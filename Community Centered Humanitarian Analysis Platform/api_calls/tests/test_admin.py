"""The section, the button, and the rows that must not offer one."""
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.test import TestCase, override_settings
from django.urls import reverse

from external_data.models import SourceSync
from api_calls.models import PullJob


class AdminTestCase(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_superuser(
            "tester", "t@example.org", "pw")
        self.client.force_login(self.user)
        self.api_row = SourceSync.objects.create(
            source="fewsnet", dataset="seasonal_calendar", iso3="TCD", variant="")
        # A workbook row: no API, but a command that re-reads the file, so it
        # does get a button.
        self.workbook_row = SourceSync.objects.create(
            source="excel", dataset="idps", iso3="SDN", variant="sudan-idps-workbook")
        # A row with neither an API nor a command wired to the button.
        # (Was a kobo row until Kobo got fetchers on 2026-11-16; acaps is still
        # file-based.)
        self.file_row = SourceSync.objects.create(
            source="acaps", dataset="seasonal_calendar", iso3="TCD", variant="")


class ListTests(AdminTestCase):
    def test_the_section_is_reachable(self):
        response = self.client.get(reverse("admin:api_calls_datasource_changelist"))
        self.assertEqual(response.status_code, 200)

    def test_the_source_is_shown_by_its_display_name(self):
        response = self.client.get(reverse("admin:api_calls_datasource_changelist"))
        self.assertContains(response, "FEWS NET")

    @override_settings(IPC_API_KEY="", HDX_API_TOKEN="")
    def test_a_row_whose_key_is_missing_says_which_one(self):
        SourceSync.objects.create(source="ipc", dataset="food_security", iso3="SDN")
        response = self.client.get(reverse("admin:api_calls_datasource_changelist"))
        self.assertContains(response, "IPC_API_KEY")

    def test_a_file_based_row_offers_no_button(self):
        """A button that cannot work is worse than no button."""
        response = self.client.get(reverse("admin:api_calls_datasource_changelist"))
        self.assertNotContains(response, f"pull/{self.file_row.pk}/")

    def test_an_api_row_offers_one(self):
        response = self.client.get(reverse("admin:api_calls_datasource_changelist"))
        self.assertContains(response, f"pull/{self.api_row.pk}/")

    def test_a_file_based_row_names_the_command_that_loads_it(self):
        response = self.client.get(reverse("admin:api_calls_datasource_changelist"))
        self.assertContains(response, "load_external acaps_seasonal")

    def test_a_workbook_row_offers_a_button(self):
        """The workbook has no API, but it does have a newer file on the share.

        This is the whole point of the button: the analyst saves a new dated
        column into Sudan IDPs.xlsx and the platform must have a way to pick it up
        that is not a terminal.
        """
        response = self.client.get(reverse("admin:api_calls_datasource_changelist"))
        self.assertContains(response, f"pull/{self.workbook_row.pk}/")

    def test_a_workbook_button_says_it_reads_a_file(self):
        """"Pull now" on a workbook row invites the reading that it goes looking
        for newer figures somewhere. It re-reads what has been saved."""
        response = self.client.get(reverse("admin:api_calls_datasource_changelist"))
        self.assertContains(response, "Reload file")


class PullTests(AdminTestCase):
    def _url(self, row):
        return f"/admin/api_calls/datasource/pull/{row.pk}/"

    def test_pressing_the_button_creates_a_queued_job_and_launches_it(self):
        with patch("api_calls.views.subprocess.Popen") as popen:
            response = self.client.post(self._url(self.api_row))
        self.assertEqual(response.status_code, 302)
        job = PullJob.objects.get()
        self.assertEqual(job.source, "fewsnet")
        self.assertEqual(job.requested_by, self.user)
        popen.assert_called_once()

    def test_the_command_is_launched_detached(self):
        """start_new_session, or a child that outlives its worker reparents to
        gunicorn's arbiter, which misreads its exit code and halts the server."""
        with patch("api_calls.views.subprocess.Popen") as popen:
            self.client.post(self._url(self.api_row))
        self.assertTrue(popen.call_args.kwargs["start_new_session"])
        self.assertIn("refresh_external", popen.call_args.args[0])

    def test_the_country_and_variant_reach_the_command(self):
        with patch("api_calls.views.subprocess.Popen") as popen:
            self.client.post(self._url(self.api_row))
        argv = popen.call_args.args[0]
        self.assertIn("--iso3", argv)
        self.assertIn("TCD", argv)

    def test_a_get_does_not_start_anything(self):
        """A pull is a change. It must not be triggerable by following a link."""
        with patch("api_calls.views.subprocess.Popen") as popen:
            response = self.client.get(self._url(self.api_row))
        popen.assert_not_called()
        self.assertEqual(PullJob.objects.count(), 0)
        self.assertEqual(response.status_code, 200)

    def test_an_anonymous_visitor_is_refused(self):
        self.client.logout()
        with patch("api_calls.views.subprocess.Popen") as popen:
            response = self.client.post(self._url(self.api_row))
        popen.assert_not_called()
        self.assertEqual(response.status_code, 302)
        self.assertIn("/admin/login/", response["Location"])

    def test_a_busy_source_is_refused_without_launching(self):
        PullJob.objects.create(kind="pull", source="fewsnet",
                               dataset="seasonal_calendar", iso3="TCD",
                               status="running")
        with patch("api_calls.views.subprocess.Popen") as popen:
            self.client.post(self._url(self.api_row))
        popen.assert_not_called()

    def test_a_file_based_row_is_refused(self):
        with patch("api_calls.views.subprocess.Popen") as popen:
            self.client.post(self._url(self.file_row))
        popen.assert_not_called()
        self.assertEqual(PullJob.objects.count(), 0)

    def test_a_workbook_row_launches_load_workbooks_for_its_own_file(self):
        """--only, or one row's button reloads both workbooks.

        The neighbours workbook would be re-read as a side effect of pressing
        Reload on the Sudan IDPs row - and, worse, a missing neighbours file would
        fail a press that had nothing to do with it.
        """
        with patch("api_calls.views.subprocess.Popen") as popen:
            response = self.client.post(self._url(self.workbook_row))
        self.assertEqual(response.status_code, 302)
        argv = popen.call_args.args[0]
        self.assertIn("load_workbooks", argv)
        self.assertEqual(argv[argv.index("--only") + 1], "sudan-idps-workbook")
        job = PullJob.objects.get()
        self.assertEqual(argv[argv.index("--job") + 1], str(job.id))
        self.assertEqual(job.source, "excel")

    def test_a_workbook_row_is_never_asked_for_an_api_key(self):
        """missing_keys reads a fetcher class's own list. A workbook has none, and
        putting it through that check is how the button starts asking for a token
        no file read could use."""
        with override_settings(IPC_API_KEY="", HDX_API_TOKEN=""), \
                patch("api_calls.views.subprocess.Popen") as popen:
            self.client.post(self._url(self.workbook_row))
        popen.assert_called_once()

    def test_the_confirmation_page_for_a_workbook_talks_about_the_file(self):
        """A page promising an API call for a file read is a page people stop
        reading."""
        response = self.client.get(self._url(self.workbook_row))
        self.assertContains(response, "workbook")
        # Literal template text, so it is NOT autoescaped - the apostrophe has to
        # be the real one here or this assertion passes against both branches and
        # proves nothing.
        self.assertNotContains(response, "fetches from the source's API")

    def test_the_confirmation_page_for_an_api_row_still_talks_about_the_api(self):
        """The guard on the assertion above: it must be able to fail."""
        response = self.client.get(self._url(self.api_row))
        self.assertContains(response, "fetches from the source's API")

    @override_settings(IPC_API_KEY="")
    def test_a_keyless_source_is_refused_without_launching(self):
        row = SourceSync.objects.create(source="ipc", dataset="food_security",
                                        iso3="SDN")
        with patch("api_calls.views.subprocess.Popen") as popen:
            self.client.post(self._url(row))
        popen.assert_not_called()
        self.assertEqual(PullJob.objects.count(), 0)


class JobPageTests(AdminTestCase):
    def test_a_job_page_shows_its_status(self):
        job = PullJob.objects.create(kind="pull", source="fewsnet",
                                     dataset="seasonal_calendar", iso3="TCD",
                                     status="failed", message="503 from fdw.fews.net")
        response = self.client.get(f"/admin/api_calls/datasource/job/{job.id}/")
        self.assertContains(response, "503 from fdw.fews.net")

    def test_the_status_endpoint_reports_the_job(self):
        job = PullJob.objects.create(kind="pull", source="fewsnet",
                                     dataset="seasonal_calendar", iso3="TCD",
                                     status="running")
        response = self.client.get(f"/admin/api_calls/datasource/job/{job.id}/status/")
        self.assertEqual(response.json()["status"], "running")


@override_settings(KOBO_TOKEN="T", HSPS_FORM_ID="aHSP", UGANDA_CCHA_FORM_ID="aUGA")
class PrimaryDataTests(AdminTestCase):
    """Kobo rows are primary data, with a working Pull now on each (2026-11-16)."""

    def setUp(self):
        super().setUp()
        self.hsp_row = SourceSync.objects.create(
            source="kobo", dataset="humanitarian_service_points", iso3=None,
            variant="hsp-mapping")
        # Seeded by migration, so it already exists. One regional row: the
        # form collects in several countries.
        self.uga_row = SourceSync.objects.get(
            source="kobo", dataset="primary_data", iso3=None, variant="ccha_primary_data")

    def _list(self, **params):
        return self.client.get(reverse("admin:api_calls_datasource_changelist"), params)

    def test_kobo_rows_are_primary_data(self):
        from api_calls.admin import source_category
        self.assertEqual(source_category("kobo"), "Primary data")
        self.assertEqual(source_category("fewsnet"), "Secondary data")
        self.assertContains(self._list(), "Primary data")

    def test_both_kobo_rows_have_a_pull_now_button(self):
        response = self._list()
        self.assertContains(response, f"pull/{self.hsp_row.pk}/")
        self.assertContains(response, f"pull/{self.uga_row.pk}/")

    def test_kobo_not_listed_as_file_based(self):
        from api_calls.admin import FILE_BASED
        self.assertNotIn("kobo", FILE_BASED)
        self.assertNotContains(self._list(), "load_hsps")

    def test_category_filter_primary_shows_only_kobo(self):
        rows = list(self._list(category="primary").context["cl"].result_list)
        self.assertEqual({r.source for r in rows}, {"kobo"})
        rows = list(self._list(category="secondary").context["cl"].result_list)
        self.assertNotIn("kobo", {r.source for r in rows})

    def test_primary_rows_sort_first(self):
        rows = list(self._list().context["cl"].result_list)
        self.assertEqual(rows[0].source, "kobo")

    def test_refresh_argv_for_ccha_row(self):
        from api_calls.views import refresh_argv
        self.assertEqual(refresh_argv(self.uga_row, 1),
                         ["refresh_external", "kobo", "primary_data", "--job", "1",
                          "--variant", "ccha_primary_data"])
