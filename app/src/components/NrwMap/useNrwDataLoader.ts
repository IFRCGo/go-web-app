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
    getAllEventData,
    getCountryMapData,
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
 * - Load shared data and cache it
 * - Track shared states locally applied to that data
 *
 * @param scopedCountries - ISO_A3 country code list for country-specific layers
 * @param selectedEventId - Currently selected event id (selection state owned by the container)
 */
export default function useNrwDataLoader(
    scopedCountries: string[],
    initialEventData: EventResponseDto[],
    selectedEventId: number | null,
    initialLayerKeys: string[],
) {
    const alert = useAlert();

    // Data state: event data loaded from the API.
    const [eventData, setEventData] = useState<EventResponseDto[]>(initialEventData);

    // Non-event data layers available for the current scoped countries.
    const [countryLayers, setCountryLayers] = useState<Record<string, LayerDto[]>>({});

    // Keys of currently visible layer types.
    const [visibleLayerKeys, setVisibleLayerKeys] = useState<string[]>(initialLayerKeys);

    // If the base map setup is complete.
    // This must be awaited before any layers can be added to the map.
    const [isMapReady, setIsMapReady] = useState(false);

    // Reference to the function (passed in by the map component) for adding layers to the map.
    const addLayerToMapFunction = useRef<(
      (layer: BaseLayer, layerInfo: LayerDto) => void) | null
        >(null,
        );

    // Cache of all loaded layers, keyed per scoped country, per layer.
    const layersCache = useRef(new Map<string, BaseLayer>());

    // Register the map's addLayer function.
    // Set when the map is ready.
    const registerMapAddLayer = useCallback(
        (addLayer: (layer: BaseLayer, layerInfo: LayerDto) => void) => {
            addLayerToMapFunction.current = addLayer;
            setIsMapReady(true);
        },
        [],
    );

    // Update the visible layer keys whenever a layer's visibility changes.
    const updateVisibleLayerKey = (key: string, isVisible: boolean) => {
        setVisibleLayerKeys((prev) => {
            const has = prev.includes(key);
            if (isVisible === has) {
                return prev;
            }
            return isVisible ? [...prev, key] : prev.filter((k) => k !== key);
        });
    };

    // Internal function for setting a single cached layer's visibility.
    // If not cached and the target is visible, loads it.
    const setLayerVisibility = async (
        cacheKey: string,
        layerDetails: LayerDto,
        loadLayer: () => Promise<BaseLayer>,
        targetVisible: boolean,
    ) => {
        if (!addLayerToMapFunction.current) {
            console.error('[useNrwDataLoader] Map not ready');
            return;
        }

        const existing = layersCache.current.get(cacheKey);
        if (existing) {
            existing.setVisible(targetVisible);
            return;
        }

        // Nothing to hide if it isn't loaded yet.
        if (!targetVisible) {
            return;
        }

        try {
            const layer = await loadLayer();
            layersCache.current.set(cacheKey, layer);
            addLayerToMapFunction.current(layer, layerDetails);
            layer.setVisible(targetVisible);
        } catch (error) {
            console.error(`[useNrwDataLoader] Failed to load layer ${cacheKey}:`, error);
            alert.show('Failed to load map layer', {
                variant: 'danger',
                description: 'The map layer could not be loaded. Please try again.',
            });
        }
    };

    // Dispatch a single layer instance to its loader with an explicit target
    // visibility.
    const dispatchLayer = (
        layerDetails: LayerDto,
        country: string | undefined,
        targetVisible: boolean,
    ) => {
        const { layerName, layerType, resourceId } = layerDetails;

        let loadLayer: (() => Promise<BaseLayer>) | null = null;
        if (layerType === LayerType.raster && layerName === LayerName.floodDepth) {
            loadLayer = () => makeEventImageLayer(resourceId);
        } else if (country) {
            // The remaining supported layers are all country-scoped.
            if (layerType === LayerType.raster && layerName === LayerName.population) {
                loadLayer = () => makePopulationImageLayer(country);
            } else if (layerType === LayerType.point && layerName === LayerName.redCrossBranches) {
                loadLayer = () => makeRcBranchesPointLayer(country, styleRcBranchPoint);
            } else if (layerType === LayerType.point && layerName === LayerName.clinics) {
                loadLayer = () => makeClinicPointLayer(country, styleClinicPoint);
            }
        }

        if (!loadLayer) {
            console.error(
                `[useNrwDataLoader] Unsupported layer: ${layerDetails.layerName} `
                + `(${layerDetails.layerType})`,
            );
            return;
        }

        setLayerVisibility(
            layerDetails.layerName,
            layerDetails,
            loadLayer,
            targetVisible,
        );
    };

    // Apply an explicit visibility to a layer. Event layers affect a single
    // resource; country layer types fan out to every scoped country's instance
    // of that `layerName` in one go.
    const applyLayerVisibility = (
        layerDetails: LayerDto,
        isCountryLayer: boolean,
        targetVisible: boolean,
    ) => {
        const publicKey = layerDetails.layerName;

        if (!isCountryLayer) {
            dispatchLayer(layerDetails, undefined, targetVisible);
        } else {
            Object.entries(countryLayers).forEach(([countryCode, layers]) => {
                const match = layers.find((l) => l.layerName === layerDetails.layerName);
                if (match) {
                    dispatchLayer(match, countryCode, targetVisible);
                }
            });
        }

        updateVisibleLayerKey(publicKey, targetVisible);
    };

    // Public toggle used by the layer panel.
    const toggleMapLayer = (layerDetails: LayerDto, isCountryLayer: boolean) => {
        const targetVisible = !visibleLayerKeys.includes(layerDetails.layerName);
        applyLayerVisibility(layerDetails, isCountryLayer, targetVisible);
    };

    // Set the visibility of all cached layers to false.
    const hideAllLayers = () => {
        layersCache.current.forEach((layer) => {
            layer.setVisible(false);
        });
        setVisibleLayerKeys([]);
    };

    // Reload the current country's event data and update shared state
    const reloadCountryEventData = async () => {
        const data = await getAllEventData(scopedCountries);
        setEventData(data);
    };

    // Get available layers for the currently selected event
    const selectedEvent = eventData.find((event) => event.eventId === selectedEventId) ?? null;
    const selectedEventLayers: LayerDto[] = selectedEvent?.availableLayers ?? [];

    // Unique country-scoped layer types across all scoped countries
    const countryLayerTypes = useMemo<LayerDto[]>(() => {
        const seen = new Set<LayerName>();
        const result: LayerDto[] = [];
        Object.values(countryLayers).forEach((layers) => {
            layers.forEach((layer) => {
                if (!seen.has(layer.layerName)) {
                    seen.add(layer.layerName);
                    result.push(layer);
                }
            });
        });
        return result;
    }, [countryLayers]);

    // Get details for the selected event
    const selectedEventDetails = useMemo(
        () => getSelectedEventDetails(eventData, selectedEventId),
        [eventData, selectedEventId],
    );

    // Show alert when no exposed areas found in a selected event
    useEffect(() => {
        if (selectedEventDetails
             && Object.keys(selectedEventDetails.exposedPopulationPerAreaByLevel).length === 0) {
            alert.show('No exposed areas', {
                variant: 'danger',
                description: `No exposed areas found for event "${selectedEventId}".`,
            });
        }
    }, [selectedEventDetails, selectedEventId, alert]);

    // Load shared country and event data, and then apply deeplinked layers.
    // This is done once the map is ready
    // (which is almost instant, but we wait for it to prevent a race condition).
    useEffect(() => {
        if (!isMapReady) {
            return;
        }
        const loadInitialData = async () => {
            const [countryData, events] = await Promise.all([
                getCountryMapData(scopedCountries),
                getAllEventData(scopedCountries),
            ]);
            const layersByCountry = Object.fromEntries(
                Object.entries(countryData).map(([countryCode, data]) => [
                    countryCode,
                    data.availableLayers,
                ]),
            );
            setCountryLayers(layersByCountry);
            setEventData(events);

            // Apply deeplinked layers
            if (initialLayerKeys.length === 0) {
                return;
            }
            const initialKeys = new Set(initialLayerKeys);
            const showLayer = (layer: LayerDto, country: string | undefined) => {
                if (!initialKeys.has(layer.layerName)) {
                    return;
                }
                dispatchLayer(layer, country, true);
                updateVisibleLayerKey(layer.layerName, true);
            };

            // Event layers
            const deeplinkedEvent = events.find((event) => event.eventId === selectedEventId);
            deeplinkedEvent?.availableLayers.forEach((layer) => showLayer(layer, undefined));

            // Country layers (show for all countries)
            Object.entries(layersByCountry).forEach(([countryCode, layers]) => {
                layers.forEach((layer) => showLayer(layer, countryCode));
            });
        };
        loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isMapReady]);

    return {
        eventData,
        reloadCountryEventData,
        selectedEventLayers,
        countryLayerTypes,
        selectedEventDetails,
        registerMapAddLayer,
        toggleMapLayer,
        hideAllLayers,
        visibleLayerKeys,
    };
}
