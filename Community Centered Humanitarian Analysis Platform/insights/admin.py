"""The review queue, and the form for typing one in by hand.

They are the same screen deliberately: once saved, a reviewed AI insight and a
hand-keyed one should be indistinguishable, because they are.

The reviewer reads the quote FIRST - it is the top fieldset, alone - and only
then sees what the model made of it. That ordering is the whole point of the
screen, so do not fold it into a general "details" block.
"""
import json
import subprocess
import sys
from pathlib import Path

from django.conf import settings
from django.contrib import admin, messages
from django.urls import path
from django.utils.html import format_html

from data_track.models import Document
from insights import admin_views, review, wizard
from insights.contract import ContractError
from insights.forms import InsightFolderForm, InsightPlaceForm, InsightUploadForm
from insights.intake import catalogue_file, catalogue_folder
from insights.loader import load
from insights.models import (
    DocumentsToInsights, ExtractionJob, FieldDataTagMap, Insight, InsightCoding, InsightFigure,
    InsightFolder, InsightMovement, InsightUpload, PublishedInsight,
)


class InsightCodingInline(admin.TabularInline):
    model = InsightCoding
    extra = 1
    fields = ("dimension", "tag", "role", "tag_raw")
    readonly_fields = ("tag_raw",)


class InsightFigureInline(admin.TabularInline):
    model = InsightFigure
    extra = 0
    fields = ("figure_as_written", "value", "unit", "measures", "applies_to")


class InsightMovementInline(admin.TabularInline):
    model = InsightMovement
    extra = 0
    fields = ("origin_name_as_written", "origin_iso3", "dest_name_as_written",
              "dest_iso3", "flow_type", "value_as_written", "value", "unit",
              "origin_match_method", "dest_match_method")
    # Resolved by the loader from the written name plus that side's iso3. Editing
    # a match method by hand would claim a placement nothing resolved.
    readonly_fields = ("origin_match_method", "dest_match_method")


@admin.register(Insight)
class InsightAdmin(admin.ModelAdmin):
    inlines = [InsightCodingInline, InsightFigureInline, InsightMovementInline]
    form = InsightPlaceForm
    list_display = ("opening", "iso3", "place_name_as_written", "voice_type", "channel",
                    "themes", "status", "stated_on", "method")
    # No "status" here: a choices filter lists every choice whatever the
    # queryset holds, so "Published" would be an option returning nothing.
    list_filter = ("voice_type", "channel", "method", "iso3", "match_method", "job")
    search_fields = ("quote", "quote_translated", "place_name_as_written")
    date_hierarchy = "stated_on"
    actions = ["publish_selected", "reject_selected"]
    readonly_fields = ("answers_question", "resolved_to", "quote_sha1", "source_link", "reviewed_by",
                       "reviewed_at", "created_at")
    fieldsets = (
        ("The statement", {
            "fields": ("quote", "quote_language", "quote_translated"),
            "description": "Read this first. Edit only to repair an OCR artefact.",
        }),
        ("What it is", {"fields": ("voice_type", "channel", "answers_question", "stated_on")}),
        ("Where", {
            "fields": ("country", "state", "district", "place_name_as_written",
                       "resolved_to"),
            "description": (
                "Pick the finest place the source actually gives. The p-code, the "
                "level and the coordinates are worked out from that pick - see "
                "'Resolved to' below."
            ),
        }),
        ("Scale (usually blank)", {"fields": ("people_affected", "severity")}),
        ("Source", {"fields": ("source_link", "document", "page")}),
        ("Provenance", {"fields": ("method", "model_used", "confidence", "job",
                                   "quote_sha1", "created_at")}),
        ("Review", {"fields": ("status", "rejection_reason", "reviewed_by", "reviewed_at")}),
    )

    def get_urls(self):
        """The dropdowns' own JSON, inside the admin so it is staff-only.

        admin_view() wraps it in the same permission check and login redirect
        every other admin page gets. It is not in insights/urls.py because that
        file is the public read API and this is not public.
        """
        return [
            path("place-options/",
                 self.admin_site.admin_view(admin_views.place_options),
                 name="insights_place_options"),
        ] + super().get_urls()

    def get_queryset(self, request):
        # Part 2 is a QUEUE, and a published row is a decision already taken.
        # Left here they are most of the table within a week of going live, and
        # the rows still waiting for a decision are buried under them. Nothing
        # is hidden: every published statement is listed, whole, on Part 3 -
        # see PublishedInsightAdmin at the foot of this file.
        return (super().get_queryset(request)
                .select_related("document").prefetch_related("codings")
                .exclude(status="published"))

    @admin.display(description="Resolved to")
    def resolved_to(self, obj):
        """Where the pick landed, shown but not typeable.

        These five columns used to be five text boxes. They are derived now (see
        insights/forms.py), but they stay on the page: a reviewer auditing a
        published insight needs to see which polygon it is drawn on, and
        `match_method` is the column that tells "somewhere in Sudan" apart from
        "we do not know where".

        lat/lon are a LABEL POSITION - a point guaranteed inside the polygon,
        not an address. The wording says so, because the same caveat is written
        into insights/places.py and the dashboard popup.
        """
        if obj is None or not obj.pk:
            return "— nothing yet. Pick a country above and save."
        if not obj.admin_pcode:
            return format_html(
                "<b>{}</b> only — no polygon ({}). Nothing will be drawn on the map "
                "for this insight.",
                obj.iso3 or "—", obj.match_method or "unmatched")
        return format_html(
            "<b>{}</b> · {} · {} · label point {}, {} <br>"
            "<small>A point inside the polygon, not an address.</small>",
            obj.admin_pcode,
            # A p-code with no level should not exist, but this column is
            # written by loaders as well as by this form, and "ADMNone" on a
            # reviewer's screen is worse than saying the level is missing.
            f"ADM{obj.admin_level}" if obj.admin_level is not None else "level unknown",
            obj.match_method,
            f"{obj.lat:.4f}" if obj.lat is not None else "—",
            f"{obj.lon:.4f}" if obj.lon is not None else "—",
        )

    @admin.display(description="Statement")
    def opening(self, obj):
        return obj.quote[:90] + ("…" if len(obj.quote) > 90 else "")

    @admin.display(description="Themes")
    def themes(self, obj):
        return ", ".join(f"{c.dimension}:{c.tag}" for c in obj.codings.all()) or "—"

    @admin.display(description="Document")
    def source_link(self, obj):
        if not obj.document_id:
            return "— typed by hand, no source document"
        return format_html("{} (page {})", obj.document.file_name, obj.page or "?")

    @admin.display(description="Answers the question")
    def answers_question(self, obj):
        """For Field data: the survey question this text follows, so a reviewer
        reads the answer in context. Blank for every other statement."""
        from insights.field_data import context_for
        wording, answer = context_for(obj)
        if not wording:
            return "—"
        return format_html("{}<br><strong>{}</strong>", wording, answer) if answer else wording

    @admin.action(description="Publish selected insights")
    def publish_selected(self, request, queryset):
        updated = review.publish(queryset, request.user)
        self.message_user(request, f"{updated} published.", messages.SUCCESS)

    @admin.action(description="Reject selected insights")
    def reject_selected(self, request, queryset):
        updated = review.reject(queryset, request.user)
        self.message_user(
            request,
            f"{updated} rejected. Add a reason on each one - a rejected extraction is "
            f"evidence about the model, not rubbish.",
            messages.WARNING,
        )


@admin.register(PublishedInsight)
class PublishedInsightAdmin(InsightAdmin):
    """Part 3: everything ever published, read-only.

    The same screen as Part 2 - same fieldsets, same inlines, quote first -
    because a reviewer auditing a published statement wants to see exactly
    what the reviewer who published it saw. What it does not have is a save
    button: a published quote has been matched against the page text it was
    read from (insights/verify.py), and an edit here would invalidate that
    check with nothing left on the row to say so.

    The way back is `unpublish_selected`, which returns a row to "pending"
    where Part 2 lists it and the ordinary edit screen applies. That is one
    visible status change rather than a silent rewrite of a verified quote.
    """

    actions = ["unpublish_selected"]
    # "status" would be a filter with one value on it.
    list_filter = ("voice_type", "channel", "method", "iso3", "match_method", "job")

    def get_queryset(self, request):
        # NOT super(): InsightAdmin's excludes exactly the rows this screen is
        # for. This is the same table, sliced the other way.
        return (admin.ModelAdmin.get_queryset(self, request)
                .select_related("document").prefetch_related("codings")
                .filter(status="published"))

    def get_urls(self):
        """The admin's own URLs, without InsightAdmin's place-options route.

        That view is registered once, by Part 2, under the name every picker
        reverses. Inheriting get_urls() would register a second URL under the
        same name - and reverse() answers with the last one registered, so the
        dropdowns on the EDITABLE screen would start calling through a proxy
        whose admin exists to be read-only.
        """
        return admin.ModelAdmin.get_urls(self)

    def has_add_permission(self, request):
        # Nothing is published by typing it here; it is published by reviewing
        # it on Part 2.
        return False

    def has_change_permission(self, request, obj=None):
        # False with view permission left intact is what renders the change
        # form read-only, inlines included, instead of hiding it.
        return False

    def has_delete_permission(self, request, obj=None):
        return False

    @admin.action(description="Un-publish (send back to Part 2 for review)")
    def unpublish_selected(self, request, queryset):
        moved = review.unpublish(queryset)
        self.message_user(
            request,
            f"{moved} sent back to pending. They are on Part 2 now, editable, "
            f"and out of the insights API at once - the hazard layer built by "
            f"the pipeline keeps them until the dashboard is rebuilt.",
            messages.WARNING,
        )


@admin.register(InsightFolder)
class InsightFolderAdmin(admin.ModelAdmin):
    form = InsightFolderForm
    list_display = ("label", "path", "default_iso3", "reachable", "recursive")
    actions = ["catalogue_selected"]

    def get_model_perms(self, request):
        """Off the index, but every URL still works.

        Returning no perms is the documented way to drop a model from the app
        list without touching access: the wizard is the front door now, and
        these three are its machinery. Deliberately NOT has_module_permission,
        which also blocks the app index page.

        They must stay reachable: "Reset stuck job to queued" is the only way
        out of a job whose process was killed rather than raised.
        """
        return {}

    def get_urls(self):
        """The folder browser's JSON. Staff-only, for the same reason as above.

        It lists directories inside the container, which is the only kind of path
        InsightFolder.path can hold - a browser's own directory input hands back
        a path on the reviewer's own machine, which does not exist in here. See
        insights/admin_views.py.
        """
        return [
            path("folder-browse/",
                 self.admin_site.admin_view(admin_views.folder_browse),
                 name="insights_folder_browse"),
        ] + super().get_urls()

    @admin.display(boolean=True, description="Reachable")
    def reachable(self, obj):
        return Path(obj.path).is_dir()

    @admin.action(description="Catalogue and queue for extraction")
    def catalogue_selected(self, request, queryset):
        for folder in queryset:
            try:
                job = catalogue_folder(folder)
            except FileNotFoundError as exc:
                self.message_user(request, str(exc), messages.ERROR)
                continue
            self.message_user(
                request,
                f"{folder.label}: {job.documents_total} documents catalogued, job {job.id} "
                f"ready to read. Read them on the wizard's step 2 (or "
                f"`manage.py convert_documents --job {job.id}`), then run your "
                f"extraction agent and use 'Load payloads' on the job.",
                messages.SUCCESS,
            )


@admin.register(InsightUpload)
class InsightUploadAdmin(admin.ModelAdmin):
    """The single-document route. Saving one catalogues it there and then.

    Spec §7 asks for a file field on the intake screen, and this is it: the third
    way in beside a registered folder and the typed form. Cataloguing on save is
    what makes it a route rather than a filing cabinet - an uploaded file nobody
    catalogued would sit in MEDIA_ROOT doing nothing.
    """

    form = InsightUploadForm
    list_display = ("__str__", "iso3", "report_date", "document", "uploaded_at")
    readonly_fields = ("document", "uploaded_at")

    def get_model_perms(self, request):
        """Off the index, but every URL still works.

        Returning no perms is the documented way to drop a model from the app
        list without touching access: the wizard is the front door now, and
        these three are its machinery. Deliberately NOT has_module_permission,
        which also blocks the app index page.

        They must stay reachable: "Reset stuck job to queued" is the only way
        out of a job whose process was killed rather than raised.
        """
        return {}

    def save_model(self, request, obj, form, change):
        super().save_model(request, obj, form, change)
        if obj.document_id:
            return
        try:
            document = catalogue_file(
                Path(obj.file.path), iso3=obj.iso3, report_date=obj.report_date)
        except Exception as exc:                      # noqa: BLE001 - surfaced to the user
            self.message_user(
                request, f"Uploaded, but could not be read: {exc}", messages.ERROR)
            return
        obj.document = document
        obj.save(update_fields=["document"])
        # R13a: every catalogued document belongs to a job at catalogue time,
        # the same as one catalogued through a registered folder - otherwise
        # a document uploaded through this one-off screen would have nothing
        # to attach it to and could never be extracted.
        job = ExtractionJob.objects.create(
            producer="external", status="collected", documents_total=1)
        job.documents.add(document)
        self.message_user(
            request,
            f"{document.file_name}: {document.pages} pages catalogued as job {job.id}. "
            f"Run your extraction agent, or use 'Run extraction now' on the job, then "
            f"'Load payloads' once it is done.",
            messages.SUCCESS,
        )


@admin.register(ExtractionJob)
class ExtractionJobAdmin(admin.ModelAdmin):
    # R13b point 4: progress is read off this changelist, not a streaming UI
    # (that is deliberately deferred to the section-14 job-machinery plan) -
    # documents_done has to be a column for "N of M documents done" to be
    # visible at all while a background extraction is running.
    list_display = ("id", "folder", "producer", "status", "documents_total",
                    "documents_done", "insights_proposed",
                    "insights_rejected_unverifiable", "insights_skipped_reviewed")
    list_filter = ("status", "producer")
    readonly_fields = ("insights_proposed", "insights_rejected_unverifiable",
                       "insights_skipped_reviewed", "log", "started_at", "finished_at")
    actions = ["load_payloads_for_job", "run_extraction_now", "reset_stuck_job"]

    def get_model_perms(self, request):
        """Off the index, but every URL still works.

        Returning no perms is the documented way to drop a model from the app
        list without touching access: the wizard is the front door now, and
        these three are its machinery. Deliberately NOT has_module_permission,
        which also blocks the app index page.

        They must stay reachable: "Reset stuck job to queued" is the only way
        out of a job whose process was killed rather than raised.
        """
        return {}

    @admin.action(description="Reset stuck job to queued")
    def reset_stuck_job(self, request, queryset):
        """Manual recovery for a job wedged at "running" forever.

        extract_insights.py now catches a transport/SDK failure and marks the
        job "failed" - but it can only do that when its own process raises an
        exception. It cannot do anything when the process is KILLED instead:
        `docker compose restart web` (exactly what a dependency rebuild does)
        kills the detached child launched by run_extraction_now with no
        exception anywhere in this codebase to catch. The job is left at
        "running" forever, and run_extraction_now's own double-click guard
        then refuses to ever launch it again. This is the way out: put it
        back to "queued" so run_extraction_now accepts it.

        Deliberately not automatic - there is no pid tracked anywhere to
        check whether the process is actually gone versus still working, and
        guessing wrong would let two extractions of the same job run at
        once. Auto-detection is the section-14 job-machinery plan's problem
        to solve properly; this is a manual override, not a pre-emption of
        that work.
        """
        # Two stages can be killed mid-flight, and each goes back to the page
        # it is launched from. A killed conversion has converted nothing, so it
        # returns to "collected" - sending it to "queued" would march it past
        # the read step with intake's PyMuPDF text still in the database.
        stuck = queryset.filter(status="running")
        updated = stuck.count()
        stuck.update(status="queued")

        stuck_read = queryset.filter(status="converting")
        reset_reads = stuck_read.count()
        stuck_read.update(status="collected")

        moved = updated + reset_reads
        skipped = queryset.count() - moved
        if moved:
            self.message_user(
                request,
                f"{moved} job(s) reset ({updated} to queued, {reset_reads} to collected).",
                messages.SUCCESS)
        if skipped:
            self.message_user(
                request,
                f"{skipped} job(s) were neither \"running\" nor \"converting\" "
                f"and were left alone.",
                messages.WARNING,
            )

    @admin.action(description="Run extraction now (in-container model)")
    def run_extraction_now(self, request, queryset):
        """Launch extract_insights as a detached background process (spec §8.2).

        Validated once, up front, against get_extractor() - not against
        LLM_API_KEY, which an empty value does not disqualify: the Anthropic
        SDK falls back to ANTHROPIC_API_KEY or an `ant auth login` profile,
        and a local OpenAI-compatible server needs no key at all.

        The process is launched with start_new_session=True so a gunicorn
        worker recycling mid-run does not kill it. That is also why
        docker-compose.yml's web service now sets init: true - see R13c in
        task-13-rulings.md for the full trace of how an orphaned child that
        exits 3 or 4 could otherwise take the whole web server down through
        gunicorn's own Arbiter.reap_workers().
        """
        from insights.extractors import get_extractor

        try:
            get_extractor()
        except ValueError as exc:
            self.message_user(
                request, f"Extraction is not configured: {exc}", messages.ERROR)
            return

        for job in queryset:
            # A double click must not run two extractions of the same job at
            # once - it would double every insight the second pass wrote,
            # since the loader's conflict gate only protects reviewed rows.
            if job.status == "running":
                self.message_user(
                    request,
                    f"job {job.id}: already running - not launching a second "
                    f"extraction of the same job.",
                    messages.WARNING,
                )
                continue

            log_dir = Path(settings.API_CACHE_DIR) / "insights"
            # This directory only exists once something has written a payload
            # into it, so on a fresh setup the very first click here would
            # otherwise fail opening the log file below - before the command
            # itself ever gets a chance to create the directory.
            log_dir.mkdir(parents=True, exist_ok=True)
            log_path = log_dir / f"job-{job.id}.log"

            # Set to "running" and save BEFORE launching: the request returns
            # immediately, and the child process is what moves the job on to
            # "loaded" (or leaves it stuck at "running" if it dies - visible
            # on the changelist either way, which is the point of doing this
            # here rather than inside a request the browser is waiting on).
            job.status = "running"
            job.save(update_fields=["status"])

            with open(log_path, "wb") as log_file:
                subprocess.Popen(
                    [sys.executable, "manage.py", "extract_insights", "--job", str(job.id)],
                    cwd=settings.BASE_DIR,
                    stdout=log_file,
                    stderr=log_file,
                    start_new_session=True,
                )

            self.message_user(
                request,
                f"job {job.id}: extraction launched in the background. Refresh this "
                f"changelist to watch progress; log at {log_path}.",
                messages.SUCCESS,
            )

    @admin.action(description="Load payloads written by the agent")
    def load_payloads_for_job(self, request, queryset):
        folder = Path(settings.API_CACHE_DIR) / "insights"
        files = sorted(folder.glob("*.json"))
        if not files:
            self.message_user(request, f"No payloads in {folder}.", messages.WARNING)
            return

        for job in queryset:
            for path in files:
                # These files are written by an external extraction agent that can be
                # killed mid-write, so a truncated or unreadable file is an expected
                # input here, not an exceptional one - report it and move on to the
                # next file rather than taking the whole action down.
                try:
                    payload = json.loads(path.read_text(encoding="utf-8"))
                except (json.JSONDecodeError, OSError, UnicodeDecodeError) as exc:
                    self.message_user(
                        request, f"{path.name}: could not be read as JSON ({exc}).",
                        messages.ERROR)
                    continue
                rel = (payload.get("source") or {}).get("rel_path")
                document = Document.objects.filter(rel_path=rel).first() if rel else None
                if rel and document is None:
                    self.message_user(
                        request, f"{path.name}: no document with rel_path {rel!r}.",
                        messages.ERROR)
                    continue
                try:
                    report = load(payload, document, job=job)
                except ContractError as exc:
                    self.message_user(
                        request, f"{path.name}: the payload was rejected ({exc}).",
                        messages.ERROR)
                    continue
                self.message_user(
                    request,
                    f"{path.name}: {report.written} pending, "
                    f"{report.rejected_unverifiable} unverifiable, "
                    f"{report.skipped_reviewed} already reviewed.",
                    messages.SUCCESS,
                )
            job.status = "loaded"
            job.save(update_fields=["status"])


@admin.register(DocumentsToInsights)
class DocumentsToInsightsAdmin(admin.ModelAdmin):
    """Part 1 on the index. Every page it serves lives in insights/wizard.py.

    The changelist is replaced outright rather than configured: what a person
    needs here is "start a batch" and "open the one I was in the middle of",
    not a filterable table of a database row's columns.
    """

    def get_urls(self):
        # Before super(), so these are matched ahead of the admin's own
        # <path:object_id> catch-all - which would otherwise swallow every one
        # of them as an attempt to open a job with that id.
        return [
            path("start/", self.admin_site.admin_view(wizard.start),
                 name="insights_wizard_start"),
            path("job/<int:job_id>/", self.admin_site.admin_view(wizard.job_step),
                 name="insights_wizard_job"),
            path("batch/", self.admin_site.admin_view(wizard.batch_open),
                 name="insights_wizard_batch"),
            path("batch/<int:job_id>/file/",
                 self.admin_site.admin_view(wizard.batch_file),
                 name="insights_wizard_batch_file"),
            path("batch/<int:job_id>/url/",
                 self.admin_site.admin_view(wizard.batch_url),
                 name="insights_wizard_batch_url"),
            path("batch/<int:job_id>/ready/",
                 self.admin_site.admin_view(wizard.batch_ready),
                 name="insights_wizard_batch_ready"),
            path("job/<int:job_id>/read/", self.admin_site.admin_view(wizard.read),
                 name="insights_wizard_read"),
            path("job/<int:job_id>/read-done/",
                 self.admin_site.admin_view(wizard.read_done),
                 name="insights_wizard_read_done"),
            path("job/<int:job_id>/extract/",
                 self.admin_site.admin_view(wizard.extract),
                 name="insights_wizard_extract"),
            path("job/<int:job_id>/progress/",
                 self.admin_site.admin_view(wizard.progress),
                 name="insights_wizard_progress"),
            path("job/<int:job_id>/decide/",
                 self.admin_site.admin_view(wizard.decide),
                 name="insights_wizard_decide"),
            path("insight/<int:insight_id>/edit/",
                 self.admin_site.admin_view(wizard.edit),
                 name="insights_wizard_edit"),
        ] + super().get_urls()

    def changelist_view(self, request, extra_context=None):
        return wizard.job_list(request)

    def has_add_permission(self, request):
        # "Add extraction job" would create an empty batch with no documents
        # and no way to add any. Batches are started by the wizard.
        return False


@admin.register(FieldDataTagMap)
class FieldDataTagMapAdmin(admin.ModelAdmin):
    """Which theme a survey answer label is coded to (insights/field_data.py)."""
    list_display = ("label", "dimension", "tag", "form_key")
    list_filter = ("dimension", "form_key")
    search_fields = ("label", "tag")
