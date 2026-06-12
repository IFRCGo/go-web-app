# Malawi Risk Watch — Assumptions, Placeholders & Open Questions

Everything the implementation **assumes**, **hard-codes as a placeholder**, or **works around**, with where it
lives, the basis (`verified` / `inferred` / `placeholder` / `workaround`), and the risk if it's wrong. Verified
against the code on branch `project/malawi-risk-watch`. Paths under `app/src/components/domain/` unless noted.

**Legend:** 🔴 correctness-critical · 🟠 placeholder to replace before prod · 🟡 dev-only workaround · 🟢 verified, low risk

---

## 🔴 A1 — `band_5` unit: flood depth vs people affected
**`inferred`.** The UI presents `band5Mean/Median/P75/P90/Max` as **flood depth in metres**: the EventDetails
heading is "Forecast flood depth (m)", the InfoPopup says "flood depth (in metres) across the 51 ensemble members",
and `LeadTimeChart` tooltips suffix values with ` m`. The backend **contradicts itself**: `docs/data-pipeline.md`
and `docs/project-overview.md` call `band_5` "flood depth", **but** `create_dummy_data.py:58-68` comments the
samples are *"people affected; always whole numbers in 100s/1000s"* (values 100…18000). The **real data** observed
in the running app (≈0.4–4.2) matches *depth in metres*, so the dummy generator appears to be the outlier — but this
is unconfirmed.
- *Where:* `Jba/EventDetails/index.tsx` (heading/InfoPopup), `Jba/EventDetails/LeadTimeChart/index.tsx` (tooltip `m`); backend `create_dummy_data.py:58-68`.
- *Risk:* If `band_5` is a population/impact count, **every JBA figure, the "(m)" labelling, the fan-chart axis, and the threshold semantics are wrong by orders of magnitude.** **Action: confirm with JBA/MRCS data owners.**

## 🟠 A2 — `JBA_IMPACT_THRESHOLD = 0.5` is a placeholder
**`placeholder`.** Gates which districts get a marker (`band5Mean >= 0.5`) and draws the dashed threshold line.
The constants file header says these are TODO placeholders "intentionally loose for demos, pending MRCS/JBA confirmation".
- *Where:* `malawi/constants.ts:6`; used `Jba/index.tsx` (events filter), `LeadTimeChart/index.tsx` (threshold line).
- *Risk:* Arbitrary cutoff. If `band_5` is population, `0.5` admits virtually every nonzero district (no real filtering); if depth, `0.5 m` is meaningful but unvalidated. The on-map event set is **not** a validated trigger.

## 🟠 A3 — `ARC_IMPACT_THRESHOLD = 0.5` is a placeholder, not the real trigger
**`placeholder`.** Filters ARC observations (`impact >= 0.5`) and is shown as "Applied threshold". The **real**
backend trigger is `cell_trigger` on `rainfall >= 25.4 mm`; dummy `impact = round(rainfall*42)` lands in the hundreds.
- *Where:* `malawi/constants.ts:7`; `Arc/index.tsx`, `Arc/EventDetails/index.tsx`; backend `create_dummy_data.py:224,231`.
- *Risk:* `impact >= 0.5` admits essentially every nonzero observation, so the ARC list is effectively unfiltered and does **not** match the parametric trigger. Users may read it as the real trigger condition.

## 🟠 A4 — Choropleth tileset `go-admin2-${iso3}-staging`
**`placeholder`.** HDX choropleth fill/outline bind to Mapbox `mapbox://go-ifrc.go-admin2-${iso3}-staging` and
source-layer `go-admin2-${iso3}-staging`, joining HDX `ADM2_PCODE` → tileset feature `code`. Two `// FIXME: update
layer name` comments flag the `-staging` tileset as placeholder.
- *Where:* `RiskImminentEventMap/index.tsx` (fill/outline/source), `hdxLayers.ts`.
- *Risk:* Choropleths render blank wherever the staging tileset is absent; the `ADM2_PCODE == code` join is unverified for MWI.

## 🟢 A5 — Per-layer opacity control (was: hard-coded `0.4`) — RESOLVED
**Resolved.** Each active layer now carries its own `opacity` (0–100, default 80) set via the `OpacitySlider`
in the layers panel; choropleth `fill-opacity` and bubble `circle-opacity`/`circle-stroke-opacity` read
`selection.opacity / 100`. The hard-coded `0.4` is gone (see [ADR 0002 → Update](./adr/0002-hdx-layer-multiselect.md)).
- *Where:* `RiskImminentEventMap/index.tsx`, `RiskImminentEventMap/LayersPanel/`.
- *Residual:* the outline still uses a fixed `line-opacity 0.3`; overlapping stacked layers can still blend.

## 🟠 A6 — RP100 is the hard-coded return period for exposure
**`inferred`.** The HDX `flood_exposure` dataset has RP **10/50/100/500**-year columns (30 cm). The frontend hard-codes
only the **RP100** columns, both in `useJbaFloodExposure` and the `hdxLayers` recipe ("Flood exposure (RP100)").
- *Where:* `Jba/useJbaFloodExposure.ts`, `hdxLayers.ts`.
- *Risk:* RP100 is an unexplained default; 10/50/500 are never surfaced. If RP100 column names change, exposure silently becomes empty (`toNumber` → null).

## 🟡 A7 — `/malawi-media` dev proxy for the JBA COG (CORS)
**`workaround`.** The backend returns relative `/media/jba/tiff/…` URLs with no CORS headers, so the frontend rewrites
`/media/` → `/malawi-media/` and relies on **Vite's dev proxy** to forward it same-origin. `JbaCogRasterLayer` fetches
via `geotiff.fromUrl`.
- *Where:* `Jba/index.tsx` (rewrite), `app/vite.config.ts` (proxy), `JbaCogRasterLayer/index.tsx`.
- *Risk:* **Dev-only.** Production has no `/malawi-media` proxy, so the COG overlay silently fails to decode (caught + warned) unless the backend serves CORS-correct/absolute media URLs.

## 🟡 A8 — Many Malawi strings are hard-coded (i18n not wired)
**`workaround`.** Source labels `JBA`/`ARC`, `Layers`, the lead-time label, all EventDetails/IngestionRunInfo labels,
chart tooltips, and "Create early warning report" are hard-coded with `// FIXME: use strings`.
- *Where:* `RiskImminentEvents/index.tsx`, `Jba/*`, `RiskImminentEventMap/index.tsx`.
- *Risk:* English-only; not picked up by translation tooling. Per the team's note, the i18n-usage eslint rule scans only the co-located `index.tsx` for `strings.*`, so these FIXMEs are invisible to it because no keys exist yet.

## 🟡 A9 — HDX CSVs fetched client-side directly from HEIGIT storage
**`inferred`.** `useHdxLayers` and `useJbaFloodExposure` download HDX CSVs in the browser via `Papa.parse(hdxUrl,
{download:true})`; `hdxUrl` points at `hot.storage.heigit.org/.../mwi/MWI_ADM2_*.csv` — **not** routed through the
`/malawi-media` proxy.
- *Risk:* Works only if HEIGIT serves permissive CORS. If `hdx_url` ever pointed at backend-stored media, it would hit the same CORS issue the COG proxy solves. (Backend loader docstring calls the field `file_blob_url` but the model field is `hdx_url` — stale comment.)

## 🟡 A10 — Queries fetch up to 9999 rows; "latest" = row[0]
**`inferred`.** `JbaForecastImpacts`, `JbaIngestionRuns`, `ArcRainfallObservations`, `HdxDatasets` all request
`pagination {limit: 9999}` and do **all** date/lead-time/threshold filtering client-side, assuming the latest
issue/observation date is `results[0]` (ordered DESC).
- *Risk:* `9999` is a magic upper bound (~320 rows/run/day could approach it over time). If row count exceeds it, "latest" detection and timelines silently truncate.

## 🟠 A11 — `DISASTER_FLOOD_ID = 12` (GO DType "Flood")
**`inferred`.** Used as `dtype` when seeding a GO field/early-warning report from a JBA/ARC event. Comment claims it
matches the GO REST DType "Flood"; both sources are treated flood-only.
- *Where:* `malawi/constants.ts:14-16`; `Jba/EventDetails`, `Arc/EventDetails`.
- *Risk:* Not verified against the live GO disaster-type table; a wrong id mislabels prefilled reports.

## 🟡 A12 — `runDate == forecastIssueDate` (ingestion-run ↔ impacts join)
**`inferred`.** The active run is matched to impacts by string-comparing `run.runDate === impact.forecastIssueDate`
(no FK exists). Dummy data sets `run_date = issue_date`, so it holds in dev.
- *Where:* `Jba/index.tsx`; backend `create_dummy_data.py:159-197`.
- *Risk:* If real ingestion runs on a different calendar date than the forecast issue date, the default run shows no data and rows may map to the wrong run. Mitigated by the `activeIssueDate` fallback to the latest impact issue date.

## 🟢 A13 — RP100 flood-exposure is static context, NOT forecast-matched
**`verified`.** `useJbaFloodExposure` attaches RP100/30 cm exposed population (under-15, elderly, female, under-5) to
JBA events. The EventDetails InfoPopup states explicitly it is static context, **not** matched to the forecast's
depth/lead time, and the subgroups **overlap (non-additive)**.
- *Risk:* Users may read it as the forecast's predicted impact. RP100/30 cm is one fixed scenario; pairing it with an arbitrary lead time/depth can over/under-state exposure. Enforced by labelling only, not by data.

## 🟢 A14 — `leadTimeDays` is a derived (resolver) field, not a DB column
**`verified`.** Backend computes it as `forecast_target_date − forecast_issue_date`; there is no column/order field.
- *Risk:* Cannot filter/order on it server-side, hence the client fetches up to 9999 rows and filters in memory; assumes target−issue is always a whole number of days.

## 🟢 A15 — "51 ensemble members" is hard-coded in the UI
**`verified`.** EventDetails shows "X of 51"; the backend stores only `ensembles_nonzero_count` (raw 51 not retained).
Consistent with backend docs and dummy `randint(0,51)`.
- *Risk:* If JBA changes ensemble size, the `/51` denominator becomes silently wrong.

## 🟢 A16 — JBA lead times `1..10`, default `3`
**`verified`.** `JBA_LEAD_TIME_DAYS = [1..10]`, `JBA_DEFAULT_LEAD_TIME_DAYS = 3`; 10 lead days confirmed by backend docs.
- *Risk:* The default of 3 is an unexplained UX choice; if a run lacks lead day 3, the initial view shows no markers until the slider moves.

## 🟢 A17 — `pcode` join (forecast adminArea ↔ HDX `ADM2_PCODE`)
**`verified`.** Exposure joined by `adminAreaPcode` against CSV `ADM2_PCODE`; `AdminArea.pcode` (e.g. `MW101`) is the
documented HDX/ARC join key.
- *Risk:* Relies on exact string equality; any leading-zero/format mismatch yields silently missing exposure (absent section).

## 🟢 A18 — `ifrcId` join to GO `/api/v2/admin2/`
**`verified`.** Both sources drop rows with null `adminArea.ifrcId` (warn), then fetch GO admin2 by `id__in=ifrcIds`
for `centroid`/`bbox`/`district_*`.
- *Risk:* Admin areas with null `ifrc_id` (backend says HDX levels 3–4) are silently dropped from the map; marker placement depends on GO returning a Point centroid.

## 🟢 A19 — COG raster normalisation is per-image and relative
**`inferred`.** `JbaCogRasterLayer` normalises each TIFF's band-0 nonzero pixels to its **own** min/max, maps to a
light-blue→red ramp (`alpha = 110 + 145·t`), `v<=0` transparent, ~512² overview, 4× upscale, nearest resampling.
- *Risk:* Colours are **not** comparable across lead times/runs (relative, not absolute), and there is **no raster legend** or physical-value readout. Alpha floor and upscale are eyeballed magic numbers.

## 🟢 A20 — HDX choropleth binning is 5-bin quantile, client-side; `percent` assumes 0–100
**`inferred`.** `useHdxLayers` computes 5-bin quantile breakpoints per metric (with a uniform-metric collapse to a
single swatch). `'percent'`-format metrics assume the source is already 0–100.
- *Risk:* Bins are dataset-relative, so legends differ per metric/area set; if a `*_pct` column is actually 0–1, labels ("0%") and colours are wrong.

---

## Cross-cutting notes
- **`Under-5` exposure** uses CSV column `RP100_children_u5_30cm`, which exists in the live CSV but is **not** in the
  `hdxLayers.ts` flood-exposure recipe — so it's surfaced in the detail panel but not as a toggleable layer.
- **Heading inconsistency:** JBA dropped its `(issued …)` heading suffix in favour of the run selector, but ARC still
  appends `(observed <date>)`.
- **Chart needs ≥2 timeline points** to draw the uncertainty fan (`buildBandPath` returns undefined below 2).
- **Cosmetic:** the fan band bridges straight across any interior lead-day with a null percentile, while the mean line
  breaks at it — only visible if percentile columns are sparsely populated.
