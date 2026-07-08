import {
    useCallback,
    useState,
} from 'react';
import { useSearchParams } from 'react-router-dom';

import { defaultMapZoom } from '#utils/nrw/nrwConstants';
import type { MapViewParameters } from '#utils/nrw/nrwMapTypes';
import {
    adminParamsKey,
    countryParamsKey,
    eventIdParamsKey,
    mapCenterLatParamsKey,
    mapCenterLonParamsKey,
    mapLayersParamsKey,
    mapZoomParamsKey,
    parseAndSanitizeCountryCodesParam,
    parseMapLayersParam,
    sanitizeAdminCode,
    sanitizeEventIdParam,
    sanitizeMapLatitudeParam,
    sanitizeMapLongitudeParam,
    sanitizeMapZoomParam,
    serializeCountryCodesParam,
    serializeMapLayersParam,
} from '#utils/nrw/nrwSearchParamHelpers';

interface InitialParams {
    scopedCountries: string[];
    initialEventId: number | null;
    initialAdminCode: string | null;
    initialLayerKeys: string[];
    initialMapView: MapViewParameters | null;
}

interface MapViewParams {
    countries: string[];
    eventId?: number | null;
    adminCode?: string;
    mapView?: MapViewParameters;
    layerIds: string[];
}

interface EventParams {
    countries: string[];
    eventId: number;
    layerIds: string[];
}

/**
 * Hook for search parameter handling for NRW.
 * The parameters are loaded once on mount
 * and are written to during page use to keep track of the state.
 */
export default function useNrwMapSearchParams() {
    const [searchParams, setSearchParams] = useSearchParams();

    // Read initial param values once on mount for setting initial display.
    const [initialParams] = useState<InitialParams>(() => {
        const selectedMapZoom = sanitizeMapZoomParam(searchParams.get(mapZoomParamsKey));
        const selectedMapLat = sanitizeMapLatitudeParam(searchParams.get(mapCenterLatParamsKey));
        const selectedMapLon = sanitizeMapLongitudeParam(searchParams.get(mapCenterLonParamsKey));

        // Initial map view based on the params
        const initialMapView = selectedMapLat !== null && selectedMapLon !== null
            ? {
                zoom: selectedMapZoom ?? defaultMapZoom,
                center: {
                    lat: selectedMapLat,
                    lon: selectedMapLon,
                },
            }
            : null;

        return {
            scopedCountries: parseAndSanitizeCountryCodesParam(searchParams.get(countryParamsKey)),
            initialEventId: sanitizeEventIdParam(searchParams.get(eventIdParamsKey)),
            initialAdminCode: sanitizeAdminCode(searchParams.get(adminParamsKey)) || null,
            initialLayerKeys: parseMapLayersParam(searchParams.get(mapLayersParamsKey)),
            initialMapView,
        };
    });

    // Sync the active layer IDs into the existing URL params.
    const setLayerIds = useCallback((layerIds: string[]) => {
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            const value = serializeMapLayersParam(layerIds);
            if (value) {
                next.set(mapLayersParamsKey, value);
            } else {
                next.delete(mapLayersParamsKey);
            }
            return next;
        }, { replace: true });
    }, [setSearchParams]);

    // Reset URL to only contain the countries.
    const resetToCountryParamsOnly = useCallback((countries: string[]) => {
        const serializedCountries = serializeCountryCodesParam(countries);
        setSearchParams({
            [countryParamsKey]: serializedCountries,
        });
    }, [setSearchParams]);

    // Set params on event selection (does not include map view).
    const setEventParams = useCallback(({ countries, eventId, layerIds }: EventParams) => {
        const serializedCountries = serializeCountryCodesParam(countries);
        const nextParams: Record<string, string> = {
            [countryParamsKey]: serializedCountries,
            [eventIdParamsKey]: String(eventId),
        };
        const layersValue = serializeMapLayersParam(layerIds);
        if (layersValue) {
            nextParams[mapLayersParamsKey] = layersValue;
        }
        setSearchParams(nextParams);
    }, [setSearchParams]);

    // Set params reflecting the current map view + admin selection.
    const setMapViewParams = useCallback(({
        countries,
        eventId,
        adminCode,
        mapView,
        layerIds,
    }: MapViewParams) => {
        const serializedCountries = serializeCountryCodesParam(countries);
        const nextParams: Record<string, string> = {
            [countryParamsKey]: serializedCountries,
        };

        if (eventId) {
            nextParams[eventIdParamsKey] = String(eventId);
        }

        const sanitizedAdminCode = sanitizeAdminCode(adminCode);
        if (sanitizedAdminCode) {
            nextParams[adminParamsKey] = sanitizedAdminCode;
        }

        if (mapView) {
            nextParams[mapZoomParamsKey] = mapView.zoom.toFixed(2);
            nextParams[mapCenterLonParamsKey] = mapView.center.lon.toFixed(6);
            nextParams[mapCenterLatParamsKey] = mapView.center.lat.toFixed(6);
        }

        const layersValue = serializeMapLayersParam(layerIds);
        if (layersValue) {
            nextParams[mapLayersParamsKey] = layersValue;
        }

        // Replace existing entry to not fill up the back button stack.
        setSearchParams(nextParams, { replace: true });
    }, [setSearchParams]);

    return {
        initialParams,
        resetToCountryParamsOnly,
        setEventParams,
        setMapViewParams,
        setLayerIds,
    };
}
