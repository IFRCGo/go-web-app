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

    // Cache of all loaded layers, keyed per underlying resource so per-country
    // instances stay independent even though the panel exposes a single toggle.
    const layersCache = useRef(new Map<string, BaseLayer>());

    // Public key used by the UI + URL. Country layers of the same type share
    // a single key regardless of country.
    const getLayerKey = (layerDetails: LayerDto): string => layerDetails.layerName;

    // Internal cache key — retains per-country granularity so each country's
    // data source has its own cached BaseLayer.
    const getCacheKey = (layerDetails: LayerDto, country?: string): string => (
        `${layerDetails.layerName}_${country}`
    );

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

    // Get the loader function for a layer type
    const resolveLayerLoader = (
        layerDetails: LayerDto,
        country: string | undefined,
    ): (() => Promise<BaseLayer>) | null => {
        const { layerName, layerType, resourceId } = layerDetails;

        if (layerType === LayerType.raster && layerName === LayerName.floodDepth) {
            return () => makeEventImageLayer(resourceId);
        }

        // The remaining supported layers are all country-scoped.
        if (!country) {
            return null;
        }

        if (layerType === LayerType.raster && layerName === LayerName.population) {
            return () => makePopulationImageLayer(country);
        }
        if (layerType === LayerType.point && layerName === LayerName.redCrossBranches) {
            return () => makeRcBranchesPointLayer(country, styleRcBranchPoint);
        }
        if (layerType === LayerType.point && layerName === LayerName.clinics) {
            return () => makeClinicPointLayer(country, styleClinicPoint);
        }

        return null;
    };

    // Dispatch a single layer instance to its loader with an explicit target
    // visibility.
    const dispatchLayer = (
        layerDetails: LayerDto,
        country: string | undefined,
        targetVisible: boolean,
    ) => {
        const loadLayer = resolveLayerLoader(layerDetails, country);
        if (!loadLayer) {
            console.error(
                `[useNrwDataLoader] Unsupported layer: ${layerDetails.layerName} `
                + `(${layerDetails.layerType})`,
            );
            return;
        }

        setLayerVisibility(
            getCacheKey(layerDetails, country),
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
        const publicKey = getLayerKey(layerDetails);

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
        const targetVisible = !visibleLayerKeys.includes(getLayerKey(layerDetails));
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

    // Unique country-scoped layer types across all scoped countries. The panel
    // shows one toggle per entry; the hook fans the toggle out to every country.
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

    // Load shared country + event data once the map is ready, then apply any
    // deeplinked layers inline. Waiting for `isMapReady` means layers can be
    // added immediately, so applying the initial keys is a one-shot step here
    // (this effect only fires when the map becomes ready) rather than a
    // separate effect that has to race data + readiness.
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

            // Apply deeplinked layers using the freshly-loaded data (the state
            // set above hasn't propagated yet, so resolve against locals).
            if (initialLayerKeys.length === 0) {
                return;
            }
            const initialKeys = new Set(initialLayerKeys);
            const showLayer = (layer: LayerDto, country: string | undefined) => {
                if (!initialKeys.has(getLayerKey(layer))) {
                    return;
                }
                dispatchLayer(layer, country, true);
                updateVisibleLayerKey(getLayerKey(layer), true);
            };

            // Event layers target a single resource (no country).
            const deeplinkedEvent = events.find((event) => event.eventId === selectedEventId);
            deeplinkedEvent?.availableLayers.forEach((layer) => showLayer(layer, undefined));

            // Country layers fan out to every scoped country's instance.
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
        getLayerKey,
    };
}
