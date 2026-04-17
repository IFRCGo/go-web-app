// TODO: Find a better differentiation between ibfMap.ts and ibfMapHelpers.ts and simplify
// Task: https://dev.azure.com/redcrossnl/IBF/_workitems/edit/41662

import MVT from 'ol/format/MVT';
import ImageLayer from 'ol/layer/Image';
import VectorTileLayer from 'ol/layer/VectorTile';
import ImageStatic from 'ol/source/ImageStatic';
import VectorTile from 'ol/source/VectorTile';

import {
    pgFeatureserv,
    seedDataRepo,
} from '#config';

import { CountryData } from './ibfMap';
import { type MvtStyleCreator } from './ibfMapStyles';
import type {
    AllEventsData,
    MapLayerDetails,
    SelectedEventMapDetails,
} from './ibfMapTypes';
import {
    mockAllEventsData_MW,
    mockAllEventsData_ZM,
} from './ibfMockData_debug';

// Raw GitHub URLs for direct file access
// TODO: Once we have working API, we'll need a conditional here to target either the
// seed repo or the API
// depending on the environment or another setting.
const seedRepoEventDataUrl = `${seedDataRepo}raster-data/mock-events/rgba/`;
const seedRepoPopDataUrl = `${seedDataRepo}raster-data/population/rgba/`;

// Simplification algorithm factor for simplifying vector data
// Example of factor values on vector object size:
//    full vector size: 300kb
//    .0005 = 279kb
//    .001 = 188kb
//    .05 = 53kb
//    .01 = 30kb
const adminLevelToSimplificationFactor: number[] = [0.01, 0.01, 0.005, 0.004];

// Fetch upcoming or ongoing event data for a country
export function getCurrentCountryEventData(country: string): AllEventsData {
    // TODO: Use the API for fetching this for any country, and only use mock data
    // if set to do so in the env file.

    // TODO: Try to switch to ISO3 in the data, so we can avoid ISO2 -> ISO3 mapping.
    // See task https://dev.azure.com/redcrossnl/IBF/_workitems/edit/41656
    if (country === 'MW') {
        return mockAllEventsData_MW;
    } if (country === 'ZM') {
        return mockAllEventsData_ZM;
    } return {} as AllEventsData;
}

// Fetch a specific event's details, and only return that event
export function getEventDetails(eventId: string): AllEventsData {
    // TODO: Use the API for fetching this for any country, and only use mock data
    // if set to do so in the env file.
    // For mock data, look for the event data with the matching eventId, and only return that event.
    const allMockData: AllEventsData[] = [
        mockAllEventsData_MW,
        mockAllEventsData_ZM,
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
 * @param selectedCountry The ISO_A2 code of the selected country,
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

// TODO: Try to switch to ISO3 in the data, so we can avoid ISO2 -> ISO3 mapping.
// See task https://dev.azure.com/redcrossnl/IBF/_workitems/edit/41656
export const getISO3FromISO2 = (iso2: string): string => {
    const output = CountryData.get(iso2)?.iso_a3;
    if (!output) {
        console.warn(
            `No ISO3 mapping found for ISO2 code ${iso2}, returning input as fallback`,
        );
        return iso2; // fallback to input if no mapping found
    }
    return output;
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
        `${getISO3FromISO2(country_code)}_population`,
    );
};

const makeStaticImageLayer = async (baseUri: string, name: string) => {
    const extents = await getImageExtentsAsync(baseUri, name);
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

/**
 * Fetches the extents from the png metadata JSON file. *
 * @param baseUri base URL for the data source
 * @param name the same name as the image
 * @returns the extents in EPSG:3857, ordered [left, bottom, right, top]
 */
const getImageExtentsAsync = async (
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
