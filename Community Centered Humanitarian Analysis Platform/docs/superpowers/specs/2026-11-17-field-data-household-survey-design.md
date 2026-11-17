# Field data on the dashboard: the CCHA household survey

Date: 2026-11-17. Status: approved by George 2026-11-17; implemented (plan:
`docs/superpowers/plans/2026-11-17-field-data-household-survey.md`).

## Why

The CCHA primary-data form (Kobo) is the communities' own account of their
situation. It is stored in `ccha_primary_data` and its two repeat tables, but
nothing of it reaches the dashboard. Someone looking at **Kiryandongo** should
come away understanding four things:

1. what **hazards** the population faces,
2. **who is vulnerable** (most affected),
3. how people **cope**,
4. what **gaps** they experience.

Households are the first interview type shown. FGD and KII come later.

## What exists today

- 81 household interviews, all `UGANDA / WESTERN / KIRYANDONGO`, collected
  2026-10-08 → 09, all with GPS. 24 FGD and 7 KII rows are out of scope here.
- Tick-box (multi-select) answers, stored as labels joined with `"; "`:
  `hazards_experience`, `hazard_kind` (more severe/frequent recently),
  `hazard_cause`, `hazard_affected_groups`, `hazard_measures`,
  `hazard_management`, `hazard_evacuate`, `vulnerabilities_believe`,
  `vulnerabilities_group`, `vulnerabilities_differences`, `coping_extent`,
  `coping_cohesion`, `coping_gaps`. Repeat `hazard_details` gives per-hazard
  frequency, months and impact.
- Free text in households' own words: `vulnerabilities_elaborate` (80
  non-empty), the per-hazard `coping_challenges` repeat (138 rows), and the
  `<question>_other` columns (about 30 non-empty in total).
- `insights.Insight` already has `channel = primary` ("Primary collection") and
  `manual` ("Typed by hand"), a nullable `document`, `stated_on`, and codings by
  dimension (hazard / vulnerability / coping / need / movement_pattern).
- The survey's answer lists do **not** use the taxonomy keys in
  `data_pipeline/taxonomy.json` ("Insect Infestation", "Population Movement",
  "Lack of income" have no key).
- `AdminArea` has Kiryandongo at admin2 (`UG4120`, label point 1.991, 32.051).

## Goals

- A **Field data** marker per surveyed place, opening a summary card that
  answers the four questions from the tick-box counts.
- Households' free-text answers become **community insights**, labelled
  **Field data**, going through the same review queue (Part 2) as everything
  else, and appearing on the map only once published.
- Statements typed by hand in Admin → Insights are labelled **Primary input**.

## Non-goals

- FGD and KII interviews (next round; the design must not block them).
- Audio, transcription, translation.
- Charts over time: there is one collection round.
- Changing the Kobo form.

## Anti-goals (a failure even if it works)

- **Household locations on the public map.** No household GPS point, and no
  point derived from a single household, is ever sent to the browser.
- A survey quote reaching the public without a person having published it.
- A Kobo pull overwriting a reviewer's decision.
- Survey data leaking for a hidden country (country visibility switch).

## Approaches considered

- **A. Place summary + quotes as insights** (picked by George). One marker per
  place, a summary card from counts, free text into the insights review queue.
  Answers the four questions directly: counts give the pattern, quotes the why.
- **B. Quotes only.** Cheaper; drops the tick-box answers, which are most of
  the data.
- **C. One dot per household.** Most detail, but exposes homes and hides the
  pattern among 81 dots.

## Decisions

### Taken by George

- Approach A.
- Survey statements are **reviewed first**: each pull adds them to Part 2 as
  `pending`; nothing is published automatically.
- Labels: Kobo-derived statements = **Field data**; statements keyed in Admin =
  **Primary input**. Both are community insights.

### My calls (correct any)

1. **Labels are a relabel, not new channels.** `CHANNELS` becomes
   `primary → "Field data"`, `manual → "Primary input"`. Display text only; no
   data migration of values.
2. **Placement is the admin2 label point**, never GPS. The interview's `admin2`
   text is matched to `AdminArea` (level 2, same iso3, case-insensitive name).
   If `admin2` is blank or unmatched, GPS is used *server-side only* to find the
   containing admin2 polygon. The insight's `lat/lon` are the label point, as
   for document insights. Unmatched → statement still created, `match_method =
   unmatched`, no map point (it shows in the panel only), as today.
3. **Small-number rule:** a place with fewer than **5** household interviews
   gets no summary card (counts on 1–4 homes identify them). Its quotes still
   go to review.
4. **Which free text becomes a statement** (household rows only):
   | Source | Dimension coded automatically |
   |---|---|
   | `vulnerabilities_elaborate` | vulnerability |
   | `coping_challenges` (repeat), one per hazard | hazard (the repeat's hazard) + coping |
   | `hazards_experience_other`, `hazard_kind_other`, `hazard_cause_other` | hazard |
   | `hazard_affected_groups_other`, `vulnerabilities_believe_other`, `vulnerabilities_group_other` | vulnerability |
   | `hazard_measures_other`, `hazard_management_other`, `hazard_evacuate_other`, `coping_cohesion_other`, `coping_gaps_other` | coping |
   **Rule (George, 2026-11-17): a follow-up text is tagged with what it
   elaborates.** "Please elaborate" and every "Other (specify)" answer becomes a
   statement only when there is text. It is coded to the dimension of the
   question it follows, as in the table above: an elaboration on vulnerability
   is tagged vulnerability, and an "Other" hazard is tagged hazard. The
   statement also carries that parent question, so the reader knows what it
   is answering:
   - `field_question` stores the follow-up's column. Part 2, the insight card and the
     popup show the **parent question's wording** above the quote, e.g. *"Are
     there any differences between people who arrived recently and longer-term
     residents?"*.
   - Where the parent is a single choice, its answer is shown with it, e.g.
     *"Yes, significant differences"*.
   - `/api/insights/` gains two fields for this: `field_context` (the parent
     question wording) and `field_context_answer` (the parent answer, single
     choice only). Both are null for non-field rows.
   The parent question for each follow-up comes from the column pairs that
   already exist (`<question>_other` → `<question>`, and
   `vulnerabilities_elaborate` → `vulnerabilities_differences`). Each
   `coping_challenges` row's parent is "Gaps/challenges the community has with
   this hazard", and the hazard named is shown with it.
   The three "What does X mean to you?" answers are **not** turned into
   statements: they are definitions ("something bad"), not experiences, and
   would roughly double the review queue. Expected first queue: ~250.
5. **Obvious non-answers are not queued:** blank, "None", "N/A", "No",
   "I don't know"/"I don’t know", "Nothing", or fewer than 3 characters after
   trimming (case-insensitive). This short list lives in code beside the
   statement builder: it is a filter rule, not a curated mapping, and anything
   it misses is caught by the reviewer.
6. **Survey-to-taxonomy mapping is an editable table**
   (`FieldDataTagMap`: form key, question, survey label → dimension, taxonomy
   tag), with an Admin screen and a seed for the labels seen so far. It is used
   for (a) the automatic coding of a statement where the label is known (the
   hazard name of a `coping_challenges` row) and (b) nothing else in this
   round — the summary card shows the survey's own labels, as households were
   asked them. An unmapped label codes as `tag = "other"`, `tag_raw = <label>`,
   so the reviewer can see and fix it. Reviewers add or change codings in Part 2
   as they do today. (Curated values belong in tables: project rule.)
   **What an `other` coding means on the map:** `insightPasses()` lets every
   statement through when no theme chip is ticked, so a published statement
   coded only `vulnerability|other` shows on the map, in the panel and in the
   card by default. It drops out as soon as someone ticks a theme chip, because
   `other` has no chip. A reviewer who wants a statement to answer a theme
   filter gives it a real taxonomy tag before publishing; this is optional, not
   required to publish. Per row of the call-4 table: the `coping_challenges`
   hazard coding takes the mapped tag (else `other`); every other automatic
   coding is `<dimension>|other`.
7. **Each statement is tied to its interview.** New nullable fields on
   `Insight`: `field_interview` (FK → `CchaPrimaryData`, `on_delete=CASCADE`),
   `field_question` (column name, e.g. `coping_challenges`) and
   `field_item` (repeat `hazard_number`, else 0). Unique constraint on
   `(field_interview, field_question, field_item)` where the interview is set.
   This is the natural key: two households can say the identical words
   ("Lack of job"), and the existing `(document, page, quote_sha1)` key would
   merge them. **That existing constraint must exclude field-data rows**
   (condition `field_interview IS NULL`), or the second household's "Lack of
   job" is refused. Check that Django accepts `condition` together with
   `nulls_distinct=False` on one `UniqueConstraint`. If it does not, use two
   constraints.
   Publishing needs no change: `insights/review.publish()` does not re-verify
   against `DocumentText`, and document-less `manual` rows already publish.
   CASCADE is deliberate: an interview rejected in Kobo after it was stored is
   deleted on the next pull (existing rule), and its statements go with it,
   published or not.
8. **Re-pull behaviour:** the statement step runs at the end of
   `CchaPrimaryDataLoader.after_insert`. New `(interview, question, item)` →
   create `pending`. Existing and still `pending` → update quote/date/place if
   they changed in Kobo. Existing and `published` or `rejected` → **untouched**
   (a reviewer's decision stands). An answer blanked in Kobo deletes a
   *pending* statement only.
   Known edge case: the loader replaces repeat rows on every pull, and the key
   uses `hazard_number`. If a household's hazards are reordered in Kobo, a
   pending statement for item 1 takes item 2's text. That is accepted for
   pending rows, because the reviewer sees the text they are deciding on.
   Published rows are never rewritten.
   This makes the Kobo pull the second writer to the `insights` app besides the
   extraction job. It is still not a `data_pipeline` step, so the rule "no
   pipeline step writes insights" holds; CLAUDE.md gets a line saying so.
9. **Statement fields:** `quote` = the answer verbatim (line breaks kept);
   `channel = primary`; `voice_type = community`; `method = "kobo"`;
   `stated_on = interview_date` (fallback `submitted_at` date);
   `iso3` from the matched `AdminArea` row (admin2 by name, else the polygon
   containing the GPS point, else a level-0 name match). There is no
   country-name dict in code. `place_name_as_written` =
   `admin2`; `quote_language = "en"`; no `document`, no `job`.
   In Part 2 the row shows the question wording it answered and the interview
   type, so the reviewer reads it in context.
10. **Summary file:** a new builder in `s06_mcp_layers.py`,
    `build_field_surveys()`, writes `dashboard/data/field_surveys.json`, run by
    the existing Rebuild (so the map moves only when George says so, like every
    other layer). One entry per (iso3, admin2 pcode, interview type) — only
    `household` this round:
    ```
    {"surveys": [{
      "iso3": "UGA", "pcode": "UG4120", "place": "Kiryandongo",
      "lat": 1.991, "lon": 32.051, "type": "household",
      "n": 81, "date_from": "2026-10-08", "date_to": "2026-10-09",
      "sections": {
        "hazards":   {"experienced": [[label, count], ...],
                      "worsening":   [...], "causes": [...],
                      "per_hazard":  [{"hazard": ..., "n": ..., "impact": {...}, "frequency": {...}}]},
        "vulnerable":{"most_affected": [...], "why": [...], "vulnerabilities": [...],
                      "newcomers_vs_residents": [...]},
        "coping":    {"extent": [...], "measures": [...], "capacities": [...],
                      "cohesion": [...], "evacuate_to": [...]},
        "gaps":      {"cohesion_gaps": [...]}
      }}]}
    ```
    Counts are households naming the option (a multi-select counts once per
    household). "Other" is counted as "Other". Lists are sorted by count, full
    (the card decides how many to show).
    Scrubber line: `("field_surveys.json", _rows("surveys", field="iso3"))`.
    `build_data_dates()` includes `date_to` per country so the timeline reaches
    the collection date.
11. **Dashboard:**
    - A **Field data** layer toggle in the layer list (on by default), drawing
      one marker per survey entry, styled distinct from insight bubbles (IFRC
      red outline, clipboard-style glyph).
    - **Time:** the marker appears once the slider reaches `date_from` and
      stays after it (a survey's findings stay current until replaced).
    - **Card** (popup/side panel, using the existing panel conventions), in
      the order of the four questions:
      ```
      Kiryandongo · Household survey · 81 households · 8–9 Oct 2026
      HAZARDS      top 5 experienced (bars, % of households) · getting worse: top 3
      WHO IS MOST AFFECTED   top 5 groups · why: top 3
      COPING       "Can cope with a hazard": extent split · top 3 measures
      GAPS         top 5 cohesion gaps
      WHAT HOUSEHOLDS SAID   published Field-data statements at this place
                             (from /api/insights/, channel=primary, same admin_pcode)
      ```
      Each block has "show all" to expand the full list.
      **"What households said" ignores the slider month.** It lists every
      published Field-data statement at the place, so it matches the marker,
      which stays after `date_from`. The insight *bubbles* keep the
      month rule (`insightInMonth`), so they show only in October 2026. That is
      intended: the bubbles are the timeline view, and the card is the
      survey's view. The card filters the already-fetched `api/insights/`
      list in the browser, by `channel === "primary"` and `admin_pcode`, so
      no new query parameter is added to the view.
    - Insight cards and popups everywhere show a small **Field data** /
      **Primary input** badge from `channel`; document-derived ones show none.
    - Admin Part 2 / Part 3 list filter on channel uses the new labels.
    - The hand-typing form (`insights/forms.py`) no longer offers
      **Field data** as a channel choice. Only a Kobo pull creates those rows,
      and a hand-typed row is always Primary input (or Document when it has a
      document).

## Constraints

- Docker only; tests via `docker compose exec web python manage.py test`.
- After the model change, `docker compose restart web` (gunicorn).
- New data file ⇒ scrubber entry (fail-closed test).
- `/api/insights/` already filters hidden countries; no new `/api/` view.
- Model fields need migrations in `insights`; the FK points across apps to
  `external_data.CchaPrimaryData`.
- George does all git work; leave changes uncommitted.

## Tests that must exist

- Two households with identical text produce two statements.
- Re-pull: pending updated, published/rejected untouched, blanked pending deleted.
- Not Approved deletion removes the interview's statements.
- Non-answers are not queued.
- Field-data statements are created `pending`; `/api/insights/` does not return
  them until published.
- `field_surveys.json`: counts per option, multi-select counted once per
  household, places under 5 households omitted, no `latitude/longitude` from
  `ccha_primary_data` anywhere in the file.
- Scrubber removes a hidden country's surveys.

## Left to the builder

- Marker glyph and exact card styling within the existing IFRC look.
- Whether the card is a MapLibre popup or the side panel, following what the
  existing layers do.
- Seed contents of `FieldDataTagMap` for the hazard names seen so far.
