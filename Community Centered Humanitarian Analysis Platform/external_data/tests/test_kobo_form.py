"""FormMap: a Kobo form definition read as xpaths, labels and choice labels.

The HSP fixture is the real form (cut to the choices its answers use). The
multilingual and missing-code cases are built inline, because neither of this
project's forms has them yet and both are how a label silently goes wrong.
"""
import json
from pathlib import Path

from django.test import SimpleTestCase

from external_data.loaders.kobo_form import FormMap, selected

FIXTURES = Path(__file__).parent / "fixtures" / "kobo"


def hsp_form():
    return json.loads((FIXTURES / "hsp_form.json").read_text(encoding="utf-8"))


class FormMapTests(SimpleTestCase):
    def setUp(self):
        self.form = FormMap(hsp_form())

    def test_paths_include_group_prefixes(self):
        self.assertEqual(self.form.path_for_label("Country"), "intro_section/country")
        self.assertEqual(
            self.form.path_for_label("Are the SAME services", startswith=True),
            "intro_section/same_services")

    def test_repeat_path_found(self):
        self.assertEqual(self.form.repeat_path_for_label("Service point location"), "location")
        self.assertEqual(self.form.path_for_label("District"), "location/district")

    def test_unknown_label_is_none(self):
        self.assertIsNone(self.form.path_for_label("No such question"))

    def test_choice_labels(self):
        self.assertEqual(self.form.choice_label("intro_section/country", "TCD"), "Chad")
        self.assertEqual(
            self.form.choice_label("intro_section/services_all", "cva"),
            "Cash & Voucher Assistance")

    def test_unknown_choice_code_returns_code(self):
        self.assertEqual(self.form.choice_label("intro_section/country", "XYZ"), "XYZ")
        self.assertEqual(self.form.choice_label("intro_section/num_hsps", "3"), "3")

    def test_choices_for_keeps_form_order(self):
        codes = [code for code, _ in self.form.choices_for("intro_section/services_all")]
        self.assertEqual(codes[:2], ["health", "migration"])

    def test_label_from_first_translation(self):
        asset = {"content": {
            "translations": ["English (en)", "Arabic (ar)"],
            "survey": [{"type": "select_one", "name": "c", "label": ["Country", "البلد"],
                        "select_from_list_name": "cl"}],
            "choices": [{"list_name": "cl", "name": "SDN", "label": ["Sudan", "السودان"]}]}}
        form = FormMap(asset)
        self.assertEqual(form.path_for_label("Country"), "c")
        self.assertEqual(form.choice_label("c", "SDN"), "Sudan")

    def test_plain_string_and_missing_labels(self):
        asset = {"content": {"survey": [
            {"type": "text", "name": "a", "label": "Plain"},
            {"type": "text", "$autoname": "b"}], "choices": []}}
        form = FormMap(asset)
        self.assertEqual(form.path_for_label("Plain"), "a")
        self.assertEqual(form.path_for_label("b"), "b")


class SelectedTests(SimpleTestCase):
    def test_selected_splits_on_any_whitespace(self):
        self.assertEqual(selected("a  b\nc"), ["a", "b", "c"])
        self.assertEqual(selected(None), [])
        self.assertEqual(selected(""), [])


class OrOtherTests(SimpleTestCase):
    def test_builtin_other_reads_as_other(self):
        """`select_multiple x or_other` adds an 'other' choice that is not in the
        choice list; it must read "Other", not the code."""
        form = FormMap(hsp_form())
        self.assertEqual(form.choice_label("intro_section/services_all", "other"), "Other")

    def test_a_listed_other_keeps_its_own_label(self):
        asset = {"content": {"survey": [{"type": "select_one", "name": "s", "label": ["S"],
                                         "select_from_list_name": "l"}],
                             "choices": [{"list_name": "l", "name": "other",
                                          "label": ["Something else"]}]}}
        self.assertEqual(FormMap(asset).choice_label("s", "other"), "Something else")
