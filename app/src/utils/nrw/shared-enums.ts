// Enums shared between the api-service, the pipelines, and the front end.
// When adding enums here, follow the full updating flow.
// See `Updating Shared Enums` in the README for details.

export enum EnsembleMemberType {
  median = 'median',
  run = 'run',
}

export enum ForecastSource {
  glofas = 'glofas',
  ecmwf = 'ECMWF',
}

export enum HazardType {
  floods = 'floods',
  drought = 'drought',
}

export enum Layer {
  // --- generic layers (cross-hazard) ---
  populationExposed = 'population_exposed',

  // --- floods-specific layers ---
  floodDepth = 'flood_depth',
  glofasStations = 'glofas_stations',
}

// Key to identify the type of map layer info being shown.
// This is used to style/label it on the frontend.
export enum MapLayerInfoType {
  // --- generic (cross-hazard) ---
  Population = 'population',
  RedCrossBranches = 'red_cross_branches',
  Clinics = 'clinics',

  // --- floods-specific ---
  FloodDepth = 'flood_depth',
}

export enum MapLayerDisplayType {
  // Image data, i.e. PNGs
  Raster = 'raster',
  // Vector shape data for lines and polygons, including admin areas
  Shape = 'shape',
  // Vector point data, such as for glofas locations
  Point = 'point',
  // Vector tiles, used for dense vector information such as many buildings and roads
  VectorTile = 'vector_tile',
}

export enum SeverityKey {
  returnPeriod = 'return_period',
  percentile = 'percentile',
}

// ---------------------------------------------
// Alert classification related enums - START
// ---------------------------------------------

// Allowed classification levels for: severityClass and probabilityClass
export enum AlertClassificationLevel {
  SingleThreshold = 'single_threshold',
  Low = 'low',
  Medium = 'medium',
  High = 'high',
}

// Allowed classification levels for alertClass
// (derived from severityClass and probabilityClass according to ALERT_CLASS_MATRIX)
// NOTE: do not change order, as this is used functionally
export enum AlertClass {
  Low = 'low',
  Medium = 'medium',
  High = 'high',
}

// ---------------------------------------------
// Alert classification related enums - END
// ---------------------------------------------
