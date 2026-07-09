import { type Map as MapboxGLMap } from 'mapbox-gl-v3';

import fetchJson from './nrwDataFetchHelpers';
import {
    getBoundsFromFeatures,
    getPaddedSquareBounds,
    getZoomToFitBounds,
} from './nrwMapHelpers';
import { scopedCountriesAdmin0BorderPaint } from './nrwMapStyles';
import type {
    LonLatBounds,
    MapViewParameters,
    NrwMapboxLayer,
    OrderedMapLayer,
} from './nrwMapTypes';
import { getAdminAreaUrl } from './nrwUrls';

// Time in ms for map panning and zooming animations
export const animationDurationMs = 500;
// Extent padding ratio for constraining the panning/zooming to the scoped countries
export const constraintPaddingRatio = 2;

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

// Add a layer to the map, inserting it into a list sorted by draw order.
// Returns the updated ordered layer list.
export function addOrderedLayer(
    map: MapboxGLMap,
    newLayer: NrwMapboxLayer,
    drawOrder: number,
    orderedLayers: OrderedMapLayer[],
): OrderedMapLayer[] {
    if (map.getLayer(newLayer.layerId)) {
        return orderedLayers;
    }

    if (!map.getSource(newLayer.sourceId)) {
        map.addSource(newLayer.sourceId, newLayer.source);
    }

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
