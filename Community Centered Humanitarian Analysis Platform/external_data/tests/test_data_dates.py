"""data_dates.json: how far the observed data runs, per country.

The bug this pins: the dashboard's timeline ended at meta.date_max, the newest
PDF report. A workbook saved with 9 Nov figures loaded into movement_patterns,
the rebuild drew them into refugee_camps.json, and the map still stopped on
2 Nov - every point after the newest PDF sat past the end of the slider.
"""
import json
import pathlib
import tempfile
from datetime import date, timedelta

from django.test import TestCase

from dashboard import scrubbers
from data_pipeline.steps import s06_mcp_layers as s06
from external_data.models import MovementPattern


def observed(on, iso3, source="excel"):
    MovementPattern.objects.create(
        date=on, iso3=iso3, admin_pcode=None, admin_level=0, place_name=iso3,
        metric="refugees", population_group="sudanese_refugees", value=1,
        unit="individuals", source=source, source_dataset=f"test-{source}-{on}")


class DataDatesTests(TestCase):
    def setUp(self):
        self.tmp = pathlib.Path(tempfile.mkdtemp())
        real = s06.DASHBOARD_DATA
        s06.DASHBOARD_DATA = self.tmp
        self.addCleanup(setattr, s06, "DASHBOARD_DATA", real)

    def build(self):
        s06.build_data_dates()
        return json.loads((self.tmp / "data_dates.json").read_text(encoding="utf-8"))

    def test_newest_observation_per_country(self):
        observed(date(2026, 11, 2), "TCD", source="unhcr-odp")
        observed(date(2026, 11, 9), "TCD")
        observed(date(2026, 11, 2), "LBY")
        self.assertEqual(
            sorted(self.build()["countries"], key=lambda r: r["country"]),
            [{"country": "LBY", "date": "2026-11-02"},
             {"country": "TCD", "date": "2026-11-09"}])

    def test_a_future_date_never_stretches_the_timeline(self):
        """A dated-ahead row (a projection, a typo in a workbook) would push the
        slider's end past today and leave the map drawing an empty future."""
        observed(date(2026, 11, 9), "TCD")
        observed(date.today() + timedelta(days=30), "SSD")
        self.assertEqual(self.build()["countries"],
                         [{"country": "TCD", "date": "2026-11-09"}])

    def test_a_hidden_country_takes_its_date_with_it(self):
        """Only Libya reporting a later date must not leak that it reported."""
        observed(date(2026, 11, 9), "TCD")
        observed(date(2026, 11, 2), "LBY")

        class Hidden:
            def hides(self, value):
                return value == "LBY"

        data = self.build()
        scrub = scrubbers.scrubber_for("data_dates.json")
        self.assertIsNotNone(scrub)
        self.assertEqual(scrub(data, Hidden())["countries"],
                         [{"country": "TCD", "date": "2026-11-09"}])
