"""Only published rows leave the building."""
from django.test import TestCase

from insights.models import (
    Insight, InsightCoding, InsightFigure, InsightMovement,
)
from insights.verify import quote_sha1


def make(quote, **kwargs):
    defaults = dict(
        quote=quote, quote_sha1=quote_sha1(quote), voice_type="community",
        channel="manual", stated_on="2026-03-14", iso3="ETH", method="manual",
        status="published",
    )
    defaults.update(kwargs)
    return Insight.objects.create(**defaults)


class InsightApiTests(TestCase):
    def setUp(self):
        self.published = make("We have cholera and no clinic.", lat=11.75, lon=40.95,
                              admin_pcode="ET02", match_method="name",
                              place_name_as_written="Afar")
        InsightCoding.objects.create(insight=self.published, dimension="hazard",
                                     tag="disease_outbreak")
        make("A pending statement.", status="pending")
        make("An analyst passage.", voice_type="secondary_analysis", iso3="SDN")

    def get(self, query=""):
        return self.client.get(f"/api/insights/{query}").json()

    def test_only_published_rows_are_returned(self):
        body = self.get()
        quotes = [row["quote"] for row in body["results"]]
        self.assertIn("We have cholera and no clinic.", quotes)
        self.assertNotIn("A pending statement.", quotes)

    def test_codings_travel_with_the_row(self):
        row = next(r for r in self.get()["results"] if r["quote"].startswith("We have"))
        # Each coding now carries its role; a coding written without one is a
        # 'subject'. See ComprehensiveFieldTests for what a 'driver' is for.
        self.assertEqual(
            row["codings"],
            [{"dimension": "hazard", "tag": "disease_outbreak", "role": "subject"}])

    def test_placement_is_reported_honestly(self):
        row = next(r for r in self.get()["results"] if r["quote"].startswith("We have"))
        self.assertEqual(row["match_method"], "name")
        self.assertEqual(row["lat"], 11.75)

    def test_filtering_by_voice_type(self):
        body = self.get("?voice_type=community")
        self.assertTrue(all(r["voice_type"] == "community" for r in body["results"]))

    def test_filtering_by_country(self):
        self.assertEqual(len(self.get("?iso3=SDN")["results"]), 1)

    def test_filtering_by_tag(self):
        self.assertEqual(len(self.get("?tag=disease_outbreak")["results"]), 1)

    def test_free_text_search(self):
        self.assertEqual(len(self.get("?q=cholera")["results"]), 1)

    def test_the_count_reflects_the_filter(self):
        self.assertEqual(self.get("?iso3=SDN")["count"], 1)

    def test_dimension_and_tag_filters_match_same_row(self):
        """When both dimension and tag are supplied, they must describe the
        same coding row. Chained .filter() calls join separately; this test
        proves they are combined in one .filter() call when both are supplied.
        """
        # Create an insight with two codings: hazard/flooding and need/health
        multi = make("We have floods and health needs.", iso3="ETH")
        InsightCoding.objects.create(insight=multi, dimension="hazard", tag="flooding")
        InsightCoding.objects.create(insight=multi, dimension="need", tag="health")

        # Query for dimension=need & tag=flooding should NOT return it
        # (those never co-occur on one coding)
        results = self.get("?dimension=need&tag=flooding")["results"]
        self.assertEqual(len(results), 0)

        # Query for dimension=hazard & tag=flooding should return it
        results = self.get("?dimension=hazard&tag=flooding")["results"]
        self.assertEqual(len(results), 1)

    def test_distinct_prevents_join_duplicates(self):
        """When an insight has multiple codings and we join the codings table,
        .distinct() prevents that insight from appearing multiple times in
        results. This test proves .distinct() is doing work.
        """
        # Create an insight with two codings that both have the same dimension.
        # Without .distinct(), filtering by that dimension would return the
        # insight twice (once for each matching coding).
        multi = make("Multiple codes same dimension.", iso3="SDN")
        InsightCoding.objects.create(insight=multi, dimension="hazard", tag="flooding")
        InsightCoding.objects.create(insight=multi, dimension="hazard", tag="windstorm")

        # Query in a way that joins the codings table
        body = self.get("?dimension=hazard")
        # The insight should appear exactly once in results, not twice
        results = [r for r in body["results"] if r["quote"] == "Multiple codes same dimension."]
        self.assertEqual(len(results), 1, "Insight should appear exactly once despite having 2 hazard codings")
        self.assertEqual(body["count"], 2)  # count includes the cholera insight too


class ComprehensiveFieldTests(TestCase):
    """The endpoint is mounted at /api/insights/ - reuse the module's `make`
    helper, which already fills quote_sha1 and the other defaults."""

    def setUp(self):
        self.insight = make(
            "Since the escalation of conflict in Sudan in April 2023, 0.7 million "
            "Sudanese refugees have been registered in Egypt.",
            iso3="EGY", stated_on="2026-03-01", voice_type="secondary_analysis")
        InsightCoding.objects.create(
            insight=self.insight, dimension="movement_pattern",
            tag="cross_border_arrival", role="subject")
        InsightCoding.objects.create(
            insight=self.insight, dimension="hazard", tag="armed_conflict", role="driver")
        InsightFigure.objects.create(
            insight=self.insight, figure_as_written="0.7 million", value=700000.0,
            unit="people", measures="Sudanese refugees registered in Egypt")
        InsightMovement.objects.create(
            insight=self.insight, origin_name_as_written="Sudan", origin_iso3="SDN",
            dest_name_as_written="Egypt", dest_iso3="EGY", flow_type="cross_border",
            value_as_written="0.7 million", value=700000, unit="people")

    def get(self, query=""):
        return self.client.get(f"/api/insights/{query}").json()

    def only_row(self):
        return [r for r in self.get()["results"] if r["iso3"] == "EGY"][0]

    def test_the_figures_are_served(self):
        figure = self.only_row()["figures"][0]
        self.assertEqual(figure["value"], 700000.0)
        self.assertEqual(figure["unit"], "people")
        self.assertEqual(figure["as_written"], "0.7 million")

    def test_the_corridor_is_served_with_both_ends(self):
        movement = self.only_row()["movements"][0]
        self.assertEqual(movement["origin"]["name"], "Sudan")
        self.assertEqual(movement["origin"]["iso3"], "SDN")
        self.assertEqual(movement["destination"]["iso3"], "EGY")
        self.assertEqual(movement["flow_type"], "cross_border")

    def test_each_coding_carries_its_role(self):
        roles = {c["tag"]: c["role"] for c in self.only_row()["codings"]}
        self.assertEqual(roles["armed_conflict"], "driver")

    def test_filtering_by_role_and_tag_finds_the_driver(self):
        """'What drives cross-border arrival' - the question the role column adds."""
        self.assertEqual(
            self.get("?dimension=hazard&tag=armed_conflict&role=driver")["count"], 1)

    def test_a_role_that_matches_no_coding_returns_nothing(self):
        self.assertEqual(
            self.get("?dimension=hazard&tag=armed_conflict&role=barrier")["count"], 0)

    def test_filtering_by_flow_type(self):
        self.assertEqual(self.get("?flow_type=cross_border")["count"], 1)
        self.assertEqual(self.get("?flow_type=return")["count"], 0)

    def test_a_pending_insight_is_still_never_served(self):
        self.insight.status = "pending"
        self.insight.save()
        self.assertEqual(self.get("?iso3=EGY")["count"], 0)


class FieldDataApiTests(TestCase):
    """Field statements carry the question they answer; the household's GPS never travels."""

    def setUp(self):
        from external_data.models import CchaPrimaryData
        self.iv = CchaPrimaryData.objects.create(
            submission_id=1, interview_type="Household Survey", latitude=1.9512345,
            longitude=32.0612345, vulnerabilities_differences="Yes, significant differences")
        make("Everything goes to new arrivals", channel="primary", iso3="UGA", method="kobo",
             field_interview=self.iv, field_question="vulnerabilities_elaborate",
             lat=1.991, lon=32.051)
        make("A pending field statement", channel="primary", iso3="UGA", method="kobo",
             status="pending", field_interview=self.iv, field_question="hazard_kind_other")

    def rows(self):
        return self.client.get("/api/insights/").json()["results"]

    def test_api_field_context_for_elaboration(self):
        row = next(r for r in self.rows() if r["channel"] == "primary")
        self.assertEqual(row["field_context"], "Are there any differences between people who "
                                               "arrived recently and longer-term residents?")
        self.assertEqual(row["field_context_answer"], "Yes, significant differences")

    def test_api_field_context_null_for_document_rows(self):
        make("A typed statement.")
        row = next(r for r in self.rows() if r["quote"] == "A typed statement.")
        self.assertIsNone(row["field_context"])
        self.assertIsNone(row["field_context_answer"])

    def test_api_pending_field_data_not_sent(self):
        self.assertNotIn("A pending field statement", [r["quote"] for r in self.rows()])

    def test_api_never_sends_household_gps(self):
        text = self.client.get("/api/insights/").content.decode()
        self.assertNotIn("1.9512345", text)
        self.assertNotIn("32.0612345", text)
        self.assertNotIn("field_interview", text)
