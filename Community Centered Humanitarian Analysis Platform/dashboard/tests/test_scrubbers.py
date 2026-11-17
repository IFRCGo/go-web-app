"""One cleaning rule per dashboard data file. Each test pairs a hidden-country
item with a Chad item and checks only the hidden one goes."""
import copy
import json
import tempfile
from pathlib import Path

from django.test import TestCase, override_settings

from boundaries.models import AdminArea, BoundarySource
from dashboard import scrubbers as S
from dashboard.visibility import Hidden, iso3_for_pcode

H = Hidden(frozenset({"LBY", "CAF"}), frozenset({"Libya", "Central African Republic"}))


def fc(*props):
    return {"type": "FeatureCollection",
            "features": [{"type": "Feature", "geometry": None, "properties": p} for p in props]}


def names(fc_):
    return [f["properties"].get("name") for f in fc_["features"]]


def square(x0, y0, x1, y1):
    return {"type": "Polygon", "coordinates": [[[x0, y0], [x1, y0], [x1, y1], [x0, y1], [x0, y0]]]}


class GeoFileTests(TestCase):
    def test_iso3_feature_files(self):
        for path in ("boundaries/admin0.geojson", "boundaries/admin1.geojson",
                     "boundaries/admin1_lines.geojson", "boundaries/areas.geojson",
                     "hsps.geojson"):
            out = S.scrubber_for(path)(fc({"name": "L", "iso3": "LBY"},
                                          {"name": "T", "iso3": "TCD"}), H)
            self.assertEqual(names(out), ["T"], path)

    def test_aoi_ipc_by_ipc_country(self):
        out = S.scrubber_for("aoi_ipc.geojson")(
            fc({"name": "Vakaga", "ipc_country": "CAF"}, {"name": "Ouaddai", "ipc_country": "TCD"}), H)
        self.assertEqual(names(out), ["Ouaddai"])

    def test_aoi_by_name_lookup(self):
        src = BoundarySource.objects.create(path="t.shp")
        AdminArea.objects.create(source=src, kind="aoi", iso3="CAF", country_name="CAR",
                                 level=None, pcode="AOI1", name="Vakaga")
        AdminArea.objects.create(source=src, kind="aoi", iso3="TCD", country_name="Chad",
                                 level=None, pcode="AOI2", name="Ouaddai")
        out = S.scrubber_for("boundaries/aoi.geojson")(fc({"name": "Vakaga"}, {"name": "Ouaddai"}), H)
        self.assertEqual(names(out), ["Ouaddai"])

    def test_ipc_fs_hidden_country_is_whole_file(self):
        caf = {"_meta": {"iso3": "CAF"}, "periods": {}}
        tcd = {"_meta": {"iso3": "TCD"}, "periods": {}}
        self.assertIs(S.scrubber_for("ipc_fs/CAF.geojson")(caf, H), S.WHOLE_FILE)
        self.assertEqual(S.scrubber_for("ipc_fs/TCD.geojson")(tcd, H), tcd)
        self.assertEqual(S.scrubber_for("ipc_areas_fs.geojson")(tcd, H), tcd)


class JsonFileTests(TestCase):
    def test_tag_areas(self):
        out = S.scrubber_for("tag_areas.json")(
            {"CF53": {"iso3": "CAF"}, "TD01": {"iso3": "TCD"}}, H)
        self.assertEqual(list(out), ["TD01"])

    def test_seasonal(self):
        out = S.scrubber_for("seasonal.json")(
            {"source": "x", "countries": {"LBY": {}, "TCD": {}}}, H)
        self.assertEqual(list(out["countries"]), ["TCD"])
        self.assertEqual(out["source"], "x")

    def test_refugee_camps(self):
        out = S.scrubber_for("refugee_camps.json")({
            "countries": [{"country": "Libya"}, {"country": "Chad"}],
            "camps": [{"country": "Central African Republic"}, {"country": "Chad"}]}, H)
        self.assertEqual([c["country"] for c in out["countries"]], ["Chad"])
        self.assertEqual([c["country"] for c in out["camps"]], ["Chad"])

    def test_unhcr_asylum(self):
        out = S.scrubber_for("unhcr_asylum.json")(
            {"caveat": "c", "countries": [{"country": "Libya"}, {"country": "Chad"}]}, H)
        self.assertEqual([c["country"] for c in out["countries"]], ["Chad"])

    def test_crossings(self):
        out = S.scrubber_for("crossings.json")(
            {"points": [{"country": "Libya"}, {"country": "Chad"}, {"country": "Sudan"}]}, H)
        self.assertEqual([c["country"] for c in out["points"]], ["Chad", "Sudan"])

    def test_field_surveys_hidden_country_dropped(self):
        out = S.scrubber_for("field_surveys.json")(
            {"surveys": [{"iso3": "LBY", "place": "x"}, {"iso3": "UGA", "place": "y"}]}, H)
        self.assertEqual([s["place"] for s in out["surveys"]], ["y"])

    def test_flows(self):
        data = {k: {} for k in ("sudan-car", "libya-sudan-return", "sudan-chad",
                                "south_sudan-sudan-influx", "sudan-south_sudan")}
        out = S.scrubber_for("flows.json")(data, H)
        self.assertEqual(sorted(out), ["south_sudan-sudan-influx", "sudan-chad", "sudan-south_sudan"])

    def test_corridor_countries_shapes(self):
        self.assertEqual(S.corridor_countries("sudan-car"), {"Central African Republic"})
        self.assertEqual(S.corridor_countries("libya-sudan-return"), {"Libya"})
        self.assertEqual(S.corridor_countries("south_sudan-sudan-influx"), {"South Sudan"})
        self.assertEqual(S.corridor_countries("sudan-south_sudan"), {"South Sudan"})

    def test_documents(self):
        out = S.scrubber_for("documents.json")(
            [{"country": "Libya"}, {"country": "Chad"}, {"country": "Regional"}, {"country": None}], H)
        self.assertEqual([d["country"] for d in out], ["Chad", "Regional", None])

    def test_tags(self):
        data = {"coping": {"meal_reduction": {
            "monthly": [{"month": "2024-01", "country": "Libya", "count": 2},
                        {"month": "2024-01", "country": "Chad", "count": 1},
                        {"month": "2024-01", "country": None, "count": 1}],
            "snippets": {"2024-01": {"Libya": "a", "Chad": "b", "null": "c"}}}}}
        out = S.scrubber_for("tags.json")(data, H)["coping"]["meal_reduction"]
        self.assertEqual([m["country"] for m in out["monthly"]], ["Chad", None])
        self.assertEqual(out["snippets"]["2024-01"], {"Chad": "b", "null": "c"})

    def test_hazard_events(self):
        src = BoundarySource.objects.create(path="t.shp")
        AdminArea.objects.create(source=src, iso3="LBY", country_name="Libya", level=2,
                                 pcode="LY0106", name="x")
        AdminArea.objects.create(source=src, iso3="TCD", country_name="Chad", level=2,
                                 pcode="TCD0704", name="y")
        iso3_for_pcode.cache_clear()
        data = {"by_sub": {"floods": {"monthly": [
                    {"country": "Libya", "area": "LY0106"}, {"country": "Chad", "area": "TCD0704"}]}},
                "events": {"LY0106": {}, "TCD0704": {}}}
        out = S.scrubber_for("hazard_events.json")(data, H)
        self.assertEqual([m["country"] for m in out["by_sub"]["floods"]["monthly"]], ["Chad"])
        self.assertEqual(list(out["events"]), ["TCD0704"])

    def test_regional_and_sudan_only_files_pass_through(self):
        for path in ("idp_localities.json", "idp_states.json", "returnee_localities.json",
                     "headline.json", "meta.json", "hazards.json", "water.geojson"):
            data = {"x": [1, 2]}
            self.assertEqual(S.scrubber_for(path)(data, H), data, path)

    def test_scrubbers_do_not_mutate_input(self):
        cases = {
            "flows.json": {"sudan-libya": {}, "sudan-chad": {}},
            "tags.json": {"d": {"t": {"monthly": [{"country": "Libya"}],
                                      "snippets": {"m": {"Libya": "x"}}}}},
            "hazard_events.json": {"by_sub": {"f": {"monthly": [{"country": "Libya"}]}},
                                   "events": {}},
        }
        for path, data in cases.items():
            before = copy.deepcopy(data)
            S.scrubber_for(path)(data, H)
            self.assertEqual(data, before, path)

    def test_unknown_file_has_no_scrubber(self):
        self.assertIsNone(S.scrubber_for("brand_new_layer.json"))


class EventTests(TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        base = Path(self.tmp.name)
        (base / "boundaries").mkdir()
        admin0 = {"type": "FeatureCollection", "features": [
            {"type": "Feature", "properties": {"name": "Libya", "iso3": "LBY"},
             "geometry": square(20, 20, 25, 30)},
            {"type": "Feature", "properties": {"name": "Chad", "iso3": "TCD"},
             "geometry": square(14, 8, 20, 20)}]}
        (base / "boundaries" / "admin0.geojson").write_text(json.dumps(admin0))
        self.override = override_settings(DASHBOARD_DATA_DIR=base)
        self.override.enable()
        S.clear_caches()

    def tearDown(self):
        self.override.disable()
        S.clear_caches()
        self.tmp.cleanup()

    def scrub(self, events):
        return S.scrubber_for("events.json")(events, H)

    def test_event_in_hidden_country_goes(self):
        out = self.scrub([{"title": "Kufra", "lon": 23, "lat": 24},
                          {"title": "Adre", "lon": 18, "lat": 13}])
        self.assertEqual([e["title"] for e in out], ["Adre"])

    def test_events_without_coordinates_stay(self):
        out = self.scrub([{"title": "Ceasefire", "lon": None, "lat": None}])
        self.assertEqual(len(out), 1)

    def test_event_outside_every_polygon_stays(self):
        out = self.scrub([{"title": "Sea", "lon": 40, "lat": 40}])
        self.assertEqual(len(out), 1)

    def test_text_is_not_edited(self):
        ev = {"title": "Returns", "description": "return from Egypt and Libya", "lon": 18, "lat": 13}
        self.assertEqual(self.scrub([ev]), [ev])


class RegistryTests(TestCase):
    def test_registry_patterns_are_reachable(self):
        samples = ["boundaries/admin0.geojson", "boundaries/admin1.geojson",
                   "boundaries/admin1_lines.geojson", "boundaries/areas.geojson",
                   "boundaries/aoi.geojson", "hsps.geojson", "aoi_ipc.geojson",
                   "ipc_fs/SDN.geojson", "ipc_areas_fs.geojson", "tag_areas.json",
                   "seasonal.json", "refugee_camps.json", "unhcr_asylum.json",
                   "crossings.json", "flows.json", "documents.json", "tags.json",
                   "hazard_events.json", "events.json", "idp_localities.json",
                   "idp_states.json", "returnee_localities.json", "headline.json",
                   "meta.json", "hazards.json", "water.geojson", "data_dates.json",
                   "field_surveys.json"]
        import fnmatch
        for pattern, _ in S.REGISTRY:
            self.assertTrue(any(fnmatch.fnmatchcase(s, pattern) for s in samples), pattern)
