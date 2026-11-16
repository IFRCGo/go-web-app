"""With Libya and CAR switched off, no structured field the server sends names them.

Runs over the REAL dashboard/data/ files (read only). Prose is deliberately not
inspected: by decision, free text is never edited. P-code keys need AdminArea,
which the test database does not hold, so those are checked against the live
site instead (see the plan's Task 6 browser/live check).
"""
import json
from pathlib import Path

from django.conf import settings
from django.test import TestCase

from dashboard.models import CountryVisibility
from dashboard.scrubbers import corridor_countries

HIDDEN = {"LBY", "CAF", "Libya", "Central African Republic"}
COUNTRY_KEYS = {"country", "iso3", "ipc_country", "country_focus"}


def leaks(node, path="$"):
    """Every structured value under a country key that names a hidden country."""
    found = []
    if isinstance(node, dict):
        for k, v in node.items():
            if k in COUNTRY_KEYS and v in HIDDEN:
                found.append(f"{path}.{k}={v}")
            found += leaks(v, f"{path}.{k}")
    elif isinstance(node, list):
        for i, v in enumerate(node):
            found += leaks(v, f"{path}[{i}]")
    return found


def body(resp):
    return b"".join(resp.streaming_content) if resp.streaming else resp.content


class NoLeakTests(TestCase):
    def setUp(self):
        for iso, name in (("LBY", "Libya"), ("CAF", "Central African Republic"), ("TCD", "Chad")):
            CountryVisibility.objects.create(iso3=iso, name=name, shown=iso == "TCD")
        self.base = Path(settings.DASHBOARD_DATA_DIR)
        self.files = sorted(p.relative_to(self.base).as_posix()
                            for p in self.base.rglob("*") if p.is_file())

    def test_no_structured_field_names_a_hidden_country(self):
        problems = {}
        for rel in self.files:
            r = self.client.get(f"/data/{rel}")
            if r.status_code == 404:
                continue  # a whole-country file, refused
            self.assertEqual(r.status_code, 200, rel)
            data = json.loads(body(r))
            found = leaks(data)
            if rel == "seasonal.json":
                found += [k for k in data["countries"] if k in HIDDEN]
            if rel == "flows.json":
                found += [c for c in data if corridor_countries(c) & HIDDEN]
            if found:
                problems[rel] = found[:5]
        self.assertEqual(problems, {})

    def test_whole_country_files_are_refused(self):
        for rel in self.files:
            if rel.startswith("ipc_fs/") and Path(rel).stem in HIDDEN:
                self.assertEqual(self.client.get(f"/data/{rel}").status_code, 404, rel)

    def test_switching_back_on_restores_every_file_byte_for_byte(self):
        CountryVisibility.objects.update(shown=True)
        for rel in self.files:
            self.assertEqual(body(self.client.get(f"/data/{rel}")),
                             (self.base / rel).read_bytes(), rel)
