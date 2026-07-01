// Enums shared between the api-service, the pipelines, and the front end.
// When adding enums here, follow the full updating flow.
// See `Updating Shared Enums` in the README for details.

// Not used by FE
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

export enum LayerName {
  // --- generic (cross-hazard) ---
  population = 'population',
  populationExposed = 'population_exposed',
  redCrossBranches = 'red_cross_branches',
  clinics = 'clinics',

  // --- floods-specific ---
  floodDepth = 'flood_depth',
  glofasStations = 'glofas_stations',
}

export enum LayerType {
  raster = 'raster',
  shape = 'shape',
  point = 'point',
  vectorTile = 'vector_tile',
}

// Not used by FE
export enum SeverityKey {
  returnPeriod = 'return_period',
  percentile = 'percentile',
}

// START: Alert classification related enums
// Allowed classification levels for: severityClass and probabilityClass - Not used by FE
export enum AlertClassificationLevel {
  singleThreshold = 'single_threshold',
  low = 'low',
  medium = 'medium',
  high = 'high',
}

// Allowed classification levels for alertClass
// (derived from severityClass and probabilityClass according to ALERT_CLASS_MATRIX)
// NOTE: do not change order, as this is used functionally
export enum AlertClass {
  low = 'low',
  medium = 'medium',
  high = 'high',
}
// END: Alert classification related enums
