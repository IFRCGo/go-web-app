# Working in this repository

The Community Centered Humanitarian Analysis Platform: a Django + PostGIS
application that reads humanitarian documents and APIs into a database and draws
the result on a MapLibre dashboard.

Everything runs in Docker. There is no Django environment on the host:

    docker compose exec web python manage.py <command>
    docker compose exec web python manage.py test <app> -v 2

## The two jobs an agent does here

### 1. Pull external data

**For a person, the route in is Admin → Data Refresh via API → Data
sources**, at `/admin/api_calls/datasource/`. Each row carries its last pull
and its newest data date, and every
API-backed row has a **Pull now** button that fetches, saves the raw response
under `data_pipeline/api_cache/`, and loads it. Rebuilding the dashboard
afterwards is a **separate** button on that page, so the database and the map
move only when you say so.

**The two Excel rows have a button too, labelled Reload file**, because their
newer data arrives as a saved workbook rather than an API response. It runs
`load_workbooks --only <variant>` against the file under `/work` — so it picks up
whatever has been *saved*, and `--only` is what keeps one row's press to one
workbook. The label differs from "Pull now" on purpose: nothing is fetched, and a
row that said "Pull now" would invite the reading that the platform goes looking
for figures the file does not yet contain.

**A workbook row's staleness is its sha1, not its date.** "Pull everything out of
date" skips anything already pulled today, which is right for an API and wrong for
a file: an analyst who saves a corrected figure an hour after the morning load
would be told there is nothing to do. `load_workbooks.file_changed()` compares the
fingerprint already held in `params`, and `api_calls/views.stale_rows()` uses it for
`FILE_SOURCES` instead of the date rule.

**One function decides which command refreshes a row**: `api_calls/views.refresh_argv()`.
The button, the confirmation view and `pull_batch` all ask it, and it returns a
positional argv that both `subprocess.Popen` and `call_command` accept. A second
rule anywhere else is how an excel row admitted by `stale_rows()` starts failing
inside every batch while its own button works.

`kobo` and `acaps` still have no button — they take different inputs
(`load_hsps`, a CSV export path) and the list names the command for each.

**`dtm` is the first source whose payload is not JSON.** The HDX resources
behind `sudan-displacement-situation-countrywide-idps-iom-dtm` are `.xlsx`
workbooks, so `Call.format="xlsx"` sends them through
`external_data/fetchers/workbook.py`, which transcribes **any** workbook to
`{"sheets": {name: [[cell, …], …]}}` and saves the raw bytes beside the JSON —
a transcription is not the response, and the bytes are what settles an argument
about whether the parser or the publisher was wrong. The transcriber knows
nothing about DTM; every scrap of that lives in `loaders/dtm_snapshot.py`, which
anchors on **HXL tags** because sheet names and header offsets drift between
snapshots — and because snapshot 004's IDP sheets are titled "Return Master
List". Its watermark is `known_ids` (resource ids), not a date: DTM publishes
each snapshot as a new resource. A first pull that finds no snapshot resources
raises rather than reporting "up to date".

**DTM's IDP totals sit BESIDE the HAPI series, not over it.** `hdx/idps` runs
from Aug 2023 and the snapshots from Nov 2025; they are the same programme
counted on different dates, and `date` is in `uniq_movement_observation`, so
sharing a `source` would add rows rather than merge them and inflate the IDP
bubbles. The snapshots are `source='dtm'`, and `build_idp_localities()` still
filters `source='hdx'`.

**The matrix is its own table.** `displacement_breakdown` holds one row per
cell — of the people at this place on this date, how many came from there —
keyed `(dimension, key)` where `key` is a state p-code or `OUTSIDE_SDN`.
Household counts ride here as `dimension='households'` because
`uniq_movement_observation` has no `unit`, so an individuals row and a
households row for one locality and date would overwrite each other.
`build_returnee_localities()` draws **admin2 only** — DTM publishes a state
total *and* the localities inside it, and drawing both puts Khartoum's 2.5m
bubble on top of the localities it is the sum of. Design:
`docs/superpowers/specs/2026-09-25-dtm-displacement-snapshots-design.md`.

From a terminal, the same thing, and this is what the button runs:

    docker compose exec web python manage.py refresh_external <source> <dataset> --iso3 <ISO3>

Those buttons call the upstream APIs **directly**, because the container cannot
run the MCP servers: they are Node scripts on a host share that is not mounted
into it. The payloads are identical — every MCP tool this project uses is a
pass-through wrapper ending in `return response.data` — but the distinction
matters the day a fetcher and its tool disagree. Fetchers live in
`external_data/fetchers/`, mirroring `loaders/`; each records the tool it
reproduces. `IPC_API_KEY` and `HDX_API_TOKEN` go in `.env` (the HDX one also
covers the `unhcr` rows); FEWS NET needs no key. Design:
`docs/superpowers/specs/2026-09-15-mcp-data-sources-admin-design.md`.

**IPC pulls are filtered, and not only by what is held.** `known_ids` says what
loaded; `skipped_ids` says what a person deliberately excluded, plus anything
that came back empty. Without the second list a refresh re-pulls every
exclusion — Chad's March 2024 displaced-population analysis among them — and
retries the known-empty analyses forever.

**The app is `api_calls` throughout** - package, label, URL and heading. It was
`mcp` until 2026-09-24, renamed because nothing here speaks the Model Context
Protocol; the pulls are plain HTTPS. Imports read `from api_calls.models import
...`. The table is `api_pull_job` (pinned in `Meta.db_table`) and job logs land in
`api_cache/api/`. **Both were renamed by migrations, not by hand**, because
`PullJob.log_path` and `Conversion.markdown_path` hold ABSOLUTE paths into the
cache: `api_calls/0003` and `insights/0009` rewrite them, and moving that folder
again without extending those two is how a job page starts showing an empty log
with nothing raised. Renaming a
label again means updating `django_migrations.app` and
`django_content_type.app_label` by hand; no migration can do it, and
MAINTENANCE.md §6 has the two statements.

`.mcp.json` in this folder configures five humanitarian MCP servers — `hdx`,
`fewsnet`, `ifrc-go`, `unhcr-refugees`, `ipc`. Claude Code reads it
automatically; nothing else needs configuring.

**For an agent, and for the sources with no fetcher** (`kobo`, `acaps`), the rule
is unchanged — **fetch, save, then load**, never fetch straight into the database:

1. Check what is already held: `manage.py external_status`.
2. Call the MCP tool for what is missing or newer.
3. Save the raw response under `data_pipeline/api_cache/`.
4. Load it: `manage.py load_external <dataset> <path> --iso3 <ISO3>`.

Loaders live in `external_data/loaders/`; `external_data/loaders/base.py` states
the four guarantees each one keeps.

**Never pull two IPC countries in parallel.** Recorded incident: the connection
closed and the server stayed down for the rest of the session.

### 2. Extract community insights from documents

Read `insights/prompts/extract_insights.md` and follow it exactly. That file is
the single source of truth for the extraction and its output format; this section
does not restate it.

The route in for a person is **Admin → Community insights → Part 1 — Documents →
insights**: pick files or a folder from a native window on your own machine,
**read them** (step 2, below), extract (watchable, and it survives the tab
closing), then review and publish. Part 2 is the statement table, for typing one
in by hand and for deciding the ones still pending.

**Part 2 lists everything except published; Part 3 lists nothing else.** Parts 1
and 2 are for actions, so a decision already taken leaves the queue —
`InsightAdmin.get_queryset()` excludes `published`, and the `PublishedInsight`
proxy (`Part 3 — Published insights`) is where they are read, whole and
view-only. Read-only because the quote on a published row was matched against
the page text it came from and an edit would invalidate that check silently; the
way back is the **Un-publish** action, which returns a row to `pending` and
clears the reviewer stamp so Part 2 picks it up. It does not restore the source
file — retention released that at publication, and nothing undoes a delete.

**Documents are read with Docling before the model sees them.** Step 2, "Read
these documents", converts each PDF or Word file to per-page markdown — reading
order, tables and headings kept, scanned pages OCR'd — and **replaces** the
PyMuPDF text intake wrote. That replacement is the point: `verify.py` re-matches
every quote against the same `DocumentText` rows the model read, so the two must
never diverge. Terminal equivalent, and what the button runs:

    docker compose exec web python manage.py convert_documents --job <N>

Three things about it that are not guessable:

- **A document Docling cannot read keeps its intake text** and is badged "Docling
  failed" on the preview. A re-read always tries Docling again first — the
  fallback is never sticky.
- **A document that already has a non-rejected insight is refused.** Moving the
  page text under a quote that was verified against it would invalidate that
  check with nothing left to say so. The practical cost: a batch already
  extracted from PyMuPDF text cannot be upgraded without rejecting its pending
  queue first.
- **OCR languages are not a free combination.** EasyOCR will not load Arabic
  beside any other non-English language, and one pass has one language list, so
  `DOCLING_OCR_LANGS` is `en,ar` or `en,fr`, not both. Both sets of weights are
  in the image; switching is a `.env` edit and a restart.

`ExtractionJob.status` reads `collecting → collected → converting → converted →
queued → running → loaded`. **`queued` means converted and ready to extract**,
not "files are in".

**An uploaded document is not kept.** What the platform keeps is the text read
out of it and the statements published from it, so `insights/retention.py`
deletes the file under `media/insights/` as soon as the document has no pending
statement left, and sweeps anything older than
`INSIGHT_UPLOAD_RETENTION_MINUTES` (default 30) whether it was reviewed or not.
Releasing blanks `InsightUpload.file` and touches nothing else - the `Document`,
its `DocumentText` pages and every `Insight` stay. There is no scheduler here,
so the sweep runs on wizard page loads and from `manage.py prune_uploads`; a
batch at `converting` is skipped until Docling finishes with it. Re-importing a
released file stores the bytes again and **moves that document's still-pending
statements to the new batch**, so the review queue follows the person rather
than being extracted a second time.

**Retention follows rows, never the folder.** Nothing deletes a file because
the database does not mention it - a file left behind by deleting an upload in
Admin stays until a person removes it. An earlier version swept those from the
wizard's page load and `manage.py test` emptied this deployment's upload
folder, because the test database legitimately has no rows in it.

**A batch whose files were swept refuses to be read**, rather than badging
every document "Docling failed" and quietly extracting from the weaker intake
text: step 2 says the files were released and links to a new import.
`retention.released_documents(job)` is the check, and a document already read
successfully is not in it. The rule is not fussiness: "no row claims it" is only as true as the
database being asked, and asked against an empty one - a test run, a restored
dump - the answer is every file in the folder. An earlier version swept
unclaimed files from the wizard's page load, and `manage.py test` emptied this
deployment's upload folder.

An archive already sitting on a mounted share should be registered as an
`InsightFolder` instead — nothing is copied that way. Which folders may be
browsed is `INSIGHT_DOCUMENT_ROOTS`; there is no hardcoded `/work` any more, and
the host folder behind the mount is `SOURCE_HOST_DIR`.

## Hiding a country from the public dashboard

**Admin → Dashboard → Countries shown on the dashboard** has one tick box per
country, detected from the level-0 boundaries (nobody types a name). Unticking
one hides it from the map, the picker, the panels and every public `/api/`
response, **on the server**, so nothing of it reaches the browser, not even
DevTools. Nothing is deleted. The data on disk and in PostgreSQL stays complete,
and ticking the box again restores the country on the next page load, with no
rebuild. Design: `docs/superpowers/specs/2026-11-16-country-visibility-switch-design.md`.

- **The switch is `country_visibility`, and no pipeline step writes it.** A data
  pull or rebuild can never turn a country back on. `sync_countries` only adds
  missing rows.
- **`dashboard/views.data_file()` is fail-closed while anything is hidden.** A
  data file with no entry in `dashboard/scrubbers.REGISTRY` is refused (404).
  For the core files `loadData()` fetches, that stops the whole dashboard. So
  **a new file under `dashboard/data/` needs a scrubber line**, and
  `test_every_file_in_data_dir_has_a_scrubber` fails until it has one.
- **A new `/api/` view must be listed in `dashboard/gated.py`**, either GATED
  (it filters hidden countries) or REGIONAL. `test_every_api_url_is_gated_or_regional`
  enforces this.
- Structured rows are dropped and free text is never edited. A statement located in
  a shown country is sent as it is, including a movement leg into a hidden one.
  Regional totals (`headline`, `meta`) are not split.
- **Sudan cannot be switched off** (`visibility.NEVER_HIDDEN`). The corridors and
  IDP layers are Sudan's, so hiding it would only half-work.
- `manage.py test` runs with `API_CACHE_DIR` pointed at a temporary folder
  (`config/test_runner.py`), because the refresh tests used to rewrite and
  delete the real, git-tracked cache files.

## Things worth knowing before changing anything

- `/work` is mounted **read-only**. Anything written goes under `/app`.
- **`web` runs gunicorn, which never autoreloads. After a model change, run
  `docker compose restart web`** — migrating alone is not enough. The symptom is
  not a stale page: `AddField` sets a DB default only to backfill it and then
  drops it, so a worker that booted before the field existed omits the column
  from its INSERT and the next request raises
  `NotNullViolation: null value in column "<field>"`. `manage.py test` forks a
  fresh process, so the whole suite stays green while the running site is broken.
- `data_pipeline/steps/s03_parse.py` deletes and rebuilds `population_figures`,
  `movement_flows` and `narrative_tags` on every run, and `s04_events.py` deletes
  every row in `events`. Do not put hand-curated data in those tables.
- The `insights` app is never written to by any pipeline step. That is deliberate.
- Settings use `os.environ.get(X, default)` by default; use `get(X) or default` (or `env_path()`) only when an empty .env value must fall back to the default instead of being treated as empty.
- Specs are in `docs/superpowers/specs/`, plans in `docs/superpowers/plans/`.
