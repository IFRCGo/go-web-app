"""Findings from the final review of the country switch, each pinned by a test."""
import json
import tempfile
from collections import OrderedDict
from pathlib import Path
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.test import TestCase, override_settings

from dashboard import views
from dashboard.models import CountryVisibility
from dashboard.visibility import hidden_countries
from data_track.models import Document, NarrativeTag, PopulationFigure


class Iso3InNameFieldTests(TestCase):
    """Name fields sometimes hold an ISO3 code ('SDN' does today)."""

    def setUp(self):
        CountryVisibility.objects.create(iso3="LBY", name="Libya", shown=False)

    def rows(self, url):
        body = json.loads(self.client.get(url).content)
        return body["results"] if isinstance(body, dict) and "results" in body else body

    def test_documents_coded_by_iso3(self):
        Document.objects.create(file_name="a", rel_path="a", country_focus="LBY")
        Document.objects.create(file_name="b", rel_path="b", country_focus="TCD")
        self.assertEqual([d["country"] for d in self.rows("/api/documents/")], ["TCD"])

    def test_figures_coded_by_iso3(self):
        PopulationFigure.objects.create(country="LBY", metric="refugees", value=1)
        self.assertEqual(self.rows("/api/figures/"), [])

    def test_tags_coded_by_iso3(self):
        NarrativeTag.objects.create(country="LBY", dimension="hazard", tag="x",
                                    report_date="2025-01-01")
        self.assertEqual(json.loads(self.client.get("/api/tags/").content), {})

    def test_community_insights_coded_by_iso3(self):
        NarrativeTag.objects.create(country="LBY", dimension="hazard", tag="x", snippet="s")
        self.assertEqual(self.rows("/api/community-insights/"), [])


class SudanStaysOnTests(TestCase):
    """The dashboard is about Sudan: its corridors and IDP layers cannot be hidden."""

    def test_sudan_is_never_hidden_even_if_the_row_says_so(self):
        CountryVisibility.objects.create(iso3="SDN", name="Sudan", shown=False)
        self.assertFalse(hidden_countries())

    def test_admin_cannot_untick_sudan(self):
        user = get_user_model().objects.create_superuser("g", "g@example.org", "pw")
        self.client.force_login(user)
        row = CountryVisibility.objects.create(iso3="SDN", name="Sudan")
        self.client.post("/admin/dashboard/countryvisibility/", {
            "form-TOTAL_FORMS": "1", "form-INITIAL_FORMS": "1",
            "form-MIN_NUM_FORMS": "0", "form-MAX_NUM_FORMS": "1000",
            "form-0-id": str(row.pk), "_save": "Save"})
        row.refresh_from_db()
        self.assertTrue(row.shown)


class RebuildLeavesSwitchTests(TestCase):
    """The spec's guard: a dashboard rebuild never turns a country back on."""

    def test_export_step_does_not_touch_the_switch(self):
        from data_pipeline.steps import s05_export
        CountryVisibility.objects.create(iso3="LBY", name="Libya", shown=False)
        before = list(CountryVisibility.objects.values_list("iso3", "shown", "changed_at"))
        with tempfile.TemporaryDirectory() as tmp, \
                patch.object(s05_export, "DASHBOARD_DATA", Path(tmp)):
            s05_export.run()
        self.assertEqual(list(CountryVisibility.objects.values_list("iso3", "shown", "changed_at")),
                         before)


class _EvictedMeanwhile(OrderedDict):
    """A cache whose entry another thread evicts between lookup and use."""

    def move_to_end(self, key, last=True):
        raise KeyError(key)


class ScrubCacheRaceTests(TestCase):
    def test_a_concurrently_evicted_entry_is_recomputed_not_a_500(self):
        tmp = tempfile.TemporaryDirectory()
        self.addCleanup(tmp.cleanup)
        base = Path(tmp.name)
        (base / "flows.json").write_text(json.dumps({"sudan-libya": {}, "sudan-chad": {}}))
        CountryVisibility.objects.create(iso3="LBY", name="Libya", shown=False)
        with override_settings(DASHBOARD_DATA_DIR=base), \
                patch.object(views, "_SCRUB_CACHE", _EvictedMeanwhile()):
            self.client.get("/data/flows.json")          # fills the cache
            r = self.client.get("/data/flows.json")      # hit, but evicted meanwhile
        self.assertEqual(r.status_code, 200)
        self.assertEqual(list(json.loads(r.content)), ["sudan-chad"])
