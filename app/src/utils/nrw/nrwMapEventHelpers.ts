import { type Map as MapboxGLMap } from 'mapbox-gl-v3';

import { fetchExposedAdminAreasFeatures } from './nrwDataFetchHelpers';
import {
    addOrderedLayer,
    animationDurationMs,
    exposedAreasDrawOrder,
    getBoundsFromFeatures,
    getZoomToFitBounds,
    makeExposedAreasFillLayerFromFeatures,
} from './nrwMapHelpers';
import { setExposureColorsOnFeatures } from './nrwMapStyles';
import type {
    NrwMapboxLayer,
    OrderedMapLayer,
    SelectedEventDetails,
} from './nrwMapTypes';

interface RenderExposedAreasOnMapParams {
    map: MapboxGLMap;
    scopedCountries: string[];
    selectedEventDetails: SelectedEventDetails;
    orderedLayers: OrderedMapLayer[];
    isOutdated?: () => boolean;
}

interface RenderExposedAreasOnMapResult {
    layer: NrwMapboxLayer;
    orderedLayers: OrderedMapLayer[];
}

function hasExposedPopulationData(selectedEventDetails: SelectedEventDetails): boolean {
    const { exposedPopulationPerAreaByLevel } = selectedEventDetails;
    return Object.keys(exposedPopulationPerAreaByLevel).length > 0;
}

// Fetch, prepare, render, and zoom to a selected event's exposed admin areas.
// Returns null when the caller marks this render request as
// outdated, or when the data cannot be fetched or rendered.
export default async function renderExposedAreasOnMap({
    map,
    scopedCountries,
    selectedEventDetails,
    orderedLayers,
    isOutdated,
}: RenderExposedAreasOnMapParams): Promise<
RenderExposedAreasOnMapResult | null
> {
    if (!hasExposedPopulationData(selectedEventDetails)) {
        console.error(`[renderSelectedEventExposedAreasOnMap] No exposed population data for event ${selectedEventDetails.eventId}`);
        return null;
    }

    try {
        const features = await fetchExposedAdminAreasFeatures(
            scopedCountries,
            selectedEventDetails,
        );
        if (isOutdated?.()) {
            return null;
        }

        const coloredFeatures = setExposureColorsOnFeatures(features, selectedEventDetails);
        const layer = makeExposedAreasFillLayerFromFeatures(
            `exposed-areas-event-${selectedEventDetails.eventId}`,
            coloredFeatures,
        );

        // Insert below all other data layers so exposed areas render at the bottom.
        const updatedOrderedLayers = addOrderedLayer(
            map,
            layer,
            exposedAreasDrawOrder,
            orderedLayers,
        );

        const exposedAreasBounds = getBoundsFromFeatures(features);
        if (exposedAreasBounds) {
            map.fitBounds(getZoomToFitBounds(exposedAreasBounds), {
                duration: animationDurationMs,
            });
        }

        return {
            layer,
            orderedLayers: updatedOrderedLayers,
        };
    } catch (error) {
        console.error(`[renderSelectedEventExposedAreasOnMap] Failed to render exposed areas for event ${selectedEventDetails.eventId}:`, error);
        return null;
    }
}
