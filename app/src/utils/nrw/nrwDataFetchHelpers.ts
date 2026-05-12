import type VectorLayer from 'ol/layer/Vector';
import type Style from 'ol/style/Style';

import {
    ADMIN_LEVEL_FIELD_KEY,
    ADMIN1_PCODE_FIELD_KEY,
    ADMIN2_PCODE_FIELD_KEY,
    ADMIN3_PCODE_FIELD_KEY,
    PLACE_CODE_FIELD_KEY,
} from './nrwConstants';
import {
    isValidCoordinatePair,
    makePointLayerFromFeatures,
} from './nrwMapHelpers';
import {
    type AllEventsData,
    type CountryMapData,
} from './nrwMapTypes';
import {
    getAdminAreaDetailsNoGeoUrl,
    getHealthLocsApiUrl,
    getRcLocsApiUrl,
    getSeedRepoMockEventDataUrl,
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
        const props = features[0].properties;
        return {
            code: props[PLACE_CODE_FIELD_KEY],
            adminLevel: Number(props[ADMIN_LEVEL_FIELD_KEY]),
            admin1Pcode: props[ADMIN1_PCODE_FIELD_KEY] ?? null,
            admin2Pcode: props[ADMIN2_PCODE_FIELD_KEY] ?? null,
            admin3Pcode: props[ADMIN3_PCODE_FIELD_KEY] ?? null,
        };
    } catch {
        return null;
    }
}

// Load mock event data JSON for a given country from the seed data repo
async function loadMockEventData(country: string): Promise<AllEventsData> {
    const url = getSeedRepoMockEventDataUrl(country);
    try {
        const response = await fetch(url);
        if (!response.ok) {
            return {} as AllEventsData;
        }
        return await response.json() as AllEventsData;
    } catch {
        return {} as AllEventsData;
    }
}

// Fetch upcoming or ongoing events data for a country
export async function getCurrentCountryEventData(country: string): Promise<AllEventsData> {
    // TODO: Use the API for fetching this for any country, and only use mock data
    // if set to do so in the env file.
    return loadMockEventData(country);
}

// Fetch a specific event's details, and only return that event
export async function getEventDetails(eventId: string): Promise<AllEventsData> {
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
            const eventData = countryEvents[eventId];
            if (eventData) {
                return { [eventId]: eventData };
            }
        }
    }
    return {} as AllEventsData;
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
