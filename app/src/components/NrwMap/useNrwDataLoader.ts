import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import type BaseLayer from 'ol/layer/Base';

import useAlert from '#hooks/useAlert';
import {
    getCurrentCountryEventData,
    getEventDetails,
    makeClinicPointLayer,
    makeRcBranchesPointLayer,
} from '#utils/nrw/nrwDataFetchHelpers';
import {
    getSelectedEventDetails,
    makeEventImageLayer,
    makePopulationImageLayer,
} from '#utils/nrw/nrwMapHelpers';
import {
    styleClinicPoint,
    styleRcBranchPoint,
} from '#utils/nrw/nrwMapStyles';
import {
    type EventResponseDto,
    type LayerDto,
} from '#utils/nrw/shared-dtos';
import {
    LayerName,
    LayerType,
} from '#utils/nrw/shared-enums';

/**
 * Hook used to manage and share data for the NRW map components.
 *
 * Responsibilities:
 * - Load and cache data
 * - Create, cache, and toggle map data layers
 *
 * @param selectedCountry - ISO_A3 country code for country-specific layers
 * @param selectedEventId - Currently selected event id (selection state owned by the container)
 */
export default function useNrwDataLoader(
    selectedCountry: string,
    initialEventData: EventResponseDto[],
    selectedEventId: number | null,
    initialLayerIds: string[],
) {
    const alert = useAlert();

    // Data state: event data loaded from the API.
    const [eventData, setEventData] = useState<EventResponseDto[]>(initialEventData);

    // Resource IDs of currently visible layers (population, flood depth, etc.)
    // The starting value is any layer IDs in the deeplink.
    const [visibleLayerIds, setVisibleLayerIds] = useState<string[]>(initialLayerIds);

    // If the base map setup is complete.
    // This must be awaited before any layers can be added to the map.
    const [isMapReady, setIsMapReady] = useState(false);

    // Load initial event data asynchronously on mount.
    useEffect(() => {
        const loadInitialData = async () => {
            const data = selectedEventId
                ? await getEventDetails(selectedCountry, selectedEventId)
                : await getCurrentCountryEventData(selectedCountry);
            setEventData(data);
        };
        loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Reference to the function (passed in by the map component) for adding layers to the map.
    const addLayerToMapFunction = useRef<(
      (layer: BaseLayer, layerInfo: LayerDto) => void) | null
        >(null,
        );

    // Cache of all loaded layers.
    // The key is fixed based on the layer details.
    const layersCache = useRef(new Map<string, BaseLayer>());
    const getLayerKey = (layerDetails: LayerDto): string => `${layerDetails.layerName}_${selectedCountry}_${layerDetails.resourceId}`;

    // Register the map's addLayer function.
    // Called by OlDataMap when the map is ready.
    const registerMapAddLayer = useCallback(
        (addLayer: (layer: BaseLayer, layerInfo: LayerDto) => void) => {
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
        layerDetails: LayerDto,
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
    const toggleMapLayer = (layerDetails: LayerDto) => {
        const { layerName, layerType, resourceId } = layerDetails;

        switch (layerType) {
            case LayerType.raster:
                switch (layerName) {
                    case LayerName.population:
                        toggleLayer(
                            getLayerKey(layerDetails),
                            layerDetails,
                            () => makePopulationImageLayer(selectedCountry),
                        );
                        break;
                    case LayerName.floodDepth:
                        toggleLayer(
                            getLayerKey(layerDetails),
                            layerDetails,
                            () => makeEventImageLayer(resourceId),
                        );
                        break;
                    default:
                        console.error(
                            `[useNrwDataLoader] Unsupported raster layer type: ${layerName}`,
                        );
                }
                break;
            case LayerType.point:
                switch (layerName) {
                    case LayerName.redCrossBranches:
                        toggleLayer(
                            getLayerKey(layerDetails),
                            layerDetails,
                            () => makeRcBranchesPointLayer(selectedCountry, styleRcBranchPoint),
                        );
                        break;
                    case LayerName.clinics:
                        toggleLayer(
                            getLayerKey(layerDetails),
                            layerDetails,
                            () => makeClinicPointLayer(selectedCountry, styleClinicPoint),
                        );
                        break;
                    default:
                        console.error(
                            `[useNrwDataLoader] Unsupported point layer type: ${layerName}`,
                        );
                }
                break;
            default:
                // TODO: Handle other display types (Shape, VectorTile)
                console.error(
                    `[useNrwDataLoader] Unsupported display type: ${layerType}`,
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

    // Reload the current country's event data and update shared state
    const reloadCountryEventData = async () => {
        const data = await getCurrentCountryEventData(selectedCountry);
        setEventData(data);
    };

    // Get available layers for the currently selected event
    const selectedEvent = eventData.find((event) => event.eventId === selectedEventId) ?? null;
    const selectedEventLayers: LayerDto[] = selectedEvent?.availableLayers ?? [];

    // Get details for the selected event
    const selectedEventDetails = useMemo(
        () => getSelectedEventDetails(eventData, selectedEventId),
        [eventData, selectedEventId],
    );

    // Show user-facing alert when no exposed areas were in a selected event
    useEffect(() => {
        if (selectedEventDetails
             && Object.keys(selectedEventDetails.exposedPopulationPerAreaByLevel).length === 0) {
            alert.show('No exposed areas', {
                variant: 'danger',
                description: `No exposed areas found for event "${selectedEventId}".`,
            });
        }
    }, [selectedEventDetails, selectedEventId, alert]);

    return {
        eventData,
        reloadCountryEventData,
        selectedEventLayers,
        selectedEventDetails,
        registerMapAddLayer,
        toggleMapLayer,
        hideAllLayers,
        activeLayerIds: visibleLayerIds,
        isMapReady,
        initialLayerIds,
    };
}
