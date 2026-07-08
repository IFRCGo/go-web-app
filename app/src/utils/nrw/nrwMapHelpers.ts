import type {
    CircleLayerSpecification,
    Map as MapboxGLMap,
} from 'mapbox-gl-v3';

import { ibfApiBackend } from '#config';

import {
    exposedAreasFillPaint,
    scopedCountriesAdmin0BorderPaint,
    scopedCountriesAdmin0FillPaint,
} from './nrwMapStyles';
import type {
    MapViewParameters,
    NrwMapboxLayer,
    SelectedEventDetails,
} from './nrwMapTypes';
import { getAdminAreaUrl } from './nrwUrls';
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

const scopedCountriesAdminSourceId = 'nrw-source-scoped-countries-admin0';
const scopedCountriesAdminFillLayerId = 'nrw-layer-scoped-countries-admin0-fill';
const scopedCountriesAdminBorderLayerId = 'nrw-layer-scoped-countries-admin0-border';
export const animationDurationMs = 500;
export const paddingRatio = 0.1;

function hasValidInitialMapCenter(initialMapView?: MapViewParameters | null): boolean {
    return Boolean(
        initialMapView
        && Number.isFinite(initialMapView.center.lon)
        && Number.isFinite(initialMapView.center.lat),
    );
}

// Build a square lon/lat bounding box centered on the data, sized to the larger
// of the width/height dimensions, plus padding on all sides.
// Using the larger dimension means the map can zoom out to fit the full extent
// (height or width) and still leaves room to pan.
export function getPaddedSquareBounds(
    bounds: [[number, number], [number, number]],
    paddingRatioPercent: number,
): [[number, number], [number, number]] {
    const [[minLongitude, minLatitude], [maxLongitude, maxLatitude]] = bounds;

    const centerLongitude = (minLongitude + maxLongitude) / 2;
    const centerLatitude = (minLatitude + maxLatitude) / 2;

    const width = maxLongitude - minLongitude;
    const height = maxLatitude - minLatitude;

    // Fit to the larger dimension, then pad.
    const largerDimension = Math.max(width, height);
    const halfSide = (largerDimension * (1 + paddingRatioPercent)) / 2;

    return [
        [centerLongitude - halfSide, centerLatitude - halfSide],
        [centerLongitude + halfSide, centerLatitude + halfSide],
    ];
}

export function getBoundsFromFeatures(
    features: GeoJSON.Feature[],
): [[number, number], [number, number]] | null {
    let minLongitude = Infinity;
    let minLatitude = Infinity;
    let maxLongitude = -Infinity;
    let maxLatitude = -Infinity;
    let hasAtLeastOneCoordinate = false;

    const addCoordinate = (coordinate: unknown) => {
        if (!Array.isArray(coordinate) || coordinate.length < 2) {
            return;
        }
        const longitude = Number(coordinate[0]);
        const latitude = Number(coordinate[1]);
        if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) {
            return;
        }

        hasAtLeastOneCoordinate = true;
        minLongitude = Math.min(minLongitude, longitude);
        minLatitude = Math.min(minLatitude, latitude);
        maxLongitude = Math.max(maxLongitude, longitude);
        maxLatitude = Math.max(maxLatitude, latitude);
    };

    const traverseCoordinates = (coordinates: unknown) => {
        if (!Array.isArray(coordinates)) {
            return;
        }

        if (coordinates.length > 0 && typeof coordinates[0] === 'number') {
            addCoordinate(coordinates);
            return;
        }

        coordinates.forEach(traverseCoordinates);
    };

    const traverseGeometry = (geometry: GeoJSON.Geometry | undefined) => {
        if (!geometry) {
            return;
        }

        if (geometry.type === 'GeometryCollection') {
            geometry.geometries.forEach(traverseGeometry);
            return;
        }

        traverseCoordinates(geometry.coordinates);
    };

    features.forEach((feature) => {
        traverseGeometry(feature.geometry ?? undefined);
    });

    if (!hasAtLeastOneCoordinate) {
        return null;
    }

    return [
        [minLongitude, minLatitude],
        [maxLongitude, maxLatitude],
    ];
}

export async function drawScopedCountriesAdmin0Layer(
    map: MapboxGLMap,
    scopedCountries: string[],
    initialMapView?: MapViewParameters | null,
): Promise<[[number, number], [number, number]]> {
    const admin0GeoJson = await Promise.allSettled(
        scopedCountries.map(async (countryCodeIso3) => {
            const response = await fetch(getAdminAreaUrl(countryCodeIso3, 0));
            if (!response.ok) {
                throw new Error(`Failed to load admin0 for ${countryCodeIso3}`);
            }
            return response.json() as Promise<GeoJSON.FeatureCollection>;
        }),
    );

    const features = admin0GeoJson.flatMap((result) => (
        result.status === 'fulfilled'
            ? (result.value.features ?? [])
            : []
    ));

    if (features.length === 0) {
        throw new Error('Failed to load scoped countries admin0 features');
    }

    if (map.getLayer(scopedCountriesAdminBorderLayerId)) {
        map.removeLayer(scopedCountriesAdminBorderLayerId);
    }
    if (map.getLayer(scopedCountriesAdminFillLayerId)) {
        map.removeLayer(scopedCountriesAdminFillLayerId);
    }
    if (map.getSource(scopedCountriesAdminSourceId)) {
        map.removeSource(scopedCountriesAdminSourceId);
    }

    map.addSource(scopedCountriesAdminSourceId, {
        type: 'geojson',
        data: {
            type: 'FeatureCollection',
            features,
        },
    });

    map.addLayer({
        id: scopedCountriesAdminFillLayerId,
        type: 'fill',
        source: scopedCountriesAdminSourceId,
        paint: scopedCountriesAdmin0FillPaint,
    });

    map.addLayer({
        id: scopedCountriesAdminBorderLayerId,
        type: 'line',
        source: scopedCountriesAdminSourceId,
        paint: scopedCountriesAdmin0BorderPaint,
    });

    const bounds = getBoundsFromFeatures(features);
    if (!bounds) {
        throw new Error('Failed to compute bounds for scoped countries admin0 features');
    }

    // The pan constraint box must be much larger than the fit box. setMaxBounds
    // caps how far you can zoom out (the viewport must stay inside the box), and
    // with a landscape viewport the horizontal edges bind first. A generously
    // padded constraint box lets the user zoom out far enough to fit the full
    // vertical extent while still preventing panning off into empty space.
    const constraintBounds = getPaddedSquareBounds(bounds, 2);
    map.setMaxBounds(constraintBounds);

    // Respect URL-supplied view; otherwise fit map to scoped countries on first
    // load, framing the country with a smaller padding.
    if (!hasValidInitialMapCenter(initialMapView)) {
        map.fitBounds(getPaddedSquareBounds(bounds, paddingRatio), {
            duration: animationDurationMs,
        });
    }

    return bounds;
}
