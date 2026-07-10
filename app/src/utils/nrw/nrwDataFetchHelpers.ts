import mockCountryData from './mockData/mock_CountryData';
import {
    ADMIN_LEVEL_FIELD_KEY,
    ADMIN_PCODE_KEY_BASE,
    ATTRIBUTES_FIELD_KEY,
    POPULATION_ATTRIBUTE_KEY,
} from './nrwConstants';
import {
    type CountryMapData,
    type SelectedEventDetails,
} from './nrwMapTypes';
import {
    getAdminAreaDetailsNoGeoNoCountryUrl,
    getAdminAreaDetailsNoGeoUrl,
    getAdminAreasByCodesUrl,
    getEventsApiUrl,
    getHealthLocsApiUrl,
    getRcLocsApiUrl,
} from './nrwUrls';
import type { EventResponseDto } from './shared-dtos';

// Fetch a URL and parse the response body as JSON.
// Throws when the request fails or the response is not OK.
export default async function fetchJson<T>(
    url: string,
    description: string,
    signal?: AbortSignal,
): Promise<T> {
    const response = await fetch(url, { signal });
    if (!response.ok) {
        throw new Error(
            `Failed to fetch ${description}: HTTP ${response.status} ${response.statusText}`,
        );
    }
    return response.json() as Promise<T>;
}

// Fields shared by GO API local unit results (RC branches and clinics)
// that are mapped onto map feature properties.
type LocalUnitResult = {
    id?: number;
    local_branch_name?: string;
    english_branch_name?: string;
    address_loc?: string;
    address_en?: string;
    modified_at?: string;
    status?: number;
    status_details?: string;
    type_details?: {
        name?: string;
    };
    link?: string;
};

// Format of GO API result for Red Cross locations
type RcLocResult = LocalUnitResult & {
    country_details?: {
        iso3?: string;
    };
    type?: number;
    health_details?: {
        health_facility_type?: number;
        health_facility_type_details?: {
            name?: string;
        };
    };
    location_geojson?: {
        type?: string;
        coordinates?: [number, number] | number[];
    };
};

// Format of GO API result for Clinic locations
type ClinicLocResult = LocalUnitResult & {
    country_iso3?: string;
    health_facility_type_details?: {
        name?: string;
    };
    location?: {
        lat?: number;
        lng?: number;
    };
};

type GoDataResults<T> = {
    results?: T[];
};

// Admin area details fetched from the API
// This is used for finding info on selected admin areas.
export interface AdminAreaDetails {
    code: string;
    adminLevel: number;
    admin1Pcode: string | null;
    admin2Pcode: string | null;
    admin3Pcode: string | null;
    admin4Pcode: string | null;
    population: number | null;
}

// Parse the population value from the attributes field
function parsePopulation(rawAttributes: unknown): number | null {
    if (!rawAttributes || typeof rawAttributes !== 'object') {
        return null;
    }
    const attrs = rawAttributes as Record<string, unknown>;
    const value = Number(attrs[POPULATION_ATTRIBUTE_KEY]);
    return Number.isFinite(value) ? value : null;
}

// Build admin area details from feature properties
export function getAdminAreaDetailsFromProperties(
    properties: GeoJSON.GeoJsonProperties,
): AdminAreaDetails | null {
    if (!properties) {
        return null;
    }
    const props = properties as Record<string, unknown>;
    const adminLevel = Number(props[ADMIN_LEVEL_FIELD_KEY]);
    if (!Number.isFinite(adminLevel)) {
        return null;
    }
    const code = props[`${ADMIN_PCODE_KEY_BASE}${adminLevel}`];
    if (typeof code !== 'string' || !code) {
        return null;
    }
    return {
        code,
        adminLevel,
        admin1Pcode: (props[`${ADMIN_PCODE_KEY_BASE}1`] as string | null) ?? null,
        admin2Pcode: (props[`${ADMIN_PCODE_KEY_BASE}2`] as string | null) ?? null,
        admin3Pcode: (props[`${ADMIN_PCODE_KEY_BASE}3`] as string | null) ?? null,
        admin4Pcode: (props[`${ADMIN_PCODE_KEY_BASE}4`] as string | null) ?? null,
        population: parsePopulation(props[ATTRIBUTES_FIELD_KEY]),
    };
}

// Fetch admin area details directly
export async function fetchAdminAreaDetails(
    country: string,
    code: string,
): Promise<AdminAreaDetails | null> {
    const url = getAdminAreaDetailsNoGeoUrl(country, code);
    try {
        const data = await fetchJson<GeoJSON.FeatureCollection>(url, 'admin area details');
        const firstFeature = data.features[0];
        if (!firstFeature) {
            return null;
        }
        return getAdminAreaDetailsFromProperties(firstFeature.properties);
    } catch {
        return null;
    }
}

// Fetch admin area details by place code without a country context.
// Used to resolve a deeplinked admin place code that has no country context.
export async function fetchAdminAreaDetailsByCode(
    code: string,
): Promise<AdminAreaDetails | null> {
    const url = getAdminAreaDetailsNoGeoNoCountryUrl(code);
    try {
        const data = await fetchJson<GeoJSON.FeatureCollection>(url, 'admin area details');
        const firstFeature = data.features[0];
        if (!firstFeature) {
            return null;
        }
        return getAdminAreaDetailsFromProperties(firstFeature.properties);
    } catch {
        return null;
    }
}

// Fetch events from the IBF API
async function fetchEventsFromApi(
    countryCodeIso3: string,
): Promise<EventResponseDto[]> {
    try {
        const url = getEventsApiUrl(countryCodeIso3);
        const data = await fetchJson<EventResponseDto[]>(
            url,
            `events for ${countryCodeIso3}`,
        );
        return data;
    } catch {
        return [];
    }
}

// Fetch upcoming or ongoing events data for a country
export async function getAllEventData(
    countries: string[],
): Promise<EventResponseDto[]> {
    const eventsByCountry = await Promise.all(
        countries.map((country) => fetchEventsFromApi(country)),
    );
    return eventsByCountry.flat();
}

// Fetch country-level map layer data
// TODO: Use the API instead of mock data. Pending IBF API
// This now just filters the results of the mock data, but the actual API would probably
// just return the countries we query for.
export async function getCountryMapData(
    scopedCountries: string[],
): Promise<Record<string, CountryMapData>> {
    return Object.fromEntries(
        Object.entries(mockCountryData).filter(
            ([countryCode]) => scopedCountries.includes(countryCode),
        ),
    );
}

// Fetch the exposed admin areas for the selected event and return their GeoJSON features.
// The areas are the deepest (lowest) admin level that has exposure data.
// Geometry is fetched for each scoped country and the features are merged.
export const fetchExposedAdminAreasFeatures = async (
    scopedCountries: string[],
    selectedEventDetails: SelectedEventDetails,
    signal?: AbortSignal,
): Promise<GeoJSON.Feature[]> => {
    const {
        eventId,
        exposedPopulationPerAreaByLevel,
    } = selectedEventDetails;

    // Find the deepest (lowest) admin level that has exposed areas.
    const deepestExposedLevel = Number(
        Object.keys(exposedPopulationPerAreaByLevel).at(-1),
    );
    const exposedPopulationByPlaceCode = exposedPopulationPerAreaByLevel[deepestExposedLevel];
    if (!deepestExposedLevel || !exposedPopulationByPlaceCode) {
        throw new Error(`Event ${eventId} has no exposed population data`);
    }

    // Fetch the geometry for only the exposed admin areas, per scoped country.
    const placeCodes = Object.keys(exposedPopulationByPlaceCode);
    const results = await Promise.allSettled(
        scopedCountries.map(async (countryIso3) => {
            const url = getAdminAreasByCodesUrl(countryIso3, deepestExposedLevel, placeCodes);
            const data = await fetchJson<GeoJSON.FeatureCollection>(
                url,
                `exposed admin areas for ${countryIso3}`,
                signal,
            );
            return data.features ?? [];
        }),
    );

    return results.flatMap((result) => (
        result.status === 'fulfilled' ? result.value : []
    ));
};

const isValidCoordinatePair = (
    longitude: number,
    latitude: number,
): boolean => Number.isFinite(longitude)
    && Number.isFinite(latitude)
    && Math.abs(longitude) <= 180
    && Math.abs(latitude) <= 90;

// Build the GeoJSON point feature for a GO API local unit (RC branch or clinic).
// Returns an empty array when the coordinates are invalid, so callers can flatMap.
function makeLocalUnitFeatures(
    item: LocalUnitResult,
    longitude: number,
    latitude: number,
    healthFacilityTypeName: string | undefined,
    country: string,
): GeoJSON.Feature[] {
    if (!isValidCoordinatePair(longitude, latitude)) {
        return [];
    }

    return [{
        type: 'Feature',
        geometry: {
            type: 'Point',
            coordinates: [longitude, latitude],
        },
        properties: {
            id: item.id,
            name: item.local_branch_name,
            local_branch_name: item.local_branch_name,
            english_branch_name: item.english_branch_name,
            address_loc: item.address_loc,
            address_en: item.address_en,
            modified_at: item.modified_at,
            status: item.status,
            status_display: item.status_details,
            type_name: item.type_details?.name,
            health_facility_type_name: healthFacilityTypeName,
            link: item.link,
            country,
        },
    }];
}

export const fetchRcBranchesFeatures = async (
    selectedCountry: string,
): Promise<GeoJSON.Feature[]> => {
    const apiUrl = getRcLocsApiUrl(selectedCountry);
    const data = await fetchJson<GoDataResults<RcLocResult>>(apiUrl, 'RC branches data');
    return (data.results ?? [])
        .flatMap((item) => {
            const coordinates = item.location_geojson?.coordinates;
            if (!coordinates || coordinates.length < 2) {
                return [];
            }

            return makeLocalUnitFeatures(
                item,
                Number(coordinates[0]),
                Number(coordinates[1]),
                item.health_details?.health_facility_type_details?.name,
                selectedCountry,
            );
        });
};

export const fetchClinicFeatures = async (
    selectedCountry: string,
): Promise<GeoJSON.Feature[]> => {
    const apiUrl = getHealthLocsApiUrl(selectedCountry);
    const data = await fetchJson<GoDataResults<ClinicLocResult>>(apiUrl, 'clinic data');
    return (data.results ?? [])
        .flatMap((item) => makeLocalUnitFeatures(
            item,
            Number(item.location?.lng),
            Number(item.location?.lat),
            item.health_facility_type_details?.name,
            selectedCountry,
        ));
};
