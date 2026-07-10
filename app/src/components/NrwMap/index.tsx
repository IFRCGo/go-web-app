import {
    useEffect,
    useState,
} from 'react';

import { nrwPortalMode } from '#config';
import useAlert from '#hooks/useAlert';
import {
    EVENTS_PANEL_ELEMENT_ID,
    LEGEND_PANEL_ELEMENT_ID,
} from '#utils/nrw/nrwConstants';
import {
    type AdminAreaDetails,
    fetchAdminAreaDetails,
} from '#utils/nrw/nrwDataFetchHelpers';
import exportNrwDataMapToPdf from '#utils/nrw/nrwMapToPdfExporter';
import type { MapViewParameters } from '#utils/nrw/nrwMapTypes';

import MapboxDataMap from './MapboxDataMap';
import NrwEventsPanel from './NrwEventsPanel';
import NrwLayerPanel from './NrwLayerPanel';
import NrwLegendPanel from './NrwLegendPanel';
import useNrwDataLoader from './useNrwDataLoader';
import useNrwMapSearchParams from './useNrwMapSearchParams';

import styles from './styles.module.css';

/**
 * Parent map component for NRW
 * This creates the NRW components and facilitates their interactions.
 * @returns A standalone component
 */
export default function NrwMapContainer() {
    const alert = useAlert();

    // All URL search param handling lives in this hook.
    const {
        initialParams: {
            scopedCountries,
            initialEventId,
            initialAdminCode,
            initialLayerKeys,
            initialMapView,
        },
        resetToCountryParamsOnly,
        setLayerIds,
        setEventParams,
        setMapViewParams,
    } = useNrwMapSearchParams();

    // Selected items states owned by the container.
    const [selectedEventId, setSelectedEventId] = useState<number | null>(initialEventId);
    const [selectedAdminPlaceCode, setSelectedAdminPlaceCode] = useState<string | null>(
        initialAdminCode ?? null,
    );
    const [selectedAdminAreaDetails,
        setSelectedAdminAreaDetails] = useState<AdminAreaDetails | null>(null);

    // Data loader hook - manages layer loading, caching, and shared event data state
    const {
        eventData,
        reloadCountryEventData,
        selectedEventLayers,
        nonEventLayers,
        registerMapLayerFunctions,
        toggleMapLayer,
        hideAllLayers,
        visibleLayerNames,
        selectedEventDetails,
    } = useNrwDataLoader(scopedCountries, [], selectedEventId, initialLayerKeys);

    // Clear all selections and reload event data
    const handleRefreshAll = async () => {
        // Deselect current event and admin areas
        setSelectedEventId(null);
        hideAllLayers();
        setSelectedAdminPlaceCode(null);
        setSelectedAdminAreaDetails(null);

        // Reset search params
        resetToCountryParamsOnly(scopedCountries);

        // Reload event data
        await reloadCountryEventData();
    };

    // Set event selection and related search params when user selects and event.
    const handleEventSelection = (eventId: number) => {
        // Clear any user-selected admin area when changing events
        setSelectedAdminPlaceCode(null);
        setSelectedAdminAreaDetails(null);
        // Select the event
        setSelectedEventId(eventId);
        // Update the search params
        setEventParams({
            countries: scopedCountries,
            eventId,
            layerIds: visibleLayerNames,
        });
    };

    // Callback to handle the user selecting an admin area on the map.
    const handleAdminAreaSelected = (
        placeCode: string,
        details: AdminAreaDetails | null,
        mapView?: MapViewParameters,
    ) => {
        setSelectedAdminPlaceCode(placeCode);
        setSelectedAdminAreaDetails(details);
        setMapViewParams({
            countries: scopedCountries,
            eventId: selectedEventId,
            adminCode: placeCode,
            mapView,
            layerIds: visibleLayerNames,
        });
    };

    // Callback to set search params with any map interaction, such as panning or zooming.
    const handleMapViewChanged = (mapView: MapViewParameters) => {
        setMapViewParams({
            countries: scopedCountries,
            eventId: selectedEventId,
            adminCode: selectedAdminPlaceCode ?? undefined,
            mapView,
            layerIds: visibleLayerNames,
        });
    };

    // Export to PDF button handler
    const handlePdfExportClicked = async () => {
        try {
            await exportNrwDataMapToPdf(scopedCountries);
        } catch (error) {
            alert.show('Failed to export Mapbox PDF. Please try again.', { variant: 'danger' });
            console.error('[NrwMapContainer] Export failed:', error);
        }
    };

    // When the admin area is deeplinked via URL, fetch its details once on mount.
    useEffect(() => {
        if (!initialAdminCode) {
            return undefined;
        }

        let isCancelled = false;

        fetchAdminAreaDetails(initialAdminCode)
            .then((details) => {
                if (!isCancelled) {
                    setSelectedAdminAreaDetails(details);
                }
            })
            .catch(() => {
                if (!isCancelled) {
                    setSelectedAdminAreaDetails(null);
                }
            });

        return () => {
            isCancelled = true;
        };
    // Mount-only: the deeplinked admin details are resolved a single time.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Update the layer search params when the visible layers change
    useEffect(() => {
        setLayerIds(visibleLayerNames);
    }, [visibleLayerNames, setLayerIds]);

    return (
        <div className={styles.container}>
            <div className={styles.mainContent}>
                <div className={styles.controlPanelColumn}>
                    <div id={EVENTS_PANEL_ELEMENT_ID}>
                        <NrwEventsPanel
                            eventData={eventData}
                            activeEventId={selectedEventId}
                            onEventClick={handleEventSelection}
                            onRefreshAll={handleRefreshAll}
                            onDeselectEvent={handleRefreshAll}
                            countryCodes={scopedCountries}
                            selectedAdminPlaceCode={selectedAdminPlaceCode}
                            adminDetails={selectedAdminAreaDetails}
                        />
                    </div>
                </div>
                <div className={styles.mapColumn}>
                    <div className={styles.debugToolbar}>
                        <button
                            type="button"
                            className={styles.debugExportButton}
                            onClick={handlePdfExportClicked}
                        >
                            Debug Export PDF (Mapbox)
                        </button>
                    </div>
                    <MapboxDataMap
                        scopedCountries={scopedCountries}
                        selectedEventDetails={selectedEventDetails}
                        initialMapView={initialMapView}
                        registerMapLayerFunctions={registerMapLayerFunctions}
                        onSelect={handleAdminAreaSelected}
                        onViewChange={handleMapViewChanged}
                        layerPanel={(
                            <div>
                                <NrwLayerPanel
                                    eventLayers={selectedEventLayers}
                                    nonEventLayers={nonEventLayers}
                                    onToggleMapLayer={toggleMapLayer}
                                    onHideAllLayers={hideAllLayers}
                                    visibleLayerNames={visibleLayerNames}
                                />
                            </div>
                        )}
                    />
                    <div id={LEGEND_PANEL_ELEMENT_ID}>
                        <NrwLegendPanel
                            selectedEventDetails={selectedEventDetails}
                        />
                    </div>
                </div>
            </div>
            {nrwPortalMode === 'STANDALONE' && (
                <div>__</div>
            )}
        </div>
    );
}
