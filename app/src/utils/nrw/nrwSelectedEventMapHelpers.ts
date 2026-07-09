import { type Map as MapboxGLMap } from 'mapbox-gl-v3';

import { fetchExposedAdminAreasFeatures } from './nrwDataFetchHelpers';
import {
    addExposedAreasFillLayer,
    animationDurationMs,
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

interface RenderSelectedEventExposedAreasOnMapParams {
    map: MapboxGLMap;
    scopedCountries: string[];
    selectedEventDetails: SelectedEventDetails;
    orderedLayers: OrderedMapLayer[];
    isOutdated?: () => boolean;
}

interface RenderSelectedEventExposedAreasOnMapResult {
    layer: NrwMapboxLayer;
    orderedLayers: OrderedMapLayer[];
}

function hasExposedPopulationData(selectedEventDetails: SelectedEventDetails): boolean {
    const { exposedPopulationPerAreaByLevel } = selectedEventDetails;
    return Object.keys(exposedPopulationPerAreaByLevel).length > 0;
}

// Fetch, prepare, render, and zoom to a selected event's exposed admin areas.
// Returns null when the caller marks this render request as outdated.
export default async function renderSelectedEventExposedAreasOnMap({
    map,
    scopedCountries,
    selectedEventDetails,
    orderedLayers,
    isOutdated,
}: RenderSelectedEventExposedAreasOnMapParams):
Promise<RenderSelectedEventExposedAreasOnMapResult |
null> {
    if (!hasExposedPopulationData(selectedEventDetails)) {
        throw new Error('Event has no exposed population data');
    }

    const features = await fetchExposedAdminAreasFeatures(scopedCountries, selectedEventDetails);
    if (isOutdated?.()) {
        return null;
    }

    const coloredFeatures = setExposureColorsOnFeatures(features, selectedEventDetails);
    const layer = makeExposedAreasFillLayerFromFeatures(
        `exposed-areas-event-${selectedEventDetails.eventId}`,
        coloredFeatures,
    );

    const updatedOrderedLayers = addExposedAreasFillLayer(
        map,
        layer,
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
}
