import type VectorLayer from 'ol/layer/Vector';
import type Style from 'ol/style/Style';

import {
    mockAllEventsData_MW,
    mockAllEventsData_ZM,
} from './mockData/mock_EventData';
import {
    ADMIN_LEVEL_FIELD_KEY,
    ADMIN_PCODE_KEY_BASE,
    ATTRIBUTES_FIELD_KEY,
    POPULATION_ATTRIBUTE_KEY,
} from './nrwConstants';
import {
    isValidCoordinatePair,
    makePointLayerFromFeatures,
} from './nrwMapHelpers';
import {
    type CountryMapData,
    type EventOverviewData,
} from './nrwMapTypes';
import {
    getAdminAreaDetailsNoGeoUrl,
    getHealthLocsApiUrl,
    getRcLocsApiUrl,
    seedRepoMockCountryDataUrl,
} from './nrwUrls';

// Format of GO API result for Red Cross locations
type RcLocResult = {
    id?: number;
    country_details?: {
        iso3?: string;
    };
    local_branch_name?: string;
    english_branch_name?: string;
    address_loc?: string;
    address_en?: string;
    modified_at?: string;
    status?: number;
    status_details?: string;
    type?: number;
    type_details?: {
        name?: string;
    };
    health_details?: {
        health_facility_type?: number;
        health_facility_type_details?: {
            name?: string;
        };
    };
    link?: string;
    location_geojson?: {
        type?: string;
        coordinates?: [number, number] | number[];
    };
};

// Format of GO API result for Clinic locations
type ClinicLocResult = {
    id?: number;
    country_iso3?: string;
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
    health_facility_type_details?: {
        name?: string;
    };
    link?: string;
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
    props: Record<string, unknown>,
): AdminAreaDetails | null {
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
        const response = await fetch(url);
        if (!response.ok) {
            return null;
        }
        const data = await response.json();
        const features = data?.features;
        if (!features || features.length === 0) {
            return null;
        }
        return getAdminAreaDetailsFromProperties(features[0].properties);
    } catch {
        return null;
    }
}

// Load mock event data for a given country from local mock data
// TODO: Replace with API calls when available
// TODO: Also set this to be able to load mock data from the seed repo.
// This was disabled since the DB payload format is still changing, so the seed repo
// data is out of date. Regenerating it each time takes effort (and a lot of LLM tokens)
async function loadMockEventData(country: string): Promise<EventOverviewData[]> {
    // Method to fetch from seed repo, but also can be used for the backend
    /*
    const url = getSeedRepoMockEventDataUrl(country); // Import from './nrwUrls'
    try {
        const response = await fetch(url);
        if (!response.ok) {
            return [];
        }
        return await response.json() as EventOverviewData[];
    } catch {
        return [];
    }
        */

    // Placeholder method using local mock data
    const mockDataMap: Record<string, EventOverviewData[]> = {
        MWI: mockAllEventsData_MW,
        ZMB: mockAllEventsData_ZM,
    };
    return mockDataMap[country] ?? [];
}

// Fetch upcoming or ongoing events data for a country
export async function getCurrentCountryEventData(country: string): Promise<EventOverviewData[]> {
    // TODO: Use the API for fetching this for any country, and only use mock data
    // if set to do so in the env file.
    return loadMockEventData(country);
}

// Fetch a specific event's details, and only return that event
export async function getEventDetails(eventId: number): Promise<EventOverviewData[]> {
    // TODO: Use the API for fetching this for any country, and only use mock data
    // if set to do so in the env file.
    // For mock data, look for the event data with the matching eventId across all countries.
    // TODO: When the API is available, this will be a single call to the API.
    const countries = ['MWI', 'ZMB'];
    for (let i = 0; i < countries.length; i += 1) {
        const country = countries[i];
        if (country) {
            // eslint-disable-next-line no-await-in-loop
            const countryEvents = await loadMockEventData(country);
            const eventData = countryEvents.find((event) => event.eventId === eventId);
            if (eventData) {
                return [eventData];
            }
        }
    }
    return [];
}

// Fetch country-level map layer data
// TODO: Use the API instead of mock data. Pending IBF API
export async function getCountryMapData(): Promise<Record<string, CountryMapData>> {
    try {
        const response = await fetch(seedRepoMockCountryDataUrl);
        if (!response.ok) {
            return {} as Record<string, CountryMapData>;
        }
        return await response.json() as Record<string, CountryMapData>;
    } catch {
        return {} as Record<string, CountryMapData>;
    }
}

export const makeRcBranchesPointLayer = async (
    selectedCountry: string,
    style: Style,
): Promise<VectorLayer> => {
    const apiUrl = getRcLocsApiUrl(selectedCountry);
    const response = await fetch(apiUrl);
    if (!response.ok) {
        throw new Error(
            `Failed to load RC branches data: HTTP ${response.status} ${response.statusText}`,
        );
    }

    const data: GoDataResults<RcLocResult> = await response.json();
    const filteredFeatures: GeoJSON.Feature[] = (data.results ?? [])
        .flatMap((item) => {
            const coordinates = item.location_geojson?.coordinates;
            if (!coordinates || coordinates.length < 2) {
                return [];
            }

            const longitude = Number(coordinates[0]);
            const latitude = Number(coordinates[1]);
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
                    health_facility_type_name:
                        item.health_details?.health_facility_type_details?.name,
                    link: item.link,
                    country: selectedCountry,
                },
            } as GeoJSON.Feature];
        });

    return makePointLayerFromFeatures(filteredFeatures, style);
};

export const makeClinicPointLayer = async (
    selectedCountry: string,
    style: Style,
): Promise<VectorLayer> => {
    const apiUrl = getHealthLocsApiUrl(selectedCountry);
    const response = await fetch(apiUrl);
    if (!response.ok) {
        throw new Error(
            `Failed to load clinic data: HTTP ${response.status} ${response.statusText}`,
        );
    }

    const data: GoDataResults<ClinicLocResult> = await response.json();
    const filteredFeatures: GeoJSON.Feature[] = (data.results ?? [])
        .flatMap((item) => {
            const longitude = Number(item.location?.lng);
            const latitude = Number(item.location?.lat);
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
                    health_facility_type_name: item.health_facility_type_details?.name,
                    link: item.link,
                    country: selectedCountry,
                },
            } as GeoJSON.Feature];
        });

    return makePointLayerFromFeatures(filteredFeatures, style);
};
