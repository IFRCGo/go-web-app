# ADR 0006 — Workarounds: media proxy (CORS), staging tileset, unwired i18n

**Status:** partial (all are deliberate temporary measures awaiting proper fixes)

## Context
The Malawi backend returns relative TIFF URLs like `/media/jba/tiff/.../lead01.tif` and Django does **not** attach
CORS headers to media responses, so a direct cross-origin GET from the GO dev server to the backend fails. The feature
was also built against a **staging** admin-2 vector tileset, and the Malawi UI was developed **ahead of** i18n wiring.

## Decision
- **COG / media (CORS):** rewrite `/media/...` → `/malawi-media/...` so the request stays same-origin, with Vite's dev
  proxy forwarding `/malawi-media` → backend `/media` (sibling to a `/malawi-graphql` → `/graphql` proxy). The COG is
  streamed into a Mapbox raster source by `JbaCogRasterLayer` when the raster toggle is on.
- **Tileset:** choropleth fill/outline bind to `mapbox://go-ifrc.go-admin2-${iso3}-staging` / source-layer
  `go-admin2-${iso3}-staging`, both flagged `// FIXME: update layer name`.
- **i18n:** many Malawi strings (source labels, "Layers", lead-time label, all EventDetails/IngestionRunInfo labels,
  chart tooltips, "Create early warning report") are hard-coded with `// FIXME: use strings`.

## Alternatives (the proper fixes, deferred)
- **Media:** have the backend serve CORS-tagged media or ship absolute, CORS-correct URLs, removing the rewrite.
- **Tileset:** point at a production (non-staging) admin-2 tileset and verify the `ADM2_PCODE == code` join for MWI.
- **i18n:** add the strings to `i18n.json` and wire `useTranslation`, as the rest of the module already does
  (`RiskImminentEvents/i18n.json`, per-source i18n files).

## Consequences
- The `/malawi-media` rewrite **only works in dev**. Production needs an equivalent same-origin path or backend CORS,
  or the COG overlay fails cross-origin (caught + logged).
- The hard-coded `-staging` tileset breaks/shows stale geometry if removed or renamed.
- Untranslated strings ship English-only. Because the i18n-usage eslint rule scans only the co-located `index.tsx` for
  `strings.*`, these FIXMEs are currently invisible to it (no keys exist yet).

## Files
`Jba/index.tsx` (COG url rewrite), `app/vite.config.ts` (proxies), `RiskImminentEventMap/index.tsx` (tileset),
`JbaCogRasterLayer/index.tsx`, and the various components with `// FIXME: use strings`.
