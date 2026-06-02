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
  // raster layers
  alertExtent = 'alert_extent',
  // admin-area layers
  populationExposed = 'population_exposed',
  // geo-feature layers
  glofasStations = 'glofas_stations',
}
