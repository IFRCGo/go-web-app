import { View } from 'ol';
import {
    buffer as bufferExtent,
    type Extent,
    getHeight,
    getWidth,
    isEmpty,
} from 'ol/extent';
import GeoJSON from 'ol/format/GeoJSON';
import MVT from 'ol/format/MVT';
import ImageLayer from 'ol/layer/Image';
import VectorLayer from 'ol/layer/Vector';
import VectorTileLayer from 'ol/layer/VectorTile';
import type MapOl from 'ol/Map';
import { fromLonLat } from 'ol/proj';
import ImageStatic from 'ol/source/ImageStatic';
import VectorSource from 'ol/source/Vector';
import VectorTile from 'ol/source/VectorTile';
import type Style from 'ol/style/Style';

import {
    maptilerApiKey,
    pgFeatureserv,
    seedDataRepo,
} from '#config';

import { type MvtStyleCreator } from './ibfMapStyles';
import type {
    AllEventsData,
    MapLayerDetails,
    SelectedEventMapDetails,
} from './ibfMapTypes';
import {
    mockAllEventsData_MW as mockAllEventsData_MWI,
    mockAllEventsData_ZM as mockAllEventsData_ZMB,
} from './ibfMockData_debug';

// Map property strings
export const noCountrySelectedValue = 'None';

// Default map values
export const defaultMapZoom = 3;

// URL search parameter keys
export const countryParamsKey = 'c';
export const eventIdParamsKey = 'e';
export const mapZoomParamsKey = 'mz';
export const mapCenterLatParamsKey = 'mlat';
export const mapCenterLonParamsKey = 'mlon';

// Data field keys, for instance keys in the GeoJSON data.
export const COUNTRY_FIELD_KEY = 'country';
export const PLACE_CODE_FIELD_KEY = 'code';

// Map URLs
const maptilerBaseUrl = 'https://api.maptiler.com';
// Simple, default IBF data map
export const mapUrlSimpleStyleJson = `${maptilerBaseUrl}/maps/019c41d2-17c7-7e5e-9a47-d3b3f9515a5b/style.json?key=${maptilerApiKey}`;

// Raw GitHub URLs for direct file access
// TODO: Once we have working API, we'll need a conditional here to target either the
// seed repo or the API
// depending on the environment or another setting.
const seedRepoEventDataUrl = `${seedDataRepo}raster-data/mock-events/rgba/`;
const seedRepoPopDataUrl = `${seedDataRepo}raster-data/population/rgba/`;

// GO API URLs for local units data
// TODO: Revisit these sources as part of this task:
// https://dev.azure.com/redcrossnl/IBF/_workitems/edit/42046
// At a minimum, we need a more complete dataset for clinics
// IFRC GO clinics data only seems to list RC locs that are also clinics
// For the Philippines, this is a 100% crossover.
const goApiBaseUrl = 'https://goadmin.ifrc.org/api/v2';
const GO_API_RESULTS_LIMIT = 200;
const getRcLocsApiUrl = (countryIso3: string) => `${goApiBaseUrl}/public-local-units/?country__iso3=${countryIso3}&limit=${GO_API_RESULTS_LIMIT}`;
const getHealthLocsApiUrl = (countryIso3: string) => `${goApiBaseUrl}/health-local-units/?iso3=${countryIso3}&limit=${GO_API_RESULTS_LIMIT}`;

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

// Simplification algorithm factor for simplifying vector data
// Example of factor values on vector object size:
//    full vector size: 300kb
//    .0005 = 279kb
//    .001 = 188kb
//    .05 = 53kb
//    .01 = 30kb
const adminLevelToSimplificationFactor: number[] = [0.05, 0.01, 0.005, 0.004];

// Accept ids containing only alphanumeric characters and hyphens, with a max length
export function sanitizeIdParam(value: string | null | undefined): string {
    const maxLength = 36;
    const idRegex = /^[A-Za-z0-9-]+$/;
    const cleanedValue = value?.trim() ?? '';
    if (cleanedValue.length > maxLength) {
        return '';
    }
    return idRegex.test(cleanedValue) ? cleanedValue : '';
}

// Convert to uppercase and accept only 3 letter length codes
export function sanitizeCountryCode(value: string | null | undefined): string {
    const countryRegex = /^[A-Z]{3}$/;
    const cleanedValue = value?.trim().toUpperCase() ?? '';
    return countryRegex.test(cleanedValue) ? cleanedValue : noCountrySelectedValue;
}

function sanitizeFloatInRange(
    value: string | null | undefined,
    min: number,
    max: number,
): number | null {
    const cleanedValue = value?.trim() ?? '';
    if (cleanedValue === '') {
        return null;
    }

    const parsedValue = Number(cleanedValue);
    if (!Number.isFinite(parsedValue)) {
        return null;
    }

    if (parsedValue < min || parsedValue > max) {
        return null;
    }

    return parsedValue;
}

export function sanitizeMapZoomParam(value: string | null | undefined): number | null {
    return sanitizeFloatInRange(value, 0, 24);
}

export function sanitizeMapLatitudeParam(value: string | null | undefined): number | null {
    return sanitizeFloatInRange(value, -90, 90);
}

export function sanitizeMapLongitudeParam(value: string | null | undefined): number | null {
    return sanitizeFloatInRange(value, -180, 180);
}

// Fetch upcoming or ongoing event data for a country
export function getCurrentCountryEventData(country: string): AllEventsData {
    // TODO: Use the API for fetching this for any country, and only use mock data
    // if set to do so in the env file.
    if (country === 'MWI') {
        return mockAllEventsData_MWI;
    } if (country === 'ZMB') {
        return mockAllEventsData_ZMB;
    } return {} as AllEventsData;
}

// Fetch a specific event's details, and only return that event
export function getEventDetails(eventId: string): AllEventsData {
    // TODO: Use the API for fetching this for any country, and only use mock data
    // if set to do so in the env file.
    // For mock data, look for the event data with the matching eventId, and only return that event.
    const allMockData: AllEventsData[] = [
        mockAllEventsData_MWI,
        mockAllEventsData_ZMB,
    ];
    for (let i = 0; i < allMockData.length; i += 1) {
        const countryEvents = allMockData[i];
        if (countryEvents) {
            const eventData = countryEvents[eventId];
            if (eventData) {
                return { [eventId]: eventData };
            }
        }
    }
    return {} as AllEventsData;
}

// Extract the map-relevant details from event data for a selected event
// Returns null if no event is selected or event not found
export function getSelectedEventMapDetails(
    eventData: AllEventsData,
    eventId: string | null,
): SelectedEventMapDetails | null {
    if (!eventId) return null;

    const event = eventData[eventId];
    if (!event) return null;

    // Build affected regions map by admin level
    const exposedRegionsByLevel = new Map<number, string[]>();
    if (event.exposedAdminAreas) {
        event.exposedAdminAreas.forEach((adminAreas, level) => {
            if (adminAreas && adminAreas.length > 0) {
                const codes = adminAreas.map((area) => area.placeCode);
                exposedRegionsByLevel.set(level, codes);
            }
        });
    } else {
    // Log error and let caller handle the empty map.
        console.error('No exposedAdminAreas found for event:', eventId);
    }

    // TODO: Return extents (of all exposed admin areas)
    // TODO: Return zoom level based on extents
    return {
        eventId,
        centroid: event.centroid,
        exposedRegionsByLevel,
    };
}

/**
 * Create a vector tile layer for the map.
 * @param selectedCountry The ISO_A3 code of the selected country,
 * or noCountrySelectedValue for none.
 * @param mapVectorTileUrl The URL template for the vector tiles
 * @param getMapStyle A function for an MVT tile style creator
 * @returns A VectorTileLayer
 */
export const makeMvtLayerAsync = (
    selectedCountry: string,
    mapVectorTileUrl: string,
    getMapStyle: MvtStyleCreator,
) => new VectorTileLayer({
    source: new VectorTile({
        url: mapVectorTileUrl,
        format: new MVT(),
        maxZoom: 2,
    }),
    style: (feature) => getMapStyle(feature, selectedCountry),
});

/**
 * Fetches the extents from the png metadata JSON file. *
 * @param baseUri base URL for the data source
 * @param name the same name as the image
 * @returns the extents in EPSG:3857, ordered [left, bottom, right, top]
 */
const getRasterExtentsAsync = async (
    baseUri: string,
    name: string,
): Promise<number[]> => {
    const jsonUrl = `${baseUri}${name}_metadata.json`;

    try {
        const response = await fetch(jsonUrl);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();
        if (data?.bounds) {
            const {
                left, bottom, right, top,
            } = data.bounds;
            return [left, bottom, right, top];
        }
        throw new Error('Invalid JSON structure: missing "bounds" property');
    } catch (error) {
    // Re-throw with a customized message
        throw new Error(`Error loading image extents from ${jsonUrl}: ${error}`);
    }
};

const makeStaticImageLayer = async (baseUri: string, name: string) => {
    const extents = await getRasterExtentsAsync(baseUri, name);
    const rasterUrl = `${baseUri}${name}.png`;
    return new ImageLayer({
        source: new ImageStatic({
            url: rasterUrl,
            projection: 'EPSG:3857',
            interpolate: false,
            imageExtent: extents,
            crossOrigin: 'anonymous',
        }),
    });
};

// Raster layer functions
export const makeEventImageLayer = async (name: string) => {
    const baseUri = seedRepoEventDataUrl;
    return makeStaticImageLayer(baseUri, name);
};

export const makePopulationImageLayer = async (country_code: string) => {
    const baseUri = seedRepoPopDataUrl;
    return makeStaticImageLayer(
        baseUri,
        `${country_code}_population`,
    );
};

const isValidCoordinatePair = (
    longitude: number,
    latitude: number,
): boolean => Number.isFinite(longitude)
    && Number.isFinite(latitude)
    && Math.abs(longitude) <= 180
    && Math.abs(latitude) <= 90;

const makePointLayerFromFeatures = (
    features: GeoJSON.Feature[],
    style: Style,
): VectorLayer => {
    const source = new VectorSource({
        features: new GeoJSON().readFeatures(
            {
                type: 'FeatureCollection',
                features,
            },
            {
                dataProjection: 'EPSG:4326',
                featureProjection: 'EPSG:3857',
            },
        ),
    });

    return new VectorLayer({
        source,
        style,
    });
};

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
    return `${pgFeatureserv}/collections/debug.admin_areas/items?filter=admin_level=%270%27&limit=10000&transform=simplify,${factor}`;
};

export const getAdminRegionUrl = (
    country: string,
    adminLevel: number,
): string => {
    const factor = getSimplificationFactor(adminLevel);
    return `${pgFeatureserv}/collections/debug.admin_areas/items?filter=country=%27${country}%27%20AND%20admin_level=%27${adminLevel}%27&limit=10000&transform=simplify,${factor}`;
};

export const getNestedAdminUrl = (
    country: string,
    parentCode: string,
    adminLevel: number,
): string => {
    const factor = getSimplificationFactor(adminLevel);
    return `${pgFeatureserv}/collections/debug.admin_areas/items?filter=country=%27${country}%27%20AND%20admin_level=%27${adminLevel}%27%20AND%20code%20LIKE%20%27${parentCode}%25%27&limit=10000&transform=simplify,${factor}`;
};

// Get the z index offset to make sure lower-level admin layers are not hidden by their parents
export function getAdminAreaZIndex(level: number): number {
    // Start with a base offset of 1000, and add the level
    return 1000 + level;
}

// Get the map layer z index offset on which the layer is drawn.
// Higher numbers are drawn on top of other layers.
// Change the numbers in this function to change the layering order. Use ints.
export function getZIndexOffset(layerDetails: MapLayerDetails): number {
    // Note: admin levels are handled by this function: getAdminAreaZIndex
    // Set the number below in relation to what the admin layer is drawn at.

    switch (layerDetails.dataType) {
        case 'population':
            return 500;
        case 'event_extent':
            return 1100;
        case 'red_cross_branches':
            // Give point data a higher offset
            return 1201;
        case 'clinics':
            // Give point data a higher offset
            return 1202;
        default:
            // No need for a user facing error, but we should log this to correctly handle it later.
            console.error(
                'Unknown layer data type for z-indexing:',
                layerDetails.dataType,
            );
            return 1; // draw on the lowest layer above the base map
    }
}

// Get the extents that fits all the supplied vector data, with added padding
export function getExtentForVectorData(
    source: VectorSource,
): Extent | null {
    const extent = source.getExtent();

    if (!extent || isEmpty(extent)) {
        return null;
    }

    // Padding ratio for all sides.
    // 0.1 = 10%
    const paddingRatio = 0.1;

    // Set the padding amount by the larger of the two dimensions
    const extentWidth = getWidth(extent);
    const extentHeight = getHeight(extent);
    const paddingAmount = Math.max(extentWidth, extentHeight) * paddingRatio;

    return bufferExtent(extent, paddingAmount);
}

export interface InitialMapViewParams {
    zoom?: number;
    center?: {
        lon: number;
        lat: number;
    };
}

/**
 * Initialize the map view with extent constraint and optional initial position.
 *
 * Behavior:
 * - Always constrains panning to the given extent
 * - If valid center coords provided, centers there
 * - If valid zoom provided with center, applies that zoom
 * - If no valid center, fits the view to the extent
 *
 * @param map - The OpenLayers map instance
 * @param extent - The extent to constrain panning to
 * @param initialView - Optional initial view params (center, zoom) from URL
 */
export function initializeMapView(
    map: MapOl,
    extent: Extent,
    initialView?: InitialMapViewParams | null,
): void {
    const currentView = map.getView();

    // Create constrained view that limits panning to the extent
    const constrainedView = new View({
        center: currentView.getCenter(),
        resolution: currentView.getResolution(),
        rotation: currentView.getRotation(),
        projection: currentView.getProjection(),
        extent,
        constrainOnlyCenter: true,
    });
    map.setView(constrainedView);

    const hasValidCenter = initialView?.center
        && Number.isFinite(initialView.center.lon)
        && Number.isFinite(initialView.center.lat);

    if (hasValidCenter) {
        // Apply center from URL params
        constrainedView.setCenter(
            fromLonLat([
                initialView!.center!.lon,
                initialView!.center!.lat,
            ]),
        );

        // Apply zoom if valid
        if (initialView?.zoom !== undefined && Number.isFinite(initialView.zoom)) {
            constrainedView.setZoom(initialView.zoom);
        }
    } else {
        // No valid center - fit to extent (default behavior)
        constrainedView.fit(extent, {
            duration: 500,
        });
    }
}
