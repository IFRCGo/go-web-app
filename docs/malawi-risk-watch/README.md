# Malawi Risk Watch — Imminent Events

How the Malawi-specific flood early-warning experience is built inside the GO web app's
**Imminent Events** panel, the data it consumes, and the decisions/assumptions behind it.

> **Status:** active development on branch `project/malawi-risk-watch`. Much of this is wired against
> a **staging tileset, dev-only media proxy, and placeholder thresholds** — see
> [`assumptions.md`](./assumptions.md) before relying on any figure. Read
> [`figures.md`](./figures.md) for what every number means and its unit.

## Contents
- [`assumptions.md`](./assumptions.md) — every assumption, placeholder, magic number, and workaround, with risk + status.
- [`figures.md`](./figures.md) — glossary of every figure/metric shown, its meaning, unit, source, and caveats.
- [`adr/`](./adr/) — Architecture Decision Records (one per major decision).

## ⚠️ The single most important open question
`band_5` (the JBA forecast quantity behind Mean/Median/P75/P90/Max) is **labelled in the UI as
"Forecast flood depth (m)"**, but the backend is self-contradictory about what it is — the docs say
"flood depth" while the dummy-data generator says "people affected". This must be confirmed with the
JBA data owners; if it is a population/impact count, the depth labelling and the `m` units are wrong by
orders of magnitude. See [`assumptions.md` → A1](./assumptions.md#a1--band_5-unit-flood-depth-vs-people-affected).

## What this feature is
For Malawi (`iso3 === 'MWI'`) the Imminent Events panel gains two extra sources backed by the
**Malawi Risk Watch GraphQL API** (separate from the GO REST/risk APIs):

- **JBA** — probabilistic flood-**forecast** ensemble statistics, per district, for lead times **1–10 days**.
- **ARC** — parametric **rainfall observations**, per district, for the latest observation date.

Both are **flood-only** (`hazardTypeSelector` always returns `'FL'`) and both can seed a GO field /
early-warning report (`dtype = DISASTER_FLOOD_ID = 12`). They render through the same shared
`RiskImminentEventMap` (map + side panel) used by the global sources (GDACS/PDC/WfpAdam/MeteoSwiss),
plus Malawi-only **HDX context choropleth layers**.

## Component map
All paths under `app/src/components/domain/`.

| Component | Path | Role |
|---|---|---|
| Parent view | `views/CountryProfileRiskWatch/` | Renders `<RiskImminentEvents variant="country" iso3 .../>`; the only place that drives the Malawi case. |
| Orchestrator | `RiskImminentEvents/index.tsx` | `isMalawi` gate, source radios (JBA/ARC only for Malawi), default source `'jba'`; owns lifted state (`activeView`, `activeHdxOptionKeys`, `activeLeadTimeDays`). |
| Shared constants | `RiskImminentEvents/malawi/constants.ts` | `JBA_IMPACT_THRESHOLD`, `ARC_IMPACT_THRESHOLD`, `JBA_LEAD_TIME_DAYS`, `JBA_DEFAULT_LEAD_TIME_DAYS`, `DISASTER_FLOOD_ID` (all placeholders/TODO). |
| JBA source | `RiskImminentEvents/Jba/index.tsx` | 3 GraphQL queries + admin2 REST + exposure hook; run/lead-time selection; markers + per-admin timelines; COG url rewrite. |
| └ ingestion-run select | `Jba/IngestionRunFilter/` | `SelectInput` of runs (header), `IngestionRunInfo` popup as its `actions`. |
| └ lead-time slider | `Jba/LeadTimeFilter/` | Custom 1–10 numbered slider (design handoff "B2"), bound to `activeLeadTimeDays`. |
| └ exposure hook | `Jba/useJbaFloodExposure.ts` | Parses HDX `MWI_ADM2_flood_exposure` CSV → `Map<pcode, {popU15,elderly,female,childrenU5}>` (RP100, 30 cm). |
| └ detail + chart | `Jba/EventDetails/` (+ `LeadTimeChart/`) | Depth figures + InfoPopup, uncertainty fan, exposed-population, ensembles count, field-report link. |
| ARC source | `RiskImminentEvents/Arc/` (+ `EventListItem/`, `EventDetails/`) | 1 GraphQL query + admin2 REST; latest-observation markers; rainfall/impact/RP/cellTrigger detail. |
| Shared map | `RiskImminentEventMap/index.tsx` | Generic map + side panel: markers, footprint, HDX choropleths, COG raster, layer dropdown, legend, event list. |
| └ HDX layers | `RiskImminentEventMap/{useHdxLayers.ts, hdxLayers.ts}` | Recipe table + grouped multi-select + CSV parse + 5-bin quantile choropleth. |
| └ COG raster | `RiskImminentEventMap/JbaCogRasterLayer/` | Client-side GeoTIFF decode → Mapbox image source. |
| GraphQL client | `utils/graphql/index.ts` | Single urql client → `malawiRiskWatchGraphqlApi`; provided app-wide in `App/index.tsx`. |
| Backend (read-only) | `malawi-risk-watch-backend/` (submodule) | Source schema + `docs/`. `apps/pipeline/models.py`, `apps/admin_areas/models.py`. |

## Data flow

**JBA**
1. **Fetch** — `JbaForecastImpacts` (all rows, `forecastIssueDate DESC`, `limit 9999`), `JbaIngestionRuns`
   (`runDate DESC`), lazily `JbaForecastFile(id)` for the active lead time, and (via `useJbaFloodExposure`,
   reusing the shared `HdxDatasets` query) the `MWI_ADM2_flood_exposure` CSV.
2. **Select run** — `activeRun` = explicitly selected run, else the run whose `runDate` matches the latest
   impact issue date (fallback: newest run, then the latest impact issue date). `activeIssueDate` drives row selection.
3. **Transform** — keep impact rows where `forecastIssueDate === activeIssueDate`, `band5Mean` present,
   and `adminArea.ifrcId` present (null-`ifrcId` rows dropped with a `console.warn`). `GET /api/v2/admin2/?id__in=…`
   enriches each row with `centroid` (marker), `bbox` (footprint), `district_id`/`district_name`.
4. **Markers + timeline** — `timelineByAdmin` groups all 10 lead-time rows per admin; `events` = rows at
   `activeLeadTimeDays` with `band5Mean >= JBA_IMPACT_THRESHOLD`, each joined to flood exposure by `adminAreaPcode`.
5. **COG** — `activeForecastFileId` → `JbaForecastFile` → `tiff.url`; rewrite leading `/media/` → `/malawi-media/`
   (dev proxy). On "Show forecast raster", `JbaCogRasterLayer` decodes the COG with `geotiff` and overlays it.
6. **Render** — `RiskImminentEventMap` (source `'jba'`) draws markers, footprint, HDX choropleths, optional COG,
   the side-panel list, and on expand `EventDetails` (fed `activeTimeline` for the chart).

**ARC** — `ArcRainfallObservations` (latest `observationDate`, `impact >= ARC_IMPACT_THRESHOLD`) → admin2 REST
enrich → markers + bbox footprint. No lead-time / ingestion-run / COG concepts.

**HDX overlay (shared, Malawi-only)** — when `showLayerSelection`, `useHdxLayers` runs `HdxDatasets`, intersects
returned dataset names with the recipe table, and on toggling a metric parses that dataset's CSV (cached by URL),
computes a 5-bin quantile choropleth (`pcode → colour`), and paints stacked admin-2 fills (`fill-opacity 0.4`,
selection order) on the `go-admin2-${iso3}-staging` vector tileset (`ADM2_PCODE` → feature `code`). Selected layer
keys persist across JBA↔ARC because they are lifted to `RiskImminentEvents`.

## State model
- **`RiskImminentEvents`** owns `activeView`, `activeHdxOptionKeys` (reset to `[]` when leaving jba/arc),
  `activeLeadTimeDays` (init `3`) — passed to both Jba and Arc.
- **`Jba`** owns `selectedRunId` and `activeTimeline` (active admin's 10-lead-time series, passed up as
  `activeEventExposure`).
- **`Arc`** owns `activeIfrcId` (active admin, used by `footprintSelector`).
- **`RiskImminentEventMap`** owns map UI state: `activeEventId`, `layerOptions` (TC-only), `showRaster`/`rasterOpacity`
  (JBA COG), debounced `bounds`.
- **Caches:** `useHdxLayers.csvByUrl` (parsed CSVs, never evicted), `useJbaFloodExposure.exposureByPcode`,
  `JbaCogRasterLayer` decoded image per `cogUrl`.

## External dependencies / endpoints
- **Malawi GraphQL API** — `malawiRiskWatchGraphqlApi` (`.env`: `http://localhost:3000/malawi-graphql`, Vite-proxied
  to backend `/graphql/`). Codegen schema: `malawi-risk-watch-backend/schema.graphql`. Ops: `JbaForecastImpacts`,
  `JbaIngestionRuns`, `JbaForecastFile`, `ArcRainfallObservations`, `HdxDatasets` (shared by `useHdxLayers` and
  `useJbaFloodExposure`).
- **GO REST** — `GET /api/v2/admin2/?id__in=…` (centroid/bbox/district), and in the parent view
  `/api/v1/country-imminent-counts/` (default-source resolution).
- **HDX CSVs** — downloaded **directly in the browser** from `hot.storage.heigit.org/.../mwi/MWI_ADM2_*.csv`
  (not via the media proxy; relies on HEIGIT CORS).
- **Mapbox** — vector tiles `mapbox://go-ifrc.go-admin2-${iso3}-staging` (⚠ staging).
- **Backend media** — JBA COG TIFFs at `/media/jba/tiff/…` (dev: `/malawi-media/` proxy; ⚠ no prod equivalent yet).

## Known gaps / follow-ups (see ADRs + assumptions)
- Confirm `band_5` semantics + unit (A1) — blocks correctness of the depth UI.
- Replace placeholder thresholds (A2/A3) and the `-staging` tileset (A12).
- Production media access for the COG (no `/malawi-media` proxy outside dev).
- Wire i18n for the hard-coded Malawi strings (`// FIXME: use strings`).
- HDX layer panel: per-layer opacity/representation controls and "Local units" group from the handoff are unbuilt.
