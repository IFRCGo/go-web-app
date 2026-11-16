"""The test runner: Django's own, with the API cache moved out of the way.

API_CACHE_DIR is on the bind mount and its files are tracked in git. Every
refresh_external call saves its raw payload there, and tests clean up with
unlink() - so a plain `manage.py test` rewrote and deleted real cache files
(2026-11-16). For the whole run, API_CACHE_DIR points at a fresh temporary
folder that is removed afterwards. A test that needs its own folder can still
override_settings on top of this.
"""
import tempfile
from pathlib import Path

from django.test import override_settings
from django.test.runner import DiscoverRunner


class IsolatedCacheRunner(DiscoverRunner):
    def setup_test_environment(self, **kwargs):
        super().setup_test_environment(**kwargs)
        self._cache_tmp = tempfile.TemporaryDirectory(prefix="api_cache_test_")
        self._cache_override = override_settings(API_CACHE_DIR=Path(self._cache_tmp.name))
        self._cache_override.enable()

    def teardown_test_environment(self, **kwargs):
        self._cache_override.disable()
        self._cache_tmp.cleanup()
        super().teardown_test_environment(**kwargs)
