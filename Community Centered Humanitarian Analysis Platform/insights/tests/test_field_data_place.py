"""Field data: which question a follow-up answers, and where it goes on the map.

Placement is the admin2 LABEL POINT, never the household's GPS: the GPS is
used only on the server, to find the district when its name is missing.
Synthetic boundaries; no real interview answer.
"""
from datetime import date

from django.db import connection
from django.test import TestCase

from boundaries.models import AdminArea, BoundarySource
from external_data.models import CchaPrimaryData, CchaPrimaryDataCopingChallenge
from insights import field_data
from insights.models import Insight


def uganda():
    """Uganda (level 0) and Kiryandongo (level 2), each a square around the label point."""
    src = BoundarySource.objects.create(path="t.shp")
    AdminArea.objects.create(source=src, iso3="UGA", country_name="Uganda", level=0,
                             pcode="UG", name="Uganda", center_lat=1.3, center_lon=32.3)
    AdminArea.objects.create(source=src, iso3="UGA", country_name="Uganda", level=2,
                             pcode="UG4120", name="Kiryandongo",
                             center_lat=1.991, center_lon=32.051)
    with connection.cursor() as cur:
        cur.execute("UPDATE admin_areas SET geom = ST_Multi(ST_MakeEnvelope(31.8,1.8,32.3,2.2,4326))"
                    " WHERE pcode = 'UG4120'")
        cur.execute("UPDATE admin_areas SET geom = ST_Multi(ST_MakeEnvelope(29,-1.5,35,4.3,4326))"
                    " WHERE pcode = 'UG'")


def interview(sid=1, **kw):
    fields = dict(submission_id=sid, interview_type="Household Survey",
                  interview_date=date(2026, 10, 8), country="UGANDA", admin1="WESTERN",
                  admin2="KIRYANDONGO", latitude=1.95, longitude=32.06)
    fields.update(kw)
    return CchaPrimaryData.objects.create(**fields)


class WiringTests(TestCase):
    def test_every_follow_up_and_parent_is_a_model_field(self):
        names = {f.name for f in CchaPrimaryData._meta.get_fields()}
        for column, follow in field_data.FOLLOW_UPS.items():
            self.assertIn(column, names)
            self.assertIn(follow.parent, names)
            self.assertIn(follow.dimension, {"hazard", "vulnerability", "coping"})

    def test_non_answers(self):
        for text in ("None", " n/a ", "I don’t know", "No.", "ok", "", None, "nothing"):
            self.assertTrue(field_data.is_non_answer(text), text)
        for text in ("No boats", "Thefts", "Blind and deaf"):
            self.assertFalse(field_data.is_non_answer(text), text)


class PlaceTests(TestCase):
    def setUp(self):
        uganda()

    def test_place_matched_case_insensitively(self):
        place = field_data.place_for(interview())
        self.assertEqual(place["iso3"], "UGA")
        self.assertEqual(place["admin_pcode"], "UG4120")
        self.assertEqual(place["match_method"], "name")
        self.assertEqual((place["lat"], place["lon"]), (1.991, 32.051))
        self.assertEqual(place["place_name_as_written"], "KIRYANDONGO")

    def test_admin2_wins_over_a_namesake_province(self):
        src = BoundarySource.objects.first()
        AdminArea.objects.create(source=src, iso3="UGA", country_name="Uganda", level=1,
                                 pcode="UG4", name="Kiryandongo", center_lat=1.5, center_lon=31.5)
        place = field_data.place_for(interview())
        self.assertEqual((place["admin_pcode"], place["admin_level"]), ("UG4120", 2))

    def test_gps_beats_a_coarser_name_match(self):
        src = BoundarySource.objects.first()
        AdminArea.objects.create(source=src, iso3="UGA", country_name="Uganda", level=1,
                                 pcode="UG9", name="Western", center_lat=0.5, center_lon=30.5)
        place = field_data.place_for(interview(admin2="Western"))
        self.assertEqual((place["admin_pcode"], place["match_method"]), ("UG4120", "gps"))

    def test_blank_admin2_falls_back_to_gps_polygon(self):
        place = field_data.place_for(interview(admin2=None))
        self.assertEqual(place["admin_pcode"], "UG4120")
        self.assertEqual(place["match_method"], "gps")
        self.assertEqual((place["lat"], place["lon"]), (1.991, 32.051))

    def test_gps_fallback_finds_country_when_country_blank(self):
        place = field_data.place_for(interview(country=None, admin2=None))
        self.assertEqual((place["iso3"], place["admin_pcode"]), ("UGA", "UG4120"))

    def test_unplaceable_is_unmatched_with_iso3(self):
        place = field_data.place_for(interview(admin2="Nowhere", latitude=None, longitude=None))
        self.assertEqual(place["match_method"], "unmatched")
        self.assertEqual(place["iso3"], "UGA")
        self.assertIsNone(place["lat"])
        self.assertIsNone(place["admin_pcode"])


class ContextTests(TestCase):
    def test_context_for_elaboration_shows_parent_answer(self):
        iv = interview(vulnerabilities_differences="Yes, significant differences",
                       vulnerabilities_elaborate="Everything goes to new arrivals")
        row = Insight(field_interview=iv, field_question="vulnerabilities_elaborate")
        self.assertEqual(field_data.context_for(row), (
            "Are there any differences between people who arrived recently and longer-term residents?",
            "Yes, significant differences"))

    def test_context_for_other_has_no_answer(self):
        iv = interview(hazards_experience="Other", hazards_experience_other="Thefts")
        row = Insight(field_interview=iv, field_question="hazards_experience_other")
        self.assertEqual(field_data.context_for(row),
                         ("What hazards has this community been experiencing?", None))

    def test_context_for_coping_challenge_names_hazard(self):
        iv = interview()
        CchaPrimaryDataCopingChallenge.objects.create(interview=iv, hazard_number=2,
                                                      hazard="Drought", coping_challenges="No rain")
        row = Insight(field_interview=iv, field_question="coping_challenges", field_item=2)
        self.assertEqual(field_data.context_for(row),
                         ("Gaps/challenges the community has with this hazard", "Drought"))

    def test_context_for_non_field_row(self):
        self.assertEqual(field_data.context_for(Insight()), (None, None))
