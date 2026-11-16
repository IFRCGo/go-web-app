"""Kobo's HSP mapping answers -> humanitarian_service_points rows, as the Excel did.

THE SAME ROWS AS loaders/hsp.py, FROM A DIFFERENT SHAPE. The Excel export was
one wide sheet of label-headed 1/0 columns plus a 'location' sheet; Kobo's
/data/ is one JSON object per country with space-separated codes and the
location repeat nested inside it. This loader finds the same seven questions
the Excel parser anchored on - BY LABEL, through FormMap - turns codes back into
labels, and emits dicts with exactly the keys parse_country_rows emits. Place
resolution, the natural key and the update list are imported from load_hsps,
not copied: two copies would be two answers to "where is Assoungha?".

DATE_REPORTED IS THE PULL DATE. Kobo sends no edit timestamp, and the newest
submission time (10 Aug 2026) is older than the Excel export the map showed
before this (8 Sep 2026), so dating by submission would leave the Excel set on
the map for ever. The pull date is the old "export date" idea: what Kobo said on
this day. A same-day re-pull overwrites in place; a later one adds a dated set
beside it, and build_hsps() draws the newest.
"""
from datetime import date

from external_data.loaders import register
from external_data.loaders.base import Loader
from external_data.loaders.hsp import COUNTRY_TO_ISO3
from external_data.loaders.kobo_form import FormMap, selected
from external_data.management.commands.load_hsps import (UNIQUE_FIELDS, UPDATE_FIELDS,
                                                          resolve_places)
from external_data.models import HumanitarianServicePoint

# The Excel parser's anchors, verbatim - they were its column headings and they
# are this form's question labels.
COUNTRY = "Country"
SAME = "Are the SAME services"
COUNT = "How many humanitarian service points"
SERVICES = "Services offered (applies to ALL locations)"
DISTRICTS = "Districts where these services are offered"
LOCATION_REPEAT = "Service point location"
LOC_DISTRICT = "District"
LOC_SERVICES = "Services offered at THIS location"


def _count(value):
    return int(value) if str(value or "").isdigit() else None


@register
class KoboHspLoader(Loader):
    dataset = "kobo_hsp"
    source = "kobo"
    model = HumanitarianServicePoint
    unique_fields = UNIQUE_FIELDS
    update_fields = UPDATE_FIELDS
    tool = "kobo list_submissions"

    def parse(self, payload, iso3, context=None):
        context = context or {}
        form = FormMap(context["form"])
        reported = date.fromisoformat(context["pulled_on"])
        source_file = f"kobo:{context['form_uid']}"

        p_country = form.path_for_label(COUNTRY)
        p_same = form.path_for_label(SAME, startswith=True)
        p_count = form.path_for_label(COUNT, startswith=True)
        p_services = form.path_for_label(SERVICES)
        p_districts = form.path_for_label(DISTRICTS)
        p_repeat = form.repeat_path_for_label(LOCATION_REPEAT)
        p_loc_district = form.path_for_label(LOC_DISTRICT)
        p_loc_services = form.path_for_label(LOC_SERVICES)
        missing = [name for name, p in (
            (COUNTRY, p_country), (SERVICES, p_services), (DISTRICTS, p_districts))
            if p is None]
        if missing:
            # A relabelled question in Kobo looks exactly like this. Refusing is
            # better than loading a country with no services and calling it done.
            raise ValueError(f"HSP form has no question labelled {missing}; was it renamed?")

        out = []
        for sub in payload.get("results", []):
            code = sub.get(p_country)
            if not code:
                continue
            country = form.choice_label(p_country, code)
            same_code = sub.get(p_same) if p_same else None
            same = None if same_code is None else same_code == "yes"
            base = {
                "date_reported": reported, "country": country,
                "iso3": COUNTRY_TO_ISO3.get(country, ""),
                "admin_pcode": None, "admin_level": None, "match_method": "unmatched",
                "lat": None, "lon": None, "same_services_everywhere": same,
                "hsp_count": _count(sub.get(p_count)) if p_count else None,
                "kobo_uuid": sub.get("_uuid"), "source_file": source_file,
            }
            if same is False:
                # Detail lives in the location repeat only. Emitting country-wide
                # rows as well would double-count, exactly as the Excel parser says.
                for loc in sub.get(p_repeat, []) if p_repeat else []:
                    district = loc.get(p_loc_district)
                    if not district:
                        continue
                    name = form.choice_label(p_loc_district, district)
                    for svc in selected(loc.get(p_loc_services)):
                        out.append(dict(base, scope="named-location", location_name=name,
                                        service=form.choice_label(p_loc_services, svc)))
                continue

            for district in selected(sub.get(p_districts)):
                name = form.choice_label(p_districts, district)
                for svc in selected(sub.get(p_services)):
                    out.append(dict(base, scope="country-wide", location_name=name,
                                    service=form.choice_label(p_services, svc)))
        return out

    def _insert_rows(self, rows):
        """Place each row before it is written - the one step parse() cannot do,
        because it reads the boundary library."""
        # A pull REPLACES its own day's Kobo set. Upsert alone would leave a
        # district unticked in Kobo since the morning's pull on the map, as the
        # newest set, until tomorrow. Inside load()'s transaction, so a failed
        # load restores the rows. Other days and the Excel rows are untouched.
        for source_file, day in {(r["source_file"], r["date_reported"]) for r in rows}:
            self.model.objects.filter(source_file=source_file, date_reported=day).delete()

        unmatched = resolve_places(rows)
        if unmatched:
            print("  unmatched: " + ", ".join(unmatched))
        return [self.model(**row) for row in rows]

    def sync_key(self, iso3, context=None):
        # The row load_hsps has always written, so the button and the history
        # stay on the row people already know.
        return {"source": "kobo", "dataset": "humanitarian_service_points",
                "iso3": None, "variant": "hsp-mapping"}

    def count_scope(self, key):
        return {}      # every HSP row; the table has no source or iso3 scope to use

    def high_water(self, rows):
        return max((r["date_reported"] for r in rows), default=None)
