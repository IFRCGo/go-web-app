import getBbox from '@turf/bbox';
import type { CircleLayerSpecification } from 'mapbox-gl-v3';

import { ibfApiBackend } from '#config';

import { defaultMapZoom } from './nrwConstants';
import fetchJson from './nrwDataFetchHelpers';
import { exposedAreasFillPaint } from './nrwMapStyles';
import type {
    LonLatBounds,
    MapViewParameters,
    NrwMapboxLayer,
} from './nrwMapTypes';
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

// Raster extent as returned by the IBF API raster metadata endpoints (EPSG:3857)
interface RasterExtent {
    xmin: number;
    ymin: number;
    xmax: number;
    ymax: number;
}

// Relevant fields of the raster metadata responses from the IBF API
interface RasterMetadataResponse {
    metadata: {
        coloured: {
            extent: RasterExtent;
        };
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
            return 1; // draw on the lowest layer
    }
}

// Padding around 'zoom to fit' logic when zooming in on exposed areas or scoped countries
export const zoomToFitPaddingRatio = 0.1;

// Build a square lon/lat bounding box centered on the data, sized to the larger
// of the width/height dimensions, plus padding on all sides.
// Using the larger dimension means the map can zoom out to fit the full extent
// (height or width) and still leaves room to pan.
export function getPaddedSquareBounds(
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
