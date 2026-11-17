"""Field data: households' own words from the CCHA Kobo form, as community insights.

The Kobo pull (external_data/loaders/ccha_primary_data.py) ends by calling
sync_statements(). It is the one writer to this app besides document
extraction, and it is not a data_pipeline step. Every statement it writes is
PENDING: a person publishes it in Part 2 before the public sees it (George,
2026-11-17). Design: docs/superpowers/specs/2026-11-17-field-data-household-survey-design.md

WHAT BECOMES A STATEMENT. Only follow-up text: a "Please elaborate" or an
"Other (specify)" answer, and the gaps listed per hazard. A follow-up is tagged
with the dimension of the question it follows, and the reader is shown that
question (context_for). The "What does X mean to you?" answers are definitions,
not experiences, and are left out.

WHERE IT GOES. The district's LABEL POINT, never the household's GPS. The GPS is
read here, server-side, only to find the district when its name is missing.
"""
from typing import NamedTuple

from django.db import connection, transaction

from boundaries.models import AdminArea
from external_data.models import CchaPrimaryData
from insights import places
from insights.models import FieldDataTagMap, Insight, InsightCoding

HOUSEHOLD = "Household Survey"
FORM_KEY = "ccha_primary_data"
COPING = "coping_challenges"
COPING_CONTEXT = "Gaps/challenges the community has with this hazard"


class FollowUp(NamedTuple):
    parent: str
    dimension: str


# Which question each follow-up column answers. Structural wiring of the form,
# like loaders/ccha_primary_data.COLUMNS - not a curated vocabulary.
FOLLOW_UPS = {
    "vulnerabilities_elaborate": FollowUp("vulnerabilities_differences", "vulnerability"),
    "hazards_experience_other": FollowUp("hazards_experience", "hazard"),
    "hazard_kind_other": FollowUp("hazard_kind", "hazard"),
    "hazard_cause_other": FollowUp("hazard_cause", "hazard"),
    "hazard_affected_groups_other": FollowUp("hazard_affected_groups", "vulnerability"),
    "vulnerabilities_believe_other": FollowUp("vulnerabilities_believe", "vulnerability"),
    "vulnerabilities_group_other": FollowUp("vulnerabilities_group", "vulnerability"),
    "hazard_measures_other": FollowUp("hazard_measures", "coping"),
    "hazard_management_other": FollowUp("hazard_management", "coping"),
    "hazard_evacuate_other": FollowUp("hazard_evacuate", "coping"),
    "coping_cohesion_other": FollowUp("coping_cohesion", "coping"),
    "coping_gaps_other": FollowUp("coping_gaps", "coping"),
}

# Parents whose one answer is worth showing beside the quote. A multi-select
# parent's answer is a list of ticks the quote is not about, so it is not shown.
SINGLE_CHOICE_PARENTS = {"vulnerabilities_differences"}

# A filter rule, not a curated mapping: anything it misses, the reviewer rejects.
NON_ANSWERS = {"none", "n/a", "na", "no", "nothing", "nil", "i don't know",
               "dont know", "don't know", "i dont know"}


def is_non_answer(text):
    if text is None:
        return True
    t = str(text).strip().replace("’", "'").casefold().rstrip(".").strip()
    return len(t) < 3 or t in NON_ANSWERS


def _country_iso3(name):
    if not name:
        return None
    return (AdminArea.objects.filter(kind=AdminArea.KIND_ADMIN, level=0,
                                     name__iexact=name.strip())
            .values_list("iso3", flat=True).first())


def _district_at(lat, lon, iso3=None):
    """The level-2 area containing a point, or None. The point never leaves here."""
    sql = ("SELECT id FROM admin_areas WHERE kind = %s AND level = 2 AND geom IS NOT NULL"
           " AND ST_Contains(geom, ST_SetSRID(ST_Point(%s, %s), 4326))")
    params = [AdminArea.KIND_ADMIN, lon, lat]
    if iso3:
        sql += " AND iso3 = %s"
        params.append(iso3)
    with connection.cursor() as cur:
        cur.execute(sql + " LIMIT 1", params)
        hit = cur.fetchone()
    return AdminArea.objects.get(pk=hit[0]) if hit else None


def _district_named(iso3, name):
    """The level-2 area of this country with this name, or None.

    Level 2 FIRST: places.resolve() matches any level, coarsest first, and an
    admin2 that shares its name with its province (Kanem, Khartoum, Bangui...)
    would land on the province."""
    if not iso3 or not name:
        return None
    wanted = places._key(name)
    for area in AdminArea.objects.filter(iso3=iso3, kind=AdminArea.KIND_ADMIN, level=2):
        if any(places._key(n) == wanted for n in [area.name, *(area.name_alt or [])] if n):
            return area
    return None


def place_for(interview):
    """Placement fields for a statement from this interview.

    Keys: iso3, admin_pcode, admin_level, match_method, lat, lon,
    place_name_as_written. lat/lon are always an AdminArea's centre.
    Order: the district by name, then the district containing the GPS point,
    then any coarser area by name, else unmatched.
    """
    iso3 = _country_iso3(interview.country)
    hit = None
    area = _district_named(iso3, interview.admin2)
    if area:
        hit = {"admin_pcode": area.pcode, "admin_level": area.level,
               "match_method": "name", "lat": area.center_lat, "lon": area.center_lon}
    elif interview.latitude is not None and interview.longitude is not None:
        area = _district_at(interview.latitude, interview.longitude, iso3)
        if area:
            iso3 = area.iso3
            hit = {"admin_pcode": area.pcode, "admin_level": area.level,
                   "match_method": "gps", "lat": area.center_lat, "lon": area.center_lon}
    if hit is None:
        hit = places.resolve(iso3, interview.admin2) if iso3 else dict(places.UNMATCHED)
    # iso3 is NOT NULL on Insight. An unknown country still goes to review,
    # unplaced, so the reviewer can place it; "" is what no hidden-country rule matches.
    return {**hit, "iso3": iso3 or "",
            "place_name_as_written": interview.admin2 or interview.admin1 or interview.country}


def context_for(insight):
    """(parent question wording, parent answer or None) for a field statement."""
    if not insight.field_interview_id or not insight.field_question:
        return (None, None)
    iv = insight.field_interview
    if insight.field_question == COPING:
        hazard = next((c.hazard for c in iv.coping_challenges.all()
                       if (c.hazard_number or 0) == insight.field_item), None)
        return (COPING_CONTEXT, hazard)
    follow = FOLLOW_UPS.get(insight.field_question)
    if not follow:
        return (None, None)
    wording = str(CchaPrimaryData._meta.get_field(follow.parent).verbose_name)
    answer = getattr(iv, follow.parent) if follow.parent in SINGLE_CHOICE_PARENTS else None
    return (wording, answer or None)


# ------------------------------------------------------------------ the sync
def _wanted(interview):
    """{(field_question, field_item): (quote, [(dimension, tag, tag_raw), ...])}"""
    if interview.interview_type != HOUSEHOLD:
        return {}
    out = {}
    for column, follow in FOLLOW_UPS.items():
        text = getattr(interview, column)
        if not is_non_answer(text):
            out[(column, 0)] = (text.strip(), [(follow.dimension, "other", follow.parent)])
    for row in interview.coping_challenges.all():
        if is_non_answer(row.coping_challenges):
            continue
        tag = FieldDataTagMap.lookup(FORM_KEY, row.hazard, "hazard") or "other"
        out[(COPING, row.hazard_number or 0)] = (
            row.coping_challenges.strip(),
            [("hazard", tag, row.hazard), ("coping", "other", None)])
    return out


def _plain(value):
    """A JSON-safe form of a field value, for comparing against field_kobo."""
    return value.isoformat() if hasattr(value, "isoformat") else value


def sync_statements(interviews):
    """Bring the review queue in line with these interviews. Returns counts.

    New answer -> a PENDING statement. A pending statement follows its answer:
    updated when the text, date or place changed, deleted when the answer went
    blank. A published or rejected statement is never touched - a reviewer's
    decision stands.
    """
    counts = {"created": 0, "updated": 0, "deleted": 0, "kept": 0}
    with transaction.atomic():
        for iv in interviews:
            stated_on = iv.interview_date or (iv.submitted_at.date() if iv.submitted_at else None)
            wanted = _wanted(iv) if stated_on else {}
            existing = {(s.field_question, s.field_item): s for s in iv.statements.all()}
            place = place_for(iv) if wanted else None

            for key, row in existing.items():
                if key in wanted:
                    continue
                if row.status == "pending":
                    row.delete()
                    counts["deleted"] += 1
                else:
                    counts["kept"] += 1

            for key, (quote, codes) in wanted.items():
                row = existing.get(key)
                fields = dict(quote=quote, stated_on=stated_on, **place)
                snapshot = {k: _plain(v) for k, v in fields.items()}
                if row is None:
                    row = Insight.objects.create(
                        field_interview=iv, field_question=key[0], field_item=key[1],
                        channel="primary", voice_type="community", method="kobo",
                        quote_language="en", status="pending", field_kobo=snapshot, **fields)
                    InsightCoding.objects.bulk_create([
                        InsightCoding(insight=row, dimension=d, tag=t, tag_raw=raw)
                        for d, t, raw in codes])
                    counts["created"] += 1
                elif row.status != "pending":
                    counts["kept"] += 1
                else:
                    # Only what changed IN KOBO since the last pull. A row from
                    # before field_kobo existed takes its current value as that
                    # baseline, i.e. it is treated as unedited.
                    last = row.field_kobo or {}
                    moved = {k: v for k, v in fields.items()
                             if snapshot[k] != last.get(k, _plain(getattr(row, k)))}
                    for k, v in moved.items():
                        setattr(row, k, v)
                    if moved or row.field_kobo != snapshot:
                        row.field_kobo = snapshot
                        row.save()
                    counts["updated" if moved else "kept"] += 1
    return counts
