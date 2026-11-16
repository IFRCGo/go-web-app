"""CCHA primary data: one readable row per interview, repeats in their own tables.

The form and submissions are SYNTHETIC, built with the real form's xpaths and
shapes (or_other answers, a nested repeat, an audio attachment). No real
interview answer is in the repo.
"""
from datetime import date
from unittest.mock import patch

from django.core.management import CommandError, call_command
from django.test import TestCase, override_settings

from external_data.fetchers import base
from external_data.loaders.base import load
from external_data.loaders.ccha_primary_data import COLUMNS, CchaPrimaryDataLoader
from external_data.models import (KoboForm, SourceSync, CchaPrimaryData,
                                  CchaPrimaryDataCopingChallenge, CchaPrimaryDataHazardDetail)


def q(kind, name, label, lst=None):
    row = {"type": kind, "name": name, "label": [label]}
    if lst:
        row["select_from_list_name"] = lst
    return row


FORM = {"uid": "aUGA", "name": "Community Centered Humanitarian Analysis - Survey",
        "content": {"translations": [None], "survey": [
            q("select_one", "interview_type", "Which interview is this?", "interview_type"),
            {"type": "begin_group", "name": "interview_start"},
            q("select_one", "country", "Country", "country"),
            q("geopoint", "hh_gps", "Record the GPS location"),
            {"type": "end_group"},
            {"type": "begin_group", "name": "demographics"},
            q("integer", "hh_composition", "How many people live in your household?"),
            {"type": "end_group"},
            {"type": "begin_group", "name": "hazards"},
            q("select_multiple", "hazards_experience", "What hazards?", "hazards"),
            {"type": "begin_repeat", "name": "hazard_details"},
            q("select_one", "hazard_occurence", "How often?", "frequency"),
            q("select_multiple", "hazard_events", "When?", "month"),
            {"type": "end_repeat"},
            {"type": "end_group"},
            {"type": "begin_group", "name": "fgd_section"},
            q("audio", "fgd_audio", "Record Audio"),
            {"type": "end_group"},
        ], "choices": [
            {"list_name": "interview_type", "name": "hh", "label": ["Household"]},
            {"list_name": "country", "name": "UGA", "label": ["Uganda"]},
            {"list_name": "hazards", "name": "flood", "label": ["Floods"]},
            {"list_name": "hazards", "name": "drought", "label": ["Drought"]},
            {"list_name": "hazards", "name": "other", "label": ["Other"]},
            {"list_name": "frequency", "name": "yearly", "label": ["Every year"]},
            {"list_name": "month", "name": "jan", "label": ["January"]},
            {"list_name": "month", "name": "feb", "label": ["February"]},
        ]}}


def sub(_id, status=None, **extra):
    s = {"_id": _id, "_uuid": f"uuid-{_id}", "_submission_time": "2026-10-02T08:15:00",
         "_validation_status": {"uid": status} if status else {},
         "start_time": "2026-10-02T10:00:00.000+03:00",
         "end_time": "2026-10-02T10:45:00.000+03:00", "today_date": "2026-10-02",
         "device_id": "collect:x", "meta/instanceID": "uuid:x",
         "interview_type": "hh", "interview_start/country": "UGA",
         "interview_start/hh_gps": "1.95 32.06 1100 5",
         "demographics/hh_composition": "6",
         "hazards/hazards_experience": "flood other",
         "hazards/hazards_experience_other": "Landslide",
         "hazards/hazard_details_count": "1",
         "hazards/hazard_details": [{
             "hazards/hazard_details/hazard_name": "Floods",
             "hazards/hazard_details/hazard_number": "1",
             "hazards/hazard_details/hazard_occurence": "yearly",
             "hazards/hazard_details/hazard_events": "jan feb"}],
         "coping_capacities/coping_challenges_repeat": [{
             "coping_capacities/coping_challenges_repeat/coping_hazard_name": "Floods",
             "coping_capacities/coping_challenges_repeat/coping_challenges": "No boats"}],
         "fgd_section/fgd_audio": "rec.ogg",
         "_attachments": [{"question_xpath": "fgd_section/fgd_audio",
                           "download_url": "https://kobo.example/media/rec.ogg",
                           "filename": "a/rec.ogg"}]}
    s.update(extra)
    return s


def ctx(not_approved=()):
    return {"form": FORM, "form_uid": "aUGA", "form_key": "ccha_primary_data",
            "not_approved_ids": list(not_approved), "pulled_on": "2026-11-16"}


def pull(*subs, not_approved=()):
    return load(CchaPrimaryDataLoader(), {"count": len(subs), "results": list(subs)},
                None, context=ctx(not_approved))


class ShapeTests(TestCase):
    def test_every_column_is_a_model_field(self):
        fields = {f.name for f in CchaPrimaryData._meta.get_fields()}
        for name, _xpath, kind in COLUMNS:
            if kind == "geo":
                self.assertTrue({"latitude", "longitude"} <= fields)
            else:
                self.assertIn(name, fields)

    def test_tables_are_named_ccha_primary_data(self):
        self.assertEqual(CchaPrimaryData._meta.db_table, "ccha_primary_data")
        self.assertEqual(CchaPrimaryDataHazardDetail._meta.db_table, "ccha_primary_data_hazard_details")
        self.assertEqual(CchaPrimaryDataCopingChallenge._meta.db_table,
                         "ccha_primary_data_coping_challenges")


class LoadTests(TestCase):
    def test_answers_become_labelled_columns(self):
        pull(sub(1))
        row = CchaPrimaryData.objects.get(submission_id=1)
        self.assertEqual(row.interview_type, "Household")
        self.assertEqual(row.country, "Uganda")
        self.assertEqual(row.hazards_experience, "Floods; Other")
        self.assertEqual(row.hazards_experience_other, "Landslide")
        self.assertEqual(row.hh_composition, 6)
        self.assertEqual((row.latitude, row.longitude), (1.95, 32.06))
        self.assertEqual(row.interview_date, date(2026, 10, 2))
        self.assertEqual(row.started_at.isoformat(), "2026-10-02T07:00:00+00:00")

    def test_audio_column_holds_the_kobo_link(self):
        pull(sub(1))
        self.assertEqual(CchaPrimaryData.objects.get().fgd_audio,
                         "https://kobo.example/media/rec.ogg")

    def test_questions_not_in_this_form_are_blank(self):
        pull(sub(1))
        self.assertIsNone(CchaPrimaryData.objects.get().gender)

    def test_unknown_answers_kept_in_unmapped_and_meta_is_not(self):
        pull(sub(1, **{"new_group/new_question": "x"}))
        unmapped = CchaPrimaryData.objects.get().unmapped
        self.assertEqual(unmapped, {"new_group/new_question": "x"})

    def test_hazard_repeat_rows(self):
        pull(sub(1))
        [h] = CchaPrimaryDataHazardDetail.objects.all()
        self.assertEqual((h.interview.submission_id, h.hazard, h.hazard_occurence,
                          h.hazard_events), (1, "Floods", "Every year", "January; February"))

    def test_coping_repeat_rows(self):
        pull(sub(1))
        [c] = CchaPrimaryDataCopingChallenge.objects.all()
        self.assertEqual((c.hazard, c.coping_challenges), ("Floods", "No boats"))

    def test_reload_after_edit_updates_in_place_and_replaces_repeats(self):
        pull(sub(1))
        edited = sub(1, **{"hazards/hazard_details": []})
        edited["demographics/hh_composition"] = "7"
        pull(edited)
        self.assertEqual(CchaPrimaryData.objects.count(), 1)
        self.assertEqual(CchaPrimaryData.objects.get().hh_composition, 7)
        self.assertEqual(CchaPrimaryDataHazardDetail.objects.count(), 0)

    def test_validation_status_mapped(self):
        pull(sub(1, "validation_status_approved"), sub(2, "validation_status_on_hold"),
             sub(3))
        self.assertEqual(dict(CchaPrimaryData.objects.values_list("submission_id",
                                                            "validation_status")),
                         {1: "approved", 2: "on_hold", 3: ""})

    def test_now_not_approved_row_is_deleted_with_its_repeats(self):
        pull(sub(7), sub(8))
        pull(sub(8), not_approved=[7])
        self.assertEqual(list(CchaPrimaryData.objects.values_list("submission_id", flat=True)), [8])
        self.assertEqual(CchaPrimaryDataHazardDetail.objects.count(), 1)

    def test_not_approved_row_in_payload_is_never_stored(self):
        pull(sub(1), sub(2, "validation_status_not_approved"))
        self.assertEqual(list(CchaPrimaryData.objects.values_list("submission_id", flat=True)), [1])

    def test_form_definition_upserted(self):
        pull(sub(1))
        self.assertEqual(KoboForm.objects.get().form_key, "ccha_primary_data")

    def test_sync_row_counts_interviews(self):
        pull(sub(1), sub(2))
        sync = SourceSync.objects.get(source="kobo", dataset="primary_data", iso3=None,
                                      variant="ccha_primary_data")
        self.assertEqual(sync.row_count, 2)
        self.assertEqual(sync.high_water_date, date(2026, 10, 2))

    def test_seed_row_exists(self):
        self.assertTrue(SourceSync.objects.filter(
            source="kobo", dataset="primary_data", iso3=None,
            variant="ccha_primary_data").exists())


class AllRejectedTests(TestCase):
    def test_rejected_rows_deleted_even_when_nothing_else_loads(self):
        pull(sub(7))
        responses = [FORM, {"count": 1, "next": None, "results": [{"_id": 7}]},
                     {"count": 0, "next": None, "results": []}]
        with override_settings(KOBO_TOKEN="T", KOBO_URL="https://kobo.example",
                               UGANDA_CCHA_FORM_ID="aUGA"), \
                patch.object(base, "http_get_json", side_effect=responses):
            with self.assertRaises(CommandError):
                call_command("refresh_external", "kobo", "primary_data",
                             "--variant", "ccha_primary_data")
        self.assertFalse(CchaPrimaryData.objects.exists())
