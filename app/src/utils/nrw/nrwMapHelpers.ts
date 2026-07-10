import type {
    CircleLayerSpecification,
    Map as MapboxGLMap,
} from 'mapbox-gl-v3';

import { ibfApiBackend } from '#config';

import fetchJson from './nrwDataFetchHelpers';
import {
    exposedAreasFillPaint,
    scopedCountriesAdmin0BorderPaint,
} from './nrwMapStyles';
import type {
    MapViewParameters,
    NrwMapboxLayer,
    OrderedMapLayer,
    RasterExtent,
    RasterMetadataResponse,
} from './nrwMapTypes';
import type { LonLatBounds } from './nrwMapViewHelpers';
import {
    getBoundsFromFeatures,
    getPaddedSquareBounds,
    getZoomToFitBounds,
} from './nrwMapViewHelpers';
import { getAdminAreaUrl } from './nrwUrls';
import { LayerName } from './shared-enums';

// Time in ms for map panning and zooming animations
export const animationDurationMs = 500;
// Extent padding ratio for constraining the panning/zooming to the scoped countries
const constraintPaddingRatio = 2;

// Mapbox renders in EPSG:3857, but takes lon/lat coordinates in WGS84
// Because of this, image data is stored in EPSG:3857, but
// The API still needs WGS84 coordinates to define the image extent.
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
    extent: RasterExtent
    ,
): NrwMapboxLayer {
    const west = webMercatorToLongitude(extent.xmin);
    const south = webMercatorToLatitude(extent.ymin);
    const east = webMercatorToLongitude(extent.xmax);
    const north = webMercatorToLatitude(extent.ymax);

    const { sourceId, layerId } = makeLayerIds(layerKey);

    return {
        sourceId,
        renderLayerId: layerId,
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

// Fetch raster metadata from the IBF API and build an image raster layer.
// The API serves metadata at `{baseResourceUrl}` and the image at `{baseResourceUrl}/image`.
const makeRasterLayerFromApi = async (
    layerKey: string,
    baseResourceUrl: string,
    layerDescription: string,
): Promise<NrwMapboxLayer> => {
    const metadataJson = await fetchJson<RasterMetadataResponse>(
        baseResourceUrl,
        `${layerDescription} raster metadata`,
    );
    const { extent } = metadataJson.metadata.coloured;

    return makeImageRasterLayer(layerKey, `${baseResourceUrl}/image`, extent);
};

export const makeEventImageLayer = (
    resourceId: string,
): Promise<NrwMapboxLayer> => makeRasterLayerFromApi(
    `event-${resourceId}`,
    `${ibfApiBackend}rasters/alert/${resourceId}`,
    'event',
);

export const makeStaticImageLayer = (
    countryCodeIso3: string,
    layerName: string,
): Promise<NrwMapboxLayer> => makeRasterLayerFromApi(
    `static-${countryCodeIso3}-${layerName}`,
    `${ibfApiBackend}rasters/static/${countryCodeIso3}/${layerName}`,
    layerName,
);

// Build a mapbox circle point layer from GeoJSON point features (WGS84 coordinates)
export const makePointLayerFromFeatures = (
    layerKey: string,
    features: GeoJSON.Feature[],
    paint: CircleLayerSpecification['paint'],
): NrwMapboxLayer => {
    const { sourceId, layerId } = makeLayerIds(layerKey);

    return {
        sourceId,
        renderLayerId: layerId,
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

// Create a mapbox fill layer for exposed admin areas from GeoJSON polygon features.
// The fill color is the precomputed exposure color property.
export const makeExposedAreasFillLayerFromFeatures = (
    layerKey: string,
    features: GeoJSON.Feature[],
): NrwMapboxLayer => {
    const { sourceId, layerId } = makeLayerIds(layerKey);

    return {
        sourceId,
        renderLayerId: layerId,
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

// Draw order for exposed admin area fills: below all other data layers,
// which all have a draw order of at least 1 (see getDrawOrder).
export const exposedAreasDrawOrder = 0;

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
            return 1; // draw on the lowest layer above exposed areas
    }
}

// Add a layer to the map, inserting it into a list sorted by draw order.
// Returns the updated ordered layer list.
export function addOrderedLayer(
    map: MapboxGLMap,
    newLayer: NrwMapboxLayer,
    drawOrder: number,
    orderedLayers: OrderedMapLayer[],
): OrderedMapLayer[] {
    if (map.getLayer(newLayer.renderLayerId)) {
        return orderedLayers;
    }

    if (!map.getSource(newLayer.sourceId)) {
        map.addSource(newLayer.sourceId, newLayer.source);
    }

    const layerAbove = orderedLayers.find((entry) => entry.drawOrder > drawOrder);
    map.addLayer(newLayer.layer, layerAbove?.renderLayerId);

    return [
        ...orderedLayers,
        { renderLayerId: newLayer.renderLayerId, drawOrder },
    ].sort((a, b) => a.drawOrder - b.drawOrder);
}

// Remove a tracked layer and its source if present, and remove it from
// ordered layer bookkeeping.
export function removeLayerAndSource(
    map: MapboxGLMap,
    layer: NrwMapboxLayer,
    orderedLayers: OrderedMapLayer[],
): OrderedMapLayer[] {
    if (map.getLayer(layer.renderLayerId)) {
        map.removeLayer(layer.renderLayerId);
    }
    if (map.getSource(layer.sourceId)) {
        map.removeSource(layer.sourceId);
    }

    return orderedLayers.filter((entry) => entry.renderLayerId !== layer.renderLayerId);
}

// Draw the admin0 borders for the scoped countries and constrain the map
// view to them. Never rejects: returns null when the features cannot be
// fetched or their bounds computed.
export async function drawScopedCountriesAdmin0Layer(
    map: MapboxGLMap,
    scopedCountries: string[],
    initialMapView?: MapViewParameters | null,
): Promise<LonLatBounds | null> {
    try {
        const admin0GeoJson = await Promise.allSettled(
            scopedCountries.map((countryCodeIso3) => fetchJson<GeoJSON.FeatureCollection>(
                getAdminAreaUrl(countryCodeIso3, 0),
                `admin0 for ${countryCodeIso3}`,
            )),
        );

        const features = admin0GeoJson.flatMap((result) => (
            result.status === 'fulfilled'
                ? (result.value.features ?? [])
                : []
        ));

        if (features.length === 0) {
            throw new Error('Failed to load scoped countries admin0 features');
        }

        // Mapbox requires unique names for every layer.
        // If you have the source data, the polygon fill, and the polygon outline,
        // Mapbox treats these as 3 layers, so each would need a unique id.
        // If we add too many layers, consider using a function for name generation.
        const scopedCountriesAdminSourceId = 'nrw-source-scoped-countries-admin0';
        const scopedCountriesAdminBorderLayerId = 'nrw-layer-scoped-countries-admin0-border';

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
            map.fitBounds(getZoomToFitBounds(bounds), {
                duration: animationDurationMs,
            });
        }

        return bounds;
    } catch (error) {
        console.error('[drawScopedCountriesAdmin0Layer] Failed to draw scoped countries admin0:', error);
        return null;
    }
}
