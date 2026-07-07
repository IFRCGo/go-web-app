import type { CircleLayerSpecification } from 'mapbox-gl-v3';

import { ibfApiBackend } from '#config';

import { exposedAreasFillPaint } from './nrwMapStyles';
import type {
    NrwMapboxLayer,
    SelectedEventDetails,
} from './nrwMapTypes';
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

// Half of the earth's circumference in meters at the equator (EPSG:3857 bound)
const webMercatorHalfCircumference = 20037508.34;

// Convert EPSG:3857 meters to WGS84 longitude degrees
function webMercatorToLongitude(x: number): number {
    return (x / webMercatorHalfCircumference) * 180;
}

// Convert EPSG:3857 meters to WGS84 latitude degrees
function webMercatorToLatitude(y: number): number {
    return (
        (Math.atan(Math.exp((y / webMercatorHalfCircumference) * Math.PI)) * 360) / Math.PI - 90
    );
}

// Raster extent as returned by the IBF API raster metadata endpoints (EPSG:3857)
interface RasterExtent {
    xmin: number;
    ymin: number;
    xmax: number;
    ymax: number;
}

// Build a mapbox image raster layer from an image URL and its EPSG:3857 extent
function makeImageRasterLayer(
    layerKey: string,
    imageUrl: string,
    extent: RasterExtent,
): NrwMapboxLayer {
    const west = webMercatorToLongitude(extent.xmin);
    const south = webMercatorToLatitude(extent.ymin);
    const east = webMercatorToLongitude(extent.xmax);
    const north = webMercatorToLatitude(extent.ymax);

    const sourceId = `nrw-source-${layerKey}`;
    const layerId = `nrw-layer-${layerKey}`;

    return {
        sourceId,
        layerId,
        source: {
            type: 'image',
            url: imageUrl,
            coordinates: [
                [west, north],
                [east, north],
                [east, south],
                [west, south],
            ],
        },
        layer: {
            id: layerId,
            type: 'raster',
            source: sourceId,
            paint: {
                'raster-opacity': 0.8,
                // Use 'nearest' resampling to avoid blurring the raster when zoomed in
                'raster-resampling': 'nearest',
            },
        },
    };
}

// Raster layer functions
export const makeEventImageLayer = async (resourceId: string): Promise<NrwMapboxLayer> => {
    const baseUrl = `${ibfApiBackend}rasters/alert`;
    const metadataUrl = `${baseUrl}/${resourceId}`;
    const metadataResponse = await fetch(metadataUrl);
    if (!metadataResponse.ok) {
        throw new Error(`Failed to fetch event raster metadata: ${metadataResponse.status}`);
    }
    const metadataJson = await metadataResponse.json();
    const extent = metadataJson.metadata.coloured.extent as RasterExtent;

    const imageUrl = `${baseUrl}/${resourceId}/image`;
    return makeImageRasterLayer(`event-${resourceId}`, imageUrl, extent);
};

export const makeStaticImageLayer = async (
    countryCodeIso3: string,
    layerName: string,
): Promise<NrwMapboxLayer> => {
    const baseUrl = `${ibfApiBackend}rasters/static`;
    const metadataUrl = `${baseUrl}/${countryCodeIso3}/${layerName}`;
    const metadataResponse = await fetch(metadataUrl);
    if (!metadataResponse.ok) {
        throw new Error(`Failed to fetch ${layerName} raster metadata: ${metadataResponse.status}`);
    }
    const metadataJson = await metadataResponse.json();
    const extent = metadataJson.metadata.coloured.extent as RasterExtent;

    const imageUrl = `${baseUrl}/${countryCodeIso3}/${layerName}/image`;
    return makeImageRasterLayer(`static-${countryCodeIso3}-${layerName}`, imageUrl, extent);
};

export const isValidCoordinatePair = (
    longitude: number,
    latitude: number,
): boolean => Number.isFinite(longitude)
    && Number.isFinite(latitude)
    && Math.abs(longitude) <= 180
    && Math.abs(latitude) <= 90;

// Build a mapbox circle point layer from GeoJSON point features (WGS84 coordinates)
export const makePointLayerFromFeatures = (
    layerKey: string,
    features: GeoJSON.Feature[],
    paint: CircleLayerSpecification['paint'],
): NrwMapboxLayer => {
    const sourceId = `nrw-source-${layerKey}`;
    const layerId = `nrw-layer-${layerKey}`;

    return {
        sourceId,
        layerId,
        source: {
            type: 'geojson',
            data: {
                type: 'FeatureCollection',
                features,
            },
        },
        layer: {
            id: layerId,
            type: 'circle',
            source: sourceId,
            paint,
        },
    };
};

// Build a mapbox fill layer for exposed admin areas from GeoJSON polygon features.
// Each feature must carry its precomputed exposure color property
// (EXPOSURE_COLOR_FIELD_KEY), which drives the fill and outline colors.
export const makeExposedAreasFillLayerFromFeatures = (
    layerKey: string,
    features: GeoJSON.Feature[],
): NrwMapboxLayer => {
    const sourceId = `nrw-source-${layerKey}`;
    const layerId = `nrw-layer-${layerKey}`;

    return {
        sourceId,
        layerId,
        source: {
            type: 'geojson',
            data: {
                type: 'FeatureCollection',
                features,
            },
        },
        layer: {
            id: layerId,
            type: 'fill',
            source: sourceId,
            paint: exposedAreasFillPaint,
        },
    };
};

// Get the map layer z index offset on which the layer is drawn.
// Higher numbers are drawn on top of other layers.
// Change the numbers in this function to change the layering order. Use ints.
export function getZIndexOffset(layerDetails: LayerDto): number {
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
