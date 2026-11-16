"""The Data Refresh via API section: what is held, and the button to refresh it.

READ-ONLY APART FROM THE BUTTONS, and for the reason external_data/admin.py
already gives: every row here is written by a loader, so a row hand-edited in the
browser is a row the next refresh silently overwrites.
"""
from django.contrib import admin, messages
from django.db.models import Case, IntegerField, Value, When
from django.urls import path
from django.utils import timezone
from django.utils.html import format_html
from django.utils.safestring import mark_safe

from external_data.fetchers import fetcher_for
from external_data.fetchers.base import missing_keys
from api_calls import views
from api_calls.locks import JobBusy
from api_calls.models import ACTIVE, DataSource, PullJob

# What each source is CALLED, as opposed to what its column says. The office says
# "FEWS NET", not "fewsnet".
SOURCE_LABELS = {
    "fewsnet": "FEWS NET", "hdx": "HDX HAPI", "ipc": "IPC",
    "ch": "Cadre Harmonisé", "unhcr": "UNHCR", "acaps": "ACAPS",
    "excel": "Excel workbook", "kobo": "Kobo",
    "montandon": "IFRC Montandon",
}

# Why a source has no button. Naming the command that DOES load it turns a dead
# end into an instruction. `excel` is no longer here: its two workbook rows have
# a button of their own, which re-reads the file under /work.
FILE_BASED = {
    "acaps": "CSV export — manage.py load_external acaps_seasonal",
}


# Primary data is what IFRC and its National Societies collected themselves, in
# Kobo; everything else on this page is someone else's published figures.
PRIMARY_SOURCES = {"kobo"}


def source_category(source):
    return "Primary data" if source in PRIMARY_SOURCES else "Secondary data"


class CategoryFilter(admin.SimpleListFilter):
    title = "category"
    parameter_name = "category"

    def lookups(self, request, model_admin):
        return [("primary", "Primary data"), ("secondary", "Secondary data")]

    def queryset(self, request, queryset):
        if self.value() == "primary":
            return queryset.filter(source__in=PRIMARY_SOURCES)
        if self.value() == "secondary":
            return queryset.exclude(source__in=PRIMARY_SOURCES)
        return queryset


@admin.register(DataSource)
class DataSourceAdmin(admin.ModelAdmin):
    list_display = ("category", "source_label", "dataset", "country", "last_pulled_at",
                    "high_water_date", "row_count", "job_status", "pull_button")
    list_filter = (CategoryFilter, "source", "dataset", "iso3")

    search_fields = ("source", "dataset", "variant", "tool", "notes")
    change_list_template = "admin/api_calls/datasource/change_list.html"
    actions = ["pull_selected"]

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False

    def get_urls(self):
        return [
            path("pull/<int:pk>/", self.admin_site.admin_view(views.pull),
                 name="mcp_pull"),
            path("pull-all/", self.admin_site.admin_view(views.pull_all),
                 name="mcp_pull_all"),
            path("activity/", self.admin_site.admin_view(views.activity),
                 name="mcp_activity"),
            path("rebuild/", self.admin_site.admin_view(views.rebuild),
                 name="mcp_rebuild"),
            path("job/<int:job_id>/", self.admin_site.admin_view(views.job_page),
                 name="mcp_job"),
            path("job/<int:job_id>/status/",
                 self.admin_site.admin_view(views.job_status),
                 name="mcp_job_status"),
        ] + super().get_urls()

    def changelist_view(self, request, extra_context=None):
        extra_context = extra_context or {}
        extra_context["pulls_since_rebuild"] = views.pulls_since_last_rebuild()
        extra_context["stale_count"] = len(views.stale_rows())
        return super().changelist_view(request, extra_context)

    @admin.action(description="Pull the selected data sources (one at a time)")
    def pull_selected(self, request, queryset):
        """Several rows, one press, still strictly serial.

        The selection is filtered before launching rather than after: a row with
        no API, or no key, would only fail inside the batch, and a failure the
        operator could have been told about up front is noise in a log.
        """
        rows, skipped = [], []
        for row in queryset:
            why = views.pullable(row)
            (skipped.append((row, why)) if why else rows.append(row))

        if not rows:
            self.message_user(
                request, "None of those can be pulled: "
                         + "; ".join(f"{r.source}/{r.dataset} - {w}" for r, w in skipped),
                messages.WARNING)
            return

        try:
            job = views.start_batch(request, rows)
        except JobBusy as exc:
            self.message_user(request, str(exc), messages.WARNING)
            return
        except Exception as exc:
            self.message_user(request, f"could not start: {exc}", messages.ERROR)
            return

        note = f"job {job.id}: pulling {len(rows)} source(s), one at a time."
        if skipped:
            note += f" {len(skipped)} skipped (no API or no key)."
        self.message_user(request, note, messages.SUCCESS)

    def get_ordering(self, request):
        """Primary data first, then the order the page always had.

        An expression, not an annotation: the list filters build their own
        querysets, and an ordering that names an annotation breaks them.
        """
        primary_first = Case(When(source__in=PRIMARY_SOURCES, then=Value(0)),
                             default=Value(1), output_field=IntegerField())
        return [primary_first.asc(), "source", "dataset", "iso3", "variant"]

    @admin.display(description="category")
    def category(self, obj):
        return source_category(obj.source)

    @admin.display(description="source", ordering="source")
    def source_label(self, obj):
        return SOURCE_LABELS.get(obj.source, obj.source)

    @admin.display(description="country", ordering="iso3")
    def country(self, obj):
        return obj.iso3 or "global"

    @admin.display(description="last attempt")
    def job_status(self, obj):
        """The latest attempt for this row - including the ones that failed.

        This column is why PullJob exists: source_sync records what is HELD and
        says nothing about an attempt that did not land. A pull that SUCCEEDED
        has to be visible here too, or the only evidence a refresh happened is a
        date moving in the next column along.
        """
        job = (PullJob.objects
               .filter(source=obj.source, dataset=obj.dataset, iso3=obj.iso3,
                       variant=obj.variant)
               .order_by("-requested_at").first())
        if job is None:
            return format_html('<span style="color:#888">&mdash;</span>')

        if job.is_stale:
            return self._chip("#ef6c00", "stuck", "no process behind it", job)
        if job.status == "failed":
            return self._chip("#c62828", "failed", job.message[:90], job)
        if job.status in ACTIVE:
            detail = job.progress_note or job.status
            if job.progress_total:
                detail = f"{job.progress_done} of {job.progress_total} - {detail}"
            return self._chip("#2b7cd3", "running", detail, job)

        # Succeeded. "0 rows" reads like a failure to anyone scanning the page,
        # and for an incremental pull it is the ordinary result - so the reason
        # it wrote nothing is what gets shown instead of the count.
        if job.rows_written:
            detail = f"{job.rows_written:,} rows"
        elif "up to date" in (job.message or ""):
            detail = "already up to date"
        else:
            detail = job.message[:90] or "no rows"
        when = timezone.localtime(job.finished_at).strftime("%H:%M") if job.finished_at else ""
        return self._chip("#2e7d32", "succeeded", f"{detail}{' at ' + when if when else ''}", job)

    def _chip(self, colour, label, detail, job):
        """One coloured word plus what it means, linking to the full log."""
        return format_html(
            '<a href="job/{}/" style="text-decoration:none">'
            '<span style="color:{};font-weight:600">{}</span>'
            '<span style="color:#555"> {}</span></a>',
            job.id, colour, label, detail)

    @admin.display(description="")
    def pull_button(self, obj):
        fetcher_cls = fetcher_for(obj.source, obj.dataset, obj.variant)
        from_file = obj.source in views.FILE_SOURCES

        if fetcher_cls is None and not from_file:
            return mark_safe(
                '<span style="color:#888">'
                f'{FILE_BASED.get(obj.source, "no API behind this source")}</span>')

        if fetcher_cls is not None:
            absent = missing_keys(fetcher_cls)
            if absent:
                return format_html(
                    '<span style="color:#888" title="Add it to .env and restart the '
                    'web container">needs {} in .env</span>', absent[0])

        if PullJob.objects.filter(source=obj.source, status__in=ACTIVE).exists():
            # Both workbook rows share source='excel', so the one active job per
            # source constraint makes them queue behind each other. That is
            # correct rather than merely tolerated: they are read by the same
            # command, in one transaction.
            return mark_safe('<span style="color:#888">source busy</span>')

        # A link to a confirmation page, whose form POSTs. The refresh itself is
        # never a GET: it changes the database, and an IPC one moves 8-15 MB per
        # analysis, so nothing should be able to start one by prefetching a link.
        #
        # A WORKBOOK ROW SAYS WHAT IT ACTUALLY DOES. "Pull now" on a row whose
        # data comes off a file on the share invites the reading that the button
        # goes and finds newer figures somewhere; it re-reads what has been saved
        # into /work, and nothing else.
        if from_file:
            return format_html(
                '<a class="button" href="pull/{}/" title="Re-read the workbook '
                'from the source folder (/work) and load it">Reload file</a>',
                obj.pk)
        return format_html('<a class="button" href="pull/{}/">Pull now</a>', obj.pk)


@admin.register(PullJob)
class PullJobAdmin(admin.ModelAdmin):
    """The attempt log. Never edited; kept as an audit trail."""

    list_display = ("id", "kind", "target", "status", "rows_written",
                    "requested_by", "requested_at", "finished_at")
    list_filter = ("kind", "status", "source")
    search_fields = ("source", "dataset", "iso3", "message")
    date_hierarchy = "requested_at"
    actions = ["reset_stuck_job"]

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    @admin.action(description="Reset a stuck job (release its source)")
    def reset_stuck_job(self, request, queryset):
        """Free a source held by a job whose process is gone.

        `docker compose up -d --build` mid-pull leaves a row at 'running' with
        nothing behind it, and that row then refuses every future press for its
        source. This is the way out, and it is the same affordance - and the same
        reasoning - as reset_stuck_job in insights/admin.py.

        ONLY ACTIVE JOBS ARE TOUCHED. Rewriting a succeeded job as failed would
        destroy the record of a pull that really happened.
        """
        stuck = queryset.filter(status__in=ACTIVE)
        count = stuck.count()
        for job in stuck:
            job.status = "failed"
            job.finished_at = timezone.now()
            job.message = f"reset by {request.user}"
            job.save(update_fields=["status", "finished_at", "message"])

        if hasattr(request, "_messages") and request._messages is not None:
            self.message_user(
                request,
                f"{count} job(s) reset; their sources can be pulled again."
                if count else "nothing to reset - none of those jobs was active.",
                messages.SUCCESS if count else messages.WARNING,
            )
