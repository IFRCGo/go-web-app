// Map property strings
export const noCountrySelectedValue = 'None';

// Default map values
export const defaultMapZoom = 3;

// Data field keys, for instance keys in the GeoJSON data.
// Top-level feature properties on api-service.admin-area
export const COUNTRY_FIELD_KEY = 'countryCodeIso3';
export const PLACE_CODE_FIELD_KEY = 'placeCode';
export const ADMIN_LEVEL_FIELD_KEY = 'adminLevel';
export const ATTRIBUTES_FIELD_KEY = 'attributes';

// Place code is this key + admin level (1 - 4). E.g.: placeCodeLevel1, placeCodeLevel2, etc.
export const ADMIN_PCODE_KEY_BASE = 'placeCodeLevel';

// Keys within the `attributes` JSON payload on an admin-area feature
export const POPULATION_ATTRIBUTE_KEY = 'POPULATION';

// TODO: NNN Get rid of this if possible
// Key for the precomputed exposure color we add to exposed admin area features,
// read by the map layer paint via a data-driven expression.
export const EXPOSURE_COLOR_FIELD_KEY = 'exposureColor';
