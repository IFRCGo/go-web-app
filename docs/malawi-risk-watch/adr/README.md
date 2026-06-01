# Architecture Decision Records — Malawi Risk Watch

Each ADR captures one decision: the problem (context), what was chosen, alternatives considered, and consequences.
Status reflects the code on branch `project/malawi-risk-watch`.

| # | Decision | Status |
|---|---|---|
| [0001](./0001-malawi-sources.md) | Add JBA & ARC as Malawi-only imminent-event sources | implemented |
| [0002](./0002-hdx-layer-multiselect.md) | HDX context layers: grouped multi-select Switch → stacked choropleths | partial |
| [0003](./0003-ingestion-run-selector.md) | JBA ingestion-run selector in the header (run-info popup, data-aware default) | implemented |
| [0004](./0004-lead-time-slider.md) | Forecast lead-time numbered slider (replaces the radio group) | implemented |
| [0005](./0005-impact-figures-fan-population.md) | JBA impact figures, ensemble-percentile uncertainty fan, exposed-population | implemented |
| [0006](./0006-workarounds.md) | Workarounds: media proxy (CORS), staging tileset, unwired i18n | partial |

> ADRs 0002–0005 correspond to the layer panel, ingestion-run selector, lead-time slider, and impact/charts work
> done iteratively in this branch. ADR 0006 collects the deferred infra fixes. All figures/units are in
> [`../figures.md`](../figures.md); all assumptions/risks in [`../assumptions.md`](../assumptions.md).
