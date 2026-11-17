# Field Data: Household Survey on the Dashboard — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show the CCHA household survey on the dashboard as one "Field data" marker per place with a four-part summary card, and turn households' free-text answers into reviewable community insights labelled Field data.

**Architecture:** A Kobo pull (`CchaPrimaryDataLoader.after_insert`) ends by calling `insights.field_data.sync_statements()`, which creates/updates *pending* `Insight` rows keyed to the interview. Published rows reach the browser through the existing `/api/insights/`. The counted summary is a pre-built file, `dashboard/data/field_surveys.json`, written by a new builder in `s06_mcp_layers.py` on Rebuild and scrubbed per country. `app.js` draws a marker per survey and a card that reads the file plus the already-fetched insights.

**Tech Stack:** Django 5.0.6, PostgreSQL 16 / PostGIS, MapLibre, vanilla JS (`dashboard/static/dashboard/js/app.js`), Docker.

**Spec:** `docs/superpowers/specs/2026-11-17-field-data-household-survey-design.md`

## Global Constraints

- Everything runs in Docker, from the platform folder: `docker compose exec web python manage.py test <module> -v 2`. Run **narrow test modules**, not the whole suite (a refresh test writes the real API cache).
- After any model change: `docker compose exec web python manage.py migrate` then `docker compose restart web` (gunicorn never reloads; skipping it gives `NotNullViolation` on the live site while tests pass).
- **No git commits.** George does all git work. Each task ends with "leave uncommitted".
- Household only this round: `interview_type == "Household Survey"`.
- No household `latitude`/`longitude` ever leaves the server: not in `/api/insights/`, not in `field_surveys.json`.
- Small-number rule: fewer than **5** household interviews at a place → no summary entry.
- Labels: `CHANNELS` display `primary` → **"Field data"**, `manual` → **"Primary input"**, `document_ai` unchanged. Values unchanged.
- Field-data statements are created `status="pending"`, `channel="primary"`, `voice_type="community"`, `method="kobo"`, `quote_language="en"`, no document, no job.
- Curated mappings live in a table with an Admin screen, not a dict in code (survey label → taxonomy tag). Structural form wiring (which column follows which question) may live in code, like `loaders/ccha_primary_data.COLUMNS`.
- A new file under `dashboard/data/` needs a line in `dashboard/scrubbers.REGISTRY`.
- Synthetic test data only. No real interview answer in the repo.

## Review Focus

1. **Two households, identical text** ("Lack of job") must give two statements, not an IntegrityError on `uniq_insight_quote`. → Task 1 test `test_identical_quotes_from_two_interviews_both_save`, Task 3 test `test_identical_text_two_households_two_statements`.
2. **A reviewer's decision survives a re-pull**: a published or rejected statement whose Kobo answer changed stays as it was. → Task 3 `test_repull_leaves_published_and_rejected_untouched`.
3. **Household GPS leaking** through a new field or the summary file. → Task 4 `test_api_never_sends_household_gps`, Task 5 `test_file_holds_no_household_coordinates`.
4. **Admin2 blank or spelled differently** ("KIRYANDONGO" vs "Kiryandongo"; blank with a GPS point). → Task 3 `test_place_matched_case_insensitively`, `test_blank_admin2_falls_back_to_gps_polygon`.
5. **The card going empty when the slider moves past October**: the card's quote list must ignore the slider month. → Task 6 manual check step 6.

---

### Task 1: Insight fields, relabel, and the tag map table

**Files:**
- Modify: `insights/models.py` (CHANNELS at line 24; `Insight` fields and `Meta.constraints` near 229–300; new model `FieldDataTagMap` at end of file)
- Modify: `insights/forms.py:425-440` (hand-typing form: drop `primary` from channel choices)
- Modify: `insights/admin.py` (register `FieldDataTagMap`)
- Create: `insights/migrations/0011_field_data.py` (schema), `insights/migrations/0012_seed_field_data_tag_map.py` (data)
- Test: `insights/tests/test_field_data_models.py`

**Interfaces:**
- Produces:
  - `Insight.field_interview` — `ForeignKey("external_data.CchaPrimaryData", on_delete=CASCADE, null=True, blank=True, related_name="statements")`
  - `Insight.field_question` — `TextField(null=True, blank=True)` (the follow-up column name, e.g. `"vulnerabilities_elaborate"`, `"coping_challenges"`)
  - `Insight.field_item` — `IntegerField(default=0)` (repeat `hazard_number`, else 0)
  - Constraint `uniq_field_statement`: `UniqueConstraint(fields=["field_interview", "field_question", "field_item"], condition=Q(field_interview__isnull=False))`
  - `uniq_insight_quote` gains `condition=Q(field_interview__isnull=True)` (keep `nulls_distinct=False`; if Django rejects the combination, split into two constraints with the same effect and say so in the migration docstring)
  - `FieldDataTagMap(form_key: str, label: str, dimension: str in DIMENSIONS, tag: str)`; `unique_together = (form_key, label, dimension)`; `db_table = "field_data_tag_map"`; `verbose_name = "Field data → theme mapping"`
  - `FieldDataTagMap.lookup(form_key: str, label: str, dimension: str) -> str | None` (classmethod; case-insensitive on label)

- [ ] **Step 1: Write failing tests** in `insights/tests/test_field_data_models.py`:
  - `test_channel_labels`: `dict(CHANNELS)["primary"] == "Field data"` and `dict(CHANNELS)["manual"] == "Primary input"`.
  - `test_identical_quotes_from_two_interviews_both_save`: two `CchaPrimaryData` rows (submission_id 1, 2), two `Insight`s with quote `"Lack of job"`, `document=None`, `page=None`, same `field_question="coping_challenges"`, `field_item=1` → both saved, count 2.
  - `test_same_interview_question_item_is_unique`: second insight with the same `(field_interview, field_question, field_item)` raises `IntegrityError`.
  - `test_manual_duplicates_still_refused`: two hand-typed insights (no interview, no document) with the same quote → `IntegrityError` (the old rule still holds).
  - `test_deleting_interview_deletes_its_statements`: delete the interview → its insight count 0.
  - `test_tag_map_lookup_case_insensitive`: seed row `("ccha_primary_data", "Food Insecurity", "hazard", "famine_food_crisis")` → `lookup("ccha_primary_data", "food insecurity", "hazard") == "famine_food_crisis"`; unknown → `None`.
  - `test_seeded_rows_present`: after migrations, `FieldDataTagMap` holds `Food Insecurity→famine_food_crisis`, `Drought→extreme_heat_drought`, `Heat Wave→extreme_heat_drought`, `Flood→flooding` (all `hazard`, form key `ccha_primary_data`).
  - `test_hand_typing_form_does_not_offer_field_data`: the form class at `insights/forms.py:~433`'s `channel` field choices exclude `"primary"`.
- [ ] **Step 2: Run, expect FAIL**
  `docker compose exec web python manage.py test insights.tests.test_field_data_models -v 2`
- [ ] **Step 3: Implement** the fields, constraints, `FieldDataTagMap` (+ `lookup`), relabel, form choice filter (override `__init__` to filter `self.fields["channel"].choices`), Admin registration (list_display form_key, label, dimension, tag; list_filter dimension; validate `tag` is a key in `data_pipeline/taxonomy.json` under `dimension` or `"other"` in `clean()`). `makemigrations insights` for 0011; hand-write 0012 seeding the four rows with `get_or_create` (never overwrite an edited row).
- [ ] **Step 4: Migrate, restart, run tests, expect PASS**
  `docker compose exec web python manage.py migrate && docker compose restart web && docker compose exec web python manage.py test insights.tests.test_field_data_models insights.tests.test_models insights.tests.test_admin -v 2`
- [ ] **Step 5: Leave uncommitted.**

---

### Task 2: Follow-up wiring and placement helpers

**Files:**
- Create: `insights/field_data.py` (this task: constants + placement; Task 3 adds the sync)
- Test: `insights/tests/test_field_data_place.py`

**Interfaces:**
- Produces:
  - `HOUSEHOLD = "Household Survey"`
  - `FORM_KEY = "ccha_primary_data"`
  - `FOLLOW_UPS: dict[str, FollowUp]` where `FollowUp = NamedTuple(parent: str, dimension: str)`, exactly:
    | follow-up column | parent column | dimension |
    |---|---|---|
    | `vulnerabilities_elaborate` | `vulnerabilities_differences` | vulnerability |
    | `hazards_experience_other` | `hazards_experience` | hazard |
    | `hazard_kind_other` | `hazard_kind` | hazard |
    | `hazard_cause_other` | `hazard_cause` | hazard |
    | `hazard_affected_groups_other` | `hazard_affected_groups` | vulnerability |
    | `vulnerabilities_believe_other` | `vulnerabilities_believe` | vulnerability |
    | `vulnerabilities_group_other` | `vulnerabilities_group` | vulnerability |
    | `hazard_measures_other` | `hazard_measures` | coping |
    | `hazard_management_other` | `hazard_management` | coping |
    | `hazard_evacuate_other` | `hazard_evacuate` | coping |
    | `coping_cohesion_other` | `coping_cohesion` | coping |
    | `coping_gaps_other` | `coping_gaps` | coping |
    `coping_challenges` is handled separately (repeat; codings `hazard|<mapped or other>` + `coping|other`).
  - `SINGLE_CHOICE_PARENTS = {"vulnerabilities_differences"}` — the parents whose answer is shown as `field_context_answer`.
  - `is_non_answer(text: str | None) -> bool` — True for None/blank, fewer than 3 chars after strip, or (casefolded, trailing `.` stripped, `’` normalised to `'`) in `{"none", "n/a", "na", "no", "nothing", "i don't know", "dont know", "don't know"}`.
  - `place_for(interview: CchaPrimaryData) -> dict` with keys `iso3, admin_pcode, admin_level, match_method, lat, lon, place_name_as_written`. Steps: iso3 = level-0 `AdminArea` whose name casefold-equals `interview.country` (else `None`); if iso3 and admin2 → `insights.places.resolve(iso3, interview.admin2)`; if unmatched and interview has lat/lon → raw SQL `ST_Contains(geom, ST_SetSRID(ST_Point(lon, lat), 4326))` on `boundaries_adminarea` level 2 (take iso3 from the hit when it was None), `match_method="gps"`; else `UNMATCHED` with iso3 kept. `lat/lon` are always the AdminArea `center_lat/center_lon`, never the interview's.
  - `context_for(insight: Insight) -> tuple[str | None, str | None]` → `(parent question wording, parent answer)`. For a `FOLLOW_UPS` key: wording = `CchaPrimaryData._meta.get_field(parent).verbose_name`, answer = `getattr(interview, parent)` if parent in `SINGLE_CHOICE_PARENTS` else `None`. For `coping_challenges`: wording = `"Gaps/challenges the community has with this hazard"`, answer = the repeat row's `hazard` (looked up by `field_item` == `hazard_number`). Non-field rows → `(None, None)`.

- [ ] **Step 1: Write failing tests** (`insights/tests/test_field_data_place.py`; create `AdminArea` rows for UGA level 0 "Uganda", level 2 "Kiryandongo" pcode `UG4120` center (1.991, 32.051), with a square `geom` around it via raw SQL as existing boundary tests do):
  - `test_every_follow_up_and_parent_is_a_model_field`
  - `test_non_answers` — `"None"`, `" n/a "`, `"I don’t know"`, `"No."`, `"ok"`, `""`, `None` → True; `"No boats"` → False.
  - `test_place_matched_case_insensitively` — country `"UGANDA"`, admin2 `"KIRYANDONGO"` → `admin_pcode="UG4120"`, `match_method="name"`, `lat=1.991`.
  - `test_blank_admin2_falls_back_to_gps_polygon` — admin2 None, GPS inside square → `UG4120`, `match_method="gps"`, `lat` is the centre, not the GPS.
  - `test_unplaceable_is_unmatched_with_iso3` — admin2 `"Nowhere"`, no GPS → `match_method="unmatched"`, `iso3="UGA"`, lat None.
  - `test_context_for_elaboration_shows_parent_answer` and `test_context_for_coping_challenge_names_hazard`.
- [ ] **Step 2: Run, expect FAIL** — `docker compose exec web python manage.py test insights.tests.test_field_data_place -v 2`
- [ ] **Step 3: Implement** the constants and three functions in `insights/field_data.py`.
- [ ] **Step 4: Run, expect PASS.**
- [ ] **Step 5: Leave uncommitted.**

---

### Task 3: Statement sync, wired into the Kobo pull

**Files:**
- Modify: `insights/field_data.py` (add sync)
- Modify: `external_data/loaders/ccha_primary_data.py` — `after_insert`, after `delete_rejected(...)`
- Test: `insights/tests/test_field_data_sync.py`; add one test to `external_data/tests/test_loader_ccha_primary_data.py`

**Interfaces:**
- Consumes: Task 1 fields and `FieldDataTagMap.lookup`; Task 2 `FOLLOW_UPS`, `HOUSEHOLD`, `FORM_KEY`, `is_non_answer`, `place_for`.
- Produces: `sync_statements(interviews: Iterable[CchaPrimaryData]) -> dict[str, int]` returning counts `{"created", "updated", "deleted", "kept"}`.

Rules (from the spec, §Decisions 4, 5, 7, 8, 9):
- Only `interview_type == HOUSEHOLD`. Desired statements per interview: one per non-blank, non-non-answer `FOLLOW_UPS` column (`field_item=0`), and one per `coping_challenges` repeat row with usable text (`field_item=hazard_number or 0`).
- `quote` = text verbatim (line breaks kept). `stated_on = interview_date or submitted_at.date()`; skip the interview (count nothing) if both are None. Place fields from `place_for`.
- Codings created with the statement: FOLLOW_UPS → one `InsightCoding(dimension, tag="other", tag_raw=<parent column>)`; coping_challenges → `hazard|<lookup(FORM_KEY, hazard, "hazard") or "other">` (`tag_raw=hazard`) and `coping|other`.
- Existing key, `pending` → update quote/date/place when changed (codings untouched). Existing, `published`/`rejected` → untouched. Existing `pending` whose desired text vanished or became a non-answer → delete. Wrap the whole sync in `transaction.atomic()`.
- Loader call: `sync_statements(CchaPrimaryData.objects.filter(submission_id__in=self._children))`; print the counts like other loader output.

- [ ] **Step 1: Write failing tests** in `insights/tests/test_field_data_sync.py` (build `CchaPrimaryData` + repeat rows with the ORM; AdminArea fixtures as Task 2):
  - `test_household_follow_ups_become_pending_field_data` — elaboration + one `_other` + one coping row → 3 insights, all `pending`, `channel="primary"`, `method="kobo"`, `stated_on == interview_date`.
  - `test_elaboration_coded_vulnerability` — codings `[("vulnerability","other")]`.
  - `test_coping_challenge_codings` — hazard "Food Insecurity" → `{("hazard","famine_food_crisis"),("coping","other")}`; hazard "Insect Infestation" → `("hazard","other")` with `tag_raw="Insect Infestation"`.
  - `test_non_answers_not_queued` — `vulnerabilities_elaborate="None"` → no insight.
  - `test_meaning_questions_never_queued` — `meaning_vulnerability` filled → no insight for it.
  - `test_fgd_and_kii_skipped`.
  - `test_identical_text_two_households_two_statements`.
  - `test_repull_updates_pending` — change elaboration text, sync again → same row id, new quote.
  - `test_repull_leaves_published_and_rejected_untouched` — set statuses, change text, sync → quotes unchanged.
  - `test_blanked_answer_deletes_pending_only` — one pending, one published, both blanked → pending gone, published kept.
  - `test_no_interview_gps_in_statement` — interview GPS (1.95, 32.06) → insight `lat/lon` equal the AdminArea centre.
  In `external_data/tests/test_loader_ccha_primary_data.py` add `test_pull_queues_field_data_and_not_approved_removes_it`: `pull(sub(1, interview_type=<code labelled "Household Survey">, ...))` → 1+ insights; `pull(not_approved=[1])` → 0 insights. (Extend the synthetic `FORM` choices with a `"Household Survey"` label and the `vulnerabilities_elaborate` question as needed.)
- [ ] **Step 2: Run, expect FAIL** — `docker compose exec web python manage.py test insights.tests.test_field_data_sync external_data.tests.test_loader_ccha_primary_data -v 2`
- [ ] **Step 3: Implement** `sync_statements` and the loader call.
- [ ] **Step 4: Run, expect PASS** (same command).
- [ ] **Step 5: Leave uncommitted.**

---

### Task 4: Context in the API and in Part 2

**Files:**
- Modify: `insights/views.py` (the row dict, ~line 75)
- Modify: `insights/admin.py` (`InsightAdmin`: readonly `answers_question` field in "What it is"; add `"channel"` to `list_display`)
- Test: `insights/tests/test_api.py` (add tests), `insights/tests/test_admin.py` (add test)

**Interfaces:**
- Consumes: Task 2 `context_for(insight)`.
- Produces: `/api/insights/` rows gain `"field_context": str|None`, `"field_context_answer": str|None`. Add `select_related("field_interview")` and prefetch the interview's `coping_challenges` to avoid N+1.

- [ ] **Step 1: Write failing tests:**
  - `test_api_field_context_for_elaboration` — published field insight → `field_context == "Are there any differences between people who arrived recently and longer-term residents?"`, `field_context_answer == "Yes, significant differences"`.
  - `test_api_field_context_null_for_document_rows`.
  - `test_api_pending_field_data_not_sent`.
  - `test_api_never_sends_household_gps` — no key in any row equals or contains the interview's latitude value; keys set ⊆ the documented set plus the two new keys.
  - `test_part2_change_page_shows_parent_question` — admin change page for a field insight contains the parent wording.
- [ ] **Step 2: Run, expect FAIL** — `docker compose exec web python manage.py test insights.tests.test_api insights.tests.test_admin -v 2`
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run, expect PASS**, plus `dashboard.tests.test_api_gate dashboard.tests.test_no_leak`.
- [ ] **Step 5: Leave uncommitted.**

---

### Task 5: `field_surveys.json` builder, scrubber, timeline date

**Files:**
- Modify: `data_pipeline/steps/s06_mcp_layers.py` — new `build_field_surveys()`; call it in `run()` before `build_data_dates()`; extend `build_data_dates()`; add the file to the module docstring list (line ~18)
- Modify: `dashboard/scrubbers.py` — REGISTRY line `("field_surveys.json", _rows("surveys", field="iso3"))`
- Test: `external_data/tests/test_build_field_surveys.py`; add to `external_data/tests/test_data_dates.py` and `dashboard/tests/test_scrubbers.py`

**Interfaces:**
- Consumes: Task 2 `place_for`, `HOUSEHOLD`.
- Produces: `build_field_surveys() -> None` writing `{"surveys": [entry, ...]}`. Entry shape exactly as spec §Decisions 10:
  `iso3, pcode, place, lat, lon, type ("household"), n, date_from, date_to, sections{hazards{experienced, worsening, causes, per_hazard}, vulnerable{most_affected, why, vulnerabilities, newcomers_vs_residents}, coping{extent, measures, capacities, cohesion, evacuate_to}, gaps{cohesion_gaps}}`.
  Column → key: `hazards_experience→experienced`, `hazard_kind→worsening`, `hazard_cause→causes`, `hazard_affected_groups→most_affected`, `vulnerabilities_group→why`, `vulnerabilities_believe→vulnerabilities`, `vulnerabilities_differences→newcomers_vs_residents`, `coping_extent→extent`, `hazard_measures→measures`, `hazard_management→capacities`, `coping_cohesion→cohesion`, `hazard_evacuate→evacuate_to`, `coping_gaps→cohesion_gaps`. Each value: `[[label, households], ...]` sorted by count desc then label; a multi-select split on `"; "` counts once per household. `per_hazard`: from `hazard_details`, `[{"hazard", "n", "impact": {label: n}, "frequency": {label: n}}]` sorted by n desc.
  Group by `place_for(interview)["admin_pcode"]` (skip unmatched); `place`/`lat`/`lon` from the AdminArea; omit groups with `n < 5`.
  `build_data_dates()`: per iso3, `date = max(existing movement date, survey date_to)` (only dates ≤ today).

- [ ] **Step 1: Write failing tests** in `external_data/tests/test_build_field_surveys.py` (override `DASHBOARD_DATA` to a temp dir, as `test_data_dates.py` does):
  - `test_counts_once_per_household` — 5 households; 3 answer `"Floods; Drought"`, 2 answer `"Floods"` → `experienced == [["Floods", 5], ["Drought", 3]]`.
  - `test_sections_shape_and_dates` — keys exactly as above; `n == 5`; `date_from/date_to`.
  - `test_place_under_five_households_omitted` — 4 households → `surveys == []`.
  - `test_fgd_rows_not_counted`.
  - `test_file_holds_no_household_coordinates` — interview GPS values do not appear anywhere in the dumped JSON text; entry lat/lon equal the AdminArea centre.
  - `test_per_hazard_impact_and_frequency`.
  In `test_data_dates.py`: `test_survey_date_extends_country_date`. In `test_scrubbers.py`: `test_field_surveys_hidden_country_dropped`.
- [ ] **Step 2: Run, expect FAIL** — `docker compose exec web python manage.py test external_data.tests.test_build_field_surveys external_data.tests.test_data_dates dashboard.tests.test_scrubbers -v 2`
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run, expect PASS** (same command; `test_every_file_in_data_dir_has_a_scrubber` included in test_scrubbers).
- [ ] **Step 5: Leave uncommitted.**

---

### Task 6: Dashboard layer, card, and badges

**Files:**
- Modify: `dashboard/templates/dashboard/index.html` (layer toggle after `toggle-hsps`, line ~122)
- Modify: `dashboard/static/dashboard/js/app.js` (load at ~605; source/layer at ~1256; render beside `renderHSP` ~3210 and call it where `renderHSP()` is called ~3491; toggle handler beside ~3999; badge in insight card + bubble popup builders)
- Modify: the dashboard stylesheet that defines `--hsp` (add `--field-data` token, light and dark)
- Test: `dashboard/tests/test_style_spec.py` (run; extend only if it enumerates tokens)

**Interfaces:**
- Consumes: `data/field_surveys.json` (Task 5); `/api/insights/` rows with `channel`, `admin_pcode`, `field_context`, `field_context_answer` (Task 4).
- Produces: `state.showFieldData` (default `true`), `renderFieldData()`, `fieldSurveyCardHtml(entry) -> string`, `channelBadgeHtml(channel) -> string` (`"primary"` → "Field data", `"manual"` → "Primary input", else `""`).

Behaviour:
- Toggle label: "Field data — household surveys (IFRC)", checked.
- Marker shown when `state.showFieldData` and the slider date ≥ `entry.date_from`; filtered by `countryOn()`. Circle with IFRC-red outline, white fill, distinct from insight bubbles and HSP dots.
- Click → card (follow the existing popup/panel convention the HSP layer uses). Header: `"<place> · Household survey · <n> households · <date range>"`. Four blocks in order — **Hazards** (experienced top 5 as % of n bars; "Getting worse": worsening top 3), **Who is most affected** (most_affected top 5; "Why": why top 3), **Coping** (extent as a split bar; measures top 3), **Gaps** (cohesion_gaps top 5). Each block has "show all".
- **"What households said"**: `state.data.insights.filter(r => r.channel === "primary" && r.admin_pcode === entry.pcode)` — **no** `insightInMonth`, **no** tag filter. Each item: badge, dimension, `On: "<field_context>"` + ` — <field_context_answer>` when present, then the quote. Empty → "No statements published yet."
- Every insight card and bubble popup shows `channelBadgeHtml(row.channel)`; field rows also show the `On:` line.
- Escape all text (the existing escaping helper); feature properties arrive stringified (see memory note on MapLibre).

- [ ] **Step 1: Implement** the above (large edits via Edit or a scratchpad patch script, not a heredoc).
- [ ] **Step 2: Run** `docker compose exec web python manage.py test dashboard.tests.test_style_spec dashboard.tests.test_scrubbers -v 2` → PASS.
- [ ] **Step 3: Rebuild data**: Admin → Data sources → Pull now on `kobo/primary_data`, then Rebuild. Confirm `dashboard/data/field_surveys.json` has one Kiryandongo entry with `n == 81`.
- [ ] **Step 4: Publish a handful** of Field-data statements in Admin → Part 2 (check Part 2 shows ~250 pending Field-data rows with the parent question).
- [ ] **Step 5: `docker compose restart web`**, open http://127.0.0.1:2026 (Selenium, per memory note), confirm: marker at Kiryandongo from 8 Oct 2026; card's four blocks; badges on cards and popups.
- [ ] **Step 6: Move the slider to the newest month**: marker and the card's "What households said" list stay; insight bubbles for October disappear (intended).
- [ ] **Step 7: Untick Uganda** in Admin → Countries shown: marker gone, `data/field_surveys.json` returns no Uganda entry. Re-tick.
- [ ] **Step 8: Leave uncommitted.**

---

### Task 7: Docs

**Files:**
- Modify: `CLAUDE.md` (Kobo section): Field data statements come from the Kobo pull (`insights/field_data.py`), pending until reviewed; the pull is the one non-pipeline writer to `insights` besides extraction; `field_surveys.json` built on Rebuild; household GPS never leaves the server; small-number rule 5.
- Modify: spec status line → "approved 2026-11-17, implemented".

- [ ] **Step 1: Edit both files.**
- [ ] **Step 2: Leave uncommitted;** list changed files for George.
