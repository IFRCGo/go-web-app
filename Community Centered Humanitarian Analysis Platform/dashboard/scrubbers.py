"""How each dashboard data file is cleaned of hidden countries before it is sent.

THE RULE, EVERYWHERE: structured rows go, free text stays. A row, feature or key
is dropped when its country field, ISO3, p-code (looked up in AdminArea) or
corridor id names a hidden country. Titles, descriptions, snippets, file names
and source/caveat strings are never edited - a sentence may still say "Libya".

THE REGISTRY IS THE GATE'S ALLOW-LIST. dashboard.views.data_file() refuses any
file with no entry here while a country is hidden (fail-closed), so a new data
file needs a line in REGISTRY before it can be served in that state.

Every scrubber returns new containers and never mutates its input: the view
caches parsed originals.
"""
import fnmatch
from functools import lru_cache
from pathlib import Path

from django.conf import settings

from boundaries.models import AdminArea
from data_pipeline.common import load_gazetteer

from .visibility import iso3_for_pcode

# Returned by a scrubber when the whole file belongs to a hidden country: 404.
WHOLE_FILE = object()


# ------------------------------------------------------------------ helpers
def _features(key):
    """Drop GeoJSON features whose property `key` names a hidden country."""
    def scrub(data, hidden):
        return {**data, "features": [f for f in data.get("features", [])
                                     if not hidden.hides((f.get("properties") or {}).get(key))]}
    return scrub


def _rows(*list_keys, field="country"):
    """Filter the named top-level lists by `field`."""
    def scrub(data, hidden):
        out = dict(data)
        for k in list_keys:
            out[k] = [r for r in data.get(k, []) if not hidden.hides(r.get(field))]
        return out
    return scrub


def _identity(data, hidden):
    return data


def _whole_file(data, hidden):
    return WHOLE_FILE if hidden.hides((data.get("_meta") or {}).get("iso3")) else data


def _aoi(data, hidden):
    iso_by_name = dict(AdminArea.objects.filter(level__isnull=True)
                       .values_list("name", "iso3"))
    return {**data, "features": [
        f for f in data.get("features", [])
        if not hidden.hides(iso_by_name.get((f.get("properties") or {}).get("name")))]}


def _tag_areas(data, hidden):
    return {k: v for k, v in data.items() if not hidden.hides(v.get("iso3"))}


def _seasonal(data, hidden):
    return {**data, "countries": {k: v for k, v in data.get("countries", {}).items()
                                  if not hidden.hides(k)}}


@lru_cache(maxsize=1)
def _slug_to_country():
    """'car' -> 'Central African Republic', from the gazetteer's corridor ids."""
    return {cid.split("-", 1)[1]: country
            for country, cid in load_gazetteer()["country_for_corridor"].items()}


def corridor_countries(cid: str) -> set:
    """The non-Sudan country on a corridor id, in any of its three shapes:
    sudan-car, libya-sudan-return, south_sudan-sudan-influx."""
    slugs = _slug_to_country()
    return {slugs[p] for p in cid.split("-")
            if p not in ("sudan", "return", "influx") and p in slugs}


def _flows(data, hidden):
    return {cid: c for cid, c in data.items()
            if not any(hidden.hides(n) for n in corridor_countries(cid))}


def _documents(data, hidden):
    return [d for d in data if not hidden.hides(d.get("country"))]


def _tags(data, hidden):
    out = {}
    for dim, tags in data.items():
        out[dim] = {}
        for tag, body in tags.items():
            new = dict(body)
            new["monthly"] = [m for m in body.get("monthly", [])
                              if not hidden.hides(m.get("country"))]
            new["snippets"] = {month: {c: s for c, s in by_c.items() if not hidden.hides(c)}
                               for month, by_c in body.get("snippets", {}).items()}
            out[dim][tag] = new
    return out


def _hazard_events(data, hidden):
    out = dict(data)
    out["by_sub"] = {sub: {**body, "monthly": [m for m in body.get("monthly", [])
                                               if not hidden.hides(m.get("country"))]}
                     for sub, body in data.get("by_sub", {}).items()}
    out["events"] = {pcode: v for pcode, v in data.get("events", {}).items()
                     if not hidden.hides(iso3_for_pcode(pcode))}
    return out


@lru_cache(maxsize=4)
def _country_shapes(admin0_path: str):
    import json
    from shapely.geometry import shape
    from shapely.prepared import prep
    fc = json.loads(Path(admin0_path).read_text(encoding="utf-8"))
    return [(f["properties"]["name"], prep(shape(f["geometry"])))
            for f in fc["features"] if f.get("geometry")]


def country_at(lon, lat):
    """The country whose outline holds this point - the same admin0 shapes
    countryAt() uses in app.js. None for no coordinates or no country."""
    if lon is None or lat is None:
        return None
    from shapely.geometry import Point
    admin0 = Path(settings.DASHBOARD_DATA_DIR) / "boundaries" / "admin0.geojson"
    pt = Point(lon, lat)
    for name, geom in _country_shapes(str(admin0)):
        if geom.covers(pt):
            return name
    return None


def _events(data, hidden):
    return [e for e in data if not hidden.hides(country_at(e.get("lon"), e.get("lat")))]


def clear_caches():
    """For tests that point DASHBOARD_DATA_DIR somewhere else."""
    _country_shapes.cache_clear()
    _slug_to_country.cache_clear()
    iso3_for_pcode.cache_clear()


# ------------------------------------------------------------------ registry
REGISTRY = [
    ("boundaries/admin0.geojson", _features("iso3")),
    ("boundaries/admin1.geojson", _features("iso3")),
    ("boundaries/admin1_lines.geojson", _features("iso3")),
    ("boundaries/areas.geojson", _features("iso3")),
    ("hsps.geojson", _features("iso3")),
    ("boundaries/aoi.geojson", _aoi),
    ("aoi_ipc.geojson", _features("ipc_country")),
    ("ipc_fs/*.geojson", _whole_file),
    ("ipc_areas_fs.geojson", _whole_file),
    ("tag_areas.json", _tag_areas),
    ("seasonal.json", _seasonal),
    ("refugee_camps.json", _rows("countries", "camps")),
    ("unhcr_asylum.json", _rows("countries")),
    ("crossings.json", _rows("points")),
    ("data_dates.json", _rows("countries")),
    ("field_surveys.json", _rows("surveys", field="iso3")),
    ("flows.json", _flows),
    ("documents.json", _documents),
    ("tags.json", _tags),
    ("hazard_events.json", _hazard_events),
    ("events.json", _events),
    # Sudan-only or regional by decision: sent as they are.
    ("idp_localities.json", _identity),
    ("idp_states.json", _identity),
    ("returnee_localities.json", _identity),
    ("headline.json", _identity),
    ("meta.json", _identity),
    ("hazards.json", _identity),
    ("water.geojson", _identity),
]


def scrubber_for(relpath: str):
    relpath = relpath.replace("\\", "/")
    for pattern, fn in REGISTRY:
        if fnmatch.fnmatchcase(relpath, pattern):
            return fn
    return None
