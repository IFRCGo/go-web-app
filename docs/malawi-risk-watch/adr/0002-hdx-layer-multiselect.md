# ADR 0002 — HDX context layers: grouped multi-select Switch → stacked choropleths

**Status:** implemented — see the **Update** below (the searchable/collapsible panel with per-layer
opacity + Choropleth/Bubble representation has since shipped; only the point-layer groups remain deferred)

## Context
Malawi needs HDX reference datasets (flood exposure, vulnerability, facilities, access, demographics, rural
population) shown as background context over the JBA/ARC maps. The earlier design allowed **one** HDX layer at a time
(singular `activeHdxOptionKey` + `RadioInput`). Users needed to compare several context metrics together.

## Decision
- Convert to multi-select: `activeHdxOptionKeys: string[]`, lifted into `RiskImminentEvents` so selection persists
  across JBA↔ARC and resets to `[]` when leaving jba/arc.
- The selector is a `DropdownMenu` ("Layers (n)") containing one `Container` per HDX **dataset group**, each holding a
  `Switch` per metric. Recipes/grouping live in `hdxLayers.ts`; CSV fetch/parse, 5-bin quantile binning, and
  `pcode → colour` resolution live in `useHdxLayers.ts`.
- Each active layer renders as a separate admin-2 fill `MapLayer` at `fill-opacity: 0.4`, stacked in selection order
  over `go-admin2-${iso3}-staging`, with a shared semi-transparent outline.
- One `StepGradientBar` legend block per active layer; bin labels use `formatNumber({ compact: true })` for counts or
  `n%` for percent metrics. A degenerate uniform metric (e.g. all-zero `hospitals_count`) collapses to a single swatch.

## Alternatives
- The kept-but-superseded single-select `RadioInput`.
- The richer per-layer controls in `design_handoff_layers_panel` (Direction 1): per-layer representation toggle
  (Choropleth | Bubble), per-layer **opacity slider** (default 80%), searchable/collapsible panel, layer reordering,
  and a "Local units" point-layer group — **not built**. Opacity is hard-coded to `0.4` (`// FIXME: expose…`).

## Consequences
- Multiple layers can stack, but at fixed 0.4 opacity overlapping fills can read ambiguously and the legend stops
  matching on-map colour. No user opacity/representation control yet.
- Parsed CSVs cached by URL, never evicted (bounded by the recipe table). Unknown HDX datasets silently skipped.
- Quantile bins are dataset-relative (recomputed client-side per metric). Bubble representation and "Local units"
  remain unbuilt → this ADR is **partial** (see the active task to update the panel to the handoff).

## Files
`RiskImminentEventMap/index.tsx`, `hdxLayers.ts`, `useHdxLayers.ts`,
`RiskImminentEvents/index.tsx`, `design_handoff_layers_panel/README.md`.

## Update — panel redesign shipped (design_handoff_layers_panel "Tidy" / D1)
The deferred per-layer controls have since been built:
- **New `LayersPanel`** (`RiskImminentEventMap/LayersPanel/`): searchable (`TextInput`), collapsible
  groups with red count badges, an "N active · Clear all" bar. Decomposed into `LayerGroup` +
  `LayerControls` + a custom `OpacitySlider` (GO ships no slider) reusing `DropdownMenu`/`Switch`/`SegmentInput`.
- **State model** changed from `activeHdxOptionKeys: string[]` to
  **`HdxLayerSelection[]`** (`{ key, representation: 'choropleth' | 'bubble', opacity: 0–100 }`).
- **Per-layer opacity** now drives `fill-opacity` (the hard-coded `0.4` is gone — see assumption A5).
- **Bubble representation** renders live: a graduated-circle layer per bubble layer at admin-2
  centroids (from `/api/v2/admin2/?admin1__country__iso3=…`, joined by `code`=pcode), radius scaled by
  value; the legend is representation-aware (gradient bar vs graduated-size sample). `useHdxLayers` now
  exposes `pcodeToValue`/`valueRange`/`rampColor`.
- **Local Units point layer** has since been added — a single toggleable red-marker layer (own opacity) fed by
  `useLocalUnits` (`/api/v2/public-local-units/?country__iso3`, the same source as the NS `LocalUnitsMap`), with a
  red-dot legend item. Per-type sub-toggles and the type-specific icons from `LocalUnitsMap`, plus the
  **Facilities** point group, remain deferred.
- `activeKeys` is keyed on a join-string so opacity/representation tweaks don't re-resolve layers.
