import 'ol/ol.css';

import {
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import type MapOl from 'ol/Map';

import { nrwPortalMode } from '#config';
import useAlert from '#hooks/useAlert';
import {
    defaultMapZoom,
    noCountrySelectedValue,
} from '#utils/nrw/nrwConstants';
import {
    type AdminAreaDetails,
    getCurrentCountryEventData,
    getEventDetails,
} from '#utils/nrw/nrwDataFetchHelpers';
import { getSelectedEventDetails } from '#utils/nrw/nrwMapHelpers';
import type { MapSelectionView } from '#utils/nrw/nrwMapInteractionHelpers';
import { PrintElementId } from '#utils/nrw/nrwMapToPdfExporter';

import NrwControlPanel from './NrwControlPanel';
import NrwDataPanel from './NrwDataPanel';
import NrwLayerPanel from './NrwLayerPanel';
import NrwLegendPanel from './NrwLegendPanel';
import OlDataMap from './OlDataMap';
import useNrwDataLoader from './useNrwDataLoader';
import useNrwMapSearchParams from './useNrwMapSearchParams';

import styles from './styles.module.css';

/**
 * Base map component for NRW data maps
 * This component manages multiple nested components including for map data fetching,
 * display, and control.
 * @returns A standalone component
 */
export default function NrwMapContainer() {
    const alert = useAlert();

    // All URL search param handling lives in this hook.
    const {
        initial: {
            selectedCountry,
            selectedEventId,
            selectedMapZoom,
            selectedMapLat,
            selectedMapLon,
            initialAdminCode,
            initialLayerIds,
        },
        syncLayerIds,
        resetToCountry,
        setEventParams,
        setMapViewParams,
    } = useNrwMapSearchParams();

    // If these are valid latlon values, return an initial map view
    const initialMapView = () => {
        if (selectedMapLat !== null && selectedMapLon !== null) {
            let mapZoom = defaultMapZoom;
            if (selectedMapZoom) {
                mapZoom = selectedMapZoom;
            }
            return {
                zoom: mapZoom,
                center: {
                    lat: selectedMapLat,
                    lon: selectedMapLon,
                },
            };
        }
        return null;
    };

    // Check if a country is in the search params
    if (selectedCountry === noCountrySelectedValue) {
    // TODO: Redirect to NRW landing page or show some error since we can't load the portal.
    // This is pending design.
        console.error('No country selected. Cannot load the portal.');
    }

    // Data loader hook - manages layer loading, caching, and shared event state
    const {
        eventData,
        setEventData,
        selectedEventId: activeEventId,
        selectEvent,
        deselectEvent,
        selectedEventLayers,
        registerMapAddLayer,
        toggleMapLayer,
        hideAllLayers,
        activeLayerIds: visibleLayerIds,
        isMapReady,
    } = useNrwDataLoader(selectedCountry, [], selectedEventId, initialLayerIds);

    const [selectedAdminPlaceCode, setSelectedAdminPlaceCode] = useState<
    string | null
    >(initialAdminCode);
    const [adminDetails, setAdminDetails] = useState<AdminAreaDetails | null>(null);

    // Store map instance for PDF export
    const mapRef = useRef<MapOl | null>(null);

    // Load initial event data asynchronously on mount
    useEffect(() => {
        const loadInitialData = async () => {
            const data = selectedEventId
                ? await getEventDetails(selectedEventId)
                : await getCurrentCountryEventData(selectedCountry);
            setEventData(data);
        };
        loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Derive map details for the selected event (centroid, affected areas)
    const selectedEventDetails = useMemo(
        () => getSelectedEventDetails(eventData, activeEventId),
        [eventData, activeEventId],
    );

    // Derive peak day for the selected event (for PDF export filename)
    const selectedEventPeakDay = useMemo(() => {
        const activeEvent = activeEventId
            ? eventData.find((event) => event.eventId === activeEventId)
            : null;
        if (!activeEvent) {
            return undefined;
        }
        const peakTime = activeEvent.reachesPeakAlertClassTime;
        return peakTime ? peakTime.split('T')[0] : undefined;
    }, [eventData, activeEventId]);

    // Show alert when no exposed areas found in a selected event
    useEffect(() => {
        if (selectedEventDetails
             && Object.keys(selectedEventDetails.exposedPopulationPerAreaByLevel).length === 0) {
            alert.show('No exposed areas', {
                variant: 'danger',
                description: `No exposed areas found for event "${activeEventId}".`,
            });
        }
    }, [selectedEventDetails, activeEventId, alert]);

    // Sync the active layer IDs to the URL
    useEffect(() => {
        syncLayerIds(visibleLayerIds);
    }, [visibleLayerIds, syncLayerIds]);

    // Refresh page and put in a default start state
    const handleRefreshAll = async () => {
        resetToCountry(selectedCountry);

        // Deselect current event and admin areas
        deselectEvent();
        setSelectedAdminPlaceCode(null);
        setAdminDetails(null);

        // Reload event data and set it
        const data = await getCurrentCountryEventData(selectedCountry);
        setEventData(data);
    };

    // Handle event deselection (e.g. user goes back to all events view)
    const handleDeselectEvent = () => {
        deselectEvent();
        setSelectedAdminPlaceCode(null);
        setAdminDetails(null);
    };

    // Handle event selection from control panel
    const handleEventClick = (eventId: number) => {
        selectEvent(eventId);
        // Clear any user-selected admin area when changing events
        setSelectedAdminPlaceCode(null);
        setAdminDetails(null);
        // Set search params for URL sharing only - does not reload data
        setEventParams({
            country: selectedCountry,
            eventId,
            layerIds: visibleLayerIds,
        });
    };

    // Callback to update search params based on user interactions.
    const handleMapItemSelected = (
        placeCode: string,
        details: AdminAreaDetails | null,
        mapView?: MapSelectionView,
    ) => {
        setSelectedAdminPlaceCode(placeCode);
        setAdminDetails(details);
        setMapViewParams({
            country: selectedCountry,
            eventId: activeEventId,
            adminCode: placeCode,
            mapView,
            layerIds: visibleLayerIds,
        });
    };

    const handleMapViewChanged = (mapView: MapSelectionView) => {
        setMapViewParams({
            country: selectedCountry,
            eventId: activeEventId,
            adminCode: selectedAdminPlaceCode ?? undefined,
            mapView,
            layerIds: visibleLayerIds,
        });
    };

    return (
        <div className={styles.container}>
            <div id={PrintElementId.DataPanel}>
                <NrwDataPanel
                    selectedCountry={selectedCountry}
                    adminDetails={adminDetails}
                    mapRef={mapRef}
                    eventId={activeEventId ?? undefined}
                    peakDay={selectedEventPeakDay}
                />
            </div>
            <div className={styles.mainContent}>
                <div className={styles.controlPanelColumn}>
                    <div id={PrintElementId.ControlPanel}>
                        <NrwControlPanel
                            eventData={eventData}
                            activeEventId={activeEventId}
                            onEventClick={handleEventClick}
                            onRefreshAll={handleRefreshAll}
                            onDeselectEvent={handleDeselectEvent}
                            countryCode={selectedCountry}
                            selectedAdminPlaceCode={selectedAdminPlaceCode}
                        />
                    </div>
                </div>
                <div className={styles.mapColumn} id={PrintElementId.Map}>
                    <OlDataMap
                        selectedCountry={selectedCountry}
                        selectedEventDetails={selectedEventDetails}
                        initialMapView={initialMapView()}
                        initialAdminCode={initialAdminCode}
                        addLayerFunction={registerMapAddLayer}
                        onSelect={handleMapItemSelected}
                        onViewChange={handleMapViewChanged}
                        onMapReady={(map: MapOl) => { mapRef.current = map; }}
                        layerPanel={(
                            <div id={PrintElementId.LayerPanel}>
                                <NrwLayerPanel
                                    eventLayers={selectedEventLayers}
                                    countryCode={selectedCountry}
                                    onToggleMapLayer={toggleMapLayer}
                                    onHideAllLayers={hideAllLayers}
                                    initialLayerIds={initialLayerIds}
                                    visibleLayerResourceIds={visibleLayerIds}
                                    isMapReady={isMapReady}
                                />
                            </div>
                        )}
                    />
                    <NrwLegendPanel
                        selectedEventDetails={selectedEventDetails}
                    />
                </div>
            </div>
            {nrwPortalMode === 'STANDALONE' && (
                <div>__</div>
            )}
        </div>
    );
}
