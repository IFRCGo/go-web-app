// -------- Mapbox style constants --------

// Default map values
export const defaultMapZoom = 3;

// Mapbox style
// This is the Map created in Mapbox Studio with the format `mapbox://styles/<username>/<style_id>`
// Get this from Mapbox Studio > Styles > Style url
export const NRW_MAPBOX_STYLE_URL = 'mapbox://styles/510global/cmrdb6i91000a01qrf8j675uc';

// Mapbox needs to precompute colors as a property of the vector data if colors differ
// among objects of the same layer. This key indicates the color for exposed admin areas.
export const EXPOSURE_COLOR_FIELD_KEY = 'exposureColor';

// -------- Admin area data constants (used in the GeoJSON data) --------

// Top-level feature properties on api-service.admin-area
export const COUNTRY_FIELD_KEY = 'countryCodeIso3';
export const PLACE_CODE_FIELD_KEY = 'placeCode';
export const ADMIN_LEVEL_FIELD_KEY = 'adminLevel';
export const ATTRIBUTES_FIELD_KEY = 'attributes';

// Place code based on admin level.
// The key is this string + admin level (1 - 4).
// For example, the actual keys are `placeCodeLevel1`, `placeCodeLevel2`, etc.
export const ADMIN_PCODE_KEY_BASE = 'placeCodeLevel';

// Keys within the `attributes` JSON payload on an admin-area feature
export const POPULATION_ATTRIBUTE_KEY = 'POPULATION';

// -------- NRW component constants --------

// Element ids used to capture DOM nodes for PDF export.
export const MAP_CONTAINER_ELEMENT_ID = 'nrw-mapbox-map';
export const LEGEND_PANEL_ELEMENT_ID = 'nrw-legend-panel';
export const EVENTS_PANEL_ELEMENT_ID = 'nrw-events-panel';
