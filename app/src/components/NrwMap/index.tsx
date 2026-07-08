import {
    useEffect,
    useState,
} from 'react';

import { nrwPortalMode } from '#config';
import useAlert from '#hooks/useAlert';
import {
    type AdminAreaDetails,
    getAdminAreaDetailsFromCode,
} from '#utils/nrw/nrwDataFetchHelpers';
import { exportMapboxToPdf } from '#utils/nrw/nrwMapboxToPdfExporter';
import type { MapViewParameters } from '#utils/nrw/nrwMapTypes';

import MapBoxDataMap from './MapBoxDataMap';
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
    const [selectedAdminAreaDetails,
        setSelectedAdminAreaDetails] = useState<AdminAreaDetails | null>(
            initialAdminCode ? getAdminAreaDetailsFromCode(initialAdminCode) : null,
        );

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

    // Update the layer search params when the visible layers change
    useEffect(() => {
        setLayerIds(visibleLayerNames);
    }, [visibleLayerNames, setLayerIds]);

    // Clear all selections and reload event data
    const handleRefreshAll = async () => {
        // Deselect current event and admin areas
        setSelectedEventId(null);
        hideAllLayers();
        setSelectedAdminAreaDetails(null);

        // Reset search params
        resetToCountryParamsOnly(scopedCountries);

        // Reload event data
        await reloadCountryEventData();
    };

    // Set event selection and related search params when user selects and event.
    const handleEventSelection = (eventId: number) => {
        // Clear any user-selected admin area when changing events
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
        setSelectedAdminAreaDetails(details ?? getAdminAreaDetailsFromCode(placeCode));
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
            adminCode: selectedAdminAreaDetails?.code ?? undefined,
            mapView,
            layerIds: visibleLayerNames,
        });
    };

    // Export to PDF button handler
    const handlePdfExportClicked = async () => {
        try {
            await exportMapboxToPdf(scopedCountries);
        } catch (error) {
            alert.show('Failed to export Mapbox PDF. Please try again.', { variant: 'danger' });
            console.error('[NrwMapContainer] Export failed:', error);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.mainContent}>
                <div className={styles.controlPanelColumn}>
                    <div id="nrw-events-panel">
                        <NrwEventsPanel
                            eventData={eventData}
                            activeEventId={selectedEventId}
                            onEventClick={handleEventSelection}
                            onRefreshAll={handleRefreshAll}
                            onDeselectEvent={handleRefreshAll}
                            countryCodes={scopedCountries}
                            selectedAdminPlaceCode={selectedAdminAreaDetails?.code ?? null}
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
                    <MapBoxDataMap
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
                    <div id="nrw-legend-panel">
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
