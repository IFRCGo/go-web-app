# Country Visibility Switch Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** An Admin on/off pick per country that, while off, strips that country's structured data from every public response (dashboard data files and `/api/...`) before it leaves the server, without touching stored data.

**Architecture:** A `CountryVisibility` table in the `dashboard` app, synced from `AdminArea(level=0)`, is the only switch. `dashboard/visibility.py` turns it into a `Hidden` value; `dashboard/scrubbers.py` holds one scrubber per data file, and `data_file()` runs it on the way out (fail-closed when no scrubber is registered). The API views apply the same `Hidden` to their querysets. The page receives the shown countries from `index()` instead of a hard-coded list.

**Tech Stack:** Django 5.0, PostgreSQL/PostGIS, shapely 2.1 (already in requirements), vanilla JS (MapLibre).

**Spec:** `docs/superpowers/specs/2026-11-16-country-visibility-switch-design.md`

## Global Constraints

- Nothing in this feature writes to, deletes or rewrites any stored data row or any file under `dashboard/data/`.
- No pipeline step, loader or management command other than `sync_countries` writes `CountryVisibility`; `sync_countries` only inserts missing rows (`shown=True`) and refreshes `name`; it never changes `shown` and never deletes.
- Structured rows are dropped; free text (titles, descriptions, snippets, quotes, file names, `source`/`caveat` strings) is never edited.
- When nothing is hidden, every response is byte-identical to today's.
- No `LBY`/`CAF`/"Libya" literal in production code; everything asks `hidden_countries()`.
- Regional series pass through unchanged: `headline.json`, `meta.json`, `/api/headline/`, `/api/meta/`.
- A statement whose own `iso3` is shown is sent unchanged, movement legs included.
- Tests: `MSYS_NO_PATHCONV=1 docker compose exec web python manage.py test <app> -v 2` (run from the platform folder). After the model lands: `docker compose restart web` before any browser check.
- Commits carry no Claude co-author line (George's standing preference).

## Review Focus

1. **Stale caches after a switch** — a browser or the server-side cache holding a pre-switch body must not keep serving the hidden country: boundaries ETags include the hidden set (Task 4), the scrub cache key includes it (Task 3).
2. **Name vs ISO3 mismatch** — files name countries both ways (`"Central African Republic"` vs `CAF`); `Hidden.hides()` must match either, and an unknown/`None`/`"Regional"` value must be kept (Task 1).
3. **Corridor ids in all three shapes** — `sudan-car`, `libya-sudan-return`, `south_sudan-sudan-influx`; `south_sudan` contains `sudan` and must not be misread (Task 2).
4. **Events with null coordinates and events on a border** — null stays (Regional); a point in no polygon stays (Task 2).
5. **A new data file nobody registered** — refused with 404 while anything is hidden, served normally when nothing is (Task 3).

---

### Task 1: The switch — model, sync, Admin, `hidden_countries()`

**Files:**
- Create: `dashboard/models.py`, `dashboard/migrations/0001_initial.py` (via makemigrations), `dashboard/migrations/__init__.py`, `dashboard/admin.py`, `dashboard/visibility.py`, `dashboard/management/__init__.py`, `dashboard/management/commands/__init__.py`, `dashboard/management/commands/sync_countries.py`
- Move: `dashboard/tests.py` → `dashboard/tests/__init__.py` (empty) + `dashboard/tests/test_style_spec.py` (existing content, unchanged)
- Test: `dashboard/tests/test_visibility.py`

**Interfaces:**
- Produces:
  - `class CountryVisibility(models.Model)`: `iso3 = CharField(max_length=3, unique=True)`, `name = TextField()`, `shown = BooleanField(default=True)`, `changed_at = DateTimeField(null=True, blank=True)`, `changed_by = TextField(blank=True, default="")`; `Meta.db_table = "country_visibility"`, `ordering = ["name"]`.
  - `visibility.sync_countries() -> int` — inserts missing level-0 countries from `boundaries.AdminArea`, refreshes names; returns rows created.
  - `@dataclass(frozen=True) class Hidden`: `iso3: frozenset[str]`, `names: frozenset[str]`; `def __bool__(self)` (True when anything hidden); `def hides(self, value) -> bool` (True when `value` is in either set; `None`/`""`/`"Regional"` → False); `def key(self) -> str` (sorted iso3 joined by `,`, for cache keys/ETags).
  - `visibility.hidden_countries() -> Hidden` — read from the table each call (no process cache: gunicorn has several workers and a switch must reach all of them on the next request).
  - `visibility.shown_country_names() -> list[str]`.
  - `visibility.iso3_for_pcode(pcode: str) -> str | None` — `AdminArea` lookup, cached per process with `functools.lru_cache` (p-codes do not change between boundary loads; clear it in tests).

- [ ] **Step 1: Move `dashboard/tests.py` into a `tests/` package** and confirm the existing suite still runs: `manage.py test dashboard -v 2` → the MapLibre style-spec tests PASS.
- [ ] **Step 2: Write failing tests** in `test_visibility.py`:
  - `test_sync_adds_every_level0_country_shown` — with `AdminArea` rows for SDN, LBY (level 0) and one SDN level-1 row, `sync_countries()` returns 2 and both rows exist with `shown=True`.
  - `test_sync_never_flips_shown` — LBY row pre-set `shown=False`; after `sync_countries()` it is still False.
  - `test_sync_never_deletes` — a `CountryVisibility` row for `ERI` with no `AdminArea` survives sync.
  - `test_hidden_matches_iso3_and_name` — with LBY off: `hides("LBY")`, `hides("Libya")` True; `hides("Chad")`, `hides(None)`, `hides("Regional")` False; `bool(hidden_countries())` True; with all on, `bool(...)` False.
  - `test_admin_changelist_offers_checkbox_not_text` — logged-in superuser GET `/admin/dashboard/countryvisibility/` → 200, contains `name="form-0-shown"`, no add link (`has_add_permission` False), and the page load ran the sync (rows exist without calling sync first).
  - `test_admin_save_records_who_and_when` — POST the changelist form flipping LBY off → row `shown=False`, `changed_by` = username, `changed_at` set.
- [ ] **Step 3: Run** `manage.py test dashboard.tests.test_visibility -v 2` → FAIL (import errors).
- [ ] **Step 4: Implement** the model, `makemigrations dashboard`, `visibility.py`, the command (calls `sync_countries()` and prints the count), and `CountryVisibilityAdmin`: `list_display = ("name", "iso3", "shown", "changed_at", "changed_by")`, `list_editable = ("shown",)`, `readonly_fields` for everything but `shown`, `has_add_permission`/`has_delete_permission` → False, `changelist_view` calls `sync_countries()` first, `save_model` stamps `changed_at`/`changed_by` when `shown` changed. `verbose_name_plural = "Countries shown on the dashboard"`; a changelist help line: "Switching a country off hides it from the dashboard and its public API at the next page load. Nothing is deleted; switch it back on to restore it."
- [ ] **Step 5: Run** the tests → PASS. Then `manage.py migrate` and `manage.py sync_countries` against the live DB → prints 9; `docker compose restart web`.
- [ ] **Step 6: Commit** `feat(dashboard): country visibility switch in Admin`

---

### Task 2: Scrubbers — one per data file

**Files:**
- Create: `dashboard/scrubbers.py`
- Test: `dashboard/tests/test_scrubbers.py`

**Interfaces:**
- Consumes: `Hidden`, `iso3_for_pcode` (Task 1); `data_pipeline.common.load_gazetteer()`.
- Produces:
  - `Scrubber = Callable[[Any, Hidden], Any]` — takes parsed JSON, returns parsed JSON; never mutates its input (the Task 3 cache holds originals).
  - `WHOLE_FILE = object()` — sentinel a scrubber returns to mean "this file belongs to a hidden country: 404".
  - `REGISTRY: list[tuple[str, Scrubber]]` — `fnmatch` patterns relative to `DASHBOARD_DATA_DIR`, posix separators, first match wins.
  - `scrubber_for(relpath: str) -> Scrubber | None`.
  - `corridor_countries(cid: str) -> set[str]` — country names on either end; slugs from the gazetteer's `country_for_corridor` values (`"sudan-car"` → slug `car` → "Central African Republic"), id split on `-` and the parts `sudan`, `return`, `influx` ignored. `"south_sudan-sudan-influx"` → `{"South Sudan"}`.
  - `country_at(lon, lat) -> str | None` — shapely point-in-polygon against `DASHBOARD_DATA_DIR/boundaries/admin0.geojson` (`name` property), shapes loaded once per process (the same shapes `countryAt()` uses in app.js).

Registry, in this order (the spec's table is the authority for each rule):

| Pattern | Rule |
|---|---|
| `boundaries/admin0.geojson`, `boundaries/admin1.geojson`, `boundaries/admin1_lines.geojson`, `boundaries/areas.geojson`, `hsps.geojson` | drop features where `hides(props.iso3)` |
| `boundaries/aoi.geojson` | drop features whose `name` maps to a hidden iso3 via `AdminArea.objects.filter(level__isnull=True, name=…)` |
| `aoi_ipc.geojson` | drop where `hides(props.ipc_country)` |
| `ipc_fs/*.geojson`, `ipc_areas_fs.geojson` | `WHOLE_FILE` if `hides(data["_meta"]["iso3"])`, else unchanged |
| `tag_areas.json` | drop keys whose value's `iso3` is hidden |
| `seasonal.json` | drop `countries` keys that are hidden |
| `refugee_camps.json` | filter `countries[]` and `camps[]` by `country` |
| `unhcr_asylum.json` | filter `countries[]` by `country` |
| `crossings.json` | filter `points[]` by `country` |
| `flows.json` | drop corridor ids where any of `corridor_countries(cid)` is hidden |
| `documents.json` | drop rows where `hides(row["country"])` |
| `tags.json` | per dimension/tag: filter `monthly[]` by `country`; drop hidden keys inside each `snippets[month]` |
| `hazard_events.json` | filter every `by_sub.*.monthly[]` by `country`; drop `events` keys where `iso3_for_pcode(key)` is hidden |
| `events.json` | drop events where `lon`/`lat` both set and `hides(country_at(lon, lat))` |
| `idp_localities.json`, `idp_states.json`, `returnee_localities.json`, `headline.json`, `meta.json`, `hazards.json`, `water.geojson` | identity |

- [ ] **Step 1: Write failing tests**, one per rule, each fixture carrying one hidden-country item and one Chad item and asserting only the hidden one goes, plus:
  - `test_scrubbers_do_not_mutate_input` — deep-copy before, compare after, for `flows`, `tags`, `hazard_events`.
  - `test_corridor_countries_shapes` — `sudan-car` → `{"Central African Republic"}`, `libya-sudan-return` → `{"Libya"}`, `south_sudan-sudan-influx` and `sudan-south_sudan` → `{"South Sudan"}`.
  - `test_events_without_coordinates_stay` and `test_event_outside_every_polygon_stays`.
  - `test_text_is_not_edited` — an `events.json` row in Chad whose description says "Libya" survives with its description byte-equal.
  - `test_ipc_fs_hidden_country_is_whole_file` — `_meta.iso3 = "CAF"` with CAF hidden → `WHOLE_FILE`; `TCD` → unchanged.
  - `test_registry_patterns_are_reachable` — every pattern in `REGISTRY` matches at least one sample path (guards typos).
  Fixtures use `Hidden(frozenset({"LBY","CAF"}), frozenset({"Libya","Central African Republic"}))` directly; `country_at` and `iso3_for_pcode` tests create the `AdminArea` rows / use a temp `DASHBOARD_DATA_DIR` via `override_settings` with a two-square `admin0.geojson`.
- [ ] **Step 2: Run** `manage.py test dashboard.tests.test_scrubbers -v 2` → FAIL.
- [ ] **Step 3: Implement** `dashboard/scrubbers.py` to the table above.
- [ ] **Step 4: Run** → PASS.
- [ ] **Step 5: Commit** `feat(dashboard): per-file scrubbers for hidden countries`

---

### Task 3: The gate in `data_file()`

**Files:**
- Modify: `dashboard/views.py` (`data_file`)
- Test: `dashboard/tests/test_gate.py`

**Interfaces:**
- Consumes: `hidden_countries()`, `scrubber_for()`, `WHOLE_FILE`.
- Produces: unchanged URL `/data/<path>`; behaviour below.

Behaviour: resolve and path-check exactly as today. If `not hidden`: stream the file exactly as today. Else: `scrubber_for(relpath)`; `None` → 404 (fail-closed); otherwise parse JSON, scrub, `WHOLE_FILE` → 404, else `JsonResponse(result, safe=False)` with the same `content_type` the file would have had and `Cache-Control: no-store`. Cache the serialized scrubbed body in a small module-level dict keyed `(relpath, file mtime_ns, hidden.key())` (keep the last ~32 entries).

- [ ] **Step 1: Write failing tests** (temp `DASHBOARD_DATA_DIR` via `override_settings`):
  - `test_nothing_hidden_serves_file_bytes_unchanged` — body equals file bytes.
  - `test_hidden_country_rows_removed_from_flows` — LBY off → `sudan-libya` absent, `sudan-chad` present.
  - `test_unregistered_file_refused_while_hidden` — `data/new_layer.json` → 404 with LBY off, 200 with all on.
  - `test_whole_country_file_404` — `ipc_fs/CAF.geojson` with CAF off → 404.
  - `test_switch_back_on_restores_without_rebuild` — off then on → byte-identical to file.
  - `test_cache_invalidates_on_switch_and_on_file_change` — same path served under two hidden sets, and after rewriting the file, each returns the right body.
  - `test_every_file_in_data_dir_has_a_scrubber` — walks the **real** `settings.DASHBOARD_DATA_DIR` (read-only; never writes or deletes) and asserts `scrubber_for()` is not None for every file.
- [ ] **Step 2: Run** `manage.py test dashboard.tests.test_gate -v 2` → FAIL.
- [ ] **Step 3: Implement** as described.
- [ ] **Step 4: Run** → PASS.
- [ ] **Step 5: Commit** `feat(dashboard): data files pass through the visibility gate`

---

### Task 4: The public APIs

**Files:**
- Modify: `insights/views.py`, `data_track/views.py`, `external_data/views.py`, `boundaries/views.py`
- Create: `dashboard/gated.py`
- Test: `dashboard/tests/test_api_gate.py`

**Interfaces:**
- Consumes: `hidden_countries()`, `corridor_countries()`, `country_at()`.
- Produces: `dashboard.gated.REGIONAL: set[str]` — URL names that pass through by decision: `{"api-index", "api-meta", "api-headline", "external-index", "external-sync"}` (`external-sync` only after confirming its rows carry no country figures; if they do, gate it instead).

Per view (exclude at the queryset where possible, so `count`/`limit` stay honest):
- `insights-list`: `.exclude(iso3__in=hidden.iso3)`; movement legs untouched.
- `api-documents`: exclude `country_focus__in=hidden.names`. `api-events`: drop rows by `country_at`. `api-flows`: skip corridors via `corridor_countries`. `api-figures`: exclude `country__in=hidden.names`. `api-tags`: exclude `country__in=hidden.names`.
- `external-seasonal`, `external-food-security`, `external-movement`, `external-hsps`, `external-crossings`: exclude `iso3__in=hidden.iso3`. `external-insights`: exclude `country__in=hidden.names`.
- `boundary-layers`: drop rows whose iso3 is hidden. `boundary-layer`: add `iso3 <> ALL(%s)`; an explicit `?iso3=LBY` while hidden → 404. `boundary-features`: add `iso3 <> ALL(%s)` to the clause. **`_library_etag(...)` gets `hidden.key()` as an extra part** in both.

- [ ] **Step 1: Write failing tests:**
  - One test per gated view: a hidden-country row and a Chad row in the DB, LBY/CAF off → only Chad in the body.
  - `test_insight_in_shown_country_keeps_movement_into_hidden_one` — SDN statement with a destination leg `iso3="LBY"` is returned with that leg intact.
  - `test_boundary_etag_changes_with_switch` — same request before and after hiding LBY yields different ETags; a stale `If-None-Match` gets 200, not 304.
  - `test_every_api_url_is_gated_or_regional` — iterate `get_resolver()` patterns under `api/`; every URL name is either in `REGIONAL` or covered by a test in this module (keep a `GATED` set alongside `REGIONAL` in `gated.py` and assert `REGIONAL | GATED` equals the set of `api/` URL names).
- [ ] **Step 2: Run** `manage.py test dashboard.tests.test_api_gate -v 2` → FAIL.
- [ ] **Step 3: Implement** the per-view exclusions and `gated.py`.
- [ ] **Step 4: Run** the new tests **and** the full suites of the touched apps: `manage.py test insights data_track external_data boundaries dashboard -v 2` → PASS (nothing hidden in existing tests, so they must be unaffected).
- [ ] **Step 5: Commit** `feat: public APIs respect the country visibility switch`

---

### Task 5: The page takes its country list from the server

**Files:**
- Modify: `dashboard/views.py` (`index`), `dashboard/templates/dashboard/index.html`, `dashboard/static/dashboard/js/app.js:52-53` (`COUNTRIES`), `app.js:3218` (`IPC_COUNTRIES`)
- Test: `dashboard/tests/test_gate.py` (add)

**Interfaces:**
- Consumes: `hidden_countries()`.
- Produces: `index()` context `shown_countries: list[str]` = the current eight in today's order (`["Sudan", "Central African Republic", "Chad", "Egypt", "Ethiopia", "Libya", "South Sudan", "Uganda"]`, held as `DASHBOARD_COUNTRIES` in `dashboard/views.py`) minus hidden names; rendered with `{{ shown_countries|json_script:"shown-countries" }}`. `app.js`: `const COUNTRIES = JSON.parse(document.getElementById("shown-countries").textContent);` and `IPC_COUNTRIES` filtered to ISO3s of `COUNTRIES`.

- [ ] **Step 1: Write failing tests:** `test_index_lists_only_shown_countries` (LBY off → `"Libya"` absent from the `shown-countries` script, `"Chad"` present, order preserved) and `test_app_js_has_no_hardcoded_picker_list` (source text of app.js no longer contains `const COUNTRIES = ["Sudan"`).
- [ ] **Step 2: Run** → FAIL.
- [ ] **Step 3: Implement.** Use the Edit tool for app.js (see memory note on large JS edits).
- [ ] **Step 4: Run** `manage.py test dashboard -v 2` → PASS; `docker compose restart web`.
- [ ] **Step 5: Commit** `feat(dashboard): picker offers only shown countries`

---

### Task 6: End-to-end verification and docs

**Files:**
- Test: `dashboard/tests/test_no_leak.py`
- Modify: `CLAUDE.md` (repo root, "Things worth knowing"), Obsidian project note

- [ ] **Step 1: Write the leak test** `test_no_structured_field_names_a_hidden_country`: with LBY and CAF off, GET every file under the real `DASHBOARD_DATA_DIR` through `/data/` and every `api/` URL (GET, default params), walk each JSON body recursively and assert no value under the keys `country`, `iso3`, `ipc_country`, `country_focus`, no `seasonal.countries` key, no `flows` corridor id, and no p-code key resolving via `iso3_for_pcode` names a hidden country — except `movements[].origin/destination.iso3` inside insights results (allowed by decision). Prose keys are not inspected. Then switch both on and assert every `/data/` body equals its file bytes.
- [ ] **Step 2: Run** `manage.py test dashboard.tests.test_no_leak -v 2` → PASS (fix the owning task's scrubber if not).
- [ ] **Step 3: Browser check** (Selenium per memory notes; restart `web` first): in Admin switch Libya and CAR off → dashboard has no Libya/CAR picker entry, outline, corridor, camp, HSP, AOI, statement or seasonal panel; DevTools network bodies show none. Switch back on → all return after refresh. Leave both **off** only if George asks; otherwise leave them as George set them.
- [ ] **Step 4: Docs** — add a CLAUDE.md paragraph: the switch lives in `country_visibility`, no pipeline writes it, `data_file()` is fail-closed while anything is hidden, and a new data file needs a `dashboard/scrubbers.py` entry (and a new `/api/` view needs `dashboard/gated.py`). Update the Obsidian project note (feature + decision + session log line).
- [ ] **Step 5: Commit** `test+docs: country visibility leak check and notes`
