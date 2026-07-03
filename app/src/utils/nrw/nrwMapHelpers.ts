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

import { ibfApiBackend } from '#config';

import { type MvtStyleCreator } from './nrwMapStyles';
import type { SelectedEventDetails } from './nrwMapTypes';
import type {
    EventResponseDto,
    LayerDto,
} from './shared-dtos';
import { LayerName } from './shared-enums';

// Extract the map-relevant details from event data for a selected event
// Returns null if no event is selected or event not found
export function getSelectedEventDetails(
    eventData: EventResponseDto[],
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
        // Parse the list of exposed admin areas, grouping by admin level
        // to build the SelectedEventDetails.
        event.exposedAdminAreas.forEach((area) => {
            const { adminLevel: level } = area;

            // Get the value of the exposed population for this admin area, if any
            const eventPopulationData = area.exposure.find(
                (layer) => layer.layerName === LayerName.populationExposed,
            );
            const exposedPopulationValue = eventPopulationData?.exposed ?? 0;

            // Store the value for this admin area, keyed by level then place code
            if (!exposedPopulationPerAreaByLevel[level]) {
                exposedPopulationPerAreaByLevel[level] = {};
                highestExposedPopulationByLevel[level] = 0;
            }
            exposedPopulationPerAreaByLevel[level][area.placeCode] = exposedPopulationValue;

            // Update the highest exposed population value for this level if needed
            const currentHighest = highestExposedPopulationByLevel[level] ?? 0;
            if (exposedPopulationValue > currentHighest) {
                highestExposedPopulationByLevel[level] = exposedPopulationValue;
            }
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

// Raster layer functions
export const makeEventImageLayer = async (resourceId: string) => {
    const baseUrl = `${ibfApiBackend}rasters/alert`;
    const metadataUrl = `${baseUrl}/${resourceId}`;
    const metadataResponse = await fetch(metadataUrl);
    if (!metadataResponse.ok) {
        throw new Error(`Failed to fetch event raster metadata: ${metadataResponse.status}`);
    }
    const metadataJson = await metadataResponse.json();
    const {
        xmin, ymin, xmax, ymax,
    } = metadataJson.metadata.coloured.extent;

    const imageUrl = `${baseUrl}/${resourceId}/image`;
    return new ImageLayer({
        source: new ImageStatic({
            url: imageUrl,
            projection: 'EPSG:3857', // TODO: switch to shared enum
            interpolate: false,
            imageExtent: [xmin, ymin, xmax, ymax],
            crossOrigin: 'anonymous',
        }),
    });
};

export const makeStaticImageLayer = async (countryCodeIso3: string, layerName: string) => {
    const baseUrl = `${ibfApiBackend}rasters/static`;
    const metadataUrl = `${baseUrl}/${countryCodeIso3}/${layerName}`;
    const metadataResponse = await fetch(metadataUrl);
    if (!metadataResponse.ok) {
        throw new Error(`Failed to fetch ${layerName} raster metadata: ${metadataResponse.status}`);
    }
    const metadataJson = await metadataResponse.json();
    const {
        xmin, ymin, xmax, ymax,
    } = metadataJson.metadata.coloured.extent;

    const imageUrl = `${baseUrl}/${countryCodeIso3}/${layerName}/image`;
    return new ImageLayer({
        source: new ImageStatic({
            url: imageUrl,
            projection: 'EPSG:3857',
            interpolate: false,
            imageExtent: [xmin, ymin, xmax, ymax],
            crossOrigin: 'anonymous',
        }),
    });
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
export function getZIndexOffset(layerDetails: LayerDto): number {
    // Note: admin levels are handled by this function: getAdminAreaZIndex
    // Set the number below in relation to what the admin layer is drawn at.

    switch (layerDetails.layerName) {
        case LayerName.population:
            return 500;
        case LayerName.floodDepth:
            return 1100;
        case LayerName.redCrossBranches:
            // Give point data a higher offset
            return 1201;
        case LayerName.clinics:
            // Give point data a higher offset
            return 1202;
        default:
            // No need for a user facing error, but we should log this to correctly handle it later.
            console.error(
                'Unknown layer data type for z-indexing:',
                layerDetails.layerName,
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
