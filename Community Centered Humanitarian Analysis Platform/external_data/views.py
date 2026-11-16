"""A read-only JSON API over the external data tables.

    /api/seasonal/            lean, harvest and dry bands, per country
    /api/food-security/       IPC, Cadre Harmonise and FEWS NET phases
    /api/movement/            IDP and refugee series, long format
    /api/community-insights/  the quotes, with the document each came from
    /api/hsps/                humanitarian service points
    /api/sync/                what is held, how fresh, and what is missing

Same conventions as data_track/views.py, deliberately: GET only, plain
JsonResponse, filters as query parameters, and a capped result set so one request
can never dump a whole table. This is what an analyst points Power BI or Excel at.

EVERY ROW SAYS WHERE IT CAME FROM. `source` is on the seasonal and food-security
responses because the same country can be served by different providers who
disagree - Ethiopia's phases are FEWS NET's because IPC has published nothing
since 2021, Chad's are Cadre Harmonise, Sudan's are IPC proper. A reader who
cannot see that is being told less than we know.
"""
from django.db.models import Q
from django.http import JsonResponse

from dashboard.visibility import hidden_countries

from .management.commands.external_status import status_rows
from .models import (BorderCrossing, FoodSecurityArea, HumanitarianServicePoint,
                     MovementPattern, SeasonalCalendar)

# One request can never dump a whole table. food_security is the big one - 3,167
# rows and growing - so the cap matters most there.
MAX_LIMIT = 5000
DEFAULT_LIMIT = 1000


def _limit(request):
    try:
        return min(int(request.GET.get("limit", DEFAULT_LIMIT)), MAX_LIMIT)
    except (TypeError, ValueError):
        return DEFAULT_LIMIT


def _iso(value):
    return value.isoformat() if value else None


def _page(rows, total, extra=None):
    body = {"count": total, "returned": len(rows), "results": rows}
    if extra:
        body.update(extra)
    return JsonResponse(body)


def index(request):
    """What this API offers, so /api/external/ explains itself in a browser."""
    return JsonResponse({
        "endpoints": {
            "seasonal": "/api/seasonal/?iso3=TCD",
            "food_security": "/api/food-security/?iso3=TCD&period=2025-11-01",
            "movement": "/api/movement/?iso3=SDN&metric=idps&from=2025-01-01",
            "community_insights": "/api/community-insights/?dimension=hazard&q=flood",
            "hsps": "/api/hsps/?iso3=SDN&service=Health",
            "crossings": "/api/crossings/",
            "sync": "/api/sync/",
        },
        "note": "Read-only. Every row carries the source it came from.",
    })


def seasonal(request):
    """Seasonal bands. Filters: ?iso3=TCD &source=fewsnet &purpose=NutritionIndicator

    A country with no calendar returns an empty list, not a 404: Libya genuinely
    has one placeholder band and Egypt has no lean season at all, and those are
    answers rather than errors.
    """
    rows = SeasonalCalendar.objects.exclude(iso3__in=hidden_countries().iso3)
    for field in ("iso3", "source", "purpose", "season_type"):
        if value := request.GET.get(field):
            rows = rows.filter(**{field: value})
    total = rows.count()
    data = [
        {
            "iso3": r.iso3, "country": r.country_name,
            "admin_pcode": r.admin_pcode,
            "source": r.source, "source_ref": r.source_ref,
            "label": r.label, "season_type": r.season_type, "purpose": r.purpose,
            # end < start means the season wraps the year end, as published.
            "start_month": r.start_month, "end_month": r.end_month,
            "description": r.description, "aliases": r.aliases,
            "order": r.display_order,
        }
        for r in rows.order_by("iso3", "purpose", "display_order")[:_limit(request)]
    ]
    return _page(data, total)


def food_security(request):
    """IPC / Cadre Harmonise / FEWS NET phases.

    Filters: ?iso3=TCD &source=ch &period=2025-11-01 &phase=4 &min_phase=3
    Geometry is NOT returned here - it is large, and the map reads it from the
    dashboard layer. This endpoint is for the numbers.
    """
    rows = FoodSecurityArea.objects.exclude(iso3__in=hidden_countries().iso3)
    for field in ("iso3", "source", "period_type"):
        if value := request.GET.get(field):
            rows = rows.filter(**{field: value})
    if period := request.GET.get("period"):
        rows = rows.filter(period_date=period)
    if phase := request.GET.get("phase"):
        rows = rows.filter(phase=phase)
    if min_phase := request.GET.get("min_phase"):
        rows = rows.filter(phase__gte=min_phase)

    total = rows.count()
    data = [
        {
            "iso3": r.iso3, "source": r.source,
            "analysis_id": r.analysis_id, "analysis_title": r.analysis_title,
            "period_date": _iso(r.period_date), "period_type": r.period_type,
            "area_id": r.area_id, "area": r.area_title, "admin_pcode": r.admin_pcode,
            "phase": r.phase, "phase3plus_pct": r.phase3plus_pct,
            "phase5_population": r.phase5_population,
            "total_population": r.total_population,
            "famine": r.famine, "colour": r.colour,
        }
        for r in rows.order_by("iso3", "period_date", "area_title")[:_limit(request)]
    ]
    return _page(data, total)


def movement(request):
    """IDP and refugee series. Filters: ?iso3=SDN &metric=idps &source=excel &from= &to=

    These are the AGENCIES' figures. The numbers read out of the UNHCR PDFs live
    in /api/figures/ and are deliberately a separate series: they count different
    things on different dates, and a caller who wants both should union them
    knowingly rather than be handed a silent blend.
    """
    rows = MovementPattern.objects.exclude(iso3__in=hidden_countries().iso3)
    for field in ("iso3", "metric", "source", "admin_pcode"):
        if value := request.GET.get(field):
            rows = rows.filter(**{field: value})
    if start := request.GET.get("from"):
        rows = rows.filter(date__gte=start)
    if end := request.GET.get("to"):
        rows = rows.filter(date__lte=end)

    total = rows.count()
    data = [
        {
            "date": _iso(r.date), "iso3": r.iso3,
            "admin_pcode": r.admin_pcode, "admin_level": r.admin_level,
            "place": r.place_name, "metric": r.metric,
            "population_group": r.population_group,
            "value": r.value, "unit": r.unit,
            "source": r.source, "source_dataset": r.source_dataset,
            "period_start": _iso(r.reference_period_start),
            "period_end": _iso(r.reference_period_end),
        }
        for r in rows.order_by("iso3", "metric", "date")[:_limit(request)]
    ]
    return _page(data, total)


def community_insights(request):
    """The quotes. Filters: ?dimension=hazard &country=Chad &tag=flooding &q=text

    Reads narrative_tags directly rather than a copied table, so a re-parse of the
    corpus can never leave two versions of the same sentence disagreeing.
    """
    from data_track.models import NarrativeTag

    rows = (NarrativeTag.objects.exclude(snippet=None).exclude(snippet="")
            .exclude(country__in=hidden_countries().names))
    for field in ("dimension", "tag", "country", "area_id"):
        if value := request.GET.get(field):
            rows = rows.filter(**{field: value})
    if q := request.GET.get("q"):
        rows = rows.filter(Q(snippet__icontains=q) | Q(area_name__icontains=q))

    total = rows.count()
    data = [
        {
            "date": _iso(r.report_date), "dimension": r.dimension, "tag": r.tag,
            "country": r.country, "area_id": r.area_id, "area_name": r.area_name,
            "area_level": r.area_level, "quote": r.snippet,
            "source_document": r.document.file_name if r.document_id else None,
        }
        for r in rows.select_related("document").order_by("report_date")[:_limit(request)]
    ]
    return _page(data, total)


def hsps(request):
    """Humanitarian service points. Filters: ?iso3=SDN &service=Health &date=2026-09-08

    A row means "this service is offered somewhere in this district", not "there is
    a service point at this spot" - the source holds no coordinates. `lat`/`lon` are
    the district's own point-on-surface, a label position rather than an address.
    """
    rows = HumanitarianServicePoint.objects.exclude(iso3__in=hidden_countries().iso3)
    for field in ("iso3", "service", "scope", "admin_pcode"):
        if value := request.GET.get(field):
            rows = rows.filter(**{field: value})
    if reported := request.GET.get("date"):
        rows = rows.filter(date_reported=reported)

    total = rows.count()
    data = [
        {
            "date_reported": _iso(r.date_reported), "country": r.country, "iso3": r.iso3,
            "service": r.service, "scope": r.scope,
            "location": r.location_name, "admin_pcode": r.admin_pcode,
            "admin_level": r.admin_level, "match_method": r.match_method,
            "lat": r.lat, "lon": r.lon,
            "same_services_everywhere": r.same_services_everywhere,
            "source_file": r.source_file,
        }
        for r in rows.order_by("date_reported", "iso3", "location_name", "service")[:_limit(request)]
    ]
    return _page(data, total, {
        "note": "District-level, not point-level. lat/lon is the district's "
                "point-on-surface; the source publishes no site coordinates.",
    })


def crossings(request):
    """The curated border crossings, tagged to the movement corridors."""
    rows = BorderCrossing.objects.exclude(iso3__in=hidden_countries().iso3)
    if iso3 := request.GET.get("iso3"):
        rows = rows.filter(iso3=iso3)
    data = [
        {
            "name": r.name, "country": r.country, "iso3": r.iso3,
            "lon": r.lon, "lat": r.lat,
            "corridor": r.corridor, "return_corridor": r.return_corridor,
            "source": r.source,
        }
        for r in rows
    ]
    return _page(data, len(data))


def sync(request):
    """What is held, how fresh it is, and what the notes say about the gaps.

    The same rows `manage.py external_status` prints - imported from that command
    rather than rebuilt, so the two can never disagree about what the database has.
    """
    hidden = hidden_countries()
    rows = [r for r in status_rows() if not hidden.hides(r.get("iso3"))]
    return _page(rows, len(rows))
