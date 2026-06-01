# ADR 0001 — Add JBA & ARC as Malawi-only imminent-event sources

**Status:** implemented

## Context
The global Imminent Events panel exposed four sources (GDACS, PDC, WfpAdam, MeteoSwiss). Malawi Risk Watch needed two
Malawi-specific feeds from its **own GraphQL backend**: JBA ensemble flood-depth forecasts and ARC parametric rainfall
observations. They must appear **only** for Malawi and not pollute global/region/other-country views.

## Decision
- Extend `ImminentEventSource` to `'pdc' | 'wfpAdam' | 'gdacs' | 'meteoSwiss' | 'jba' | 'arc'`.
- Gate on `isMalawi = (variant === 'country' && iso3 === MALAWI_ISO3)` (`MALAWI_ISO3 = 'MWI'`); JBA/ARC source radios
  render only when `isMalawi`.
- Default source `defaultSource ?? (isMalawi ? 'jba' : 'gdacs')`.
- Both sources are **flood-only** (`hazardTypeSelector` → `'FL'`); field/early-warning reports use
  `DISASTER_FLOOD_ID = 12`.
- Data via the Malawi urql client (`floodForecastImpacts` / `arcRainfallObservations`); admin areas joined through
  GO REST `/api/v2/admin2/` by `adminArea.ifrcId`.

## Alternatives
- Make JBA/ARC available globally or behind a generic country flag instead of a hard-coded `'MWI'` check.
- Reuse the existing `environment !== 'production'` gate (used by WfpAdam/MeteoSwiss) instead of an `iso3` gate.
- i18n entries for the `JBA`/`ARC` labels (left hard-coded with `// FIXME: use strings`).

## Consequences
- Malawi country view defaults to the JBA tab. The `'MWI'` literal is implicitly duplicated (e.g. `useCountry({ iso3: 'MWI' })`).
- Adding a second risk-watch country would require generalising the `isMalawi` gate.
- JBA/ARC depend on a separate backend origin reached via a dev proxy (see [ADR 0006](./0006-workarounds.md)).
- Source labels ship untranslated.

## Files
`RiskImminentEvents/index.tsx` (42–44, 80–86, 308–375), `RiskImminentEvents/malawi/constants.ts`, `Jba/index.tsx`, `Arc/index.tsx`.
