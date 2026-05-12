import 'ol/ol.css';

import {
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import type MapOl from 'ol/Map';

import useAlert from '#hooks/useAlert';
import {
    defaultMapZoom,
    noCountrySelectedValue,
} from '#utils/nrw/nrwConstants';
import {
    getCurrentCountryEventData,
    getEventDetails,
} from '#utils/nrw/nrwDataFetchHelpers';
import { getSelectedEventMapDetails } from '#utils/nrw/nrwMapHelpers';
import type { MapSelectionView } from '#utils/nrw/nrwMapInteractionHelpers';
import { PrintElementId } from '#utils/nrw/nrwMapToPdfExporter';
import type { AllEventsData } from '#utils/nrw/nrwMapTypes';

import NrwControlPanel from './NrwControlPanel';
import NrwDataPanel from './NrwDataPanel';
import NrwLayerPanel from './NrwLayerPanel';
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
        activeLayerIds,
        isMapReady,
    } = useNrwDataLoader(selectedCountry, {} as AllEventsData, selectedEventId, initialLayerIds);

    const [selectedAdminPlaceCode, setSelectedAdminPlaceCode] = useState<
    string | null
    >(initialAdminCode);

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

    // Derive map details for the selected event (centroid, affected regions)
    const selectedEventMapDetails = useMemo(
        () => getSelectedEventMapDetails(eventData, activeEventId),
        [eventData, activeEventId],
    );

    // Derive peak day for the selected event (for PDF export filename)
    const selectedEventPeakDay = useMemo(() => {
        if (!activeEventId || !eventData[activeEventId]) {
            return undefined;
        }
        const peakTime = eventData[activeEventId].reachesPeakAlertClassTime;
        return peakTime ? peakTime.split('T')[0] : undefined;
    }, [eventData, activeEventId]);

    // Show alert when no exposed regions found in a selected event
    useEffect(() => {
        if (selectedEventMapDetails && selectedEventMapDetails.exposedRegionsByLevel.size === 0) {
            alert.show('No exposed regions', {
                variant: 'danger',
                description: `No exposed regions found for event "${activeEventId}".`,
            });
        }
    }, [selectedEventMapDetails, activeEventId, alert]);

    // Sync the active layer IDs to the URL
    useEffect(() => {
        syncLayerIds(activeLayerIds);
    }, [activeLayerIds, syncLayerIds]);

    // Refresh page and put in a default start state
    const handleRefreshAll = async () => {
        resetToCountry(selectedCountry);

        // Deselect current event and admin areas
        deselectEvent();
        setSelectedAdminPlaceCode(null);

        // Reload event data and set it
        const data = await getCurrentCountryEventData(selectedCountry);
        setEventData(data);
    };

    // Handle event deselection (e.g. user goes back to all events view)
    const handleDeselectEvent = () => {
        deselectEvent();
        setSelectedAdminPlaceCode(null);
    };

    // Handle event selection from control panel
    const handleEventClick = (eventId: string) => {
        selectEvent(eventId);
        // Clear any user-selected admin area when changing events
        setSelectedAdminPlaceCode(null);
        // Set search params for URL sharing only - does not reload data
        setEventParams({
            country: selectedCountry,
            eventId,
            layerIds: activeLayerIds,
        });
    };

    // Callback to update search params based on user interactions.
    const handleMapItemSelected = (
        placeCode: string,
        mapView?: MapSelectionView,
    ) => {
        setSelectedAdminPlaceCode(placeCode);
        setMapViewParams({
            country: selectedCountry,
            eventId: activeEventId,
            adminCode: placeCode,
            mapView,
            layerIds: activeLayerIds,
        });
    };

    const handleMapViewChanged = (mapView: MapSelectionView) => {
        setMapViewParams({
            country: selectedCountry,
            eventId: activeEventId,
            adminCode: selectedAdminPlaceCode ?? undefined,
            mapView,
            layerIds: activeLayerIds,
        });
    };

    return (
        <div className={styles.container}>
            <div id={PrintElementId.DataPanel}>
                <NrwDataPanel selectedCountry={selectedCountry} />
            </div>
            <div className={styles.mainContent}>
                <div className={styles.controlPanelColumn}>
                    <div id={PrintElementId.LayerPanel}>
                        <NrwLayerPanel
                            eventLayers={selectedEventLayers}
                            countryCode={selectedCountry}
                            onToggleMapLayer={toggleMapLayer}
                            onHideAllLayers={hideAllLayers}
                            mapRef={mapRef}
                            eventId={activeEventId ?? undefined}
                            peakDay={selectedEventPeakDay}
                            initialLayerIds={initialLayerIds}
                            isMapReady={isMapReady}
                        />
                    </div>
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
                        selectedEventDetails={selectedEventMapDetails}
                        initialMapView={initialMapView()}
                        initialAdminCode={initialAdminCode}
                        addLayerFunction={registerMapAddLayer}
                        onSelect={handleMapItemSelected}
                        onViewChange={handleMapViewChanged}
                        onMapReady={(map: MapOl) => { mapRef.current = map; }}
                    />
                </div>
            </div>
        </div>
    );
}
