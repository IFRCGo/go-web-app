"""A test run must never write into the real API cache.

The cache sits on the bind mount and its files are tracked in git. Every
refresh_external call saves its raw payload there, and several tests clean up
with path.unlink(): against the real folder that deleted
fewsnet_seasons/TCD.json and montandon/SDN-*.json on 2026-11-16. The test
runner (config/test_runner.py) points API_CACHE_DIR at a temporary folder for
the whole run, so no test can touch the real one.
"""
from pathlib import Path
from unittest.mock import patch

from django.conf import settings
from django.core.management import call_command
from django.test import TestCase

from external_data.models import SourceSync
from external_data.tests.test_refresh_external import _seasons_payload

REAL_CACHE = Path(settings.BASE_DIR) / "data_pipeline" / "api_cache"


class CacheIsolationTests(TestCase):
    def test_the_cache_is_not_the_real_folder_during_tests(self):
        cache = Path(settings.API_CACHE_DIR).resolve()
        self.assertFalse(cache.is_relative_to(Path(settings.BASE_DIR).resolve()),
                         f"tests are writing into {cache}")

    def test_a_pull_leaves_the_real_cache_file_untouched(self):
        real = REAL_CACHE / "fewsnet_seasons" / "TCD.json"
        before = real.read_bytes() if real.exists() else None
        SourceSync.objects.create(source="fewsnet", dataset="seasonal_calendar",
                                  iso3="TCD", variant="")
        with patch("external_data.fetchers.base.http_get_json",
                   return_value=_seasons_payload()):
            call_command("refresh_external", "fewsnet", "seasonal_calendar", "--iso3", "TCD")
        after = real.read_bytes() if real.exists() else None
        self.assertEqual(before, after)
        self.assertTrue((Path(settings.API_CACHE_DIR) / "fewsnet_seasons" / "TCD.json").is_file())
