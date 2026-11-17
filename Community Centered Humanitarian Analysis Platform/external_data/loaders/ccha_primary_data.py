"""CCHA primary-data interviews from Kobo -> ccha_primary_data and two repeat tables.

One form, used for data collection in several countries; the table holds all
of them, and `country` says which.

Kobo answers in xpaths and codes. This writes one readable row per interview,
with each question in its own column holding the answer's LABEL (FormMap reads
the labels from the form definition the fetcher fetched). See CchaPrimaryData's
docstring for the layout, and why.

COLUMNS is the one list of what goes where: (column, xpath, kind). A test checks
every entry is a field on the model. A question added to the form later has no
entry yet; its answer lands in `unmapped` instead of being dropped.

Not Approved: never stored (the fetcher filters it out on Kobo's side and
parse() skips it again), and deleted with its repeat rows when the fetcher found
it rejected after it was stored.
"""
from datetime import date, datetime, timezone

from external_data.loaders import register
from external_data.loaders.base import Loader
from external_data.loaders.kobo_form import FormMap, selected
from external_data.models import (KoboForm, CchaPrimaryData, CchaPrimaryDataCopingChallenge,
                                  CchaPrimaryDataHazardDetail)

COLUMNS = [
    ("interview_type", "interview_type", "select"),
    ("enum_name", "g_meta/enum_name", "text"),
    ("consent", "g_meta/consent", "select"),
    ("data_privacy", "g_meta/data_privacy", "select"),
    ("country", "interview_start/country", "select"),
    ("admin1", "interview_start/admin1", "select"),
    ("admin2", "interview_start/admin2", "select"),
    ("hh_gps", "interview_start/hh_gps", "geo"),
    ("hh_head", "demographics/hh_head", "select"),
    ("child_hh_head", "demographics/child_hh_head", "select"),
    ("who_hh_head", "demographics/who_hh_head", "select"),
    ("gender", "demographics/gender", "select"),
    ("age", "demographics/age", "select"),
    ("hh_composition", "demographics/hh_composition", "int"),
    ("hh_demographics", "demographics/hh_demographics", "multi"),
    ("meaning_hazard", "hazards/meaning_hazard", "text"),
    ("hazards_experience", "hazards/hazards_experience", "multi"),
    ("hazard_kind", "hazards/hazard_kind", "multi"),
    ("hazard_affected_groups", "hazards/hazard_affected_groups", "multi"),
    ("hazard_cause", "hazards/hazard_cause", "multi"),
    ("hazard_measures", "hazards/hazard_measures", "multi"),
    ("hazard_management", "hazards/hazard_management", "multi"),
    ("hazard_evacuate", "hazards/hazard_evacuate", "multi"),
    ("meaning_vulnerability", "vulnerability/meaning_vulnerability", "text"),
    ("vulnerabilities_believe", "vulnerability/vulnerabilities_believe", "multi"),
    ("vulnerabilities_group", "vulnerability/vulnerabilities_group", "multi"),
    ("vulnerabilities_differences", "vulnerability/vulnerabilities_differences", "select"),
    ("vulnerabilities_elaborate", "vulnerability/vulnerabilities_elaborate", "text"),
    ("meaning_coping", "coping_capacities/meaning_coping", "text"),
    ("coping_extent", "coping_capacities/coping_extent", "select"),
    ("coping_cohesion", "coping_capacities/coping_cohesion", "multi"),
    ("coping_gaps", "coping_capacities/coping_gaps", "multi"),
    ("fgd_consent", "fgd_section/fgd_consent", "select"),
    ("fgd_target_group", "fgd_section/fgd_target_group", "select"),
    ("fgd_audio", "fgd_section/fgd_audio", "audio"),
    ("kii_consent", "kii_section/kii_consent", "select"),
    ("kii_role", "kii_section/kii_role", "text"),
    ("kii_years_community", "kii_section/kii_years_community", "int"),
    ("kii_displacement_status", "kii_section/kii_displacement_status", "select"),
    ("kii_audio", "kii_section/kii_audio", "audio"),
]

HAZARD_REPEAT = "hazards/hazard_details"
COPING_REPEAT = "coping_capacities/coping_challenges_repeat"

# Kobo's own bookkeeping: carried by every submission, an answer to nothing.
# start_time / end_time / today_date are read into their own columns.
META_KEYS = {"formhub/uuid", "meta/instanceID", "meta/rootUuid", "meta/deprecatedID",
             "__version__", "device_id", "start_time", "end_time", "today_date",
             HAZARD_REPEAT + "_count", COPING_REPEAT + "_count"}

PREFIX = "validation_status_"
NOT_APPROVED = "validation_status_not_approved"


def _when(value):
    """An ISO timestamp as an aware datetime. Kobo's _submission_time has no
    offset and is UTC; start/end carry the device's own offset."""
    if not value:
        return None
    parsed = datetime.fromisoformat(value)
    return parsed if parsed.tzinfo else parsed.replace(tzinfo=timezone.utc)


def _int(value):
    try:
        return int(str(value).strip())
    except (TypeError, ValueError):
        return None


def _gps(value):
    """Kobo's 'lat lon altitude accuracy' -> (lat, lon)."""
    parts = str(value or "").split()
    try:
        return float(parts[0]), float(parts[1])
    except (IndexError, ValueError):
        return None, None


def _status(sub):
    uid = (sub.get("_validation_status") or {}).get("uid") or ""
    return uid[len(PREFIX):] if uid.startswith(PREFIX) else uid


def _label(form, xpath, code):
    return form.choice_label(xpath, code) if code not in (None, "") else None


def _labels(form, xpath, answer):
    return "; ".join(form.choice_label(xpath, c) for c in selected(answer)) or None


def delete_rejected(submission_ids):
    """Remove interviews marked Not Approved after they were stored. Their
    repeat rows go with them (CASCADE)."""
    if submission_ids:
        CchaPrimaryData.objects.filter(submission_id__in=submission_ids).delete()


@register
class CchaPrimaryDataLoader(Loader):
    dataset = "ccha_primary_data"
    source = "kobo"
    model = CchaPrimaryData
    unique_fields = ["submission_id"]
    tool = "kobo list_submissions"

    @property
    def update_fields(self):
        return [f.name for f in CchaPrimaryData._meta.concrete_fields
                if f.name not in ("id", "submission_id")]

    def parse(self, payload, iso3, context=None):
        # Kept for _insert_rows and after_insert, which receive only the rows.
        # One loader instance serves one Call, so nothing leaks between pulls.
        self._context = context or {}
        form = FormMap(self._context["form"])
        out = []
        for sub in payload.get("results", []):
            if "_id" not in sub:
                continue
            if (sub.get("_validation_status") or {}).get("uid") == NOT_APPROVED:
                continue
            out.append(self._row(sub, form))
        return out

    def _row(self, sub, form):
        links = {a.get("question_xpath"): a.get("download_url")
                 for a in sub.get("_attachments") or []}
        row = {
            "submission_id": sub["_id"], "uuid": sub.get("_uuid") or "",
            "submitted_at": _when(sub.get("_submission_time")),
            "validation_status": _status(sub),
            "interview_date": (date.fromisoformat(sub["today_date"])
                               if sub.get("today_date") else None),
            "started_at": _when(sub.get("start_time")),
            "ended_at": _when(sub.get("end_time")),
        }
        used = set(META_KEYS) | {HAZARD_REPEAT, COPING_REPEAT}
        for name, xpath, kind in COLUMNS:
            value = sub.get(xpath)
            used.add(xpath)
            if kind == "geo":
                row["latitude"], row["longitude"] = _gps(value)
            elif kind == "int":
                row[name] = _int(value)
            elif kind == "select":
                row[name] = _label(form, xpath, value)
            elif kind == "multi":
                row[name] = _labels(form, xpath, value)
                row[f"{name}_other"] = sub.get(f"{xpath}_other") or None
                used.add(f"{xpath}_other")
            elif kind == "audio":
                row[name] = links.get(xpath) or value or None
            else:
                row[name] = value or None
        row["unmapped"] = {k: v for k, v in sub.items()
                           if k not in used and not k.startswith("_")}
        row["_hazards"] = [self._hazard(h, form) for h in sub.get(HAZARD_REPEAT) or []]
        row["_coping"] = [self._coping(c) for c in sub.get(COPING_REPEAT) or []]
        return row

    @staticmethod
    def _hazard(item, form):
        p = HAZARD_REPEAT + "/"
        return {
            "hazard_number": _int(item.get(p + "hazard_number")),
            "hazard": item.get(p + "hazard_name") or None,
            "hazard_occurence": _label(form, p + "hazard_occurence",
                                       item.get(p + "hazard_occurence")),
            "hazard_occurence_other": item.get(p + "hazard_occurence_other") or None,
            "hazard_events": _labels(form, p + "hazard_events", item.get(p + "hazard_events")),
            "hazard_impact": _label(form, p + "hazard_impact", item.get(p + "hazard_impact")),
        }

    @staticmethod
    def _coping(item):
        p = COPING_REPEAT + "/"
        return {
            "hazard_number": _int(item.get(p + "coping_hazard_number")),
            "hazard": item.get(p + "coping_hazard_name") or None,
            "coping_challenges": item.get(p + "coping_challenges") or None,
        }

    def _insert_rows(self, rows):
        """Take the repeat rows off before the upsert; after_insert writes them."""
        self._children = {r["submission_id"]: (r.pop("_hazards"), r.pop("_coping"))
                          for r in rows}
        return [self.model(**row) for row in rows]

    def after_insert(self, rows):
        ctx = self._context
        ids = dict(CchaPrimaryData.objects.filter(submission_id__in=self._children)
                   .values_list("submission_id", "pk"))
        # An edited interview's repeats are REPLACED, not merged: Kobo sends the
        # whole repeat every time, and a hazard removed in Kobo must go here too.
        CchaPrimaryDataHazardDetail.objects.filter(interview_id__in=ids.values()).delete()
        CchaPrimaryDataCopingChallenge.objects.filter(interview_id__in=ids.values()).delete()
        CchaPrimaryDataHazardDetail.objects.bulk_create([
            CchaPrimaryDataHazardDetail(interview_id=ids[sid], **h)
            for sid, (hazards, _) in self._children.items() for h in hazards])
        CchaPrimaryDataCopingChallenge.objects.bulk_create([
            CchaPrimaryDataCopingChallenge(interview_id=ids[sid], **c)
            for sid, (_, coping) in self._children.items() for c in coping])

        form = ctx.get("form") or {}
        KoboForm.objects.update_or_create(
            form_uid=ctx["form_uid"],
            defaults={"form_key": ctx["form_key"], "name": form.get("name") or "",
                      "definition": form})
        delete_rejected(ctx.get("not_approved_ids"))

        # Households' own words into the review queue, as PENDING Field-data
        # statements. After delete_rejected, so a rejected interview's
        # statements have already gone with it (CASCADE).
        from insights.field_data import sync_statements
        counts = sync_statements(
            CchaPrimaryData.objects.filter(submission_id__in=self._children)
            .prefetch_related("coping_challenges", "statements"))
        print(f"  field data statements: {counts}")

    def sync_key(self, iso3, context=None):
        return {"source": "kobo", "dataset": "primary_data", "iso3": iso3,
                "variant": (context or {})["form_key"]}

    def count_scope(self, key):
        return {}      # the table holds this one form

    def high_water(self, rows):
        dates = [r["submitted_at"].date() for r in rows if r["submitted_at"]]
        return max(dates, default=None)
