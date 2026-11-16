"""A small read-only JSON API served straight from PostgreSQL.

Why this exists
---------------
The map dashboard reads pre-built files in dashboard/data/*.json, because those
files are also published as a plain static site. These endpoints are the *live*
view of the same database: they always reflect what is in PostgreSQL right now,
and they are what you would point Power BI, Excel or another app at.

Every endpoint answers a GET request with JSON. Nothing here writes anything.

    /api/                    what endpoints exist
    /api/meta/               corpus counts and the date range
    /api/documents/          the catalogue of source PDFs
    /api/events/             the timeline
    /api/flows/              movement corridors and their time series
    /api/headline/           the regional headline series
    /api/figures/            individual extracted numbers (filterable, paged)
    /api/tags/               monthly counts per theme
"""
from collections import defaultdict

from django.db.models import Count, F, Max, Min
from django.http import JsonResponse

from dashboard.scrubbers import corridor_countries, country_at
from dashboard.visibility import hidden_countries

from .models import Document, Event, MovementFlow, NarrativeTag, PopulationFigure


def _iso(value):
    """Turn a date into a 'YYYY-MM-DD' string, leaving None alone."""
    return value.isoformat() if value else None


def index(request):
    """List the available endpoints, so /api/ is self-explanatory in a browser."""
    return JsonResponse(
        {
            "endpoints": {
                "meta": "/api/meta/",
                "documents": "/api/documents/",
                "events": "/api/events/",
                "flows": "/api/flows/",
                "headline": "/api/headline/",
                "figures": "/api/figures/?metric=idps&country=Sudan&limit=100",
                "tags": "/api/tags/?dimension=hazard",
            },
            "note": "Read-only. The dashboard itself reads the exported files under /data/.",
        }
    )


def meta(request):
    """How big the corpus is and which dates it covers."""
    span = Document.objects.aggregate(first=Min("report_date"), last=Max("report_date"))
    return JsonResponse(
        {
            "documents": Document.objects.count(),
            "pages": Document.objects.aggregate(n=Count("texts"))["n"],
            "figures": PopulationFigure.objects.count(),
            "tags": NarrativeTag.objects.count(),
            "events": Event.objects.count(),
            "date_min": _iso(span["first"]),
            "date_max": _iso(span["last"]),
        }
    )


def documents(request):
    """The catalogue of source PDFs. Optional filters: ?family=... &country=..."""
    rows = Document.objects.exclude(country_focus__in=hidden_countries().names)
    if family := request.GET.get("family"):
        rows = rows.filter(family=family)
    if country := request.GET.get("country"):
        rows = rows.filter(country_focus=country)
    data = [
        {
            "id": d.id,
            "file": d.file_name,
            "family": d.family,
            "country": d.country_focus,
            "date": _iso(d.report_date),
            "collection": d.source_collection,
            "pages": d.pages,
        }
        # nulls_first keeps undated documents at the top, as the exports do.
        for d in rows.order_by(F("report_date").asc(nulls_first=True), "id")
    ]
    return JsonResponse(data, safe=False)


def events(request):
    """The timeline. Optional filters: ?category=conflict &source=curated"""
    hidden = hidden_countries()
    rows = Event.objects.exclude(event_date=None)
    if category := request.GET.get("category"):
        rows = rows.filter(category=category)
    if source := request.GET.get("source"):
        rows = rows.filter(source=source)
    data = [
        {
            "date": _iso(e.event_date),
            "title": e.title,
            "description": e.description,
            "category": e.category,
            "location": e.location,
            "lat": e.lat,
            "lon": e.lon,
            "severity": e.severity,
            "source": e.source,
        }
        for e in rows.order_by("event_date", "id")
        if not (hidden and hidden.hides(country_at(e.lon, e.lat)))
    ]
    return JsonResponse(data, safe=False)


def flows(request):
    """Movement corridors with their raw (unsmoothed) cumulative series."""
    out = {}
    hidden = hidden_countries()
    for row in MovementFlow.objects.order_by("corridor", "report_date", "id"):
        if hidden and any(hidden.hides(c) for c in corridor_countries(row.corridor or "")):
            continue
        entry = out.setdefault(
            row.corridor,
            {
                "origin": {"name": row.origin, "lat": row.origin_lat, "lon": row.origin_lon},
                "destination": {"name": row.destination, "lat": row.dest_lat, "lon": row.dest_lon},
                "flow_type": row.flow_type,
                "series": [],
            },
        )
        entry["series"].append({"date": _iso(row.report_date), "value": row.value})
    return JsonResponse(out)


def headline(request):
    """The regional headline metrics as raw date/value pairs."""
    out = defaultdict(list)
    rows = (
        PopulationFigure.objects.exclude(report_date=None)
        .exclude(value=None)
        .values_list("metric", "report_date", "value")
        .order_by("metric", "report_date")
    )
    for metric, report_date, value in rows:
        out[metric].append({"date": _iso(report_date), "value": value})
    return JsonResponse(out)


def figures(request):
    """Individual extracted numbers, with the evidence attached.

    Filters: ?metric=idps &country=Chad &method=narrative_regex &limit=200
    The limit is capped at 5000 so one request can never dump the whole table.
    """
    rows = PopulationFigure.objects.exclude(country__in=hidden_countries().names)
    for field in ("metric", "country", "method", "confidence"):
        if value := request.GET.get(field):
            rows = rows.filter(**{field: value})
    try:
        limit = min(int(request.GET.get("limit", 200)), 5000)
    except ValueError:
        limit = 200
    data = [
        {
            "id": f.id,
            "document_id": f.document_id,
            "date": _iso(f.report_date),
            "country": f.country,
            "location": f.location,
            "metric": f.metric,
            "group": f.population_group,
            "value": f.value,
            "method": f.method,
            "confidence": f.confidence,
            "snippet": f.snippet,
        }
        for f in rows.order_by("report_date", "id")[:limit]
    ]
    return JsonResponse({"count": rows.count(), "returned": len(data), "results": data})


def tags(request):
    """How often each theme is mentioned, counted per month.

    Filter with ?dimension=hazard (hazard / vulnerability / coping / need /
    movement_pattern) to get just one group of toggles.
    """
    rows = (NarrativeTag.objects.exclude(report_date=None)
            .exclude(country__in=hidden_countries().names))
    if dimension := request.GET.get("dimension"):
        rows = rows.filter(dimension=dimension)

    counts = defaultdict(lambda: defaultdict(list))
    grouped = (
        rows.values("dimension", "tag", "country", "report_date__year", "report_date__month")
        .annotate(n=Count("id"))
        .order_by("dimension", "tag", "report_date__year", "report_date__month")
    )
    for row in grouped:
        month = f"{row['report_date__year']:04d}-{row['report_date__month']:02d}"
        counts[row["dimension"]][row["tag"]].append(
            {"month": month, "country": row["country"], "count": row["n"]}
        )
    return JsonResponse({dim: dict(tag_map) for dim, tag_map in counts.items()})
