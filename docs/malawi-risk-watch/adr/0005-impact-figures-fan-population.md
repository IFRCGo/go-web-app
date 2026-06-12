# ADR 0005 — JBA impact figures, ensemble-percentile uncertainty fan, exposed-population

**Status:** implemented

## Context
Each JBA impact row carries `band_5` ensemble statistics (mean, median, p75, p90, max) across 51 members, plus
`ensembles_nonzero_count`; raw per-member values are not stored. The detail view needed to communicate the central
estimate, the spread/uncertainty across lead times, and a sense of who is exposed — **without overstating precision**.

## Decision
- **Figures + units:** group Mean/Median/P75/P90/Max under a **"Forecast flood depth (m)"** `Container` with an
  `InfoPopup` explaining they are ensemble percentiles across the 51 members (P90 ≫ mean ⇒ tail risk). The unit is in
  the heading (GO `formatNumber` ignores its `unit` option). ⚠ The "depth/(m)" labelling is **unconfirmed** — see
  [assumptions A1](../assumptions.md#a1--band_5-unit-flood-depth-vs-people-affected).
- **Uncertainty fan:** `LeadTimeChart` draws the per-admin trajectory across all 10 lead times — the **mean line**, a
  **threshold** line, an outer **median→Max envelope**, and an inner **median→P90** band, with the y-domain scaled to
  the full spread so the fan doesn't clip. Point tooltip lists Mean/Median/P90/Max.
- **Exposed population (per district):** `useJbaFloodExposure` joins HDX `MWI_ADM2_flood_exposure` (RP100, 30 cm) by
  `ADM2_PCODE` and renders Under-15, Elderly (65+), Female, Under-5 `KeyFigure`s (compact). An `InfoPopup` states the
  figures are **static RP100 context, not matched to the forecast, and overlap (non-additive)**.

## Alternatives
- Show only the mean (the prior plain trajectory line).
- A different band (e.g. P25→P75) — only median, P90, and Max are available as band edges.
- Attempt to attribute exposure to the specific forecast depth/lead time, or sum a "total people affected" — rejected:
  the CSV has **no total column** and the subgroups overlap, so summing would be wrong. Labelled approximate instead.
- An ensemble-likelihood gauge (`nonzeroCount/51` as probability) was proposed but **not** selected.

## Consequences
- The chart needs ≥2 timeline points to draw bands (`buildBandPath` returns undefined below 2). The fan bridges
  straight across any interior lead-day with a null percentile (cosmetic; mean line breaks there).
- Exposure subgroups must never be summed — enforced by labelling, not by data.
- `Under-5` reads `RP100_children_u5_30cm`, a CSV column **not** in the `hdxLayers` recipe (detail-only, may be null).
- Labels/tooltips hard-coded (`// FIXME: use strings`).

## Files
`Jba/EventDetails/index.tsx`, `Jba/EventDetails/LeadTimeChart/index.tsx`, `Jba/useJbaFloodExposure.ts`,
backend `apps/pipeline/models.py` (120–147), `docs/data-pipeline.md` (80–83).
