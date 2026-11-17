"""The one panel that reads PostgreSQL live.

Quotes are low-volume text, so serving them live costs nothing and lets Publish
mean published: refresh the page and it is there. The map's own layers keep
reading their pre-built files, so nothing about map performance changes - see
spec §14.1 for why geometry stays on files.

PUBLISHED ROWS ONLY. There is no query parameter that will return a pending or
rejected insight, and there should never be one.
"""
from django.db.models import Q
from django.http import JsonResponse

from dashboard.visibility import hidden_countries
from insights.field_data import context_for
from insights.models import Insight

MAX_LIMIT = 2000


def _limit(request):
    try:
        return max(1, min(int(request.GET.get("limit", 500)), MAX_LIMIT))
    except (TypeError, ValueError):
        return 500


def insights(request):
    """Published community insights. Filters: ?voice_type= &iso3= &dimension=
    &tag= &role= &flow_type= &admin_pcode= &from= &to= &q=
    """
    rows = (Insight.objects.filter(status="published")
            .select_related("document", "field_interview")
            .prefetch_related("codings", "figures", "movements",
                              "field_interview__coping_challenges")
            # A statement located in a hidden country is not sent. One located in
            # a shown country is sent as it is, movement legs included.
            .exclude(iso3__in=hidden_countries().iso3))

    for field in ("voice_type", "iso3", "admin_pcode"):
        if value := request.GET.get(field):
            rows = rows.filter(**{field: value})
    dimension = request.GET.get("dimension")
    tag = request.GET.get("tag")
    role = request.GET.get("role")
    # Every coding constraint goes into ONE .filter() call so a single coding row
    # must satisfy all of them. Chained .filter() calls on a to-many relation join
    # the table separately, so a row could match the dimension in one coding and
    # the tag in another — wrong, and wrong in a way that quietly over-reports.
    coding_filters = {}
    if dimension:
        coding_filters["codings__dimension"] = dimension
    if tag:
        coding_filters["codings__tag"] = tag
    if role:
        coding_filters["codings__role"] = role
    if coding_filters:
        rows = rows.filter(**coding_filters)

    if flow_type := request.GET.get("flow_type"):
        rows = rows.filter(movements__flow_type=flow_type)
    if start := request.GET.get("from"):
        rows = rows.filter(stated_on__gte=start)
    if end := request.GET.get("to"):
        rows = rows.filter(stated_on__lte=end)
    if q := request.GET.get("q"):
        rows = rows.filter(
            Q(quote__icontains=q)
            | Q(quote_translated__icontains=q)
            | Q(place_name_as_written__icontains=q)
        )

    rows = rows.distinct()
    total = rows.count()

    def field_context(row):
        # The question a Field-data statement answers (and, for a single-choice
        # parent, the household's answer to it). Never the interview itself:
        # its GPS stays on the server.
        wording, answer = context_for(row)
        return {"field_context": wording, "field_context_answer": answer}

    data = [
        {
            "id": row.id,
            "quote": row.quote,
            "quote_language": row.quote_language,
            "quote_translated": row.quote_translated,
            "voice_type": row.voice_type,
            "channel": row.channel,
            "date": row.stated_on.isoformat() if row.stated_on else None,
            "iso3": row.iso3,
            "place_name": row.place_name_as_written,
            "admin_pcode": row.admin_pcode,
            "admin_level": row.admin_level,
            "match_method": row.match_method,
            "lat": row.lat,
            "lon": row.lon,
            "people_affected": row.people_affected,
            "severity": row.severity,
            "codings": [{"dimension": c.dimension, "tag": c.tag, "role": c.role}
                        for c in row.codings.all()],
            "figures": [
                {
                    "as_written": f.figure_as_written,
                    "value": f.value,
                    "unit": f.unit,
                    "measures": f.measures,
                    "applies_to": f.applies_to,
                }
                for f in row.figures.all()
            ],
            "movements": [
                {
                    # lat/lon on each side are LABEL POSITIONS from
                    # AdminArea.center_*, not addresses. Anything drawing these
                    # must say so, as the subject-place popup already does.
                    "origin": {"name": m.origin_name_as_written, "iso3": m.origin_iso3,
                               "pcode": m.origin_pcode, "admin_level": m.origin_admin_level,
                               "match_method": m.origin_match_method,
                               "lat": m.origin_lat, "lon": m.origin_lon},
                    "destination": {"name": m.dest_name_as_written, "iso3": m.dest_iso3,
                                    "pcode": m.dest_pcode, "admin_level": m.dest_admin_level,
                                    "match_method": m.dest_match_method,
                                    "lat": m.dest_lat, "lon": m.dest_lon},
                    "flow_type": m.flow_type,
                    "value_as_written": m.value_as_written,
                    "value": m.value,
                    "unit": m.unit,
                }
                for m in row.movements.all()
            ],
            "source_document": row.document.file_name if row.document_id else None,
            "page": row.page,
            **field_context(row),
        }
        for row in rows.order_by("-stated_on", "id")[: _limit(request)]
    ]
    return JsonResponse({"count": total, "results": data})
