import { type Map as MapboxGLMap } from 'mapbox-gl-v3';

import { fetchExposedAdminAreasFeatures } from './nrwDataFetchHelpers';
import {
    exposedAreasDrawOrder,
    getBoundsFromFeatures,
    getZoomToFitBounds,
    makeExposedAreasFillLayerFromFeatures,
} from './nrwMapHelpers';
import {
    addOrderedLayer,
    animationDurationMs,
} from './nrwMapLayerHelpers';
import { setExposureColorsOnFeatures } from './nrwMapStyles';
import type {
    NrwMapboxLayer,
    OrderedMapLayer,
    SelectedEventDetails,
} from './nrwMapTypes';
import type { EventResponseDto } from './shared-dtos';
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
