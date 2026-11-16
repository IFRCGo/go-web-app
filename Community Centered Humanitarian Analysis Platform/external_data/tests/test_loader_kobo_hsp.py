"""The HSP layer read from Kobo must say what the Excel export said.

Expected labels below are copied from the rows the 2026-09-08 Excel export
loaded - the map as people know it - not from the form, so a label rebuilt
wrongly from the form fails here instead of quietly changing the public map.
"""
import json
from datetime import date
from pathlib import Path

from django.test import TestCase

from external_data.loaders.base import EmptyPayload, load
from external_data.loaders.kobo_hsp import KoboHspLoader
from external_data.models import HumanitarianServicePoint, SourceSync

FIXTURES = Path(__file__).parent / "fixtures" / "kobo"


def _context(pulled_on="2026-11-16"):
    form = json.loads((FIXTURES / "hsp_form.json").read_text(encoding="utf-8"))
    return {"form": form, "form_uid": "aHSP", "form_key": "hsp", "pulled_on": pulled_on}


def _payload():
    return json.loads((FIXTURES / "hsp_data.json").read_text(encoding="utf-8"))


class ParseTests(TestCase):
    def setUp(self):
        self.rows = KoboHspLoader().parse(_payload(), None, _context())

    def _set(self, iso3):
        return {(r["service"], r["location_name"], r["scope"], r["country"])
                for r in self.rows if r["iso3"] == iso3}

    def test_country_wide_rows_are_service_by_district_labels(self):
        self.assertEqual(self._set("TCD"), {
            ("Health", "Assoungha", "country-wide", "Chad"),
            ("Migration", "Assoungha", "country-wide", "Chad"),
            ("Protection, Gender & Inclusion", "Assoungha", "country-wide", "Chad")})
        self.assertEqual({s for s, *_ in self._set("UGA")}, {
            "Cash & Voucher Assistance", "Community Engagement & Accountability", "Health",
            "National Society Development", "Protection, Gender & Inclusion", "Shelter",
            "Water, Sanitation & Hygiene"})
        self.assertEqual({l for _, l, *_ in self._set("UGA")}, {"Kiryandongo"})

    def test_no_answer_country_comes_from_the_repeat_only(self):
        self.assertEqual(self._set("SSD"), {
            ("Health", "Aweil North", "named-location", "South Sudan"),
            ("Health", "Renk", "named-location", "South Sudan"),
            ("Protection, Gender & Inclusion", "Aweil North", "named-location", "South Sudan"),
            ("Protection, Gender & Inclusion", "Fashoda", "named-location", "South Sudan"),
            ("Protection, Gender & Inclusion", "Renk", "named-location", "South Sudan")})

    def test_rows_carry_the_excel_loaders_keys(self):
        keys = {"date_reported", "country", "iso3", "service", "scope", "location_name",
                "admin_pcode", "admin_level", "match_method", "lat", "lon",
                "same_services_everywhere", "hsp_count", "kobo_uuid", "source_file"}
        for r in self.rows:
            self.assertEqual(set(r), keys)

    def test_named_location_rows_carry_the_reported_count(self):
        ssd = [r for r in self.rows if r["iso3"] == "SSD"]
        self.assertTrue(all(r["hsp_count"] == 3 and r["same_services_everywhere"] is False
                            for r in ssd))

    def test_source_file_is_kobo_uid(self):
        self.assertEqual({r["source_file"] for r in self.rows}, {"kobo:aHSP"})

    def test_date_reported_is_the_pull_date(self):
        self.assertEqual({r["date_reported"] for r in self.rows}, {date(2026, 11, 16)})


class LoadTests(TestCase):
    def test_load_writes_the_existing_sync_row(self):
        result = load(KoboHspLoader(), _payload(), None, context=_context())
        self.assertGreater(result.written, 0)
        sync = SourceSync.objects.get(source="kobo", dataset="humanitarian_service_points",
                                      iso3=None, variant="hsp-mapping")
        self.assertEqual(sync.high_water_date, date(2026, 11, 16))
        self.assertEqual(sync.row_count, HumanitarianServicePoint.objects.count())

    def test_same_day_reload_overwrites_in_place(self):
        load(KoboHspLoader(), _payload(), None, context=_context())
        before = HumanitarianServicePoint.objects.count()
        load(KoboHspLoader(), _payload(), None, context=_context())
        self.assertEqual(HumanitarianServicePoint.objects.count(), before)

    def test_empty_results_raise_empty_payload(self):
        with self.assertRaises(EmptyPayload):
            load(KoboHspLoader(), {"count": 0, "results": []}, None, context=_context())


class SameDayRemovalTests(TestCase):
    """Review finding: a district or service unticked in Kobo and pulled again
    the same day must leave that day's set, or the map keeps drawing it."""

    def test_same_day_repull_drops_what_kobo_no_longer_says(self):
        load(KoboHspLoader(), _payload(), None, context=_context())
        payload = _payload()
        payload["results"] = [s for s in payload["results"]
                              if s.get("intro_section/country") != "TCD"]
        load(KoboHspLoader(), payload, None, context=_context())
        self.assertFalse(HumanitarianServicePoint.objects.filter(
            iso3="TCD", date_reported=date(2026, 11, 16)).exists())

    def test_other_days_and_excel_rows_are_kept(self):
        load(KoboHspLoader(), _payload(), None, context=_context("2026-11-15"))
        load(KoboHspLoader(), _payload(), None, context=_context("2026-11-16"))
        self.assertTrue(HumanitarianServicePoint.objects.filter(
            date_reported=date(2026, 11, 15)).exists())
