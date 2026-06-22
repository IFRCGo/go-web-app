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

import { type MvtStyleCreator } from './nrwMapStyles';
import type {
    EventOverviewData,
    MapLayerDetails,
    SelectedEventDetails,
} from './nrwMapTypes';
import { ExposedItemType } from './nrwMapTypes';
import {
    seedRepoEventDataUrl,
    seedRepoPopDataUrl,
} from './nrwUrls';

// Extract the map-relevant details from event data for a selected event
// Returns null if no event is selected or event not found
export function getSelectedEventDetails(
    eventData: EventOverviewData[],
    eventId: number | null,
): SelectedEventDetails | null {
    if (!eventId) return null;

    const event = eventData.find((e) => e.eventId === eventId);
    if (!event) return null;

    // Values needed for building the SelectedEventDetails:
    // Exposed admin areas with their exposed population, per admin level.
    const exposedPopulationPerAreaByLevel: Record<number, Record<string, number>> = {};
    // Highest exposed population value per admin level
    const highestExposedPopulationByLevel: Record<number, number> = {};

    if (event.exposedAdminAreas) {
        // Parse the exposed admin area data by admin level
        // to build the SelectedEventDetails
        event.exposedAdminAreas.forEach((adminAreas, level) => {
            if (!adminAreas || adminAreas.length === 0) {
                return;
            }

            // Look in all admin areas for this level and extract both the exposed population,
            // and the highest exposed population value for this level.
            const populationByCode: Record<string, number> = {};
            let highestExposedPopulationValue = 0;

            adminAreas.forEach((area) => {
                // Get the value of the exposed population for this admin area, if any
                const eventPopulationData = area.exposure.find(
                    (category) => category.type === ExposedItemType.Population,
                );
                const exposedPopulationValue = eventPopulationData?.exposed ?? 0;

                // Store the value for this admin area, and update the highest value if needed
                populationByCode[area.placeCode] = exposedPopulationValue;
                if (exposedPopulationValue > highestExposedPopulationValue) {
                    highestExposedPopulationValue = exposedPopulationValue;
                }
            });

            // Set the data for this level
            exposedPopulationPerAreaByLevel[level] = populationByCode;
            highestExposedPopulationByLevel[level] = highestExposedPopulationValue;
        });
    } else {
    // Log error and let caller handle the empty map.
        console.error('No exposedAdminAreas found for event:', eventId);
    }

    // Return a SelectedEventDetails object with the extracted data
    return {
        eventId,
        centroid: event.centroid,
        alertClass: event.alertClass,
        exposedPopulationPerAreaByLevel,
        highestExposedPopulationByLevel,
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

export const isValidCoordinatePair = (
    longitude: number,
    latitude: number,
): boolean => Number.isFinite(longitude)
    && Number.isFinite(latitude)
    && Math.abs(longitude) <= 180
    && Math.abs(latitude) <= 90;

export const makePointLayerFromFeatures = (
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
