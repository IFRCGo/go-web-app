"""field_surveys.json: the household survey, counted per place, for the summary card.

Counts are households, never ticks: a multi-select counts once per household.
A place with fewer than 5 households is left out (counts on 1-4 homes identify
them), and no household coordinate is ever written. Synthetic interviews only.
"""
import json
import pathlib
import tempfile
from datetime import date

from django.test import TestCase

from data_pipeline.steps import s06_mcp_layers as s06
from external_data.models import CchaPrimaryDataHazardDetail
from insights.tests.test_field_data_place import interview, uganda


class FieldSurveysTests(TestCase):
    def setUp(self):
        uganda()
        self.tmp = pathlib.Path(tempfile.mkdtemp())
        real = s06.DASHBOARD_DATA
        s06.DASHBOARD_DATA = self.tmp
        self.addCleanup(setattr, s06, "DASHBOARD_DATA", real)

    def build(self):
        s06.build_field_surveys()
        return (self.tmp / "field_surveys.json").read_text(encoding="utf-8")

    def households(self, n, **kw):
        return [interview(i + 1, **kw) for i in range(n)]

    def test_counts_once_per_household(self):
        for i in range(3):
            interview(i + 1, hazards_experience="Floods; Drought")
        for i in range(3, 5):
            interview(i + 1, hazards_experience="Floods")
        entry = json.loads(self.build())["surveys"][0]
        self.assertEqual(entry["sections"]["hazards"]["experienced"], [["Floods", 5], ["Drought", 3]])

    def test_sections_shape_and_dates(self):
        interview(1, interview_date=date(2026, 10, 9))
        for i in range(2, 6):
            interview(i)
        entry = json.loads(self.build())["surveys"][0]
        self.assertEqual({k: entry[k] for k in ("iso3", "pcode", "place", "lat", "lon", "type", "n",
                                                 "date_from", "date_to")},
                         {"iso3": "UGA", "pcode": "UG4120", "place": "Kiryandongo", "lat": 1.991,
                          "lon": 32.051, "type": "household", "n": 5,
                          "date_from": "2026-10-08", "date_to": "2026-10-09"})
        self.assertEqual({k: set(v) for k, v in entry["sections"].items()}, {
            "hazards": {"experienced", "worsening", "causes", "per_hazard"},
            "vulnerable": {"most_affected", "why", "vulnerabilities", "newcomers_vs_residents"},
            "coping": {"extent", "measures", "capacities", "cohesion", "evacuate_to"},
            "gaps": {"cohesion_gaps"},
        })

    def test_single_choice_counted(self):
        self.households(3, coping_extent="To a small extent")
        self.households(0)
        interview(10, coping_extent="Not at all")
        interview(11, coping_extent=None)
        entry = json.loads(self.build())["surveys"][0]
        self.assertEqual(entry["sections"]["coping"]["extent"],
                         [["To a small extent", 3], ["Not at all", 1]])

    def test_place_under_five_households_omitted(self):
        self.households(4, hazards_experience="Floods")
        self.assertEqual(json.loads(self.build()), {"surveys": []})

    def test_fgd_rows_not_counted(self):
        self.households(5)
        interview(99, interview_type="Focused Group Discussion (FGD)")
        self.assertEqual(json.loads(self.build())["surveys"][0]["n"], 5)

    def test_file_holds_no_household_coordinates(self):
        self.households(5, latitude=1.9512345, longitude=32.0612345)
        text = self.build()
        self.assertNotIn("1.9512345", text)
        self.assertNotIn("32.0612345", text)

    def test_per_hazard_impact_and_frequency(self):
        ivs = self.households(5)
        for i, iv in enumerate(ivs):
            CchaPrimaryDataHazardDetail.objects.create(
                interview=iv, hazard_number=1, hazard="Drought",
                hazard_occurence="Yearly", hazard_impact="Severely" if i < 3 else "Moderately")
        CchaPrimaryDataHazardDetail.objects.create(interview=ivs[0], hazard_number=2,
                                                   hazard="Flood", hazard_occurence="Daily",
                                                   hazard_impact="Slightly")
        per = json.loads(self.build())["surveys"][0]["sections"]["hazards"]["per_hazard"]
        self.assertEqual(per[0], {"hazard": "Drought", "n": 5,
                                  "impact": {"Severely": 3, "Moderately": 2},
                                  "frequency": {"Yearly": 5}})
        self.assertEqual(per[1]["hazard"], "Flood")

    def test_unplaced_interviews_not_drawn(self):
        self.households(5, admin2="Nowhere", latitude=None, longitude=None)
        self.assertEqual(json.loads(self.build()), {"surveys": []})
