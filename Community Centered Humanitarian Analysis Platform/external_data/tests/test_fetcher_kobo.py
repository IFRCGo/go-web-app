"""The two Kobo fetchers: HSP mapping, and CCHA primary data.

Each makes its preparatory calls inside plan() - the form definition, and for
CCHA the ids of Not Approved submissions - saves them, and hands what it
fetched to the single /data/ Call through call.context. Nothing here touches
the network: base.http_get_json is patched.
"""
import json
from pathlib import Path
from unittest.mock import patch

from django.conf import settings
from django.test import TestCase, override_settings

from external_data.fetchers import base, fetcher_for
from external_data.fetchers.base import missing_keys
from external_data.models import SourceSync

KOBO = "https://kobo.example"
ASSET = {"uid": "aHSP", "name": "HSP mapping", "content": {"survey": [], "choices": []}}


def plan_for(source, dataset, variant, iso3, responses):
    sync, _ = SourceSync.objects.get_or_create(
        source=source, dataset=dataset, iso3=iso3, variant=variant)
    with patch.object(base, "http_get_json", side_effect=list(responses)) as get:
        calls = list(fetcher_for(source, dataset, variant)().plan(sync))
    return calls, get


@override_settings(KOBO_TOKEN="SECRETTOK", KOBO_URL=KOBO, HSPS_FORM_ID="aHSP",
                   UGANDA_CCHA_FORM_ID="aUGA")
class KoboFetcherTests(TestCase):
    def test_both_forms_are_registered(self):
        self.assertIsNotNone(fetcher_for("kobo", "humanitarian_service_points", "hsp-mapping"))
        self.assertIsNotNone(fetcher_for("kobo", "primary_data", "ccha_primary_data"))

    def test_missing_form_id_blocks_the_pull(self):
        with self.settings(UGANDA_CCHA_FORM_ID=""):
            self.assertEqual(missing_keys(fetcher_for("kobo", "primary_data", "ccha_primary_data")),
                             ["UGANDA_CCHA_FORM_ID"])
        with self.settings(KOBO_TOKEN=""):
            self.assertEqual(
                missing_keys(fetcher_for("kobo", "humanitarian_service_points", "hsp-mapping")),
                ["KOBO_TOKEN"])

    def test_hsp_plan_is_one_unfiltered_data_call(self):
        [call], get = plan_for("kobo", "humanitarian_service_points", "hsp-mapping", None,
                               [ASSET])
        self.assertEqual(get.call_args.args[0], f"{KOBO}/api/v2/assets/aHSP/")
        self.assertEqual(call.url, f"{KOBO}/api/v2/assets/aHSP/data/")
        self.assertNotIn("query", call.params)
        self.assertEqual((call.pager, call.paginated), ("next_url", True))
        self.assertEqual(call.headers, {"Authorization": "Token SECRETTOK"})
        self.assertEqual(call.loader_dataset, "kobo_hsp")
        self.assertEqual(call.context["form"]["uid"], "aHSP")
        self.assertEqual(call.context["form_uid"], "aHSP")
        self.assertEqual(call.context["form_key"], "hsp")
        self.assertIn("pulled_on", call.context)

    def test_ccha_excludes_not_approved_server_side(self):
        [call], _ = plan_for("kobo", "primary_data", "ccha_primary_data", None,
                             [dict(ASSET, uid="aUGA"),
                              {"count": 2, "next": None, "results": [{"_id": 7}, {"_id": 9}]}])
        self.assertEqual(json.loads(call.params["query"]),
                         {"_validation_status.uid": {"$ne": "validation_status_not_approved"}})
        self.assertEqual(call.loader_dataset, "ccha_primary_data")
        self.assertEqual(call.context["not_approved_ids"], [7, 9])
        self.assertEqual(call.context["form_key"], "ccha_primary_data")

    def test_not_approved_lookup_asks_for_ids_only(self):
        _, get = plan_for("kobo", "primary_data", "ccha_primary_data", None,
                          [dict(ASSET, uid="aUGA"), {"count": 0, "next": None, "results": []}])
        lookup = get.call_args_list[1]
        self.assertEqual(lookup.args[0], f"{KOBO}/api/v2/assets/aUGA/data/")
        params = lookup.args[1]
        self.assertEqual(json.loads(params["query"]),
                         {"_validation_status.uid": "validation_status_not_approved"})
        self.assertEqual(json.loads(params["fields"]), ["_id"])
        self.assertEqual(lookup.kwargs["headers"], {"Authorization": "Token SECRETTOK"})

    def test_preparatory_responses_are_saved_to_the_cache(self):
        plan_for("kobo", "primary_data", "ccha_primary_data", None,
                 [dict(ASSET, uid="aUGA"), {"count": 1, "next": None, "results": [{"_id": 7}]}])
        root = Path(settings.API_CACHE_DIR) / "kobo" / "ccha_primary_data"
        self.assertEqual(json.loads((root / "form.json").read_text())["uid"], "aUGA")
        self.assertEqual(json.loads((root / "not_approved_ids.json").read_text()), [7])

    def test_token_never_in_a_url_or_params(self):
        calls, get = plan_for("kobo", "primary_data", "ccha_primary_data", None,
                              [dict(ASSET, uid="aUGA"), {"next": None, "results": []}])
        for c in get.call_args_list:
            self.assertNotIn("SECRETTOK", c.args[0] + json.dumps(c.args[1] or {}))
        self.assertNotIn("SECRETTOK", calls[0].url + json.dumps(calls[0].params))

    def test_params_record_names_the_form_not_the_token(self):
        fetcher = fetcher_for("kobo", "primary_data", "ccha_primary_data")()
        record = json.dumps(fetcher.params_record())
        self.assertIn("aUGA", record)
        self.assertNotIn("SECRETTOK", record)
