# Malawi Risk Watch

Two extra sources on the Malawi country risk watch page, fed by the Malawi Risk Watch GraphQL backend:

- **Flood Foresight (JBA)**: an ensemble flood impact forecast per district and lead time, per daily ingestion run.
- **Parametric Trigger Model (ARC)**: the observed rainfall trigger behind the MRCS parametric flood insurance policy, with a national return period and the MRCS review of each trigger.

Both render through the shared `RiskImminentEventMap`, so they behave like the GO sources: a map with district markers and a side panel listing events.

## Layout

| Folder | Role |
| --- | --- |
| `Jba/` | Run picker, forecast day bars, district list and details, trajectory chart, baseline exposure |
| `Arc/` | Observation date picker, national trigger status, district list and details |
| `LayersPanel/`, `ThematicLayers/`, `ThematicLegend/` | Shade and bubble layers over the source metric or an HDX metric, raster overlays, plus local units |
| `DistrictChoroplethLayer/`, `BubbleLayer/` | Map layers |
| `LocalUnitsLayer/`, `useLocalUnits.ts` | GO local units by type, with GO's type icons and a details popup |
| `CogRasterLayer/`, `cog.ts`, `useCogInfo.ts` | Cloud Optimized GeoTIFF overlay read by viewport window |
| `CreateReportLink/`, `RunSelectInput/` | Pieces shared by both sources |
| `hdxMetrics.ts` | Which HDX admin-2 CSV columns are offered as layers |

Each source exposes its impact figure as a `SourceMetric` so the layer controls work the same for both.

## Rasters

A source can also expose Cloud Optimized GeoTIFFs as `SourceRaster` entries; the Layers panel lists them under "Raster overlay" with a colour ramp and opacity. JBA exposes the forecast file of the selected lead day (`floodForecastFiles` per issue date).

`CogRasterLayer` never downloads a whole file. `cog.ts` reads the header and the smallest overview once (cached per url, also used by the legend for the value range), then on every map move reads only the viewport window from the overview whose resolution matches the zoom, colours it on a canvas and swaps it into a mapbox `image` source. Files must be in EPSG:3857 (what the backend's `gdal_translate -co TILING_SCHEME=GoogleMapsCompatible` produces) or EPSG:4326, and nodata comes from the file. The storage must allow CORS and byte-range requests.

## Data notes

- Districts are keyed by pcode. It is the only key shared by the backend, the GO admin-2 areas and the HDX files. The backend's `ifrcId` matches staging GO ids only.
- JBA lead time is derived from target date minus issue date, as the backend field is not always filled.
- The JBA figure shown is the ensemble median. The percentile MRCS wants to use is still open.
- `JBA_IMPACT_THRESHOLD` is a placeholder: any forecasted impact currently lists a district.
- The ARC national trigger is the highest district return period on the date, exceeded above `ARC_TRIGGER_RP_THRESHOLD` years. The MRCS review comes from the trigger event the pipeline raises for that date.
- HDX layers are read from the CSVs the backend serves. Quantile classes are computed client-side.

## Configuration

`APP_MALAWI_RISK_WATCH_DOMAIN` switches the sources on. It is the backend's bare host; the code appends `/graphql/` for the API and `/admin/` for the review links. An empty value counts as unset, because web-app-serve blanks unset variables. The backend has no CORS headers, so the Vite dev server proxies the GraphQL API under `/malawi-backend` while links keep using the domain. Production needs CORS on the backend or a proxy in front of it.

GraphQL types come from `schema.graphql` in the `malawi-risk-watch-backend` submodule via `pnpm generate:type:malawi-graphql`.

## Not yet done

- Basemap selection, pending GO approval.
- Linking a created event back to its source record needs the `external_source` fields on the GO API.
- The ARC review link into the backend admin.
