"""Step 6 of 7 - the external humanitarian layers, built FROM THE DATABASE.

This step used to read JSON files out of data_pipeline/api_cache/ and flatten them
into dashboard/data/. It no longer does. Everything it needs now lives in the
external_data tables, and the cache is only the staging area a pull lands in before
`manage.py load_external` puts it in the database.

What that changes in practice: the numbers on the dashboard and the numbers an
analyst queries in SQL are the same numbers, from the same rows, and a refresh is
"pull what source_sync says is missing, load it, run this step".

Outputs into dashboard/data/:
  crossings.json          border crossings tagged to movement corridors
  idp_localities.json     IDP locality bubbles + monthly series      (IOM-DTM)
  refugee_camps.json      host-country refugee totals + camp markers (UNHCR + Excel)
  ipc_areas_fs.geojson    Sudan's IPC snapshots over time            (IPC)
  ipc_fs/<ISO3>.geojson   the same, per country, for the rest        (IPC/CH)
  hsps.geojson            humanitarian service points, by district   (Kobo)
  seasonal.json           seasonal calendars, now one per country    (ACAPS)
  aoi_ipc.geojson         IFRC Areas of Interest + their IPC phase

WHY FOOD SECURITY IS SPLIT PER COUNTRY. One file carrying every country at every
period would be 13.9 MB - the data grew from one country to five, and each period
has to carry every country's then-current snapshot. ipc_areas_fs.geojson therefore
keeps its existing Sudan-only shape so the current dashboard is untouched, and the
per-country files beside it are what the multi-country map will load on demand.
"""
import collections
import json

from django.db import connection

from django.conf import settings

from data_pipeline.common import DASHBOARD_DATA
# The day fighting broke out in Khartoum, as a string so it compares
# directly against the ISO dates in these series.
CRISIS_START = settings.CRISIS_START

# Where the office's refugee figures are read from by hand. Named and linked
# rather than called "the workbook": it is UNHCR's own operational portal for
# this situation, so the figures on it are UNHCR's, not a local derivation.
UNHCR_PORTAL = "https://data.unhcr.org/en/situations/sudansituation"

from external_data.models import (BorderCrossing, DisplacementBreakdown,
                                  FoodSecurityArea, HumanitarianServicePoint,
                                  MovementPattern, SeasonalCalendar)


def dump(name, obj):
    """Write one file into dashboard/data/ and print its size."""
    p = DASHBOARD_DATA / name
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(obj, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"  {name:24} {p.stat().st_size / 1024:8.1f} KB")


# ============================================================ how far the data runs
def build_data_dates():
    """The newest observation date in movement_patterns, per country.

    The timeline used to end at meta.date_max - the newest PDF, written by s05,
    which the Rebuild button does not run. A workbook saved with 9 Nov figures
    loaded, the rebuild drew them, and the slider still stopped on 2 Nov, so
    every point after the newest PDF was past the end of the map. app.js ends
    the timeline at the later of the two.

    Observations only: hazard events and IPC projections are dated ahead on
    purpose, and a future date here would end the slider in an empty future.
    Per country (iso3) so that the scrubber can drop a hidden country's date
    along with its rows.
    """
    from datetime import date
    from django.db.models import Max

    rows = (MovementPattern.objects
            .filter(date__lte=date.today())
            .exclude(iso3=None)
            .values("iso3").annotate(last=Max("date")).order_by("iso3"))
    dump("data_dates.json", {"countries": [
        {"country": r["iso3"], "date": r["last"].isoformat()} for r in rows]})


# ============================================================ border crossings
def build_crossings():
    """The curated crossings, from the border_crossings table."""
    points = [
        {"name": c.name, "country": c.country, "lon": c.lon, "lat": c.lat,
         "corridor": c.corridor, "return_corridor": c.return_corridor}
        for c in BorderCrossing.objects.order_by("id")
    ]
    dump("crossings.json", {
        "source": "Curated authoritative Sudan border crossings (UNHCR/OCHA operational "
                  "geography), tagged to the movement corridors in flows.json. "
                  "Held in the border_crossings table.",
        "points": points,
    })


# ============================================================ IDP localities
def build_idp_localities():
    """IDP bubbles: DTM counts per locality, placed by the boundary library.

    The centroids used to come from a cached geoBoundaries file matched by name,
    with a normaliser that stripped Arabic articles so "Ash Shamaliyah" and
    "Shamaliyah" would meet. That is no longer needed: DTM publishes p-codes and
    the boundary library is keyed on them, so the join is exact and no spelling has
    to be guessed at.
    """
    rows = (MovementPattern.objects
            .filter(source="hdx", metric="idps")
            .exclude(admin_pcode=None)
            .order_by("admin_pcode", "date"))

    # One query for every centroid we might need, rather than one per locality.
    with connection.cursor() as cur:
        cur.execute("""
            SELECT pcode, name, center_lon, center_lat
              FROM admin_areas
             WHERE iso3 = 'SDN' AND level = 2 AND kind = 'admin'
        """)
        places = {p: (n, lon, lat) for p, n, lon, lat in cur.fetchall()}

    loc = collections.defaultdict(lambda: {"name": "", "state": "", "months": {}})
    for r in rows:
        d = loc[r.admin_pcode]
        d["name"] = r.place_name or ""
        mk = r.date.strftime("%Y-%m")
        # The latest reading within a month wins, as it always has.
        if mk not in d["months"] or r.date.isoformat() > d["months"][mk][0]:
            d["months"][mk] = (r.date.isoformat(), int(r.value))

    out, unmatched = [], 0
    for pcode, d in loc.items():
        place = places.get(pcode)
        if not place:
            unmatched += 1
            continue
        name, lon, lat = place
        series = [{"date": dt, "value": v} for _, (dt, v) in sorted(d["months"].items()) if v > 0]
        if len(series) < 2:
            continue
        out.append({"name": d["name"] or name, "pcode": pcode, "state": d["state"],
                    "lon": round(lon, 4), "lat": round(lat, 4),
                    "peak": max(p["value"] for p in series), "series": series})
    out.sort(key=lambda x: -x["peak"])
    dump("idp_localities.json", {
        "source": "IOM DTM via HDX HAPI (get_idps, 'Overview' cumulative series), admin2, "
                  "held in movement_patterns; placed on OCHA p-codes from the boundary library.",
        "metric": "IDP individuals (cumulative, IOM DTM)",
        "localities": out,
    })
    print(f"    {len(out)} localities ({unmatched} without a polygon)")


# ============================================================ returnees
def build_returnee_localities():
    """Where returnees went inside Sudan, and where they came back from.

    The layer this project could not draw before. flows.json's return corridors
    all stop at the border; these bubbles are what is on the other side of it.

    THE OUTSIDE-SUDAN SHARE IS SPLIT OUT HERE, not left in `from`. Every other
    key is a state p-code the map can join to a centroid and draw a line from;
    OUTSIDE_SDN has no centroid because it is not a place. A builder that
    joined every key to `states` would silently drop the single number this
    layer exists to show.
    """
    # ADMIN2 ONLY, and that is not a detail. DTM publishes a state total AND
    # the localities that make it up, and both carry a p-code - so an
    # unfiltered query draws Khartoum's 2.5m state bubble on top of the
    # Khartoum localities it is the sum of, counting the same people twice on
    # the same map. The admin1 rows stay in the database for anyone querying
    # it; they are simply not this layer's to draw.
    rows = (MovementPattern.objects
            .filter(source="dtm", metric="returnees", admin_level=2)
            .exclude(admin_pcode=None)
            .order_by("admin_pcode", "date"))
    if not rows.exists():
        dump("returnee_localities.json", {
            "source": "IOM DTM Sudan Displacement and Return Snapshots via HDX. "
                      "No rows held yet - pull the dtm/displacement_snapshot row.",
            "metric": "Returnee individuals (IOM DTM)",
            "states": {}, "localities": []})
        print("    0 localities (nothing pulled yet)")
        return

    with connection.cursor() as cur:
        cur.execute("""
            SELECT pcode, name, center_lon, center_lat
              FROM admin_areas
             WHERE iso3 = 'SDN' AND kind = 'admin' AND level IN (1, 2)
        """)
        places = {p: (n, lon, lat) for p, n, lon, lat in cur.fetchall()}

    # Every matrix cell, keyed by the locality and date it belongs to.
    # Households are kept apart: they are a second UNIT of the same
    # observation, not an origin, and putting them in `from` would list
    # "total" beside White Nile as though it were a place.
    cells = collections.defaultdict(dict)
    households = {}
    for cell in (DisplacementBreakdown.objects
                 .filter(source="dtm", metric="returnees")):
        if cell.dimension == "households":
            households[(cell.dest_pcode, cell.date)] = int(cell.value)
        else:
            cells[(cell.dest_pcode, cell.date)][cell.key] = int(cell.value)

    localities, unmatched, states_used = [], 0, set()
    by_place = collections.defaultdict(list)
    for row in rows:
        by_place[row.admin_pcode].append(row)

    for pcode, series_rows in by_place.items():
        place = places.get(pcode)
        if not place:
            unmatched += 1
            continue
        name, lon, lat = place
        series = []
        for row in sorted(series_rows, key=lambda r: r.date):
            breakdown = cells.get((pcode, row.date), {})
            origins = {k: v for k, v in breakdown.items() if k != "OUTSIDE_SDN"}
            states_used.update(origins)
            series.append({
                "date": row.date.isoformat(),
                "value": int(row.value),
                "outside": breakdown.get("OUTSIDE_SDN", 0),
                "households": households.get((pcode, row.date), 0),
                "from": dict(sorted(origins.items(), key=lambda kv: -kv[1])),
            })
        if not series:
            continue
        localities.append({
            "name": series_rows[-1].place_name or name, "pcode": pcode,
            "state": places.get(pcode[:4], ("", 0, 0))[0],
            "lon": round(lon, 4), "lat": round(lat, 4),
            "peak": max(p["value"] for p in series),
            "peak_outside": max(p["outside"] for p in series),
            "series": series,
        })
    localities.sort(key=lambda x: -x["peak"])

    # Only the states that actually appear as an origin, so the file carries no
    # centroid nothing draws.
    states = {p: {"name": places[p][0], "lon": round(places[p][1], 4),
                  "lat": round(places[p][2], 4)}
              for p in sorted(states_used) if p in places}

    dump("returnee_localities.json", {
        "source": "IOM DTM Sudan Displacement and Return Snapshots via HDX "
                  "(admin2 Returnee Master Lists), held in movement_patterns and "
                  "displacement_breakdown; placed on OCHA p-codes from the "
                  "boundary library. Figures are preliminary and subject to "
                  "revision by DTM. Citation: International Organization for "
                  "Migration (IOM). DTM Sudan Displacement and Return Snapshot. "
                  "IOM, Sudan.",
        "metric": "Returnee individuals (IOM DTM)",
        "states": states,
        "localities": localities,
    })
    print(f"    {len(localities)} localities ({unmatched} without a centroid), "
          f"{len(states)} origin states")


# ============================================ UNHCR asylum-country context
def build_unhcr_asylum():
    """Sudanese refugees by country of asylum - the other end of the returns.

    THIS IS CONTEXT, NOT ATTRIBUTION, and the distinction is the whole reason
    the file exists. IOM DTM says how many people returned to each Sudanese
    locality from outside the country and never says from where. UNHCR says how
    many Sudanese are held in each country of asylum and never says where in
    Sudan any of them went. Neither join exists, so this is published as a
    national-level panel and never as a line to a locality.

    It is also not a mirror image: over the window held, every asylum stock is
    RISING while DTM records returns. Both are true - people are leaving and
    coming back at once - and a panel that implied otherwise would be
    editorialising over the data.
    """
    rows = (MovementPattern.objects
            .filter(source="unhcr-odp", metric="refugees")
            .exclude(place_name=None)
            .order_by("place_name", "date"))

    by_country = collections.defaultdict(list)
    for r in rows:
        by_country[r.place_name].append({"date": r.date.isoformat(),
                                         "value": int(r.value)})

    countries = []
    for name, series in by_country.items():
        # A single reading, or a series that never leaves zero, is a stub row
        # UNHCR keeps for completeness (Somalia 2020, Tanzania 2019). Drawing
        # it would put an empty country in a panel about where people went.
        if len(series) < 2 or not any(p["value"] for p in series):
            continue
        countries.append({
            "country": name,
            "anchor": REF_ANCHORS.get(name),
            "latest": series[-1]["value"],
            "latest_date": series[-1]["date"],
            "change": series[-1]["value"] - series[0]["value"],
            "series": series,
        })
    countries.sort(key=lambda c: -c["latest"])

    dump("unhcr_asylum.json", {
        "source": "UNHCR Operational Data Portal via HDX (unhcr-situations), "
                  "Sudanese refugees and asylum-seekers by country of asylum, "
                  "held in movement_patterns under source 'unhcr-odp'. The two "
                  "population types are collapsed, not summed: UNHCR publishes "
                  "both labels for the same people on a reclassification date.",
        "metric": "Sudanese refugees and asylum-seekers, by country of asylum",
        "caveat": "Context for the returnee layer, not an attribution. DTM does "
                  "not publish which country its cross-border returnees came "
                  "from, and nothing here may be read as saying so.",
        "countries": countries,
    })
    total = sum(c["latest"] for c in countries)
    print(f"    {len(countries)} asylum countries, {total:,} people at latest")


# ============================================================ refugees
# Curated camps / transit centres (coords approximate, from UNHCR RRP reporting).
# These stay in code: they are a handful of operational points with no API behind
# them, and unlike the figures they do not change between reports.
REF_CAMPS = [
    {"name": "Adré transit centre", "country": "Chad", "lon": 22.20, "lat": 13.47, "opened": "2023-04", "type": "Transit centre", "size": 3},
    {"name": "Aboutengue camp", "country": "Chad", "lon": 22.05, "lat": 13.55, "opened": "2023-06", "type": "Refugee camp", "size": 2},
    {"name": "Metché camp", "country": "Chad", "lon": 21.85, "lat": 13.62, "opened": "2023-09", "type": "Refugee camp", "size": 2},
    {"name": "Gaga camp", "country": "Chad", "lon": 21.45, "lat": 13.49, "opened": "2023-05", "type": "Refugee camp", "size": 2},
    {"name": "Farchana camp", "country": "Chad", "lon": 21.66, "lat": 13.42, "opened": "2023-05", "type": "Refugee camp", "size": 1},
    {"name": "Tiné reception site", "country": "Chad", "lon": 22.30, "lat": 14.94, "opened": "2023-05", "type": "Reception site", "size": 1},
    {"name": "Iriba camps (Touloum/Iridimi)", "country": "Chad", "lon": 22.27, "lat": 15.13, "opened": "2023-06", "type": "Refugee camp", "size": 1},
    {"name": "Renk transit centre", "country": "South Sudan", "lon": 32.78, "lat": 11.75, "opened": "2023-05", "type": "Transit centre", "size": 3},
    {"name": "Maban camps (Doro/Kaya/Batil)", "country": "South Sudan", "lon": 33.73, "lat": 9.94, "opened": "2023-06", "type": "Refugee camp", "size": 2},
    {"name": "Wedweil settlement", "country": "South Sudan", "lon": 28.20, "lat": 9.10, "opened": "2023-08", "type": "Refugee settlement", "size": 1},
    {"name": "Kumer camp", "country": "Ethiopia", "lon": 36.30, "lat": 12.85, "opened": "2023-06", "type": "Refugee camp", "size": 1},
    {"name": "Awlala / Aftit sites", "country": "Ethiopia", "lon": 36.40, "lat": 12.70, "opened": "2023-09", "type": "Reception site", "size": 1},
    {"name": "Wadi Halfa / Argeen arrival", "country": "Egypt", "lon": 31.30, "lat": 22.00, "opened": "2023-04", "type": "Border arrival (urban onward)", "size": 1},
    {"name": "Kufra reception", "country": "Libya", "lon": 23.31, "lat": 24.18, "opened": "2023-05", "type": "Reception / transit", "size": 1},
    {"name": "Korsi site (Birao)", "country": "Central African Republic", "lon": 22.78, "lat": 10.28, "opened": "2023-06", "type": "Reception site", "size": 1},
]

# Where to draw each host country's total. Kept here because it is a cartographic
# choice - a readable spot on the map - not a fact about the country.
REF_ANCHORS = {
    "Chad": [21.9, 13.9], "South Sudan": [32.9, 10.5], "Egypt": [31.0, 24.0],
    "Ethiopia": [36.5, 12.6], "Central African Republic": [22.8, 9.5],
    "Libya": [23.3, 24.2], "Uganda": [32.4, 2.5],
}


def build_refugees():
    """Host-country refugee totals - UNHCR's annuals AND the Excel biweekly series.

    Both sources are read here, in one place. s07 used to rewrite this file after
    s06 had written it, merging the workbook in; that meant two steps owned one
    file, and whichever ran last decided what the dashboard showed. Now the table
    holds both and this function reads them together.
    """
    # TWO QUANTITIES, TWO SERIES, AND THEY MUST NOT SHARE A LINE.
    #
    # This function used to merge every refugee source into one series per
    # country, preferring the Excel reading wherever the dates collided. That
    # was wrong, and Chad showed it plainly: the line ran 1,330,950 at
    # 2025-07-01 (UNHCR's annual stock - EVERY Sudanese refugee in Chad) and
    # then 919,187 at 2026-04-10 (the office workbook - arrivals SINCE
    # 15 April 2023 only). A reader saw 411,763 people leave Chad. Nobody left.
    # The definition changed mid-series.
    #
    #   series    what the bubble draws and animates. THE OFFICE WORKBOOK
    #             LEADS: it is hand-maintained from UNHCR's Sudan situation
    #             portal (data.unhcr.org/en/situations/sudansituation), it is
    #             the freshest reading the office has, and it is the number
    #             this operation works to. HDX fills the dates behind it.
    #   current   UNHCR's ODP operational reading of the TOTAL caseload.
    #   arrivals  the workbook on its own, so its series is readable apart.
    #   pre_war   the caseload the country already held on 15 Apr 2023.
    #
    # EVERY POINT CARRIES THE SOURCE IT CAME FROM, and that is what stops the
    # join lying. The workbook counts people who arrived SINCE 15 April 2023;
    # UNHCR's annual stock counts EVERY Sudanese refugee in the country,
    # pre-war caseload included. Chad's line therefore used to run 1,330,950
    # at 2025-07-01 straight into 919,187 at 2026-04-10 - a 411,763 fall a
    # reader took for people leaving. Nobody left. The popup now names the
    # source and the basis of whichever point the timeline is sitting on, so
    # a step in the line is explained where it is seen rather than guessed at.
    rows = (MovementPattern.objects
            .filter(metric="refugees", source__in=["unhcr", "unhcr-odp", "excel"])
            .exclude(place_name=None)
            .order_by("place_name", "date"))

    annual = collections.defaultdict(dict)
    current = {}
    arrivals = collections.defaultdict(dict)
    sources = collections.defaultdict(set)
    for r in rows:
        key = r.date.isoformat()
        if r.source == "excel":
            arrivals[r.place_name][key] = int(r.value)
        elif r.source == "unhcr":
            annual[r.place_name][key] = int(r.value)
        elif r.source == "unhcr-odp":
            # Only the latest is needed here; build_unhcr_asylum() publishes
            # the whole ODP series for the asylum panel.
            if r.place_name not in current or key > current[r.place_name]["date"]:
                current[r.place_name] = {"date": key, "value": int(r.value)}
        sources[r.place_name].add(r.source)

    countries = []
    for name in sorted(set(annual) | set(arrivals) | set(current)):
        # THE THREE BASES, IN THE ORDER THE TIMELINE MEETS THEM.
        #
        #   prewar  HDX's annual stock at a date BEFORE 15 Apr 2023 - the
        #           caseload the country already held. What a reader sees when
        #           the timeline is parked at its start.
        #   hdx     HDX's annual stock during the war: all Sudanese refugees,
        #           pre-war caseload included. Covers the years before the
        #           portal series begins.
        #   portal  UNHCR's Sudan situation portal, read by the office. Wins
        #           any date it reports, being both the freshest reading and
        #           the one this operation works to.
        merged = {d: (v, "prewar" if d < CRISIS_START else "hdx")
                  for d, v in annual[name].items()}
        merged.update({d: (v, "portal") for d, v in arrivals[name].items()})
        series = [{"date": d, "value": v, "basis": basis}
                  for d, (v, basis) in sorted(merged.items())]
        arrival_series = [{"date": d, "value": v}
                          for d, v in sorted(arrivals[name].items())]

        before = [p for p in series if p["basis"] == "prewar"]
        countries.append({
            "country": name,
            "anchor": REF_ANCHORS.get(name),
            "series": series,
            "current": current.get(name),
            "arrivals": arrival_series,
            "pre_war": before[-1] if before else None,
            "sources": sorted(sources[name]),
        })
    dump("refugee_camps.json", {
        "source": "Country figures from movement_patterns. `series` is what the map "
                  "draws, by priority: UNHCR's Sudan situation portal "
                  "(data.unhcr.org/en/situations/sudansituation, arrivals since "
                  "15 Apr 2023, read by the office) wherever it reports, "
                  "and UNHCR's annual stock via HDX (all Sudanese refugees, pre-2023 "
                  "caseload included) for the dates behind it - every point carries "
                  "its `basis` - prewar, hdx or portal - so the popup can say which "
                  "footing it is on. `current` is "
                  "UNHCR's ODP operational total, fresher still and a different count "
                  "again: it and the annual series disagree by up to 380,209 (South "
                  "Sudan, Jun/Jul 2025), so they are never drawn on one line. "
                  "`arrivals` is the workbook alone; `pre_war` the last annual total "
                  "before the war. Camp markers curated from UNHCR RRP operational "
                  "reporting (coordinates approximate).",
        "crisis_start": CRISIS_START,
        "portal_url": UNHCR_PORTAL,
        "countries": countries, "camps": REF_CAMPS,
    })
    n_points = sum(len(c["series"]) + len(c["arrivals"]) for c in countries)
    print(f"    {len(countries)} host countries, {n_points} figures")


# ============================================================ food security
def _features_sql(where, params):
    """Read areas back as GeoJSON features, geometry written by PostGIS itself."""
    with connection.cursor() as cur:
        cur.execute(f"""
            SELECT json_build_object(
                     'type', 'Feature',
                     'geometry', ST_AsGeoJSON(geom_web, 5)::json,
                     'properties', json_build_object(
                        'area', area_title, 'ph', phase, 'p3', phase3plus_pct,
                        'fam', (COALESCE(phase5_population, 0) > 0 OR phase >= 5),
                        'color', colour, 'iso3', iso3, 'src', source))
              FROM food_security
             WHERE geom_web IS NOT NULL AND NOT ST_IsEmpty(geom_web) AND {where}
        """, params)
        return [row[0] for row in cur.fetchall()]


def build_foodsec():
    """One IPC snapshot per analysis period, per country.

    Sudan keeps the existing single file so the current dashboard is untouched.
    Every country - Sudan included - also gets its own file under ipc_fs/, which is
    what a multi-country map should load: one file per country in scope, rather
    than one 13.9 MB file carrying every country at every period.

    A country with rows but no geometry produces no file, and is named rather than
    silently skipped. Ethiopia used to be that case: FEWS NET publishes unit codes,
    not polygons. Its areas are now matched to the boundary library by name
    (manage.py resolve_fewsnet_areas), so it maps like the rest.
    """
    isos = sorted(set(FoodSecurityArea.objects.values_list("iso3", flat=True)))
    written, skipped = [], []
    for iso in isos:
        dates = sorted(set(FoodSecurityArea.objects
                           .filter(iso3=iso).exclude(period_date=None)
                           .values_list("period_date", flat=True)))
        periods = {}
        for d in dates:
            feats = _features_sql("iso3 = %s AND period_date = %s", [iso, d])
            if feats:
                periods[d.isoformat()] = {"type": "FeatureCollection", "features": feats}
        if not periods:
            skipped.append(iso)
            continue
        payload = {
            "_meta": {"source": "IPC / Cadre Harmonise via the food_security table; one "
                                "snapshot per analysis period, area level.",
                      "iso3": iso, "dates": sorted(periods)},
            "periods": periods,
        }
        dump(f"ipc_fs/{iso}.geojson", payload)
        written.append(iso)
        if iso == "SDN":
            # The file the current dashboard already fetches, unchanged in shape.
            dump("ipc_areas_fs.geojson", payload)

    print(f"    {len(written)} countries with mappable areas: {', '.join(written)}")
    if skipped:
        print(f"    {', '.join(skipped)} have phases but no geometry (FEWS NET publishes none)")


# ============================================================ seasonal
# FEWS NET publishes no colours, so they are chosen here, by season type - which
# also means a lean season is the same colour in every country.
# NO COLOUR TABLE HERE ANY MORE. It used to bake a hex into every row of
# seasonal.json, which put the calendar's palette in a second place - so the
# brand block in app.css was no longer "the ONE place colour is defined" that it
# claims to be, and the strip's colours drifted away from IFRC's. The frontend
# now colours by `season_type` from --season-* in that block, and this step
# emits the type alone.

# Which publisher a country's calendar is taken from. ACAPS wins wherever it has
# rows: it names the crop, explains the event in a sentence, says which regions it
# applies to, and links the assessment behind it - all of which FEWS NET's bare
# national bands leave out. FEWS NET remains the fallback so a country ACAPS has
# not covered still shows something.
SEASONAL_PREFERENCE = ["acaps", "fewsnet", "curated"]


def build_seasonal():
    """The seasonal calendars, now one per country instead of Sudan alone.

    The shape changes here, and only here: this file becomes {iso3: {...}} so the
    frontend can show the calendar for whichever countries are selected. That is
    the one output whose structure moves in this step, and it moves now so the
    multi-country panel is a frontend change alone.
    """
    # One publisher per country, the best available - not a blend. Showing ACAPS
    # and FEWS NET bands side by side would put two descriptions of the same
    # lean season in one strip and leave a reader to guess which to believe.
    have = {}
    for r in SeasonalCalendar.objects.all():
        have.setdefault(r.iso3, set()).add(r.source)
    chosen = {iso: next((s for s in SEASONAL_PREFERENCE if s in srcs), None)
              for iso, srcs in have.items()}

    out = {}
    for r in SeasonalCalendar.objects.order_by("iso3", "event_type", "start_month", "label"):
        if r.source != chosen.get(r.iso3):
            continue
        entry = out.setdefault(r.iso3, {
            "country": r.country_name, "source": r.source, "items": [],
        })
        # `months` is the stored truth where we have it; a span is expanded only
        # for rows that predate that column.
        months = list(r.months or [])
        if not months:
            m = r.start_month
            while True:
                months.append(m)
                if m == r.end_month or len(months) > 12:
                    break
                m = 1 if m == 12 else m + 1
        entry["items"].append({
            "label": r.label, "months": months,
            "note": r.description or "",
            "event": r.event, "event_type": r.event_type,
            "season_type": r.season_type, "source": r.source,
            "country_wide": r.country_wide,
            "areas": r.admin_names or [],
            "source_org": r.source_org, "source_url": r.source_url,
            "source_date": r.source_date.isoformat() if r.source_date else None,
        })
    dump("seasonal.json", {
        "source": "ACAPS Seasonal Events Calendar where available, FEWS NET get_seasons "
                  "otherwise; held in the seasonal_calendar table.",
        "countries": out,
    })
    print("    " + ", ".join(f"{k} {len(v['items'])} ({v['source']})"
                             for k, v in sorted(out.items())))


# ============================================================ AOI + IPC
def build_aoi():
    """Colour each IFRC Area of Interest by the worst IPC phase inside it.

    This used to read a cached file built by _build_aoi_ipc.py, which in turn read
    IPC pulls from a path pinned to a Claude session from June - so it silently
    served stale data, or none, depending on what still existed on disk. The phase
    is now computed where the geometry already lives: a spatial join in PostGIS
    between the AOI polygons and the food-security areas that intersect them.

    A consequence worth having: CAR's Vakaga and Uganda's Kiryandongo were grey
    only because nobody had pulled their country's IPC data. Vakaga now colours
    itself, and Kiryandongo stays grey for the true reason - Uganda has no IPC
    analysis at all.
    """
    with connection.cursor() as cur:
        cur.execute("""
            WITH latest AS (
                SELECT DISTINCT ON (iso3) iso3, period_date
                  FROM food_security
                 WHERE geom IS NOT NULL
                 ORDER BY iso3, period_date DESC
            )
            SELECT a.id, a.name, a.iso3,
                   MAX(f.phase)                              AS worst_phase,
                   COUNT(f.id)                               AS n_areas,
                   COUNT(f.id) FILTER (WHERE f.phase >= 3)   AS n_phase3plus,
                   MAX(f.phase3plus_pct)                     AS p3,
                   ST_AsGeoJSON(a.geom_web, 5)               AS geometry
              FROM admin_areas a
              LEFT JOIN latest l ON l.iso3 = a.iso3
              LEFT JOIN food_security f
                     ON f.iso3 = a.iso3 AND f.period_date = l.period_date
                    AND f.geom IS NOT NULL
                    AND ST_Intersects(a.geom, f.geom)
             WHERE a.kind = 'aoi'
             GROUP BY a.id, a.name, a.iso3, a.geom_web
             ORDER BY a.iso3, a.name
        """)
        rows = cur.fetchall()

    # IPC's own phase colours, so an AOI reads the same as the areas beneath it.
    colours = {1: "#CDFACD", 2: "#FAE61E", 3: "#E67800", 4: "#C80000", 5: "#640000"}
    features, with_ipc = [], 0
    for _id, name, iso3, phase, n_areas, n3, p3, geometry in rows:
        if phase:
            with_ipc += 1
        features.append({
            "type": "Feature",
            "geometry": json.loads(geometry) if geometry else None,
            "properties": {
                "name": name, "ipc_country": iso3,
                "ipc_phase": phase,
                "ipc_color": colours.get(phase, "#bdbdbd"),
                "ipc_p3": p3, "ipc_n_areas": n_areas or 0, "ipc_n_phase3plus": n3 or 0,
            },
        })
    dump("aoi_ipc.geojson", {"type": "FeatureCollection", "features": features})
    print(f"    {len(features)} AOIs, {with_ipc} with an IPC phase "
          f"(computed by spatial join, not from a cache)")


# ============================================================ service points
def build_hsps():
    """Humanitarian Service Points - one marker per district offering a service.

    A MARKER HERE IS A DISTRICT, NOT A BUILDING. The Kobo export holds no site
    coordinates: it records which services a National Society offers and which
    districts it offers them in. The position is the district's point-on-surface,
    resolved when the export was loaded, so a marker means "this service is
    offered somewhere in this district". The popup says so too - it would be very
    easy for a reader to take these for addresses.

    THE EXCEPTION IS match_method='manual'. A few of the form's "districts" are
    border reception points that no polygon carries, so they were placed by hand
    from a real site coordinate held in place_coordinates. Those markers are
    points, and the property travels with them so the popup can say which it is
    rather than telling a reader the opposite of the truth.

    The newest export wins. Older ones stay in the table so a later reader can see
    what changed, but the map shows the current picture.
    """
    latest = (HumanitarianServicePoint.objects
              .order_by("-date_reported").values_list("date_reported", flat=True).first())
    if latest is None:
        print("    (no service points loaded - skipping)")
        return

    rows = (HumanitarianServicePoint.objects
            .filter(date_reported=latest)
            .exclude(lat=None)
            .order_by("iso3", "location_name", "service"))

    # One marker per place, carrying every service offered there: a district with
    # eight services should be one dot to click, not eight stacked on each other.
    places = {}
    for r in rows:
        key = (r.iso3, r.location_name)
        p = places.setdefault(key, {
            "country": r.country, "iso3": r.iso3, "place": r.location_name,
            "pcode": r.admin_pcode, "lon": r.lon, "lat": r.lat,
            "scope": r.scope, "services": [],
            # pcode / name / manual. Carried so the popup can tell a district's
            # point-on-surface from the handful of places that have no polygon
            # and were given a real site coordinate by hand - see
            # the place_coordinates table. Saying "district-level" over one of those
            # would be precisely backwards.
            "match_method": r.match_method,
        })
        if r.service not in p["services"]:
            p["services"].append(r.service)

    feats = [{
        "type": "Feature",
        "geometry": {"type": "Point", "coordinates": [p["lon"], p["lat"]]},
        "properties": {**{k: v for k, v in p.items() if k not in ("lon", "lat")},
                       "n_services": len(p["services"]),
                       "date_reported": latest.isoformat()},
    } for p in places.values()]

    dump("hsps.geojson", {
        "type": "FeatureCollection",
        "_meta": {
            "source": "IFRC Humanitarian Service Point Mapping (Kobo), held in the "
                      "humanitarian_service_points table.",
            "date_reported": latest.isoformat(),
            "note": "District-level, not point-level: the source publishes no site "
                    "coordinates. A marker is the district's point-on-surface.",
        },
        "features": feats,
    })
    print(f"    {len(feats)} districts offering services, reported {latest}")


# ============================================================ theme areas
def build_theme_areas():
    """The polygons the five pillars are drawn on, keyed by p-code.

    THIS IS THE LAYER THE HIGHLIGHTING LIVES ON, and it was silently broken. The
    corpus was re-parsed against the boundary library, so narrative_tags.area_id
    became an OCHA p-code - "SD16", "ET0604". But boundaries/areas.geojson was
    still the older file built by build_map_context, whose feature ids look like
    "SDN-ADM2:Abassiya". app.js writes one feature-state per area id onto that
    source, so every write landed on a feature that did not exist: no bands, no
    fills, and only the country-level wash - which is keyed on country name -
    still showing. That is exactly "I only see the country dimming".

    Building it here from admin_areas fixes the mismatch at its root, and gets two
    things free: the polygons are the office's own boundaries rather than borrowed
    ones, and every area the corpus can name is present, at whatever level it was
    matched - a locality highlights as a locality.
    """
    from data_track.models import NarrativeTag
    from external_data.models import HazardEvent

    # THE UNION, not just the tags: a locality that only Montandon knows about
    # still needs a polygon built for it, or its events light nothing.
    pcodes = sorted(
        set(NarrativeTag.objects
            .exclude(area_id=None).exclude(area_id="")
            .values_list("area_id", flat=True))
        | set(HazardEvent.objects
              .exclude(admin_pcode=None).exclude(admin_pcode="")
              .values_list("admin_pcode", flat=True)))
    if not pcodes:
        print("    (no tagged areas - skipping theme areas)")
        return

    # Named water bodies, so a flooding tag can light the river beside the area.
    water_path = DASHBOARD_DATA / "water.geojson"
    boxes = []
    if water_path.exists():
        water = json.loads(water_path.read_text(encoding="utf-8"))
        for f in water["features"]:
            name = (f["properties"] or {}).get("name")
            if not name:
                continue
            xs, ys = [], []
            def walk(c):
                if isinstance(c[0], (int, float)):
                    xs.append(c[0]); ys.append(c[1])
                else:
                    for x in c:
                        walk(x)
            walk(f["geometry"]["coordinates"])
            boxes.append((name, min(xs), min(ys), max(xs), max(ys)))
    MARGIN = 0.6

    with connection.cursor() as cur:
        cur.execute("""
            SELECT pcode, name, country_name, iso3, level,
                   bbox_w, bbox_s, bbox_e, bbox_n,
                   ST_AsGeoJSON(geom_web, 5)
              FROM admin_areas
             WHERE pcode = ANY(%s) AND geom_web IS NOT NULL
             ORDER BY level DESC, pcode
        """, [pcodes])
        rows = cur.fetchall()

    seen, feats = set(), []
    for pcode, name, country, iso3, level, w, s, e, n, geometry in rows:
        # Finest first, so where two publishers hold the same p-code the deeper
        # polygon wins - the same "most precise wins" rule the old file used.
        if pcode in seen:
            continue
        seen.add(pcode)
        near = [nm for nm, ww, ws, we, wn in boxes
                if w is not None and we >= w - MARGIN and ww <= e + MARGIN
                and wn >= s - MARGIN and ws <= n + MARGIN]
        feats.append({
            "type": "Feature",
            "geometry": json.loads(geometry),
            "properties": {"id": pcode, "name": name, "country": country,
                           "iso3": iso3, "level": level, "water": near},
        })

    dump("boundaries/areas.geojson", {"type": "FeatureCollection", "features": feats})
    missing = len(pcodes) - len(feats)
    print(f"    {len(feats)} theme areas keyed by p-code"
          + (f" ({missing} referenced but without geometry)" if missing else ""))


def run():
    """Rebuild every external layer from the database."""
    DASHBOARD_DATA.mkdir(parents=True, exist_ok=True)
    print("== external layers, from the database")
    build_crossings()
    build_idp_localities()
    build_returnee_localities()
    build_unhcr_asylum()
    build_refugees()
    build_foodsec()
    build_seasonal()
    build_aoi()
    build_hsps()
    build_hazards()
    build_hazard_events()
    build_theme_areas()
    build_data_dates()


# ============================================================ hazards
def build_hazards():
    """The hazard vocabulary, filtered to what the data actually holds.

    THE CODEBOOK IS A CLUSTERING METHOD, NOT A LIST TO RENDER. Writing all
    sixteen of its named hazards out would offer a Sahel operation tsunamis and
    volcanic eruptions while hiding the convective storms that really happen
    here. So the categories and the definitions come from the file, and
    membership comes from the rows: a category with nothing behind it never
    reaches the dropdown.
    """
    from data_track.models import NarrativeTag
    from external_data import hazards
    from external_data.models import HazardEvent

    montandon = collections.Counter(
        HazardEvent.objects.exclude(admin_pcode=None).exclude(admin_pcode="")
        .values_list("hazard_sub", flat=True))
    documents = collections.Counter(
        NarrativeTag.objects.filter(dimension="hazard").exclude(hazard_sub=None)
        .values_list("hazard_sub", flat=True))

    out = []
    for cat in hazards.categories():
        subs = []
        for sub in cat["sub_hazards"]:
            m, d = montandon.get(sub["key"], 0), documents.get(sub["key"], 0)
            if not (m or d):
                continue
            # WHICH KIND OF EVIDENCE stands behind this sub-hazard, so the
            # dashboard can say so rather than leaving a reader to wonder why
            # Floods and Flooding both appear in one list.
            subs.append({**sub,
                         "from": ("both" if m and d else "montandon" if m else "documents"),
                         "count": m + d})
        if subs:
            out.append({"key": cat["key"], "label": cat["label"],
                        "in_codebook": cat["in_codebook"],
                        "definition": cat["definition"], "sub_hazards": subs})
    dump("hazards.json", {"categories": out})


def build_hazard_events():
    """Montandon events as counts per area and month, plus the popup detail.

    NO GEOMETRY. The polygons come from boundaries/areas.geojson exactly as the
    document tags' do - this file only says which areas to light, and what to
    say about them, in the same shape a tags.json entry has so renderThemes()
    can union the two.

    DEDUPLICATED ON corr_id. Three sources publish the same flood; the area is
    lit once and the popup names all three. The representative row is the one
    from the most place-specific source, because "North Darfur (Tawila
    Locality)" beats "Forest fires in Sudan".

    THE COUNTRY IS THE POLYGON'S, not the filing country's. Montandon's tags are
    loose enough that most of Sudan's events sit in South Sudan; the map filters
    on country, so it has to be told where the lit area actually is.
    """
    from external_data.models import HazardEvent, HazardImpact

    # The order of place-name specificity.
    PREFERENCE = {"idmc-idu": 0, "pdc": 1, "gdacs": 2}

    events = list(HazardEvent.objects.exclude(admin_pcode=None).exclude(admin_pcode="")
                  .order_by("event_date", "id"))
    if not events:
        print("    (no located hazard events - skipping)")
        dump("hazard_events.json", {"by_sub": {}, "events": {}})
        return

    # The office's own country names, from the boundary library, so the strings
    # match the ones tags.json already carries and the country filter can
    # compare them without a translation table.
    with connection.cursor() as cur:
        cur.execute("SELECT DISTINCT iso3, country_name FROM admin_areas")
        country_name = dict(cur.fetchall())

    impacts = collections.defaultdict(list)
    for imp in HazardImpact.objects.all():
        impacts[imp.corr_id].append(
            {"type": imp.impact_type, "value": imp.value, "unit": imp.unit,
             "category": imp.category, "source": imp.collection})

    links = _insight_links(events)

    # One entry per (corr_id, area): the best row, and every source that saw it.
    best, sources = {}, collections.defaultdict(set)
    for event in events:
        key = (event.corr_id or event.event_id, event.admin_pcode)
        sources[key].add(event.collection)
        current = best.get(key)
        if current is None or (PREFERENCE.get(event.collection, 9)
                               < PREFERENCE.get(current.collection, 9)):
            best[key] = event

    by_sub = collections.defaultdict(lambda: collections.defaultdict(int))
    detail = collections.defaultdict(lambda: collections.defaultdict(list))
    for key, event in best.items():
        month = event.event_date.strftime("%Y-%m")
        country = country_name.get(event.admin_iso3 or event.iso3, event.iso3)
        by_sub[event.hazard_sub][
            (month, country, event.admin_pcode, event.significance)] += 1
        detail[event.admin_pcode][month].append({
            "date": event.event_date.isoformat(),
            "title": event.title,
            "sub": event.hazard_sub,
            "category": event.hazard_category,
            "significance": event.significance,
            # ALWAYS WITH ITS UNIT. GDACS 0.5 and PDC 0.1 are different scales,
            # so a bare number here would invite a meaningless comparison.
            "severity_label": event.severity_label,
            "severity_unit": event.severity_unit,
            "impacts": impacts.get(event.corr_id, []),
            "sources": sorted(sources[key]),
            "insight_ids": links.get(event.id, []),
        })

    dump("hazard_events.json", {
        "by_sub": {sub: {"monthly": [
            {"month": m, "country": c, "count": n, "area": a, "significance": s}
            for (m, c, a, s), n in sorted(rows.items())]}
            for sub, rows in by_sub.items()},
        "events": {area: dict(months) for area, months in detail.items()},
    })


def _insight_links(events):
    """event id -> the published insights that speak to it.

    THREE CONDITIONS, ALL OF THEM. Same hazard category, same place, same month.
    A country-level insight does not link to every event in the country, and an
    insight about shelling does not link to a flood.

    MANY EVENTS LINK TO NOTHING, and that is the design rather than a gap: the
    hazards are the spine, and the insights attach where they exist.

    This READS the insights app and never writes to it. No pipeline step writes
    to that app, deliberately, and this one does not change that.
    """
    from external_data.hazards import for_tag
    from insights.models import Insight

    coded = collections.defaultdict(list)     # (category, pcode, month) -> [id]
    rows = (Insight.objects.filter(status="published")
            .exclude(admin_pcode=None).exclude(admin_pcode="")
            .exclude(stated_on=None)
            .values("id", "admin_pcode", "stated_on",
                    "codings__dimension", "codings__tag"))
    for row in rows:
        if row["codings__dimension"] != "hazard":
            continue
        category, _sub = for_tag(row["codings__tag"])
        if not category:
            continue
        key = (category, row["admin_pcode"], row["stated_on"].strftime("%Y-%m"))
        if row["id"] not in coded[key]:
            coded[key].append(row["id"])

    out = {}
    for event in events:
        key = (event.hazard_category, event.admin_pcode,
               event.event_date.strftime("%Y-%m"))
        out[event.id] = sorted(coded.get(key, []))
    return out
