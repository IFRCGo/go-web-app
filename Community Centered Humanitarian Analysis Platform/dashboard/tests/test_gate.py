"""/data/<path> runs every file through its scrubber while a country is hidden."""
import json
import os
import tempfile
from pathlib import Path

from django.conf import settings
from django.test import TestCase, override_settings

from dashboard import scrubbers
from dashboard.models import CountryVisibility

FLOWS = {"sudan-libya": {"series": []}, "sudan-chad": {"series": []}}


def body(resp):
    return b"".join(resp.streaming_content) if resp.streaming else resp.content


class GateTests(TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.base = Path(self.tmp.name)
        (self.base / "ipc_fs").mkdir()
        (self.base / "flows.json").write_text(json.dumps(FLOWS))
        (self.base / "new_layer.json").write_text("{}")
        (self.base / "ipc_fs" / "CAF.geojson").write_text(json.dumps({"_meta": {"iso3": "CAF"}}))
        self.override = override_settings(DASHBOARD_DATA_DIR=self.base)
        self.override.enable()
        self.lby = CountryVisibility.objects.create(iso3="LBY", name="Libya")
        CountryVisibility.objects.create(iso3="CAF", name="Central African Republic")

    def tearDown(self):
        self.override.disable()
        self.tmp.cleanup()

    def hide(self, *iso3):
        CountryVisibility.objects.filter(iso3__in=iso3).update(shown=False)

    def show_all(self):
        CountryVisibility.objects.update(shown=True)

    def test_nothing_hidden_serves_file_bytes_unchanged(self):
        r = self.client.get("/data/flows.json")
        self.assertEqual(body(r), (self.base / "flows.json").read_bytes())

    def test_hidden_country_rows_removed_from_flows(self):
        self.hide("LBY")
        r = self.client.get("/data/flows.json")
        self.assertEqual(r.status_code, 200)
        self.assertEqual(list(json.loads(body(r))), ["sudan-chad"])
        self.assertEqual(r["Cache-Control"], "no-store")

    def test_unregistered_file_refused_while_hidden(self):
        self.hide("LBY")
        self.assertEqual(self.client.get("/data/new_layer.json").status_code, 404)
        self.show_all()
        self.assertEqual(self.client.get("/data/new_layer.json").status_code, 200)

    def test_whole_country_file_404(self):
        self.hide("CAF")
        self.assertEqual(self.client.get("/data/ipc_fs/CAF.geojson").status_code, 404)

    def test_switch_back_on_restores_without_rebuild(self):
        self.hide("LBY")
        self.client.get("/data/flows.json")
        self.show_all()
        r = self.client.get("/data/flows.json")
        self.assertEqual(body(r), (self.base / "flows.json").read_bytes())

    def test_cache_invalidates_on_switch_and_on_file_change(self):
        self.hide("LBY")
        self.assertEqual(list(json.loads(body(self.client.get("/data/flows.json")))), ["sudan-chad"])
        self.show_all()
        self.hide("CAF")
        self.assertEqual(sorted(json.loads(body(self.client.get("/data/flows.json")))),
                         ["sudan-chad", "sudan-libya"])
        path = self.base / "flows.json"
        path.write_text(json.dumps({"sudan-car": {}, "sudan-egypt": {}}))
        st = path.stat()
        os.utime(path, ns=(st.st_atime_ns, st.st_mtime_ns + 10**9))
        self.assertEqual(list(json.loads(body(self.client.get("/data/flows.json")))), ["sudan-egypt"])


class CoverageTests(TestCase):
    def test_every_file_in_data_dir_has_a_scrubber(self):
        base = Path(settings.DASHBOARD_DATA_DIR)  # the real folder, read only
        missing = [p.relative_to(base).as_posix() for p in base.rglob("*")
                   if p.is_file() and scrubbers.scrubber_for(p.relative_to(base).as_posix()) is None]
        self.assertEqual(missing, [])
