"""Every public /api/ address applies the country switch to its own rows."""
import datetime as dt
import json
import tempfile
from pathlib import Path

from django.test import TestCase, override_settings
from django.urls import get_resolver

from boundaries.models import AdminArea, BoundarySource
from dashboard import scrubbers
from dashboard.gated import GATED, REGIONAL
from dashboard.models import CountryVisibility
from data_track.models import Document, Event, MovementFlow, NarrativeTag, PopulationFigure
from external_data.models import (BorderCrossing, FoodSecurityArea, HumanitarianServicePoint,
                                  MovementPattern, SeasonalCalendar, SourceSync)
from insights.models import Insight, InsightMovement

D = dt.date(2025, 1, 1)


def square(x0, y0, x1, y1):
    return {"type": "Polygon", "coordinates": [[[x0, y0], [x1, y0], [x1, y1], [x0, y1], [x0, y0]]]}


class ApiGateTests(TestCase):
    def setUp(self):
        CountryVisibility.objects.create(iso3="LBY", name="Libya", shown=False)
        CountryVisibility.objects.create(iso3="TCD", name="Chad", shown=True)

    def get(self, url):
        r = self.client.get(url)
        self.assertEqual(r.status_code, 200, url)
        raw = b"".join(r.streaming_content) if r.streaming else r.content
        return json.loads(raw)

    @staticmethod
    def rows(body):
        return body["results"] if isinstance(body, dict) and "results" in body else body

    # ---------------------------------------------------------------- insights
    def make_insight(self, iso3, n):
        return Insight.objects.create(quote=f"q{n}", quote_sha1=f"{n:040d}", stated_on=D,
                                      iso3=iso3, status="published")

    def test_insights_list(self):
        self.make_insight("LBY", 1)
        self.make_insight("TCD", 2)
        body = self.get("/api/insights/")
        self.assertEqual([r["iso3"] for r in body["results"]], ["TCD"])
        self.assertEqual(body["count"], 1)

    def test_insight_in_shown_country_keeps_movement_into_hidden_one(self):
        ins = self.make_insight("TCD", 3)
        InsightMovement.objects.create(insight=ins, flow_type="cross_border", dest_iso3="LBY")
        row = self.get("/api/insights/")["results"][0]
        self.assertEqual(row["movements"][0]["destination"]["iso3"], "LBY")

    # ---------------------------------------------------------------- data_track
    def test_documents(self):
        Document.objects.create(file_name="a", rel_path="a", country_focus="Libya")
        Document.objects.create(file_name="b", rel_path="b", country_focus="Chad")
        self.assertEqual([d["country"] for d in self.get("/api/documents/")], ["Chad"])

    def test_figures(self):
        PopulationFigure.objects.create(country="Libya", metric="refugees", value=1)
        PopulationFigure.objects.create(country="Chad", metric="refugees", value=2)
        self.assertEqual([f["country"] for f in self.rows(self.get("/api/figures/"))], ["Chad"])

    def test_tags(self):
        NarrativeTag.objects.create(country="Libya", dimension="hazard", tag="x", report_date=D)
        NarrativeTag.objects.create(country="Chad", dimension="hazard", tag="x", report_date=D)
        self.assertEqual([m["country"] for m in self.get("/api/tags/")["hazard"]["x"]], ["Chad"])

    def test_flows(self):
        MovementFlow.objects.create(corridor="sudan-libya", report_date=D, value=1)
        MovementFlow.objects.create(corridor="libya-sudan-return", report_date=D, value=1)
        MovementFlow.objects.create(corridor="sudan-chad", report_date=D, value=1)
        self.assertEqual(list(self.get("/api/flows/")), ["sudan-chad"])

    def test_events(self):
        tmp = tempfile.TemporaryDirectory()
        self.addCleanup(tmp.cleanup)
        base = Path(tmp.name)
        (base / "boundaries").mkdir()
        (base / "boundaries" / "admin0.geojson").write_text(json.dumps({
            "type": "FeatureCollection", "features": [
                {"type": "Feature", "properties": {"name": "Libya"}, "geometry": square(20, 20, 25, 30)},
                {"type": "Feature", "properties": {"name": "Chad"}, "geometry": square(14, 8, 20, 20)}]}))
        Event.objects.create(event_date=D, title="Kufra", lon=23, lat=24)
        Event.objects.create(event_date=D, title="Adre", lon=18, lat=13)
        Event.objects.create(event_date=D, title="Ceasefire")
        with override_settings(DASHBOARD_DATA_DIR=base):
            scrubbers.clear_caches()
            titles = [e["title"] for e in self.get("/api/events/")]
        scrubbers.clear_caches()
        self.assertEqual(titles, ["Kufra", "Adre", "Ceasefire"][1:])

    # ---------------------------------------------------------------- external_data
    def test_seasonal(self):
        for iso, name in (("LBY", "Libya"), ("TCD", "Chad")):
            SeasonalCalendar.objects.create(iso3=iso, country_name=name, source="acaps",
                                            label="l", start_month=1, end_month=2)
        self.assertEqual([r["iso3"] for r in self.rows(self.get("/api/seasonal/"))], ["TCD"])

    def test_food_security(self):
        for iso in ("LBY", "TCD"):
            FoodSecurityArea.objects.create(source="ipc", analysis_id="a", iso3=iso,
                                            period_date=D, area_id=iso)
        self.assertEqual([r["iso3"] for r in self.rows(self.get("/api/food-security/"))], ["TCD"])

    def test_movement(self):
        for iso in ("LBY", "TCD"):
            MovementPattern.objects.create(date=D, iso3=iso, metric="refugees", value=1, source="x")
        self.assertEqual([r["iso3"] for r in self.rows(self.get("/api/movement/"))], ["TCD"])

    def test_community_insights(self):
        NarrativeTag.objects.create(country="Libya", dimension="hazard", tag="x", snippet="s")
        NarrativeTag.objects.create(country="Chad", dimension="hazard", tag="x", snippet="s")
        rows = self.rows(self.get("/api/community-insights/"))
        self.assertEqual([r["country"] for r in rows], ["Chad"])

    def test_hsps(self):
        for iso, name in (("LBY", "Libya"), ("TCD", "Chad")):
            HumanitarianServicePoint.objects.create(date_reported=D, country=name, iso3=iso,
                                                    service="Health", location_name="p")
        self.assertEqual([r["iso3"] for r in self.rows(self.get("/api/hsps/"))], ["TCD"])

    def test_crossings(self):
        for iso, name in (("LBY", "Libya"), ("TCD", "Chad")):
            BorderCrossing.objects.create(name=name, country=name, iso3=iso, lon=1, lat=1)
        self.assertEqual([r["iso3"] for r in self.rows(self.get("/api/crossings/"))], ["TCD"])

    def test_sync(self):
        SourceSync.objects.create(source="acaps", dataset="seasonal_calendar", iso3="LBY")
        SourceSync.objects.create(source="acaps", dataset="seasonal_calendar", iso3="TCD")
        isos = [r["iso3"] for r in self.rows(self.get("/api/sync/"))]
        self.assertIn("TCD", isos)
        self.assertNotIn("LBY", isos)

    # ---------------------------------------------------------------- boundaries
    def boundaries(self):
        src = BoundarySource.objects.create(path="t.shp")
        for iso, name in (("LBY", "Libya"), ("TCD", "Chad")):
            AdminArea.objects.create(source=src, iso3=iso, country_name=name, level=0,
                                     pcode=iso[:2], name=name)
        from django.db import connection
        with connection.cursor() as cur:  # features_sql only returns rows with a geometry
            cur.execute("UPDATE admin_areas SET geom = ST_Multi(ST_MakeEnvelope(0,0,1,1,4326)),"
                        " geom_web = ST_Multi(ST_MakeEnvelope(0,0,1,1,4326))")

    def test_boundary_layers(self):
        self.boundaries()
        self.assertEqual([r["iso3"] for r in self.get("/api/boundaries/layers/")["admin"]], ["TCD"])

    def test_boundary_layer_hidden_iso3_is_404(self):
        self.boundaries()
        self.assertEqual(self.client.get("/api/boundaries/layer/?iso3=LBY&level=0").status_code, 404)

    def test_boundary_features_skip_hidden(self):
        self.boundaries()
        body = self.get("/api/boundaries/features/?ids=LB,TC")
        self.assertEqual([f["properties"]["iso3"] for f in body["features"]], ["TCD"])

    def test_boundary_etag_changes_with_switch(self):
        self.boundaries()
        url = "/api/boundaries/features/?ids=LB,TC"
        before = self.client.get(url)["ETag"]
        CountryVisibility.objects.update(shown=True)
        r = self.client.get(url, HTTP_IF_NONE_MATCH=before)
        self.assertEqual(r.status_code, 200)
        self.assertNotEqual(r["ETag"], before)


class CoverageTests(TestCase):
    def test_every_api_url_is_gated_or_regional(self):
        names = set()

        def walk(patterns, prefix=""):
            for p in patterns:
                if hasattr(p, "url_patterns"):
                    walk(p.url_patterns, prefix + str(p.pattern))
                elif (prefix + str(p.pattern)).startswith("api/"):
                    names.add(p.name)
        walk(get_resolver().url_patterns)
        self.assertEqual(names, GATED | REGIONAL)
        self.assertFalse(GATED & REGIONAL)
