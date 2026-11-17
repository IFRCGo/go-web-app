"""What Admin must guarantee: nothing publishes itself, and a quote cannot be
quietly rewritten.
"""
import json
import sys
import tempfile
from pathlib import Path
from unittest.mock import patch

import fitz
from django.conf import settings
from django.contrib.auth.models import User
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings
from django.urls import reverse

from data_track.models import Document, DocumentText
from insights.models import ExtractionJob, Insight, InsightUpload
from insights.verify import quote_sha1

FIXTURES = Path(__file__).parent / "fixtures"
QUOTE = "We have cholera now and nowhere to take the sick."


class AdminReviewTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_superuser("reviewer", "r@example.org", "pw")
        self.client.force_login(self.user)
        self.doc = Document.objects.create(file_name="x.pdf", rel_path="insights/x.pdf")
        DocumentText.objects.create(document=self.doc, page=1, text=f"They said: {QUOTE}")
        self.insight = Insight.objects.create(
            quote=QUOTE, quote_sha1=quote_sha1(QUOTE), document=self.doc, page=1,
            voice_type="community", channel="document_ai", stated_on="2026-03-14",
            iso3="ETH", method="llm", status="pending",
        )

    def test_the_changelist_loads(self):
        response = self.client.get(reverse("admin:insights_insight_changelist"))
        self.assertEqual(response.status_code, 200)

    def test_publishing_records_who_and_when(self):
        self.client.post(reverse("admin:insights_insight_changelist"), {
            "action": "publish_selected",
            "_selected_action": [str(self.insight.id)],
        }, follow=True)
        self.insight.refresh_from_db()
        self.assertEqual(self.insight.status, "published")
        self.assertEqual(self.insight.reviewed_by_id, self.user.id)
        self.assertIsNotNone(self.insight.reviewed_at)

    def test_editing_the_quote_recomputes_the_fingerprint(self):
        self.insight.quote = "We have cholera now and nowhere to take the sick!"
        self.insight.save()
        self.assertEqual(self.insight.quote_sha1, quote_sha1(self.insight.quote))

    def test_a_manual_insight_saves_without_a_document(self):
        row = Insight.objects.create(
            quote="A statement relayed by the field team.",
            quote_sha1=quote_sha1("A statement relayed by the field team."),
            voice_type="community", channel="manual", stated_on="2026-04-01",
            iso3="TCD", method="manual", status="published",
        )
        self.assertIsNone(row.document_id)
        self.assertEqual(row.status, "published")


class LoadPayloadsActionTests(TestCase):
    """A payload file is written by an external agent that can be interrupted
    mid-write. A truncated or unreadable file must be reported and skipped,
    exactly like a rejected-but-well-formed one - never a 500 that takes the
    whole action, and every other file in the batch, down with it.
    """

    FLOOD_QUOTE = (
        "When it rains we get flash floods, and with the fighting around us the "
        "hospitals are gone — we have cholera now and nowhere to take the sick."
    )

    def setUp(self):
        self.user = User.objects.create_superuser("loader", "l@example.org", "pw")
        self.client.force_login(self.user)
        self.doc = Document.objects.create(
            file_name="x.pdf", rel_path="insights/x.pdf", report_date="2026-03-14")
        DocumentText.objects.create(
            document=self.doc, page=7, text=f"Participants said: {self.FLOOD_QUOTE}")
        self.job = ExtractionJob.objects.create(producer="external", status="queued")

    def _run_action(self, cache_dir):
        with override_settings(API_CACHE_DIR=str(cache_dir)):
            return self.client.post(reverse("admin:insights_extractionjob_changelist"), {
                "action": "load_payloads_for_job",
                "_selected_action": [str(self.job.id)],
            }, follow=True)

    def test_a_malformed_payload_does_not_crash_the_action(self):
        with tempfile.TemporaryDirectory() as tmp:
            insights_dir = Path(tmp) / "insights"
            insights_dir.mkdir()
            (insights_dir / "truncated.json").write_text('{"insights": [', encoding="utf-8")

            response = self._run_action(tmp)

        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "could not be read as JSON")
        self.job.refresh_from_db()
        self.assertEqual(self.job.status, "loaded")

    def test_a_good_payload_still_loads_beside_a_bad_one(self):
        good_payload = json.loads((FIXTURES / "payload_ok.json").read_text(encoding="utf-8"))
        with tempfile.TemporaryDirectory() as tmp:
            insights_dir = Path(tmp) / "insights"
            insights_dir.mkdir()
            # Sorts before the good file, so this also proves a bad file earlier in
            # the batch does not stop a good one later in the batch from loading.
            (insights_dir / "a_truncated.json").write_text('{"insights": [', encoding="utf-8")
            (insights_dir / "b_good.json").write_text(
                json.dumps(good_payload), encoding="utf-8")

            response = self._run_action(tmp)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(Insight.objects.count(), 1)


def _pdf_bytes(text):
    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((72, 72), text)
    data = doc.tobytes()
    doc.close()
    return data


class InsightUploadAdminTests(TestCase):
    """R13a: saving an upload must open a job for it, the same as a
    registered folder's documents get one from catalogue_folder() - otherwise
    a document catalogued through this one-off screen has no job to attach
    it to and can never be extracted."""

    def setUp(self):
        self.user = User.objects.create_superuser("uploader", "u@example.org", "pw")
        self.client.force_login(self.user)

    def test_saving_an_upload_catalogues_it_and_opens_a_one_document_job(self):
        with tempfile.TemporaryDirectory() as media_root:
            with override_settings(MEDIA_ROOT=media_root):
                upload = SimpleUploadedFile(
                    "assessment.pdf", _pdf_bytes("Words."), content_type="application/pdf")
                response = self.client.post(
                    reverse("admin:insights_insightupload_add"),
                    {"file": upload, "iso3": "TCD"},
                    follow=True,
                )

        self.assertEqual(response.status_code, 200)
        upload_row = InsightUpload.objects.get()
        self.assertIsNotNone(upload_row.document_id)

        job = ExtractionJob.objects.get()
        self.assertEqual(job.documents_total, 1)
        self.assertEqual(job.status, "collected")
        self.assertEqual(job.producer, "external")
        self.assertEqual(
            list(job.documents.values_list("id", flat=True)), [upload_row.document_id])


class RunExtractionNowActionTests(TestCase):
    """spec §8.2 / task-13-rulings.md §6 (R13b): the Admin action that starts
    an in-container extraction without the request waiting for it. No test
    here spawns a real subprocess - subprocess.Popen is always mocked.
    """

    def setUp(self):
        self.user = User.objects.create_superuser("runner", "run@example.org", "pw")
        self.client.force_login(self.user)
        self.job = ExtractionJob.objects.create(producer="external", status="queued")

    def _run_action(self, job_ids):
        return self.client.post(reverse("admin:insights_extractionjob_changelist"), {
            "action": "run_extraction_now",
            "_selected_action": [str(i) for i in job_ids],
        }, follow=True)

    @override_settings(LLM_PROVIDER="anthropic", LLM_MODEL="claude-opus-5")
    def test_launches_extract_insights_with_the_right_argv_and_cwd(self):
        with tempfile.TemporaryDirectory() as tmp:
            with override_settings(API_CACHE_DIR=tmp), \
                    patch("insights.admin.subprocess.Popen") as mock_popen:
                response = self._run_action([self.job.id])

        self.assertEqual(response.status_code, 200)
        mock_popen.assert_called_once()
        args, kwargs = mock_popen.call_args
        self.assertEqual(
            args[0],
            [sys.executable, "manage.py", "extract_insights", "--job", str(self.job.id)],
        )
        self.assertEqual(kwargs["cwd"], settings.BASE_DIR)
        self.assertTrue(kwargs["start_new_session"])
        self.job.refresh_from_db()
        self.assertEqual(self.job.status, "running")

    @override_settings(LLM_PROVIDER="anthropic", LLM_MODEL="claude-opus-5")
    def test_a_running_job_is_refused_with_nothing_launched(self):
        self.job.status = "running"
        self.job.save(update_fields=["status"])
        with patch("insights.admin.subprocess.Popen") as mock_popen:
            response = self._run_action([self.job.id])
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "already running")
        mock_popen.assert_not_called()

    @override_settings(LLM_PROVIDER="nonesuch")
    def test_an_invalid_config_is_refused_with_nothing_launched(self):
        """Not requiring LLM_API_KEY is deliberate (task-13-rulings.md §6
        point 1) - an unset provider is what this test uses to trigger the
        ValueError instead, so the assertion is not confused with the
        never-require-a-key rule."""
        with patch("insights.admin.subprocess.Popen") as mock_popen:
            response = self._run_action([self.job.id])
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "not configured")
        mock_popen.assert_not_called()
        self.job.refresh_from_db()
        self.assertEqual(self.job.status, "queued")

    @override_settings(LLM_PROVIDER="anthropic", LLM_MODEL="claude-opus-5")
    def test_the_log_directory_is_created_before_the_log_file_is_opened(self):
        """On a fresh setup <API_CACHE_DIR>/insights/ does not exist yet - it
        is only ever created by something writing a payload into it. The very
        first click of this action must not fail opening the log file before
        the command underneath ever gets a chance to create the directory
        itself (task-13-rulings.md §6, R13b point 3)."""
        with tempfile.TemporaryDirectory() as tmp:
            cache_dir = Path(tmp) / "cache"  # exists; its insights/ child does not
            cache_dir.mkdir()
            with override_settings(API_CACHE_DIR=str(cache_dir)), \
                    patch("insights.admin.subprocess.Popen") as mock_popen:
                response = self._run_action([self.job.id])
            self.assertTrue((cache_dir / "insights").is_dir())
            self.assertTrue((cache_dir / "insights" / f"job-{self.job.id}.log").exists())

        self.assertEqual(response.status_code, 200)
        mock_popen.assert_called_once()


class ResetStuckJobActionTests(TestCase):
    """fix-round, 2026-09-14: extract_insights.py now marks a job "failed"
    when its own process raises - but it cannot do anything when the process
    is KILLED instead (docker compose restart web kills a detached child
    with no exception anywhere to catch). That leaves a job wedged at
    "running" forever, which run_extraction_now's own double-click guard
    then refuses to ever launch again. This action is the manual way out.
    """

    def setUp(self):
        self.user = User.objects.create_superuser("resetter", "reset@example.org", "pw")
        self.client.force_login(self.user)
        self.job = ExtractionJob.objects.create(producer="external", status="running")

    def _reset(self, job_ids):
        return self.client.post(reverse("admin:insights_extractionjob_changelist"), {
            "action": "reset_stuck_job",
            "_selected_action": [str(i) for i in job_ids],
        }, follow=True)

    def test_a_running_job_is_reset_to_queued(self):
        response = self._reset([self.job.id])
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "1 to queued")
        self.job.refresh_from_db()
        self.assertEqual(self.job.status, "queued")

    def test_a_job_that_is_not_running_is_left_alone(self):
        self.job.status = "loaded"
        self.job.save(update_fields=["status"])
        response = self._reset([self.job.id])
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "were neither")
        self.job.refresh_from_db()
        self.assertEqual(self.job.status, "loaded")

    @override_settings(LLM_PROVIDER="anthropic", LLM_MODEL="claude-opus-5")
    def test_run_extraction_now_accepts_the_job_once_it_is_reset(self):
        """The end-to-end point of this action: a job run_extraction_now
        would otherwise refuse forever becomes launchable again."""
        self._reset([self.job.id])
        self.job.refresh_from_db()
        self.assertEqual(self.job.status, "queued")

        with tempfile.TemporaryDirectory() as tmp:
            with override_settings(API_CACHE_DIR=tmp), \
                    patch("insights.admin.subprocess.Popen") as mock_popen:
                response = self.client.post(
                    reverse("admin:insights_extractionjob_changelist"), {
                        "action": "run_extraction_now",
                        "_selected_action": [str(self.job.id)],
                    }, follow=True)

        self.assertEqual(response.status_code, 200)
        mock_popen.assert_called_once()
        self.job.refresh_from_db()
        self.assertEqual(self.job.status, "running")


class ChildInlineTests(TestCase):
    def test_the_insight_admin_edits_figures_and_corridors(self):
        """Read-only in the wizard, corrected here. A wrong figure needs a home."""
        from django.contrib import admin as django_admin

        from insights.models import Insight, InsightFigure, InsightMovement

        inlines = [inline.model for inline in
                   django_admin.site._registry[Insight].inlines]
        self.assertIn(InsightFigure, inlines)
        self.assertIn(InsightMovement, inlines)

    def test_the_coding_inline_exposes_the_role(self):
        from django.contrib import admin as django_admin

        from insights.models import Insight, InsightCoding

        coding_inline = next(
            inline for inline in django_admin.site._registry[Insight].inlines
            if inline.model is InsightCoding)
        self.assertIn("role", coding_inline.fields)


class FieldDataAdminTests(TestCase):
    def setUp(self):
        from django.contrib.auth.models import User
        self.client.force_login(User.objects.create_superuser("rv", "rv@example.org", "pw"))

    def test_part2_change_page_shows_parent_question(self):
        from external_data.models import CchaPrimaryData
        iv = CchaPrimaryData.objects.create(submission_id=1, interview_type="Household Survey",
                                            vulnerabilities_differences="Yes, some differences")
        row = Insight.objects.create(quote="Words", channel="primary", stated_on="2026-10-08",
                                     iso3="UGA", method="kobo", field_interview=iv,
                                     field_question="vulnerabilities_elaborate")
        page = self.client.get(reverse("admin:insights_insight_change", args=[row.pk]))
        self.assertContains(page, "arrived recently and longer-term residents")
        self.assertContains(page, "Yes, some differences")
