import getBbox from '@turf/bbox';
import type {
    CircleLayerSpecification,
    Map as MapboxGLMap,
} from 'mapbox-gl-v3';

import { ibfApiBackend } from '#config';

import { defaultMapZoom } from './nrwConstants';
import {
    exposedAreasFillPaint,
    scopedCountriesAdmin0BorderPaint,
} from './nrwMapStyles';
import type {
    LonLatBounds,
    MapViewParameters,
    NrwMapboxLayer,
    OrderedMapLayer,
    SelectedEventDetails,
} from './nrwMapTypes';
import { getAdminAreaUrl } from './nrwUrls';
import type {
    EventResponseDto,
    LayerDto,
} from './shared-dtos';
import { LayerName } from './shared-enums';

const defaultMapCenter: [number, number] = [0, 0];

export function getInitialMapViewConfig(
    initialMapView?: MapViewParameters | null,
): { center: [number, number]; zoom: number } {
    return {
        center: initialMapView
            ? [initialMapView.center.lon, initialMapView.center.lat]
            : defaultMapCenter,
        zoom: initialMapView?.zoom ?? defaultMapZoom,
    };
}

export function getMapViewParametersFromMap(
    map: MapboxGLMap,
): MapViewParameters | undefined {
    const mapCenter = map.getCenter();
    const mapZoom = map.getZoom();

    if (!Number.isFinite(mapCenter.lng) || !Number.isFinite(mapCenter.lat)
        || !Number.isFinite(mapZoom)) {
        return undefined;
    }

    return {
        zoom: mapZoom,
        center: {
            lon: mapCenter.lng,
            lat: mapCenter.lat,
        },
    };
}

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

// Generate the paired Mapbox source/layer ids for an NRW layer key
function makeLayerIds(layerKey: string): { sourceId: string; layerId: string } {
    return {
        sourceId: `nrw-source-${layerKey}`,
        layerId: `nrw-layer-${layerKey}`,
    };
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

    const { sourceId, layerId } = makeLayerIds(layerKey);

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
    const { sourceId, layerId } = makeLayerIds(layerKey);

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
    const { sourceId, layerId } = makeLayerIds(layerKey);

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

// Add an exposed admin areas fill layer to the map, inserting it below
// all other data layers (at the head of the draw list).
export function addExposedAreasFillLayer(
    map: MapboxGLMap,
    newLayer: NrwMapboxLayer,
    orderedLayers: OrderedMapLayer[],
): OrderedMapLayer[] {
    if (!map.getSource(newLayer.sourceId)) {
        map.addSource(newLayer.sourceId, newLayer.source);
    }

    // Insert below all existing layers so exposed areas render at the bottom.
    const layerAbove = orderedLayers[0];
    // Add a layer before an existing one
    map.addLayer(newLayer.layer, layerAbove?.layerId);

    // Append to head of the list and return
    return [
        { layerId: newLayer.layerId, drawOrder: 0 },
        ...orderedLayers,
    ];
}

// Get the map layer draw order to decide what is drawn above what.
// Lower numbers are drawn on the bottom of the stack. Other than that,
// the actual values used are arbitrarty.
export function getDrawOrder(layerName: LayerName): number {
    switch (layerName) {
        case LayerName.population:
            return 10;
        case LayerName.floodDepth:
            return 100;
        case LayerName.redCrossBranches:
            return 200;
        case LayerName.clinics:
            return 201;
        default:
            // No need for a user facing error, but we should log this to correctly handle it later.
            console.error(
                'Unknown layer data type for z-indexing:',
                layerName,
            );
            return 1; // draw on the lowest layer
    }
}

// Add a layer to the map, inserting it into a list sorted by draw order.
// Returns the updated ordered layer list.
export function addOrderedLayer(
    map: MapboxGLMap,
    newLayer: NrwMapboxLayer,
    layerDetails: LayerDto,
    orderedLayers: OrderedMapLayer[],
): OrderedMapLayer[] {
    if (map.getLayer(newLayer.layerId)) {
        return orderedLayers;
    }

    if (!map.getSource(newLayer.sourceId)) {
        map.addSource(newLayer.sourceId, newLayer.source);
    }

    const drawOrder = getDrawOrder(layerDetails.layerName);
    const layerAbove = orderedLayers.find((entry) => entry.drawOrder > drawOrder);
    map.addLayer(newLayer.layer, layerAbove?.layerId);

    return [
        ...orderedLayers,
        { layerId: newLayer.layerId, drawOrder },
    ].sort((a, b) => a.drawOrder - b.drawOrder);
}

// Remove a tracked layer and its source if present, and remove it from
// ordered layer bookkeeping.
export function removeLayerAndSource(
    map: MapboxGLMap,
    layer: NrwMapboxLayer,
    orderedLayers: OrderedMapLayer[],
): OrderedMapLayer[] {
    if (map.getLayer(layer.layerId)) {
        map.removeLayer(layer.layerId);
    }
    if (map.getSource(layer.sourceId)) {
        map.removeSource(layer.sourceId);
    }

    return orderedLayers.filter((entry) => entry.layerId !== layer.layerId);
}

// Mapbox requires unique names for every layer.
// If you have the source data, the polygon fill, and the polygon outline,
// Mapbox treats these as 3 layers, so each would need a unique id.
// If we add too many layers, consider using a function for name generation.
const scopedCountriesAdminSourceId = 'nrw-source-scoped-countries-admin0';
const scopedCountriesAdminBorderLayerId = 'nrw-layer-scoped-countries-admin0-border';

// Time in ms for map panning and zooming animations
export const animationDurationMs = 500;
// Extent padding ratio for constraining the panning/zooming to the scoped countries
export const constraintPaddingRatio = 2;
// Padding around 'zoom to fit' logic when zooming in on exposed areas or scoped countries
export const zoomToFitPaddingRatio = 0.1;

// Build a square lon/lat bounding box centered on the data, sized to the larger
// of the width/height dimensions, plus padding on all sides.
// Using the larger dimension means the map can zoom out to fit the full extent
// (height or width) and still leaves room to pan.
function getPaddedSquareBounds(
    bounds: LonLatBounds,
    paddingRatio: number,
): LonLatBounds {
    const [[minLongitude, minLatitude], [maxLongitude, maxLatitude]] = bounds;

    const centerLongitude = (minLongitude + maxLongitude) / 2;
    const centerLatitude = (minLatitude + maxLatitude) / 2;

    const width = maxLongitude - minLongitude;
    const height = maxLatitude - minLatitude;

    // Fit to the larger dimension, then pad.
    const largerDimension = Math.max(width, height);
    const halfSide = (largerDimension * (1 + paddingRatio)) / 2;

    return [
        [centerLongitude - halfSide, centerLatitude - halfSide],
        [centerLongitude + halfSide, centerLatitude + halfSide],
    ];
}

export function getZoomToFitBounds(
    bounds: LonLatBounds,
): LonLatBounds {
    return getPaddedSquareBounds(bounds, zoomToFitPaddingRatio);
}

// Compute the lon/lat bounding box of the given features.
// Returns null when the features contain no valid coordinates.
export function getBoundsFromFeatures(
    features: GeoJSON.Feature[],
): LonLatBounds | null {
    if (features.length === 0) {
        return null;
    }

    const [west, south, east, north] = getBbox({
        type: 'FeatureCollection',
        features,
    });

    if (!Number.isFinite(west) || !Number.isFinite(south)
        || !Number.isFinite(east) || !Number.isFinite(north)) {
        return null;
    }

    return [
        [west, south],
        [east, north],
    ];
}

export async function drawScopedCountriesAdmin0Layer(
    map: MapboxGLMap,
    scopedCountries: string[],
    initialMapView?: MapViewParameters | null,
): Promise<LonLatBounds> {
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
        id: scopedCountriesAdminBorderLayerId,
        type: 'line',
        source: scopedCountriesAdminSourceId,
        paint: scopedCountriesAdmin0BorderPaint,
    });

    const bounds = getBoundsFromFeatures(features);
    if (!bounds) {
        throw new Error('Failed to compute bounds for scoped countries admin0 features');
    }

    // Create bounds to constrain panning and zooming
    const constraintBounds = getPaddedSquareBounds(bounds, constraintPaddingRatio);
    map.setMaxBounds(constraintBounds);

    // If there is not deeplinked view, fit the map to scoped countries on load
    const hasValidInitialMapCenter = (
        initialMapView
        && Number.isFinite(initialMapView.center.lon)
        && Number.isFinite(initialMapView.center.lat)
    );

    if (!hasValidInitialMapCenter) {
        map.fitBounds(getPaddedSquareBounds(bounds, zoomToFitPaddingRatio), {
            duration: animationDurationMs,
        });
    }

    return bounds;
}
