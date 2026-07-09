import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';

import useAlert from '#hooks/useAlert';
import {
    fetchClinicFeatures,
    fetchRcBranchesFeatures,
    getAllEventData,
    getCountryMapData,
} from '#utils/nrw/nrwDataFetchHelpers';
import { getSelectedEventDetails } from '#utils/nrw/nrwMapEventHelpers';
import {
    makeEventImageLayer,
    makePointLayerFromFeatures,
    makeStaticImageLayer,
} from '#utils/nrw/nrwMapHelpers';
import {
    clinicPointPaint,
    rcBranchPointPaint,
} from '#utils/nrw/nrwMapStyles';
import type {
    MapLayerFunctions,
    NrwMapboxLayer,
} from '#utils/nrw/nrwMapTypes';
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
    initialVisibleLayerNames: string[],
) {
    const alert = useAlert();

    // ----- States -----

    // Data state: event data loaded from the API.
    const [eventData, setEventData] = useState<EventResponseDto[]>(initialEventData);

    // Non-event data layers available for the current scoped countries.
    const [countryNonEventLayers,
        setCountryNonEventLayers] = useState<Record<string, LayerDto[]>>({});

    // List of visible layer names.
    // These are not mapped to a country or event, but are just the layer names
    // of all visible layers.
    const [visibleLayerNames, setVisibleLayerNames] = useState<string[]>(initialVisibleLayerNames);

    // If the base map setup is complete.
    // This must be awaited before any layers can be added to the map.
    const [isMapReady, setIsMapReady] = useState(false);

    // If the shared country and event data has been loaded into state.
    // Deeplinked layers are applied once this is true (and the data is in state).
    const [isInitialDataLoaded, setIsInitialDataLoaded] = useState(false);

    // ----- Exposed references -----

    // Reference to the map layer functions (registered by the map component)
    // used for adding layers to the map and changing their visibility.
    const mapLayerFunctionsRef = useRef<MapLayerFunctions | null>(null);

    // Get available layers for the currently selected event
    const selectedEvent = useMemo(
        () => eventData.find((event) => event.eventId === selectedEventId) ?? null,
        [eventData, selectedEventId],
    );
    const selectedEventLayers = useMemo<LayerDto[]>(
        () => selectedEvent?.availableLayers ?? [],
        [selectedEvent],
    );

    // ----- Layer Logic -----

    // Cache of all loaded layers, keyed by a composite of parent key and layer name.
    const layersCache = useRef(new Map<string, NrwMapboxLayer>());

    // Build a unique cache key from a parent key (country or eventId) and layer name.
    const makeCacheKey = (cacheParentKey: string, layerName: string) => `${cacheParentKey}::${layerName}`;

    // Load a layer, cache it, add it to the map, and apply the target visibility.
    const loadAndAddLayer = async (
        layerDetails: LayerDto,
        cacheKey: string,
        loadLayer: () => Promise<NrwMapboxLayer>,
        targetVisible: boolean,
    ) => {
        try {
            const layer = await loadLayer();
            layersCache.current.set(cacheKey, layer);
            const mapLayerFunctions = mapLayerFunctionsRef.current;
            if (!mapLayerFunctions) {
                console.error('[useNrwDataLoader] Map layer functions not ready');
                return;
            }
            mapLayerFunctions.addLayer(layer, layerDetails);
            mapLayerFunctions.setLayerVisibility(layer, targetVisible);
        } catch (error) {
            console.error(`[useNrwDataLoader] Failed to load layer ${layerDetails.layerName}:`, error);
            alert.show('Failed to load map layer', {
                variant: 'danger',
                description: 'The map layer could not be loaded. Please try again.',
            });
        }
    };

    // Internal function for setting a single cached layer's visibility.
    // If not cached and the target is visible, loads it.
    const setLayerVisibility = (
        layerDetails: LayerDto,
        cacheParentKey: string,
        loadLayer: (() => Promise<NrwMapboxLayer>) | null,
        targetVisible: boolean,
    ) => {
        // If no loader function, exit early.
        if (!loadLayer) {
            console.error(`[useNrwDataLoader] No loader function for layer ${layerDetails.layerName}`);
            return;
        }

        // Return early if map layer functions not ready
        const mapLayerFunctions = mapLayerFunctionsRef.current;
        if (!mapLayerFunctions) {
            console.error('[useNrwDataLoader] Map not ready');
            return;
        }

        const cacheKey = makeCacheKey(cacheParentKey, layerDetails.layerName);
        const cachedLayer = layersCache.current.get(cacheKey);
        if (cachedLayer) {
            mapLayerFunctions.setLayerVisibility(cachedLayer, targetVisible);
        } else if (targetVisible) {
            // Not cached and should be shown: load it (fire-and-forget so the
            // visible layer names update immediately below).
            loadAndAddLayer(layerDetails, cacheKey, loadLayer, targetVisible);
        }

        // Update the public list of visible layer names.
        setVisibleLayerNames((prevList) => {
            // Check if the layerName is in the list
            const listHasLayerName = prevList.includes(layerDetails.layerName);

            // If it's already in the list and is being made visible, do nothing.
            if (targetVisible && listHasLayerName) {
                return prevList;
            }

            // If it's not in the list and is now visible, add it.
            if (targetVisible) {
                return [...prevList, layerDetails.layerName];
            }

            // If it's now hidden, remove it.
            return prevList.filter((name) => name !== layerDetails.layerName);
        });
    };

    // Find the right layer loader function and return it
    const resolveLayerLoader = (
        layerDetails: LayerDto,
        country: string,
    ): (() => Promise<NrwMapboxLayer>) | null => {
        const { layerName, layerType, resourceId } = layerDetails;

        if (layerType === LayerType.raster && layerName === LayerName.floodDepth) {
            return () => makeEventImageLayer(resourceId);
        }
        if (layerType === LayerType.raster && layerName === LayerName.population) {
            return () => makeStaticImageLayer(country, layerName);
        }

        if (layerType === LayerType.point && layerName === LayerName.redCrossBranches) {
            return async () => {
                const features = await fetchRcBranchesFeatures(country);
                return makePointLayerFromFeatures(
                    `${LayerName.redCrossBranches}-${country}`,
                    features,
                    rcBranchPointPaint,
                );
            };
        }
        if (layerType === LayerType.point && layerName === LayerName.clinics) {
            return async () => {
                const features = await fetchClinicFeatures(country);
                return makePointLayerFromFeatures(
                    `${LayerName.clinics}-${country}`,
                    features,
                    clinicPointPaint,
                );
            };
        }

        console.error(
            `[useNrwDataLoader] Unsupported layer: ${layerDetails.layerName} `
            + `(${layerDetails.layerType})`,
        );

        return null;
    };

    const resolveLayerAndSetVisibility = (
        layerName: string,
        targetVisible: boolean,
    ) => {
        // Get event layer info from the event data
        const eventLayerMatch = selectedEventLayers.find((layer) => layer.layerName === layerName);
        if (eventLayerMatch) {
            if (selectedEventId === null) {
                console.error('[useNrwDataLoader] No selected event id for event layer');
                return;
            }

            const layerLoader = resolveLayerLoader(eventLayerMatch, '');

            setLayerVisibility(
                eventLayerMatch,
                selectedEventId.toString(),
                layerLoader,
                targetVisible,
            );
            return;
        }

        // Handle non-event layers
        // One layer can be applied to multiple countries, so check all of them
        let visibilityChangeApplied = false;
        Object.entries(countryNonEventLayers).forEach(([countryCode, layers]) => {
            const match = layers.find((layer) => layer.layerName === layerName);
            if (match) {
                const layerLoader = resolveLayerLoader(match, countryCode);
                visibilityChangeApplied = true;

                setLayerVisibility(
                    match,
                    countryCode,
                    layerLoader,
                    targetVisible,
                );
            }
        });

        if (!visibilityChangeApplied) {
            console.error(`[useNrwDataLoader] No matching layer found for ${layerName}`);
        }
    };

    // ----- Other exposed functions and values -----

    // Callback for other components to see if a layer is visible.
    const isLayerVisible = useCallback(
        (key: string) => visibleLayerNames.includes(key),
        [visibleLayerNames],
    );

    // A callback to register the map's layer functions.
    // This is set when the map is ready.
    const registerMapLayerFunctions = useCallback(
        (mapLayerFunctions: MapLayerFunctions) => {
            mapLayerFunctionsRef.current = mapLayerFunctions;
            setIsMapReady(true);
        },
        [],
    );

    // Set the visibility of all cached layers to false.
    const hideAllLayers = () => {
        const mapLayerFunctions = mapLayerFunctionsRef.current;
        layersCache.current.forEach((layer) => {
            mapLayerFunctions?.setLayerVisibility(layer, false);
        });
        setVisibleLayerNames([]);
    };

    // Public toggle used by the layer panel.
    const toggleMapLayer = (layerName: string) => {
        // Get the opposite of the current visibility
        const targetVisible = !isLayerVisible(layerName);
        // Apply that visibility change
        resolveLayerAndSetVisibility(layerName, targetVisible);
    };

    // Reload the current country's event data and update shared state
    const reloadCountryEventData = async () => {
        const data = await getAllEventData(scopedCountries);
        setEventData(data);
    };

    // Details for available non-event layers.
    // This flattens the country layer data into a list of layer names that
    // appear in any of the scoped countries.
    const nonEventLayers = useMemo<LayerDto[]>(() => {
        const byName = new Map<LayerName, LayerDto>();
        Object.values(countryNonEventLayers).forEach((layers) => {
            layers.forEach((layer) => {
                if (!byName.has(layer.layerName)) {
                    byName.set(layer.layerName, layer);
                }
            });
        });
        return Array.from(byName.values());
    }, [countryNonEventLayers]);

    // Get details for the selected event
    const selectedEventDetails = useMemo(
        () => getSelectedEventDetails(eventData, selectedEventId),
        [eventData, selectedEventId],
    );

    // Warn when the selected event has no exposed areas.
    useEffect(() => {
        if (selectedEventDetails
            && Object.keys(selectedEventDetails.exposedPopulationPerAreaByLevel).length === 0) {
            alert.show('No exposed areas', {
                variant: 'danger',
                description: `No exposed areas found for event "${selectedEventId}".`,
            });
        }
    }, [selectedEventDetails, selectedEventId, alert]);

    // ----- Init -----

    // Load shared country and event data into state. This is done once the map
    // is ready (which is almost instant, but it must be waited for regardless
    // to prevent a race condition).
    useEffect(() => {
        if (!isMapReady) {
            return;
        }
        const loadInitialData = async () => {
            try {
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
                setCountryNonEventLayers(layersByCountry);
                setEventData(events);
                setIsInitialDataLoaded(true);
            } catch (error) {
                console.error('[useNrwDataLoader] Failed to load initial map data:', error);
                alert.show('Failed to load map data', {
                    variant: 'danger',
                    description: 'The map data could not be loaded. Please try again.',
                });
            }
        };
        loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isMapReady]);

    // Set the deeplinked layers on initial load.
    // This is done in a separate effect so it only runs after the loaded
    // data has been committed to state.
    useEffect(() => {
        if (!isInitialDataLoaded) {
            return;
        }
        initialVisibleLayerNames.forEach((layerName) => {
            resolveLayerAndSetVisibility(layerName, true);
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isInitialDataLoaded]);

    return {
        eventData,
        reloadCountryEventData,
        selectedEventLayers,
        nonEventLayers,
        selectedEventDetails,
        registerMapLayerFunctions,
        toggleMapLayer,
        hideAllLayers,
        isLayerVisible,
        visibleLayerNames,
    };
}
