import type { CircleLayerSpecification } from 'mapbox-gl-v3';

import mockCountryData from './mockData/mock_CountryData';
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
    type NrwMapboxLayer,
} from './nrwMapTypes';
import {
    getAdminAreaDetailsNoGeoUrl,
    getEventsApiUrl,
    getHealthLocsApiUrl,
    getRcLocsApiUrl,
} from './nrwUrls';
import type { EventResponseDto } from './shared-dtos';
import { LayerName } from './shared-enums';

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

// Fetch events from the IBF API
async function fetchEventsFromApi(
    countryCodeIso3: string,
): Promise<EventResponseDto[]> {
    try {
        const url = getEventsApiUrl(countryCodeIso3);
        const response = await fetch(url);
        if (!response.ok) {
            return [];
        }
        const rawText = await response.text();
        const data = JSON.parse(rawText) as EventResponseDto[];
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

export const makeRcBranchesPointLayer = async (
    selectedCountry: string,
    paint: CircleLayerSpecification['paint'],
): Promise<NrwMapboxLayer> => {
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

    return makePointLayerFromFeatures(
        `${LayerName.redCrossBranches}-${selectedCountry}`,
        filteredFeatures,
        paint,
    );
};

export const makeClinicPointLayer = async (
    selectedCountry: string,
    paint: CircleLayerSpecification['paint'],
): Promise<NrwMapboxLayer> => {
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

    return makePointLayerFromFeatures(
        `${LayerName.clinics}-${selectedCountry}`,
        filteredFeatures,
        paint,
    );
};
