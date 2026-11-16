"""The country switch: detected from the boundaries, flipped only by a person."""
from django.contrib.auth import get_user_model
from django.test import TestCase

from boundaries.models import AdminArea, BoundarySource
from dashboard.models import CountryVisibility
from dashboard.visibility import hidden_countries, sync_countries


def make_area(source, iso3, name, level, pcode):
    return AdminArea.objects.create(source=source, iso3=iso3, country_name=name,
                                    level=level, pcode=pcode, name=name)


class SyncTests(TestCase):
    def setUp(self):
        src = BoundarySource.objects.create(path="test/countries.shp")
        make_area(src, "SDN", "Sudan", 0, "SD")
        make_area(src, "LBY", "Libya", 0, "LY")
        make_area(src, "SDN", "Sudan", 1, "SD01")

    def test_sync_adds_every_level0_country_shown(self):
        self.assertEqual(sync_countries(), 2)
        self.assertEqual(
            sorted(CountryVisibility.objects.values_list("iso3", "name", "shown")),
            [("LBY", "Libya", True), ("SDN", "Sudan", True)])

    def test_sync_never_flips_shown(self):
        CountryVisibility.objects.create(iso3="LBY", name="Libya", shown=False)
        sync_countries()
        self.assertFalse(CountryVisibility.objects.get(iso3="LBY").shown)

    def test_sync_never_deletes(self):
        CountryVisibility.objects.create(iso3="ERI", name="Eritrea")
        sync_countries()
        self.assertTrue(CountryVisibility.objects.filter(iso3="ERI").exists())


class HiddenTests(TestCase):
    def test_hidden_matches_iso3_and_name(self):
        CountryVisibility.objects.create(iso3="LBY", name="Libya", shown=False)
        CountryVisibility.objects.create(iso3="TCD", name="Chad", shown=True)
        h = hidden_countries()
        self.assertTrue(h)
        self.assertTrue(h.hides("LBY"))
        self.assertTrue(h.hides("Libya"))
        for kept in ("Chad", "TCD", None, "", "Regional"):
            self.assertFalse(h.hides(kept), kept)
        self.assertEqual(h.key(), "LBY")

    def test_nothing_hidden_is_falsy(self):
        CountryVisibility.objects.create(iso3="LBY", name="Libya", shown=True)
        self.assertFalse(hidden_countries())


class AdminTests(TestCase):
    URL = "/admin/dashboard/countryvisibility/"

    def setUp(self):
        src = BoundarySource.objects.create(path="test/countries.shp")
        make_area(src, "LBY", "Libya", 0, "LY")
        self.user = get_user_model().objects.create_superuser("george", "g@example.org", "pw")
        self.client.force_login(self.user)

    def test_admin_changelist_offers_checkbox_not_text(self):
        r = self.client.get(self.URL)
        self.assertEqual(r.status_code, 200)
        self.assertContains(r, 'name="form-0-shown"')
        self.assertNotContains(r, 'name="form-0-name"')
        self.assertNotContains(r, self.URL + "add/")
        # The page load itself detected the country; nobody typed it.
        self.assertTrue(CountryVisibility.objects.filter(iso3="LBY").exists())

    def test_admin_save_records_who_and_when(self):
        self.client.get(self.URL)
        row = CountryVisibility.objects.get(iso3="LBY")
        r = self.client.post(self.URL, {
            "form-TOTAL_FORMS": "1", "form-INITIAL_FORMS": "1",
            "form-MIN_NUM_FORMS": "0", "form-MAX_NUM_FORMS": "1000",
            "form-0-id": str(row.pk), "_save": "Save",
            # an unchecked box is simply absent from the POST
        })
        self.assertEqual(r.status_code, 302)
        row.refresh_from_db()
        self.assertFalse(row.shown)
        self.assertEqual(row.changed_by, "george")
        self.assertIsNotNone(row.changed_at)
