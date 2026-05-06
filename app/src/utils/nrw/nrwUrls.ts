import {
    maptilerApiKey,
    pgFeatureserv,
    seedDataRepo,
} from '#config';

import {
    ADMIN_LEVEL_FIELD_KEY,
    ADMIN1_PCODE_FIELD_KEY,
    ADMIN2_PCODE_FIELD_KEY,
    ADMIN3_PCODE_FIELD_KEY,
    PLACE_CODE_FIELD_KEY,
} from './nrwConstants';

// Map URLs
const maptilerBaseUrl = 'https://api.maptiler.com';
const maptilerSimpleStylePath = '/maps/019c41d2-17c7-7e5e-9a47-d3b3f9515a5b/style.json';
// Simple, default IBF data map
export const mapUrlSimpleStyleJson = `${maptilerBaseUrl}${maptilerSimpleStylePath}?key=${maptilerApiKey}`;

// Raw GitHub URLs for direct file access
// TODO: Once we have working API, we'll need a conditional here to target either the
// seed repo or the API
// depending on the environment or another setting.
export const seedRepoEventDataUrl = `${seedDataRepo}raster-data/mock-events/rgba/`;
export const seedRepoPopDataUrl = `${seedDataRepo}raster-data/population/rgba/`;

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

export const getGlobalAdmin0Url = (): string => {
    const factor = getSimplificationFactor(0);
    const baseQuery = `${pgFeatureserv}/collections/debug.admin_areas/items?filter=`;
    const levelParam = 'admin_level=%270%27';
    const limitParam = 'limit=10000';
    const simplifyParam = `transform=simplify,${factor}`;

    return `${baseQuery}${levelParam}&${limitParam}&${simplifyParam}`;
};

export const getAdminRegionUrl = (
    country: string,
    adminLevel: number,
): string => {
    const factor = getSimplificationFactor(adminLevel);
    const and = '%20AND%20';
    const baseQuery = `${pgFeatureserv}/collections/debug.admin_areas/items?filter=`;
    const countryParam = `country=%27${country}%27`;
    const levelParam = `admin_level=%27${adminLevel}%27`;
    const limitParam = 'limit=10000';
    const simplifyParam = `transform=simplify,${factor}`;

    return `${baseQuery}${countryParam}${and}${levelParam}&${limitParam}&${simplifyParam}`;
};

export const getNestedAdminUrl = (
    country: string,
    parentCode: string,
    adminLevel: number,
): string => {
    const factor = getSimplificationFactor(adminLevel);
    const and = '%20AND%20';
    const baseQuery = `${pgFeatureserv}/collections/debug.admin_areas/items?filter=`;
    const countryParam = `country=%27${country}%27`;
    const levelParam = `admin_level=%27${adminLevel}%27`;
    const parentColumn = `admin${adminLevel - 1}_pcode`;
    const parentParam = `${parentColumn}=%27${parentCode}%27`;
    const limitParam = 'limit=10000';
    const simplifyParam = `transform=simplify,${factor}`;

    return `${baseQuery}${countryParam}${and}${levelParam}${and}${parentParam}&${limitParam}&${simplifyParam}`;
};

// Get a single admin area by its code (for initial selection from URL)
// Excludes geometry to reduce payload size
export const getAdminAreaDetailsNoGeoUrl = (
    country: string,
    code: string,
): string => {
    const baseQuery = `${pgFeatureserv}/collections/debug.admin_areas/items?filter=`;
    const and = '%20AND%20';
    const countryParam = `country=%27${country}%27`;
    const codeParam = `code=%27${code}%27`;
    const limitParam = 'limit=1';
    // Only fetch needed properties, exclude geom
    const propsParam = `properties=${[
        PLACE_CODE_FIELD_KEY,
        ADMIN_LEVEL_FIELD_KEY,
        ADMIN1_PCODE_FIELD_KEY,
        ADMIN2_PCODE_FIELD_KEY,
        ADMIN3_PCODE_FIELD_KEY,
    ].join(',')}`;

    return `${baseQuery}${countryParam}${and}${codeParam}&${limitParam}&${propsParam}`;
};
