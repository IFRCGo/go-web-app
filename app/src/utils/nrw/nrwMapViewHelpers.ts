import getBbox from '@turf/bbox';
import type { Map as MapboxGLMap } from 'mapbox-gl-v3';

import { defaultMapZoom } from './nrwConstants';
import type { MapViewParameters } from './nrwMapTypes';

// Padding around 'zoom to fit' logic when zooming in on exposed areas or scoped countries
const zoomToFitPaddingRatio = 0.1;

// Lon/lat bounds as [[west, south], [east, north]].
// A plain tuple is used instead of mapboxgl.LngLatBounds to avoid needing to
// construct a class instance when passing bounds to the map component.
export type LonLatBounds = [[number, number], [number, number]];

// Return the map view based on map parameters.
// This is used to set the initial view from deep link parameters.
export function getMapViewFromParameters(
    mapViewParams?: MapViewParameters | null,
): { center: [number, number]; zoom: number } {
    const defaultMapCenter: [number, number] = [0, 0];
    return {
        center: mapViewParams
            ? [mapViewParams.center.lon, mapViewParams.center.lat]
            : defaultMapCenter,
        zoom: mapViewParams?.zoom ?? defaultMapZoom,
    };
}

// Get map parameters from the current map view.
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
