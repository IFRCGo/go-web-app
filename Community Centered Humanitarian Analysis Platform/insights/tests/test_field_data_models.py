"""Field data: the columns that tie a statement to its Kobo interview.

The duplicate test is the one that matters. Two households can write the
identical words ("Lack of job"); the old (document, page, quote_sha1) key would
treat the second as a duplicate of the first, because a field statement has no
document and no page.
"""
from django.db import IntegrityError, transaction
from django.test import TestCase

from external_data.models import CchaPrimaryData
from insights.forms import InsightPlaceForm
from insights.models import CHANNELS, FieldDataTagMap, Insight


def interview(sid):
    return CchaPrimaryData.objects.create(submission_id=sid, interview_type="Household Survey")


def statement(iv=None, quote="Lack of job", question="coping_challenges", item=1, **kw):
    fields = dict(quote=quote, channel="primary" if iv else "manual", stated_on="2026-10-08",
                  iso3="UGA", method="kobo" if iv else "manual", status="pending")
    if iv:
        fields.update(field_interview=iv, field_question=question, field_item=item)
    fields.update(kw)
    return Insight.objects.create(**fields)


class FieldDataModelTests(TestCase):
    def test_channel_labels(self):
        self.assertEqual(dict(CHANNELS)["primary"], "Field data")
        self.assertEqual(dict(CHANNELS)["manual"], "Primary input")

    def test_identical_quotes_from_two_interviews_both_save(self):
        statement(interview(1))
        statement(interview(2))
        self.assertEqual(Insight.objects.filter(quote="Lack of job").count(), 2)

    def test_same_interview_question_item_is_unique(self):
        iv = interview(1)
        statement(iv)
        with self.assertRaises(IntegrityError):
            with transaction.atomic():
                statement(iv, quote="Different words")

    def test_manual_duplicates_still_refused(self):
        statement()
        with self.assertRaises(IntegrityError):
            with transaction.atomic():
                statement()

    def test_deleting_interview_deletes_its_statements(self):
        iv = interview(1)
        statement(iv)
        iv.delete()
        self.assertFalse(Insight.objects.exists())


class TagMapTests(TestCase):
    def test_seeded_rows_present(self):
        seeded = set(FieldDataTagMap.objects.filter(form_key="ccha_primary_data")
                     .values_list("label", "dimension", "tag"))
        self.assertTrue({("Food Insecurity", "hazard", "famine_food_crisis"),
                         ("Drought", "hazard", "extreme_heat_drought"),
                         ("Heat Wave", "hazard", "extreme_heat_drought"),
                         ("Flood", "hazard", "flooding")} <= seeded)

    def test_tag_map_lookup_case_insensitive(self):
        self.assertEqual(FieldDataTagMap.lookup("ccha_primary_data", "food insecurity", "hazard"),
                         "famine_food_crisis")
        self.assertIsNone(FieldDataTagMap.lookup("ccha_primary_data", "Insect Infestation", "hazard"))

    def test_tag_must_be_in_the_vocabulary(self):
        from django.core.exceptions import ValidationError
        row = FieldDataTagMap(form_key="ccha_primary_data", label="X", dimension="hazard",
                              tag="not_a_tag")
        with self.assertRaises(ValidationError):
            row.full_clean()


class HandTypingFormTests(TestCase):
    def test_hand_typing_form_does_not_offer_field_data(self):
        choices = [c for c, _ in InsightPlaceForm().fields["channel"].choices]
        self.assertNotIn("primary", choices)
        self.assertIn("manual", choices)

    def test_existing_field_row_keeps_its_channel_in_the_form(self):
        row = statement(interview(1))
        choices = [c for c, _ in InsightPlaceForm(instance=row).fields["channel"].choices]
        self.assertIn("primary", choices)
