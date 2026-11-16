"""Serving the boundary library to the map, and to anything else that asks.

    /api/boundaries/layers/                    what maps do we have?
    /api/boundaries/layer/?iso3=ETH&level=2    one whole level, as GeoJSON
    /api/boundaries/features/?ids=SD01,ET0101  exactly these polygons

The dashboard uses the third one almost exclusively. It works out which places
this month's reporting names, asks for those p-codes, and draws what comes
back - so what crosses the network is proportional to what is on the screen,
about a hundred polygons, rather than to how deep the library goes. That is
what makes ADM4 free until something is actually reported at ADM4.

The first two exist for everything else: the layer catalogue is the answer to
"do we already have Chad's districts?", and the layer endpoint hands them over.

RESPONSES ARE STREAMED. A whole level can be five thousand polygons, and
building that into one string in memory before sending a byte of it would be
slow at exactly the moment it matters. The rows arrive from PostGIS already
written as GeoJSON, so this only has to put commas between them.
"""
import hashlib

from django.db import connection
from django.http import (HttpResponse, HttpResponseNotAllowed, JsonResponse,
                         StreamingHttpResponse)

from dashboard.visibility import hidden_countries

from . import geo
from .models import BoundarySource

# How many p-codes one request may ask for. Generous next to the ~130 the
# dashboard needs in practice, and it stops a stray loop asking for the lot.
MAX_IDS = 500

# Above this, a request for full-resolution geometry is refused: Egypt's ADM3
# alone is 5,716 polygons and nobody wants that at full detail over HTTP.
MAX_FULL_FEATURES = 1000


def _stream(rows):
    """Yield a FeatureCollection, one row at a time.

    Each row already holds a finished GeoJSON Feature as text, built by
    PostGIS. This wraps them without ever holding them all at once.
    """
    yield '{"type":"FeatureCollection","features":['
    first = True
    for row in rows:
        yield ("" if first else ",") + row[1]
        first = False
    yield "]}"


def _geojson(rows, etag):
    response = StreamingHttpResponse(_stream(rows), content_type="application/geo+json")
    # no-cache means "ask me first", not "do not store": the browser keeps the
    # copy and revalidates, so a reload of the library is picked up immediately
    # while an unchanged one costs a 304 and no geometry at all. A long max-age
    # would be faster and would also hide a reload for a week.
    response["Cache-Control"] = "no-cache"
    response["ETag"] = etag
    return response


def _library_etag(*parts):
    """A fingerprint of the library's state plus this particular question.

    The hidden-country set is part of it: without that, a browser holding a
    response from before a country was switched off would be told 304 and keep
    drawing it.
    """
    stamp = BoundarySource.objects.order_by("-ingested_at").values_list(
        "ingested_at", flat=True).first()
    raw = "|".join([str(stamp), "hidden=" + hidden_countries().key()] + [str(p) for p in parts])
    return '"' + hashlib.sha1(raw.encode()).hexdigest()[:16] + '"'


def _not_modified(request, etag):
    return request.headers.get("If-None-Match") == etag


def layers(request):
    """The catalogue: every level held, where it came from, and when it was valid."""
    with connection.cursor() as cur:
        cur.execute("""
            SELECT a.iso3, a.country_name, a.level, a.kind, count(*) AS n,
                   min(s.source_label), min(s.publisher), max(s.valid_on),
                   max(s.ingested_at)
            FROM admin_areas a JOIN boundary_sources s ON s.id = a.source_id
            GROUP BY a.iso3, a.country_name, a.level, a.kind
            ORDER BY a.country_name, a.level
        """)
        hidden = hidden_countries()
        rows = [r for r in cur.fetchall() if not hidden.hides(r[0])]
    with connection.cursor() as cur:
        cur.execute("""
            SELECT layer, kind, count(*), min(s.publisher)
            FROM map_features f JOIN boundary_sources s ON s.id = f.source_id
            GROUP BY layer, kind ORDER BY layer
        """)
        feature_rows = cur.fetchall()
    return JsonResponse({
        "admin": [
            {"iso3": r[0], "country": r[1], "level": r[2], "kind": r[3], "count": r[4],
             "source": r[5], "publisher": r[6],
             "valid_on": r[7].isoformat() if r[7] else None,
             "loaded": r[8].isoformat() if r[8] else None}
            for r in rows
        ],
        "features": [
            {"layer": r[0], "kind": r[1], "count": r[2], "publisher": r[3]}
            for r in feature_rows
        ],
    })


def layer(request):
    """One whole administrative level as GeoJSON."""
    iso3 = (request.GET.get("iso3") or "").upper() or None
    level = request.GET.get("level")
    kind = request.GET.get("kind")
    full = request.GET.get("full") == "1"

    # Hidden countries are simply not in the library as far as the public sees.
    where, params = ["iso3 <> ALL(%s)"], [list(hidden_countries().iso3)]
    if iso3:
        where.append("iso3 = %s")
        params.append(iso3)
    if level not in (None, ""):
        where.append("level = %s")
        params.append(int(level))
    if kind:
        where.append("kind = %s")
        params.append(kind)
    clause = " AND ".join(where)

    n = _count(clause, params)
    if not n:
        return JsonResponse({"error": "no areas match", "iso3": iso3, "level": level},
                            status=404)
    if full and n > MAX_FULL_FEATURES:
        return JsonResponse({
            "error": f"{n} areas is too many at full resolution",
            "hint": "drop full=1 to get the simplified geometry, which is what maps want",
        }, status=413)

    etag = _library_etag("layer", iso3, level, kind, full, n)
    if _not_modified(request, etag):
        return HttpResponse(status=304)

    cur = connection.cursor()
    cur.execute(geo.features_sql(clause, simplify=not full), params)
    return _geojson(cur, etag)


def features(request):
    """Exactly these p-codes. This is what the map's highlighting calls."""
    if request.method == "POST":
        import json
        try:
            ids = json.loads(request.body or "{}").get("ids") or []
        except ValueError:
            return JsonResponse({"error": "body must be JSON like {\"ids\": [...]}"},
                                status=400)
    elif request.method == "GET":
        ids = [i for i in (request.GET.get("ids") or "").split(",") if i.strip()]
    else:
        return HttpResponseNotAllowed(["GET", "POST"])

    ids = [i.strip() for i in ids][:MAX_IDS]
    if not ids:
        return JsonResponse({"error": "no ids given"}, status=400)

    etag = _library_etag("features", len(ids), hashlib.sha1(
        ",".join(sorted(ids)).encode()).hexdigest())
    if _not_modified(request, etag):
        return HttpResponse(status=304)

    cur = connection.cursor()
    cur.execute(geo.features_sql("pcode = ANY(%s) AND iso3 <> ALL(%s)"),
                [ids, list(hidden_countries().iso3)])
    return _geojson(cur, etag)


def _count(clause, params):
    with connection.cursor() as cur:
        cur.execute(f"SELECT count(*) FROM admin_areas WHERE {clause}", params)
        return cur.fetchone()[0]
