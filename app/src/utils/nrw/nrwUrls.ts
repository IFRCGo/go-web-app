import {
    ibfApiBackend,
    maptilerApiKey,
    seedDataRepo,
} from '#config';

import {
    ADMIN_LEVEL_FIELD_KEY,
    ADMIN_PCODE_KEY_BASE,
    ATTRIBUTES_FIELD_KEY,
    COUNTRY_FIELD_KEY,
    PLACE_CODE_FIELD_KEY,
} from './nrwConstants';

// Base map URL
const maptilerBaseUrl = 'https://api.maptiler.com';
// ID of the map we created in Map Tiler.
const mapGuid = '019eb13e-4bbd-743d-995d-970d7c3a2633';
export const mapUrlStyleJson = `${maptilerBaseUrl}/maps/${mapGuid}/style.json?key=${maptilerApiKey}`;

// Raw GitHub URLs for direct file access
// TODO: Once we have working API, we'll need a conditional here to target either the
// seed repo or the API
// depending on the environment or another setting.
export const seedRepoEventDataUrl = `${seedDataRepo}raster-data/mock-events/rgba/`;
export const seedRepoPopDataUrl = `${seedDataRepo}raster-data/population/rgba/`;

// Mock backend JSON data from the seed repo
export const seedRepoMockCountryDataUrl = `${seedDataRepo}mock-backend/country/nrwMockCountryData.json`;
export const getSeedRepoMockEventDataUrl = (countryIso3: string) => `${seedDataRepo}mock-backend/events/nrwMockData_${countryIso3}.json`;

// GO API URLs for local units data
// TODO: Revisit these sources as part of this task:
// https://dev.azure.com/redcrossnl/IBF/_workitems/edit/42046
// At a minimum, we need a more complete dataset for clinics
// IFRC GO clinics data only seems to list RC locs that are also clinics
// For the Philippines, this is a 100% crossover.
const goApiBaseUrl = 'https://goadmin.ifrc.org/api/v2';
const GO_API_RESULTS_LIMIT = 200;
export const getRcLocsApiUrl = (countryIso3: string) => `${goApiBaseUrl}/public-local-units/?country__iso3=${countryIso3}&limit=${GO_API_RESULTS_LIMIT}`;
export const getHealthLocsApiUrl = (countryIso3: string) => `${goApiBaseUrl}/health-local-units/?iso3=${countryIso3}&limit=${GO_API_RESULTS_LIMIT}`;

// Simplification algorithm factor for simplifying vector data
// Example of factor values on vector object size:
//    full vector size: 300kb
//    .0005 = 279kb
//    .001 = 188kb
//    .05 = 53kb
//    .01 = 30kb
const adminLevelToSimplificationFactor: number[] = [0.05, 0.01, 0.005, 0.004];

// Get the vector simplification factor (for the query algorithm)
// This factor is based on the admin level
const getSimplificationFactor = (adminLevel: number): number => {
    let factor = adminLevelToSimplificationFactor[adminLevel];
    if (!factor) {
        // The fallback is safe, so no need to make this error user facing.
        // The fallback just results in a possibly larger data size.
        // Log it though so devs can investigate.
        console.error(
            `No simplification factor found for admin level ${adminLevel}, defaulting to 0.01`,
        );
        factor = 0.01;
    }
    return factor;
};

// For debug purposes, replace baseQuery by the following string. This directly
// calls pg_featureserv.
// This lets you access tables (such as debug.admin_areas) that are not wrapped by the API.
// Note that the query structure is slightly different for this base url.
// const baseQuery = 'http://localhost:9000/collections/debug.admin_areas/items?filter=';
const baseQuery = `${ibfApiBackend}admin-areas?filter=`;
const and = '%20AND%20';

export const getGlobalAdmin0Url = (): string => {
    const factor = getSimplificationFactor(0);
    const levelParam = `${ADMIN_LEVEL_FIELD_KEY}=0`;
    const limitParam = 'limit=10000';
    const simplifyParam = `transform=simplify,${factor}`;

    return `${baseQuery}${levelParam}&${limitParam}&${simplifyParam}`;
};

export const getAdminAreaUrl = (
    countryIso3: string,
    adminLevel: number,
): string => {
    const factor = getSimplificationFactor(adminLevel);
    const countryParam = `${COUNTRY_FIELD_KEY}=%27${countryIso3}%27`;
    const levelParam = `${ADMIN_LEVEL_FIELD_KEY}=${adminLevel}`;
    const limitParam = 'limit=10000';
    const simplifyParam = `transform=simplify,${factor}`;

    return `${baseQuery}${countryParam}${and}${levelParam}&${limitParam}&${simplifyParam}`;
};

export const getNestedAdminUrl = (
    countryIso3: string,
    parentCode: string,
    adminLevel: number,
): string => {
    const factor = getSimplificationFactor(adminLevel);
    const countryParam = `${COUNTRY_FIELD_KEY}=%27${countryIso3}%27`;
    const levelParam = `${ADMIN_LEVEL_FIELD_KEY}=${adminLevel}`;
    const parentColumn = `${ADMIN_PCODE_KEY_BASE}${adminLevel - 1}`;
    const parentParam = `${parentColumn}=%27${parentCode}%27`;
    const limitParam = 'limit=10000';
    const simplifyParam = `transform=simplify,${factor}`;

    return `${baseQuery}${countryParam}${and}${levelParam}${and}${parentParam}&${limitParam}&${simplifyParam}`;
};

// Get the geometry for a specific set of admin areas, identified by their place codes.
// All requested codes are batched into a single CQL `IN` filter so only the exposed
// areas' geometry is fetched in one request.
export const getAdminAreasByCodesUrl = (
    countryIso3: string,
    adminLevel: number,
    placeCodes: string[],
): string => {
    const factor = getSimplificationFactor(adminLevel);
    const countryParam = `${COUNTRY_FIELD_KEY}=%27${countryIso3}%27`;
    const levelParam = `${ADMIN_LEVEL_FIELD_KEY}=${adminLevel}`;
    const quotedCodes = placeCodes.map((code) => `%27${code}%27`).join(',');
    const codesParam = `${PLACE_CODE_FIELD_KEY}%20IN%20(${quotedCodes})`;
    const limitParam = 'limit=10000';
    const simplifyParam = `transform=simplify,${factor}`;

    return `${baseQuery}${countryParam}${and}${levelParam}${and}${codesParam}&${limitParam}&${simplifyParam}`;
};

// Get a single admin area by its code (for initial selection from URL)
// Excludes geometry to reduce payload size
export const getAdminAreaDetailsNoGeoUrl = (
    countryIso3: string,
    code: string,
): string => {
    const countryParam = `${COUNTRY_FIELD_KEY}=%27${countryIso3}%27`;
    const codeParam = `${PLACE_CODE_FIELD_KEY}=%27${code}%27`;
    const limitParam = 'limit=1';
    // Only fetch needed properties for the admin area. Exclude geometry.
    // The per-level place code fields are needed so parent admin selections
    // can be reconstructed from a deep-linked URL.
    const propsParam = `properties=${[
        ADMIN_LEVEL_FIELD_KEY,
        PLACE_CODE_FIELD_KEY,
        `${ADMIN_PCODE_KEY_BASE}1`,
        `${ADMIN_PCODE_KEY_BASE}2`,
        `${ADMIN_PCODE_KEY_BASE}3`,
        `${ADMIN_PCODE_KEY_BASE}4`,
        ATTRIBUTES_FIELD_KEY,
    ].join(',')}`;

    return `${baseQuery}${countryParam}${and}${codeParam}&${limitParam}&${propsParam}`;
};
