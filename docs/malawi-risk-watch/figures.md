# Malawi Risk Watch — Figures & Metrics Glossary

Every number shown on the Malawi imminent-events page: what it means, its unit, where it comes from, and caveats.
See [`assumptions.md`](./assumptions.md) for the risks behind the ⚠ items.

## JBA — forecast ensemble statistics (`band_5`)
Each JBA impact row holds statistics of `band_5` **across the 51 JBA ensemble members**, for one district at one
(issue date, target date) pair. Raw per-member values are **not** stored — only these aggregates + the non-zero count.

| Figure | Meaning | Unit | Source |
|---|---|---|---|
| **Mean** (`band5Mean`) | Ensemble mean | ⚠ metres (m) **as labelled** — see [A1](./assumptions.md#a1--band_5-unit-flood-depth-vs-people-affected) | `FloodForecastImpact.band_5_mean` |
| **Median** (`band5Median`) | 50th percentile across members | ⚠ m | `band_5_median` |
| **P75** (`band5P75`) | 75th percentile | ⚠ m | `band_5_p75` |
| **P90** (`band5P90`) | 90th percentile | ⚠ m | `band_5_p90` |
| **Max** (`band5Max`) | Largest single member | ⚠ m | `band_5_max` |
| **Ensembles non-zero** (`ensemblesNonzeroCount`) | How many of the 51 members predicted any flooding | count (0–51) | `ensembles_nonzero_count` |

> **Reading them:** percentiles describe **forecast uncertainty** (spread across the 51 members), not spatial/temporal
> spread. A P90 well above the Mean means a minority of members predict much higher values (right-skew / tail risk) —
> which is exactly what the [uncertainty fan chart](./adr/0005-impact-figures-fan-population.md) visualises.
> The `/51` denominator is **hard-coded** in the UI (A15).

## JBA — forecast / lead-time fields
| Figure | Meaning | Unit | Notes |
|---|---|---|---|
| `leadTimeDays` | Days from issue → target | days (int 1–10) | ⚠ derived server-side (A14), not a column |
| `forecastIssueDate` | When the forecast was issued | date (YYYY-MM-DD) | keys impacts to a run (A12) |
| `forecastTargetDate` | The day being forecast | date | |

## JBA — ingestion run (shown in the header select + InfoPopup)
| Figure | Meaning | Unit |
|---|---|---|
| `runDate` | Daily JBA fetch date (= forecast issue date, A12) | date — used as the select option label |
| `status` | Run status | enum: `pending` / `running` / `success` / `failed` / `partial` |
| `filesProcessed` / `filesExpected` | TIFFs ingested vs expected | counts, shown `processed / expected` |
| `forecastIssueTime` | Forecast issue timestamp | datetime (`yyyy-MM-dd, hh:mm`) |
| `completedAt` | Run completion timestamp | datetime (`yyyy-MM-dd, hh:mm`) |

## JBA — per-district flood-exposed population (HDX, contextual)
From `MWI_ADM2_flood_exposure.csv`, **RP100 (1-in-100-year), 30 cm depth**. ⚠ Static context, **not** matched to the
forecast depth/lead time; the groups **overlap and are not additive** (A13).

| Figure | CSV column | Unit |
|---|---|---|
| Under-15 | `RP100_pop_u15_30cm` | people (compact, e.g. `14K`) |
| Elderly (65+) | `RP100_elderly_30cm` | people |
| Female | `RP100_female_pop_30cm` | people |
| Under-5 | `RP100_children_u5_30cm` | people (not in the layer recipe, detail-only) |

## HDX context layer metrics (choropleths)
Toggled in the **Layers** panel; legend bins are 5-bin quantiles (A20). All admin-2, joined by `ADM2_PCODE`.

| Dataset | Metrics | Unit |
|---|---|---|
| Flood exposure (RP100) | under-15 / female / elderly exposed; hospitals %, education % | people (counts); `*_pct` = percent 0–100 |
| Vulnerability | pop_u15, female_pop, elderly; rural_pop_perc | people; rural = percent |
| Facilities | hospitals_count | count |
| Access | pop within 30 min of hospital / primary care, within 5 km of education | people |
| Demographics | pop_u15, elderly, female_pop | people |
| Rural population | rural_pop_perc; pop_u15_rural | percent; people |

## ARC — rainfall observation
| Figure | Meaning | Unit |
|---|---|---|
| `rainfall` | Processed rainfall | millimetres (mm) |
| `rainfallRaw` | Raw rainfall | millimetres (mm) |
| `impact` | Derived impact score (`rainfall × factor`) | ⚠ unitless score (3 dp shown); not the real trigger (A3) |
| `eventRp` | Return period (set only when triggered) | years (discrete: 2, 5, 10, 20) |
| `cellTrigger` | Parametric cell trigger | boolean (`Active` / `Below trigger`); real rule `rainfall >= 25.4 mm` |

## JBA COG raster overlay
Rendered client-side from the forecast TIFF for the active lead time (band 0). ⚠ Colours are **per-image normalised**
(relative, not absolute across lead times/runs) with **no legend or physical-value readout** (A19). Light-blue→red
ramp; `v<=0` transparent. Toggled via the raster control in EventDetails.
