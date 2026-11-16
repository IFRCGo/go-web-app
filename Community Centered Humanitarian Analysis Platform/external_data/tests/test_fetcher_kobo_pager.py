"""Kobo's pager: follow the server's `next` URL, and send the token every time.

Kobo pages /data/ as {count, next, previous, results} with `next` a complete URL
that already carries start and limit. HAPI's pager builds offsets itself and
would never follow it, so Kobo has its own. No test here touches the network.
"""
from pathlib import Path
from unittest.mock import MagicMock, patch

import requests
from django.test import TestCase, override_settings

from external_data.fetchers import base
from external_data.fetchers.base import Call, FetchError

URL = "https://k.example/api/v2/assets/A/data/"
AUTH = {"Authorization": "Token SECRETTOK"}


def _resp(payload):
    r = MagicMock()
    r.json.return_value = payload
    r.raise_for_status.return_value = None
    return r


@override_settings(KOBO_TOKEN="SECRETTOK")
class KoboPagerTests(TestCase):
    def test_follows_next_and_resends_the_header(self):
        pages = [{"count": 3, "next": URL + "?start=2&limit=2", "results": [1, 2]},
                 {"count": 3, "next": None, "results": [3]}]
        with patch.object(base.requests, "get",
                          side_effect=[_resp(p) for p in pages]) as get:
            out = base.fetch_next_url_pages(URL, {"limit": 2}, AUTH)

        self.assertEqual(out, {"count": 3, "results": [1, 2, 3]})
        for call in get.call_args_list:
            self.assertEqual(call.kwargs["headers"]["Authorization"], "Token SECRETTOK")
        self.assertEqual(get.call_args_list[0].kwargs["params"], {"limit": 2})
        # `next` already carries start/limit; sending params again would double them.
        self.assertEqual(get.call_args_list[1].args[0], URL + "?start=2&limit=2")
        self.assertIsNone(get.call_args_list[1].kwargs["params"])

    def test_stops_at_max_pages(self):
        endless = {"count": 10**9, "next": URL + "?start=9", "results": [1]}
        with patch.object(base.requests, "get",
                          side_effect=lambda *a, **k: _resp(endless)) as get:
            out = base.fetch_next_url_pages(URL, {}, AUTH)
        self.assertEqual(get.call_count, base.MAX_PAGES)
        self.assertEqual(len(out["results"]), base.MAX_PAGES)

    def test_token_is_redacted_from_errors(self):
        boom = requests.ConnectionError("failed with Authorization: Token SECRETTOK")
        with patch.object(base.requests, "get", side_effect=boom):
            with self.assertRaises(FetchError) as ctx:
                base.fetch_next_url_pages(URL, {}, AUTH)
        self.assertNotIn("SECRETTOK", str(ctx.exception))

    def test_kobo_token_is_a_secret_setting(self):
        self.assertIn("KOBO_TOKEN", base.SECRET_SETTINGS)

    def test_fetch_routes_the_next_url_pager(self):
        call = Call(url="u", params={}, cache_path=Path("k.json"), loader_dataset="x",
                    paginated=True, pager="next_url", headers=dict(AUTH))
        with patch.object(base, "fetch_next_url_pages",
                          return_value={"results": []}) as f:
            base.fetch(call)
        f.assert_called_once_with("u", {}, AUTH)

    def test_an_unpaginated_get_sends_its_headers(self):
        call = Call(url="u", params={"a": 1}, cache_path=Path("k.json"),
                    loader_dataset="x", headers=dict(AUTH))
        with patch.object(base.requests, "get", return_value=_resp({"ok": 1})) as get:
            self.assertEqual(base.fetch(call), {"ok": 1})
        self.assertEqual(get.call_args.kwargs["headers"]["Authorization"], "Token SECRETTOK")
        self.assertEqual(get.call_args.kwargs["headers"]["Accept"], "application/json")


class KoboSettingsTests(TestCase):
    def test_settings_exist_with_kobo_url_default(self):
        from django.conf import settings
        for name in ("KOBO_TOKEN", "HSPS_FORM_ID", "UGANDA_CCHA_FORM_ID"):
            self.assertTrue(hasattr(settings, name), name)
        self.assertTrue(settings.KOBO_URL.startswith("https://"))
