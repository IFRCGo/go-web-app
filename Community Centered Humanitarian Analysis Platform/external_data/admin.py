"""The external-source tables at /admin/, so they can be browsed without SQL.

Alongside what data_track and boundaries register. Without this file the admin
showed ten of the project's sixteen tables: the seven read out of the UNHCR
PDFs and the three that make up the map. The six below - the ones pulled from IPC,
FEWS NET, ACAPS, HDX, UNHCR and Kobo - existed in the database and were invisible
from the browser.

Read-only, for the same reason boundaries is. Almost every one of these tables is
written by a loader (`seed_external`, `load_hsps`, `load_workbooks`,
`loaders/base`), so a row hand-edited here is a row the next refresh silently
overwrites. The way to change a phase or a crossing's coordinates is to fix the
source and re-run the loader, not to leave the database disagreeing with the
thing that fills it.

PlaceCoordinate IS THE EXCEPTION, AND BY THE SAME RULE. No loader writes it -
it is a person's answer to "where is this place, since no polygon knows", and
load_hsps only reads it. There is nothing here for a refresh to overwrite, so the
reason for read-only does not apply, and making it read-only would leave the one
table on this page that is meant to be typed into uneditable. (`seed_external`
uses get_or_create on it, so re-seeding cannot undo an edit made here either.)
"""
from django.contrib import admin

from .models import (
    BorderCrossing,
    FoodSecurityArea,
    HazardEvent,
    HazardImpact,
    HumanitarianServicePoint,
    KoboForm,
    MovementPattern,
    PlaceCoordinate,
    SeasonalCalendar,
    SourceSync,
    CchaPrimaryData,
    CchaPrimaryDataCopingChallenge,
    CchaPrimaryDataHazardDetail,
)


class ReadOnly(admin.ModelAdmin):
    """Look and search, but do not add or edit. See the note at the top."""

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False


@admin.register(SourceSync)
class SourceSyncAdmin(ReadOnly):
    """The freshness table. `notes` is where a no-op refresh explains itself, so
    it is worth having in the search box even though it is not a column."""

    list_display = ("source", "dataset", "iso3", "variant", "high_water_date",
                    "last_pulled_at", "row_count")
    list_filter = ("source", "dataset", "iso3")
    search_fields = ("source", "dataset", "variant", "tool", "notes")


@admin.register(SeasonalCalendar)
class SeasonalCalendarAdmin(ReadOnly):
    # source_org rather than source in the last column: `source` says which
    # publisher we pulled from, source_org says whose assessment it actually is.
    list_display = ("iso3", "label", "season_type", "event_type",
                    "start_month", "end_month", "source", "source_org")
    list_filter = ("iso3", "source", "season_type", "event_type", "purpose")
    search_fields = ("label", "event", "country_name", "description", "source_ref")


@admin.register(FoodSecurityArea)
class FoodSecurityAreaAdmin(ReadOnly):
    list_display = ("iso3", "area_title", "phase", "phase3plus_pct",
                    "period_date", "period_type", "source", "analysis_title")
    # phase is 1-5 and period_type is one of three values, so both make honest
    # sidebar filters. analysis_id and area_id do not - they are keys, not
    # categories, and would render a sidebar thousands of links long.
    list_filter = ("source", "iso3", "phase", "period_type", "condition")
    search_fields = ("area_title", "analysis_title", "area_id", "admin_pcode")
    date_hierarchy = "period_date"


@admin.register(MovementPattern)
class MovementPatternAdmin(ReadOnly):
    list_display = ("date", "iso3", "metric", "place_name", "admin_pcode",
                    "value", "unit", "source")
    list_filter = ("metric", "iso3", "source", "unit", "admin_level")
    search_fields = ("place_name", "admin_pcode", "source_dataset", "population_group")
    date_hierarchy = "date"


@admin.register(BorderCrossing)
class BorderCrossingAdmin(ReadOnly):
    list_display = ("name", "country", "iso3", "corridor", "return_corridor",
                    "lat", "lon")
    list_filter = ("country", "corridor")
    search_fields = ("name",)


@admin.register(PlaceCoordinate)
class PlaceCoordinateAdmin(admin.ModelAdmin):
    """Editable, unlike everything else here - see the note at the top.

    Adding a row is how a place the boundary library does not carry gets onto
    the map: type the name exactly as the source spells it, then re-run the
    loader that reads it (`load_hsps` today) and rebuild the dashboard. Nothing
    picks the row up on its own.
    """

    list_display = ("name", "iso3", "lat", "lon", "source", "note")
    list_filter = ("iso3", "source")
    search_fields = ("name", "note")


@admin.register(HumanitarianServicePoint)
class HumanitarianServicePointAdmin(ReadOnly):
    # location_name and match_method sit together on purpose: a row whose
    # match_method is 'unmatched' has no p-code and no coordinates, and seeing
    # the two columns side by side is how you spot which districts never placed.
    list_display = ("date_reported", "country", "service", "location_name",
                    "scope", "match_method", "admin_pcode")
    list_filter = ("iso3", "service", "scope", "match_method")
    search_fields = ("location_name", "service", "admin_pcode", "source_file")
    date_hierarchy = "date_reported"


@admin.register(HazardEvent)
class HazardEventAdmin(ReadOnly):
    """Montandon's events. Read-only for the reason at the top of this file.

    significance and match_method sit beside each other on purpose: a row that
    is both 'detection' and 'unmatched' is a satellite fire pixel nobody can
    place, and seeing the two columns together is how you spot what the map is
    not drawing and why.
    """

    list_display = ("event_date", "iso3", "hazard_category", "hazard_sub",
                    "significance", "severity_label", "collection",
                    "match_method", "title")
    list_filter = ("iso3", "hazard_category", "hazard_sub", "collection",
                   "significance", "match_method")
    search_fields = ("title", "corr_id", "event_id", "admin_pcode")
    date_hierarchy = "event_date"


@admin.register(HazardImpact)
class HazardImpactAdmin(ReadOnly):
    # corr_id is in the list rather than only the search box: it is how a figure
    # is tied back to the event it describes, and reading the two tables side by
    # side is the only way to check that join by eye.
    list_display = ("event_date", "iso3", "impact_type", "value", "category",
                    "unit", "collection", "corr_id")
    list_filter = ("iso3", "impact_type", "category", "collection")
    search_fields = ("corr_id", "impact_id")
    date_hierarchy = "event_date"


class KoboReadOnly(ReadOnly):
    """Primary data from Kobo. Not deletable here either: a deleted row would
    simply return on the next pull, and a Not Approved one is removed by the pull
    itself - the place to reject a submission is Kobo's validation status."""

    def has_delete_permission(self, request, obj=None):
        return False


class HazardDetailInline(admin.TabularInline):
    model = CchaPrimaryDataHazardDetail
    extra = 0
    can_delete = False

    def has_add_permission(self, request, obj=None):
        return False

    def has_change_permission(self, request, obj=None):
        return False


class CopingChallengeInline(HazardDetailInline):
    model = CchaPrimaryDataCopingChallenge


@admin.register(CchaPrimaryData)
class CchaPrimaryDataAdmin(KoboReadOnly):
    """One CCHA primary-data interview per row; its hazard and coping rows inline."""
    list_display = ("submission_id", "interview_type", "interview_date", "country", "admin1",
                    "admin2", "gender", "age", "validation_status")
    list_filter = ("interview_type", "country", "validation_status", "admin2", "gender")
    search_fields = ("uuid", "enum_name", "kii_role")
    inlines = [HazardDetailInline, CopingChallengeInline]


@admin.register(CchaPrimaryDataHazardDetail)
class CchaPrimaryDataHazardDetailAdmin(KoboReadOnly):
    list_display = ("interview", "hazard", "hazard_occurence", "hazard_events",
                    "hazard_impact")
    list_filter = ("hazard", "hazard_impact")


@admin.register(CchaPrimaryDataCopingChallenge)
class CchaPrimaryDataCopingChallengeAdmin(KoboReadOnly):
    list_display = ("interview", "hazard", "coping_challenges")
    list_filter = ("hazard",)


@admin.register(KoboForm)
class KoboFormAdmin(KoboReadOnly):
    list_display = ("form_key", "name", "form_uid", "fetched_at")
