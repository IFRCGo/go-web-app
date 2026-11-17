"""Field data: what a Kobo pull puts in the review queue, and what it leaves alone.

The rule that matters most: a statement a person has published or rejected is
never changed by a later pull. Synthetic interviews only.
"""
from django.test import TestCase

from external_data.models import CchaPrimaryData, CchaPrimaryDataCopingChallenge
from insights.field_data import sync_statements
from insights.models import Insight
from insights.tests.test_field_data_place import interview, uganda


def coping(iv, number, hazard, text):
    return CchaPrimaryDataCopingChallenge.objects.create(
        interview=iv, hazard_number=number, hazard=hazard, coping_challenges=text)


def codings(row):
    return {(c.dimension, c.tag) for c in row.codings.all()}


class SyncTests(TestCase):
    def setUp(self):
        uganda()

    def sync(self):
        return sync_statements(CchaPrimaryData.objects.all())

    def test_household_follow_ups_become_pending_field_data(self):
        iv = interview(vulnerabilities_elaborate="New arrivals get everything",
                       hazards_experience_other="Thefts")
        coping(iv, 1, "Food Insecurity", "No rain for planting crops.\nNo job")
        counts = self.sync()
        self.assertEqual(counts["created"], 3)
        rows = Insight.objects.all()
        self.assertEqual(rows.count(), 3)
        for row in rows:
            self.assertEqual((row.status, row.channel, row.method, row.voice_type),
                             ("pending", "primary", "kobo", "community"))
            self.assertEqual(str(row.stated_on), "2026-10-08")
            self.assertIsNone(row.document_id)
            self.assertEqual(row.admin_pcode, "UG4120")
        self.assertEqual(rows.get(field_question="coping_challenges").quote,
                         "No rain for planting crops.\nNo job")

    def test_elaboration_coded_vulnerability(self):
        interview(vulnerabilities_elaborate="New arrivals get everything")
        self.sync()
        self.assertEqual(codings(Insight.objects.get()), {("vulnerability", "other")})

    def test_other_text_coded_by_its_question(self):
        interview(hazard_measures_other="We dig trenches")
        self.sync()
        self.assertEqual(codings(Insight.objects.get()), {("coping", "other")})

    def test_coping_challenge_codings(self):
        iv = interview()
        coping(iv, 1, "Food Insecurity", "No job")
        coping(iv, 2, "Insect Infestation", "Bushy area")
        self.sync()
        food = Insight.objects.get(field_item=1)
        bugs = Insight.objects.get(field_item=2)
        self.assertEqual(codings(food), {("hazard", "famine_food_crisis"), ("coping", "other")})
        self.assertEqual(codings(bugs), {("hazard", "other"), ("coping", "other")})
        self.assertEqual(bugs.codings.get(dimension="hazard").tag_raw, "Insect Infestation")

    def test_non_answers_not_queued(self):
        iv = interview(vulnerabilities_elaborate="None", coping_gaps_other="I don’t know")
        coping(iv, 1, "Drought", "N/A")
        self.sync()
        self.assertFalse(Insight.objects.exists())

    def test_meaning_questions_never_queued(self):
        interview(meaning_vulnerability="Someone who needs help", meaning_hazard="Something bad",
                  meaning_coping="Helping myself")
        self.sync()
        self.assertFalse(Insight.objects.exists())

    def test_fgd_and_kii_skipped(self):
        interview(1, interview_type="Focused Group Discussion (FGD)",
                  vulnerabilities_elaborate="Group said this")
        interview(2, interview_type="Key Informant Interview (KII)",
                  vulnerabilities_elaborate="Informant said this")
        self.sync()
        self.assertFalse(Insight.objects.exists())

    def test_identical_text_two_households_two_statements(self):
        coping(interview(1), 1, "Drought", "Lack of job")
        coping(interview(2), 1, "Drought", "Lack of job")
        self.sync()
        self.assertEqual(Insight.objects.filter(quote="Lack of job").count(), 2)

    def test_repull_is_idempotent(self):
        interview(vulnerabilities_elaborate="New arrivals get everything")
        self.sync()
        counts = self.sync()
        self.assertEqual(counts["created"], 0)
        self.assertEqual(Insight.objects.count(), 1)

    def test_repull_updates_pending(self):
        iv = interview(vulnerabilities_elaborate="First words")
        self.sync()
        first = Insight.objects.get()
        iv.vulnerabilities_elaborate = "Corrected words"
        iv.save()
        counts = self.sync()
        self.assertEqual(counts["updated"], 1)
        row = Insight.objects.get()
        self.assertEqual((row.id, row.quote), (first.id, "Corrected words"))

    def test_repull_leaves_published_and_rejected_untouched(self):
        a = interview(1, vulnerabilities_elaborate="Published words")
        b = interview(2, vulnerabilities_elaborate="Rejected words")
        self.sync()
        Insight.objects.filter(field_interview=a).update(status="published")
        Insight.objects.filter(field_interview=b).update(status="rejected")
        a.vulnerabilities_elaborate = "Changed A"
        a.save()
        b.vulnerabilities_elaborate = None
        b.save()
        self.sync()
        self.assertEqual(Insight.objects.get(field_interview=a).quote, "Published words")
        self.assertEqual(Insight.objects.get(field_interview=b).quote, "Rejected words")

    def test_blanked_answer_deletes_pending_only(self):
        a = interview(1, vulnerabilities_elaborate="Pending words")
        b = interview(2, vulnerabilities_elaborate="Published words")
        self.sync()
        Insight.objects.filter(field_interview=b).update(status="published")
        for iv in (a, b):
            iv.vulnerabilities_elaborate = "None"
            iv.save()
        counts = self.sync()
        self.assertEqual(counts["deleted"], 1)
        self.assertEqual(list(Insight.objects.values_list("quote", flat=True)), ["Published words"])

    def test_no_interview_gps_in_statement(self):
        interview(vulnerabilities_elaborate="Words", latitude=1.95, longitude=32.06)
        self.sync()
        row = Insight.objects.get()
        self.assertEqual((row.lat, row.lon), (1.991, 32.051))

    def test_undated_interview_skipped(self):
        interview(interview_date=None, submitted_at=None, vulnerabilities_elaborate="Words")
        self.sync()
        self.assertFalse(Insight.objects.exists())

    def test_unknown_country_still_queued_unplaced(self):
        interview(country="Atlantis", admin2="Nowhere", latitude=None, longitude=None,
                  vulnerabilities_elaborate="Words")
        self.sync()
        row = Insight.objects.get()
        self.assertEqual((row.iso3, row.match_method, row.lat), ("", "unmatched", None))

    def test_repull_keeps_reviewer_edits_to_pending_row(self):
        """A pending row a reviewer placed and corrected by hand keeps those edits;
        only what CHANGED IN KOBO is carried over."""
        iv = interview(admin2="Nowhere", latitude=None, longitude=None,
                       vulnerabilities_elaborate="Orignal wording")
        self.sync()
        row = Insight.objects.get()
        row.admin_pcode, row.match_method, row.lat, row.lon = "UG4120", "pcode", 1.991, 32.051
        row.quote = "Original wording"
        row.save()
        self.assertEqual(self.sync()["updated"], 0)
        row.refresh_from_db()
        self.assertEqual((row.admin_pcode, row.match_method, row.quote),
                         ("UG4120", "pcode", "Original wording"))
        # ...and a later change made in Kobo still arrives.
        iv.vulnerabilities_elaborate = "New wording from Kobo"
        iv.save()
        self.sync()
        row.refresh_from_db()
        self.assertEqual((row.quote, row.admin_pcode), ("New wording from Kobo", "UG4120"))
