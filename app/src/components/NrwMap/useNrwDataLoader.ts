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
 * - Load and cache data
 * - Create, cache, and toggle map data layers
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

    // Country-level layers loaded for the current scoped country.
    const [countryLayers, setCountryLayers] = useState<Record<string, LayerDto[]>>({});

    // Composite keys (layerName_country) of currently visible layers.
    // The same resourceId can appear for multiple countries and must be
    // toggled independently in the UI, so keys (not resourceIds) are the
    // canonical identifier — including for the URL deeplink.
    const [visibleLayerKeys, setVisibleLayerKeys] = useState<string[]>(initialLayerKeys);

    // If the base map setup is complete.
    // This must be awaited before any layers can be added to the map.
    const [isMapReady, setIsMapReady] = useState(false);

    // Load initial event data asynchronously on mount.
    useEffect(() => {
        const loadCountryLayers = async () => {
            const data = await getCountryMapData(scopedCountries);
            const layersByCountry = Object.fromEntries(
                Object.entries(data).map(([countryCode, countryData]) => [
                    countryCode,
                    countryData.availableLayers,
                ]),
            );
            setCountryLayers(layersByCountry);
        };

        loadCountryLayers();

        // Load events data
        const loadInitialData = async () => {
            const data = await getAllEventData(scopedCountries);
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
    // Country layers key on country; event layers key on resourceId (which
    // uniquely identifies the underlying resource for the selected event).
    const getLayerKey = (layerDetails: LayerDto, country?: string): string => (
        country
            ? `${layerDetails.layerName}_${country}`
            : `event_${layerDetails.resourceId}`
    );

    // Register the map's addLayer function.
    // Called by OlDataMap when the map is ready.
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
            updateVisibleLayerKey(key, nextVisible);
            return;
        }

        try {
            const layer = await loadLayer();
            layersCache.current.set(key, layer);
            addLayerToMapFunction.current(layer, layerDetails);
            updateVisibleLayerKey(key, layer.getVisible());
        } catch (error) {
            console.error(`[useNrwDataLoader] Failed to load layer ${key}:`, error);
            alert.show('Failed to load map layer', {
                variant: 'danger',
                description: 'The map layer could not be loaded. Please try again.',
            });
        }
    };

    // Exposed function to toggle a map layer.
    // If the layer is not cached, it will be loaded.
    // `country` is omitted for event layers.
    const toggleMapLayer = (layerDetails: LayerDto, country?: string) => {
        const { layerName, layerType, resourceId } = layerDetails;
        const key = getLayerKey(layerDetails, country);

        switch (layerType) {
            case LayerType.raster:
                switch (layerName) {
                    case LayerName.population:
                        if (!country) {
                            console.error(
                                '[useNrwDataLoader] Population layer requires a country',
                            );
                            return;
                        }
                        toggleLayer(
                            key,
                            layerDetails,
                            () => makePopulationImageLayer(country),
                        );
                        break;
                    case LayerName.floodDepth:
                        toggleLayer(
                            key,
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
                if (!country) {
                    console.error(
                        `[useNrwDataLoader] Point layer ${layerName} requires a country`,
                    );
                    return;
                }
                switch (layerName) {
                    case LayerName.redCrossBranches:
                        toggleLayer(
                            key,
                            layerDetails,
                            () => makeRcBranchesPointLayer(country, styleRcBranchPoint),
                        );
                        break;
                    case LayerName.clinics:
                        toggleLayer(
                            key,
                            layerDetails,
                            () => makeClinicPointLayer(country, styleClinicPoint),
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

    // Apply initial (deeplinked) layers once the map is ready and matching
    // layer metadata has loaded. Each matching layer key is toggled on exactly
    // once; we remove it from the pending set on match so it can never fire again.
    const pendingInitialLayerKeysRef = useRef<Set<string>>(new Set(initialLayerKeys));
    useEffect(() => {
        if (!isMapReady || pendingInitialLayerKeysRef.current.size === 0) {
            return;
        }
        const pending = pendingInitialLayerKeysRef.current;
        selectedEventLayers.forEach((layer) => {
            const key = getLayerKey(layer);
            if (pending.delete(key)) {
                toggleMapLayer(layer);
            }
        });
        Object.entries(countryLayers).forEach(([countryCode, layers]) => {
            layers.forEach((layer) => {
                const key = getLayerKey(layer, countryCode);
                if (pending.delete(key)) {
                    toggleMapLayer(layer, countryCode);
                }
            });
        });
    // toggleMapLayer is intentionally omitted: it is re-created every render
    // and we only want this to react to data / readiness changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isMapReady, selectedEventLayers, countryLayers]);

    return {
        eventData,
        reloadCountryEventData,
        selectedEventLayers,
        countryLayers,
        selectedEventDetails,
        registerMapAddLayer,
        toggleMapLayer,
        hideAllLayers,
        activeLayerKeys: visibleLayerKeys,
        getLayerKey,
    };
}
