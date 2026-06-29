import {
    useCallback,
    useRef,
    useState,
} from 'react';
import type BaseLayer from 'ol/layer/Base';

import useAlert from '#hooks/useAlert';
import {
    makeClinicPointLayer,
    makeRcBranchesPointLayer,
} from '#utils/nrw/nrwDataFetchHelpers';
import {
    makeEventImageLayer,
    makePopulationImageLayer,
} from '#utils/nrw/nrwMapHelpers';
import {
    styleClinicPoint,
    styleRcBranchPoint,
} from '#utils/nrw/nrwMapStyles';
import {
    type EventResponseDto,
    type MapLayerDetailsDto,
} from '#utils/nrw/shared-dtos';
import {
    MapLayerDisplayType,
    MapLayerInfoType,
} from '#utils/nrw/shared-enums';

/**
 * Hook used to manage and share data for the NRW map components.
 *
 * Responsibilities:
 * - Load and cache data
 * - Create, cache, and toggle map data layers
 *
 * @param selectedCountry - ISO_A3 country code for country-specific layers
 */
export default function useNrwDataLoader(
    selectedCountry: string,
    initialEventData: EventResponseDto[],
    initialEventId: number | null,
    initialLayerIds: string[],
) {
    const alert = useAlert();

    // Shared state: event data and selected event
    const [eventData, setEventData] = useState<EventResponseDto[]>(initialEventData);
    const [selectedEventId, setSelectedEventId] = useState<number | null>(
        initialEventId,
    );

    // Resource IDs of currently visible layers (population, flood depth, etc.)
    // The starting value is any layer IDs in the deeplink.
    const [visibleLayerIds, setVisibleLayerIds] = useState<string[]>(initialLayerIds);

    // If the base map setup is complete.
    // This must be awaited before any layers can be added to the map.
    const [isMapReady, setIsMapReady] = useState(false);

    // Reference to the function (passed in by the map component) for adding layers to the map.
    const addLayerToMapFunction = useRef<(
      (layer: BaseLayer, layerInfo: MapLayerDetailsDto) => void) | null
        >(null,
        );

    // Cache of all loaded layers.
    // The key is fixed based on the layer details.
    const layersCache = useRef(new Map<string, BaseLayer>());
    const getLayerKey = (layerDetails: MapLayerDetailsDto): string => `${layerDetails.dataType}_${selectedCountry}_${layerDetails.resourceId}`;

    // Register the map's addLayer function.
    // Called by OlDataMap when the map is ready.
    const registerMapAddLayer = useCallback(
        (addLayer: (layer: BaseLayer, layerInfo: MapLayerDetailsDto) => void) => {
            addLayerToMapFunction.current = addLayer;
            setIsMapReady(true);
        },
        [],
    );

    // Update the active layer ids
    // Run this whenever a layer's visibility changes.
    const updateActiveLayerIds = (resourceId: string, isVisible: boolean) => {
        if (!resourceId) {
            return;
        }
        setVisibleLayerIds((prev) => {
            const has = prev.includes(resourceId);
            if (isVisible && !has) {
                return [...prev, resourceId];
            }
            if (!isVisible && has) {
                return prev.filter((id) => id !== resourceId);
            }
            return prev;
        });
    };

    // Internal function for handling layer toggling logic
    // If there is a cached layer, toggle its visibility.
    // Otherwise, load it with the passed in loadLayer function.
    const toggleLayer = async (
        key: string,
        layerDetails: MapLayerDetailsDto,
        loadLayer: () => Promise<BaseLayer>,
    ) => {
        if (!addLayerToMapFunction.current) {
            console.error('[useNrwDataLoader] Map not ready');
            return;
        }

        const existing = layersCache.current.get(key);
        if (existing) {
            const nextVisible = !existing.getVisible();
            existing.setVisible(nextVisible);
            updateActiveLayerIds(layerDetails.resourceId, nextVisible);
            return;
        }

        try {
            const layer = await loadLayer();
            layersCache.current.set(key, layer);
            addLayerToMapFunction.current(layer, layerDetails);
            updateActiveLayerIds(layerDetails.resourceId, layer.getVisible());
        } catch (error) {
            console.error(`[useNrwDataLoader] Failed to load layer ${key}:`, error);
            alert.show('Failed to load map layer', {
                variant: 'danger',
                description: 'The map layer could not be loaded. Please try again.',
            });
        }
    };

    // Exposed function to toggle a map layer
    // If the layer is not cached, it will be loaded.
    const toggleMapLayer = (layerDetails: MapLayerDetailsDto) => {
        const { dataType, displayType, resourceId } = layerDetails;

        switch (displayType) {
            case MapLayerDisplayType.Raster:
                switch (dataType) {
                    case MapLayerInfoType.Population:
                        toggleLayer(
                            getLayerKey(layerDetails),
                            layerDetails,
                            () => makePopulationImageLayer(selectedCountry),
                        );
                        break;
                    case MapLayerInfoType.FloodDepth:
                        toggleLayer(
                            getLayerKey(layerDetails),
                            layerDetails,
                            () => makeEventImageLayer(resourceId),
                        );
                        break;
                    default:
                        console.error(
                            `[useNrwDataLoader] Unsupported raster layer type: ${dataType}`,
                        );
                }
                break;
            case MapLayerDisplayType.Point:
                switch (dataType) {
                    case MapLayerInfoType.RedCrossBranches:
                        toggleLayer(
                            getLayerKey(layerDetails),
                            layerDetails,
                            () => makeRcBranchesPointLayer(selectedCountry, styleRcBranchPoint),
                        );
                        break;
                    case MapLayerInfoType.Clinics:
                        toggleLayer(
                            getLayerKey(layerDetails),
                            layerDetails,
                            () => makeClinicPointLayer(selectedCountry, styleClinicPoint),
                        );
                        break;
                    default:
                        console.error(
                            `[useNrwDataLoader] Unsupported point layer type: ${dataType}`,
                        );
                }
                break;
            default:
                // TODO: Handle other display types (Shape, VectorTile)
                console.error(
                    `[useNrwDataLoader] Unsupported display type: ${displayType}`,
                );
        }
    };

    // Set the visibility of all cached layers to false.
    const hideAllLayers = () => {
        layersCache.current.forEach((layer) => {
            layer.setVisible(false);
        });
        setVisibleLayerIds([]);
    };

    // Select an event by ID
    const selectEvent = (eventId: number) => {
        setSelectedEventId(eventId);
    };

    // Deselect the current event, hiding all layers
    const deselectEvent = () => {
        hideAllLayers();
        setSelectedEventId(null);
    };

    // Get available layers for the currently selected event
    const selectedEvent = eventData.find((event) => event.eventId === selectedEventId) ?? null;
    const selectedEventLayers: MapLayerDetailsDto[] = selectedEvent?.availableLayers ?? [];

    return {
        eventData,
        setEventData,
        selectedEventId,
        selectEvent,
        deselectEvent,
        selectedEventLayers,
        registerMapAddLayer,
        toggleMapLayer,
        hideAllLayers,
        activeLayerIds: visibleLayerIds,
        isMapReady,
        initialLayerIds,
    };
}
