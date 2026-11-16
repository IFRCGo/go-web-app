# Country visibility switch — design

Date: 2026-11-16
Status: draft for George's review

## Intent

Libya and the Central African Republic are part of the regional scope of the
Sudan crisis. Data about them always comes in, and the database always keeps it.
For a period, though, the people running the platform may decide that dashboard
users should not see or interact with one or more countries.

Hiding a country is a **presentation decision, not a data decision**. While a
country is off:

- the dashboard behaves as if the country were not in scope (no picker entry,
  nothing drawn, no panel rows), and
- **none of its data leaves the server**. Opening the browser's developer tools
  and reading the network responses must not reveal it.

Turning a country back on restores it everywhere, with nothing re-imported and
nothing lost.

## Goals

1. An Admin page lists the countries the platform knows about, each with an
   on/off pick. Names are detected from the database and never typed.
2. A country that is off stays off through every data pull, workbook reload,
   pipeline run and dashboard rebuild, until a person switches it back on.
3. While a country is off, every response the server sends to the public
   (the dashboard data files and the `/api/...` endpoints) has that country's
   rows removed **before it is sent**.
4. A switch takes effect on the next page load. No rebuild is needed in either
   direction.

## Non-goals

- Deleting, archiving or excluding anything at ingest or in the pipeline. The
  data on disk (`dashboard/data/`) and in PostgreSQL stays complete.
- Splitting regional totals. Figures that UNHCR or the pipeline publish as one
  regional number stay exactly as they are, even though Libya and CAR are inside
  them: the `headline.json` series ("Total forcibly displaced" and the rest) and
  the counts in `meta.json`. *(George decided this.)*
- Hiding Admin. Admin is for the people who run the platform, and they see
  everything.
- The basemap. The background map tiles draw Libya and CAR as land. That comes
  from the tile provider, not from this platform's data.

## Anti-goals (failure even if it "works")

- **A leak through a forgotten path.** The page looks clean, but a file or API
  response still carries the hidden country. The design is fail-closed for this
  reason (see the gate below).
- **A rebuild that silently turns a country back on.** No pipeline step,
  loader or management command may write to the switch table.
- **Lost data.** Nothing in this feature deletes or rewrites a stored row or file.
- **A typed country list**, which drifts from the data and invites spelling
  mismatches.

## Decisions

### The switch (George decided this)

- New model in the `dashboard` app: one row per country, holding `iso3` (unique),
  `name`, and `shown` (bool, default True). Plus who changed it and when, so the
  Admin page can say "off since 3 Nov, by …". *(The audit fields are the
  builder's call.)*
- **The rows are detected, not typed.** The country list is synced from
  `boundaries.AdminArea` rows at `level=0`. Checked on 2026-11-16, that is
  nine countries: the eight the picker offers plus Eritrea. Eritrea appears in
  Admin and can be hidden like any other, but the picker does not start offering
  it (see "The page itself"). The sync runs when the Admin page loads and as a management
  command. It adds missing countries as `shown=True` and refreshes names. It
  never changes `shown` and never deletes a row. A country that drops out of the
  boundaries keeps its row and its setting.
- The Admin change list shows each country with an editable on/off checkbox
  (`list_editable`), so switching is one click and Save. No add form, and no
  free-text name field anywhere. Delete is disabled.
- **The pipeline never writes this table**, in keeping with the CLAUDE.md rule
  that hand-curated data stays out of pipeline-rebuilt tables. Add a test that
  runs the pipeline's export step and asserts that the switch rows are untouched.
- One helper, `hidden_countries()`, returns the hidden set as both ISO3 codes and
  names (the data files use both). Everything else asks it. Nothing hard-codes
  `LBY` or `CAF`.

### What "removed" means (applies everywhere below)

**Structured rows are dropped; free text is never edited.** A row, feature or
key goes when its country field, ISO3, p-code (resolved through `AdminArea`)
or corridor id names a hidden country. Prose is left alone wherever it appears:
event titles and descriptions ("…return from Egypt, South Sudan and Libya…"),
tag snippets from regional documents, document file names, and the
`source`/`caveat` strings in the data files. George decided this for community
statements, and the same logic applies to every other text field. A reader can
therefore still learn from a sentence that Libya exists and that people move
there. What they cannot get is Libya's figures, places, boundaries, corridors or
statements.

### The gate: one server-side filter (my call)

- `dashboard/views.data_file()` already serves every file under
  `dashboard/data/`. When the hidden set is non-empty, it loads the requested
  file, runs that file's **scrubber**, and sends the result. When nothing is
  hidden, it streams the file unchanged, exactly as it does today.
- Scrubbers live in one registry module, for example `dashboard/visibility.py`,
  which maps a file path or pattern to a function `(data, hidden) -> data`.
- **Fail-closed.** While any country is hidden, a request for a file with no
  registered scrubber is refused with a 404 instead of being sent whole. A
  future layer added without a scrubber then disappears from the map rather
  than leaking. For the 13 core files that `loadData()` fetches together
  (`meta`, `flows`, `events`, …), a 404 does not cost one layer: it stops **the
  whole dashboard** from loading, because the `Promise.all` has no fallback.
  That is loud rather than leaky, which is the right way round. A test walks `dashboard/data/` and asserts that every file has a
  scrubber, so the gap shows up in CI rather than on the map.
- A file that belongs entirely to a hidden country, such as `ipc_fs/CAF.geojson`,
  returns 404.
- Performance is the builder's call. Some files are a few MB (`areas.geojson` is
  about 3 MB). Caching the scrubbed result keyed on (path, file mtime, hidden
  set) is the obvious move. Responses keep `Cache-Control: no-store`.

### What each file is cleaned by

Observed on 2026-11-16. Where the decision is mine rather than George's, it says so.

| File | Country is named by | Rule |
|---|---|---|
| `boundaries/admin0.geojson` | `iso3`, `name` | drop the feature |
| `boundaries/admin1.geojson`, `admin1_lines.geojson` | `iso3` | drop the feature |
| `boundaries/areas.geojson` | `iso3` | drop the feature |
| `boundaries/aoi.geojson` | `name` only | look up the AOI's `iso3` in `AdminArea` (AOIs carry an iso3 there) and drop it |
| `aoi_ipc.geojson` | `ipc_country` (ISO3) | drop the feature |
| `ipc_fs/<ISO3>.geojson` | file name | 404 when hidden |
| `ipc_areas_fs.geojson` | `_meta.iso3` | 404 when hidden (currently SDN) |
| `hsps.geojson` | `iso3` | drop the feature |
| `tag_areas.json` | `iso3` per p-code | drop the entry |
| `seasonal.json` | key of `countries` (ISO3) | drop the key |
| `refugee_camps.json` | `countries[].country`, `camps[].country` | drop the rows |
| `unhcr_asylum.json` | `countries[].country` | drop the rows |
| `crossings.json` | `points[].country` | drop the point (my call: a crossing names the far-side country and is tied to that country's corridor) |
| `flows.json` | corridor id slugs (`sudan-libya`, `libya-sudan-return`, `sudan-car`) | drop the corridor if either end is hidden. Slug-to-country mapping as in app.js `SLUG_TO_COUNTRY` (`car`, `libya`, …) |
| `documents.json` | `country` | drop the row. `Regional`/null stay |
| `tags.json` | `monthly[].country`; `snippets[month][country]` | drop the rows and the snippet keys |
| `hazard_events.json` | `by_sub.*.monthly[].country`; `events` keyed by area p-code (`LY…`, `CF…`) | drop the rows. Resolve each p-code to its iso3 by **looking it up in `AdminArea`**, not by matching a two-letter prefix |
| `events.json` | coordinates only | drop events whose point falls inside a hidden country's admin0 polygon (GEOS is available through PostGIS). Events without coordinates are Regional and stay |
| `idp_localities.json`, `idp_states.json`, `returnee_localities.json` | Sudan only | pass through. Register the scrubber as identity so fail-closed still holds |
| `headline.json`, `meta.json` | regional | pass through (George decided this) |
| `hazards.json` | vocabulary, no country | pass through |
| `water.geojson` | river names, no country | pass through (my call: physical geography, like the basemap) |

### Community statements (George decided this)

- `/api/insights/` drops statements whose `iso3` is hidden.
- **A statement located in a shown country is sent as it is**, including a
  movement leg that points into a hidden country (a Darfur statement saying
  "people are leaving for Kufra"). George decided this. The quote is the
  community's words and is not edited.

### The other public endpoints (my call)

Every GET under `/api/` answers anyone, so "strict" covers them too. Each applies
the hidden set to its own rows:

- `data_track`: `documents`, `events`, `flows`, `figures`, `tags` (filter by
  country). `meta` and `headline` are regional and pass through.
- `external_data`: `seasonal`, `food-security`, `movement`, `community-insights`,
  `hsps`, `crossings`, `index`. `sync` is a freshness report about sources, not
  country data. The builder confirms its rows name no hidden-country figures,
  and filters them if they do.
- `boundaries`: `layers`, `layer`, `features`. **Their ETag must include the
  hidden set**, or a browser holding a cached response from before the switch
  will keep showing the country.
- A test enumerates the URL patterns under `/api/` and fails if any is not
  marked as gated or as explicitly regional, which is the same fail-closed idea
  applied to views.

### The page itself

- `app.js` currently hard-codes `COUNTRIES` (the picker list). The page must get
  the shown countries from the server instead: `dashboard.views.index()` passes
  them into the template, and `app.js` reads them. The picker offers **today's
  eight minus any that are hidden**, keeping its current order (Sudan first).
  Eritrea is not added to the picker by this work. The picker, split view, food
  security (`IPC_COUNTRIES`) and seasonal panels then only offer shown countries.
- Lookup tables in `app.js` (`ANCHORS`, `COUNTRY_TO_ISO3`, `SLUG_TO_COUNTRY`)
  still contain the words "Libya" and "Central African Republic" with a centroid
  each. They are code, not data: no figure, statement or boundary. **My call is
  to leave them**, because removing them gains nothing a reader of the source
  could not already know. If George wants even the names gone from the script,
  those tables move into the server-provided config as well.
- The page must cope with absent pieces: a 404 on `ipc_fs/CAF.geojson` and empty
  arrays everywhere. The existing `.catch(() => null)` pattern covers some
  fetches, but not the `loadData()` `Promise.all` for the core files. Every core
  file therefore always returns 200 with the hidden rows removed, and only
  whole-country files 404.

## Verification

- Unit tests per scrubber, each with a Libya or CAR row and a Chad row, asserting
  that only the hidden one goes.
- A view-level test: with LBY and CAF off, fetch every file under `/data/` and
  every `/api/` GET, then walk the **structured fields** of each body (`country`,
  `iso3`, `ipc_country`, p-codes, corridor ids, `seasonal` keys). Expect no value
  that resolves to a hidden country. Prose is not searched, by the rule above.
  Statements located in shown countries keep their movement legs into a hidden
  country, by decision.
- Switch both back on and assert that the bodies are byte-identical to the files
  on disk.
- In the browser, with both off: no picker entry, no outline, no corridors, no
  camps, no statements, and DevTools → Network shows no Libya or CAR rows.
  Restart `web` first (gunicorn does not autoreload, and a new model needs it).

## Left to the builder

The scrubber caching strategy; the audit fields on the switch; the exact template
mechanism for handing shown countries to `app.js`; the wording on the Admin page.
