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
    makeStaticImageLayer,
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

// Outer cache key used for layers without a country (e.g. event layers).
const EVENT_DATA_CACHE_KEY = 'event_data';

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
    initialVisibleLayerNames: string[],
) {
    const alert = useAlert();

    // ----- States -----

    // Data state: event data loaded from the API.
    const [eventData, setEventData] = useState<EventResponseDto[]>(initialEventData);

    // Non-event data layers available for the current scoped countries.
    const [countryLayers, setCountryLayers] = useState<Record<string, LayerDto[]>>({});

    // List of visible layer names.
    const [visibleLayerNames, setVisibleLayerNames] = useState<string[]>(initialVisibleLayerNames);

    // If the base map setup is complete.
    // This must be awaited before any layers can be added to the map.
    const [isMapReady, setIsMapReady] = useState(false);

    // If the shared country and event data has been loaded into state.
    // Deeplinked layers are applied once this is true (and the data is in state).
    const [isInitialDataLoaded, setIsInitialDataLoaded] = useState(false);

    // ----- Refs -----

    // Cache of all loaded layers, keyed by country and then by layer name.
    const layersCache = useRef(new Map<string, Map<string, BaseLayer>>());

    // Reference to the function (passed in by the map component) for adding layers to the map.
    const addLayerToMapFunction = useRef<(
      (layer: BaseLayer, layerInfo: LayerDto) => void) | null
        >(null,
        );

    // ----- Callbacks (to communicate with other functions) -----

    // Callback for other components to see if a layer is visible.
    const isLayerVisible = useCallback(
        (key: string) => visibleLayerNames.includes(key),
        [visibleLayerNames],
    );

    // A callback to register the map's addLayer function.
    // This is set when the map is ready.
    const registerMapAddLayer = useCallback(
        (addLayer: (layer: BaseLayer, layerInfo: LayerDto) => void) => {
            addLayerToMapFunction.current = addLayer;
            setIsMapReady(true);
        },
        [],
    );

    // ----- Layer Logic -----

    // Get available layers for the currently selected event
    const selectedEvent = eventData.find((event) => event.eventId === selectedEventId) ?? null;
    const selectedEventLayers: LayerDto[] = selectedEvent?.availableLayers ?? [];

    // Set one public layer key's visibility in a single place.
    const setLayerNameVisibility = (key: string, isVisible: boolean) => {
        setVisibleLayerNames((prev) => {
            const has = prev.includes(key);
            if (isVisible === has) {
                return prev;
            }
            if (isVisible) {
                return [...prev, key];
            }
            return prev.filter((name) => name !== key);
        });
    };

    // Internal function for setting a single cached layer's visibility.
    // If not cached and the target is visible, loads it.
    const setLayerVisibility = async (
        layerDetails: LayerDto,
        country: string | undefined,
        loadLayer: () => Promise<BaseLayer>,
        targetVisible: boolean,
    ) => {
        // Return early if not ready
        if (!addLayerToMapFunction.current) {
            console.error('[useNrwDataLoader] Map not ready');
            return;
        }

        // Country key for the outer cache. Layers without a country (e.g. event
        // layers) are grouped under a shared key.
        const countryKey = country ?? EVENT_DATA_CACHE_KEY;

        const loadAndAddLayer = async () => {
            try {
                const layer = await loadLayer();
                const countryCache = layersCache.current.get(countryKey)
                    ?? new Map<string, BaseLayer>();
                countryCache.set(layerDetails.layerName, layer);
                layersCache.current.set(countryKey, countryCache);
                if (!addLayerToMapFunction.current) {
                    console.error('[useNrwDataLoader] Map add layer function not ready');
                    return;
                }
                addLayerToMapFunction.current(layer, layerDetails);
                layer.setVisible(targetVisible);
            } catch (error) {
                console.error(`[useNrwDataLoader] Failed to load layer ${layerDetails.layerName}:`, error);
                alert.show('Failed to load map layer', {
                    variant: 'danger',
                    description: 'The map layer could not be loaded. Please try again.',
                });
            }
        };

        const cachedLayer = layersCache.current.get(countryKey)?.get(layerDetails.layerName);
        if (cachedLayer) {
            cachedLayer.setVisible(targetVisible);
        } else if (targetVisible) {
            // If the layer is not cached and the target is visible, load it.
            loadAndAddLayer();
        }
        setLayerNameVisibility(layerDetails.layerName, targetVisible);
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
            layerDetails,
            country,
            loadLayer,
            targetVisible,
        );
    };

    const applyLayerVisibility = (
        layerName: string,
        targetVisible: boolean,
    ) => {
        let toggleApplied = false;

        // Event layers (e.g. flood_depth) are not country-scoped; they come from
        // the selected event's available layers and are dispatched without a country.
        const eventLayerMatch = selectedEventLayers.find((l) => l.layerName === layerName);
        if (eventLayerMatch) {
            dispatchLayer(eventLayerMatch, undefined, targetVisible);
            toggleApplied = true;
        }

        Object.entries(countryLayers).forEach(([countryCode, layers]) => {
            const match = layers.find((l) => l.layerName === layerName);
            if (match) {
                dispatchLayer(match, countryCode, targetVisible);
                toggleApplied = true;
            }
        });

        if (!toggleApplied) {
            console.error(`[useNrwDataLoader] No matching layer found for ${layerName}`);
        }
    };

    // ----- Functions and values for external -----

    // Set the visibility of all cached layers to false.
    const hideAllLayers = () => {
        layersCache.current.forEach((countryCache) => {
            countryCache.forEach((layer) => {
                layer.setVisible(false);
            });
        });
        setVisibleLayerNames([]);
    };

    // Public toggle used by the layer panel.
    const toggleMapLayer = (layerName: string) => {
        const targetVisible = !isLayerVisible(layerName);
        applyLayerVisibility(layerName, targetVisible);
    };

    // Reload the current country's event data and update shared state
    const reloadCountryEventData = async () => {
        const data = await getAllEventData(scopedCountries);
        setEventData(data);
    };

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
    const selectedEventDetails = useMemo(() => {
        const details = getSelectedEventDetails(eventData, selectedEventId);
        if (details && Object.keys(details.exposedPopulationPerAreaByLevel).length === 0) {
            alert.show('No exposed areas', {
                variant: 'danger',
                description: `No exposed areas found for event "${selectedEventId}".`,
            });
        }
        return details;
    }, [eventData, selectedEventId, alert]);

    // ----- Init -----

    // Load shared country and event data into state. This is done once the map
    // is ready (which is almost instant, but it must be waited for regardless
    // to prevent a race condition).
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
            setIsInitialDataLoaded(true);
        };
        loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isMapReady]);

    // Apply deeplinked layers once the shared data is in state. Running this in
    // a separate effect ensures `countryLayers` and `selectedEventLayers`
    // reflect the freshly loaded data (state updates are not visible within the
    // same async run that sets them).
    useEffect(() => {
        if (!isInitialDataLoaded) {
            return;
        }
        initialVisibleLayerNames.forEach((layerName) => {
            applyLayerVisibility(layerName, true);
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isInitialDataLoaded]);

    return {
        eventData,
        reloadCountryEventData,
        selectedEventLayers,
        countryLayerTypes,
        selectedEventDetails,
        registerMapAddLayer,
        toggleMapLayer,
        hideAllLayers,
        isLayerVisible,
        visibleLayerNames,
    };
}
