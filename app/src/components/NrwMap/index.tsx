import 'ol/ol.css';

import {
    useEffect,
    useRef,
    useState,
} from 'react';
import type MapOl from 'ol/Map';

import { nrwPortalMode } from '#config';
import { type AdminAreaDetails } from '#utils/nrw/nrwDataFetchHelpers';
import type { MapSelectionView } from '#utils/nrw/nrwMapInteractionHelpers';

import MapBoxDataMap from './MapBoxDataMap';
import NrwEventsPanel from './NrwEventsPanel';
import NrwLayerPanel from './NrwLayerPanel';
import NrwLegendPanel from './NrwLegendPanel';
import OlDataMap from './OlDataMap';
import useNrwDataLoader from './useNrwDataLoader';
import useNrwMapSearchParams from './useNrwMapSearchParams';

import styles from './styles.module.css';

/**
 * Parent map component for NRW
 * This creates the NRW components and facilitates their interactions.
 * @returns A standalone component
 */
export default function NrwMapContainer() {
    // All URL search param handling lives in this hook.
    const {
        initialParams: {
            scopedCountries,
            selectedEventId: initialEventId,
            initialAdminCode,
            initialLayerKeys,
            initialMapView,
        },
        syncLayerIds,
        resetToCountries,
        setEventParams,
        setMapViewParams,
    } = useNrwMapSearchParams();

    // Selection / view state owned by the container.
    const [selectedEventId, setSelectedEventId] = useState<number | null>(initialEventId);

    const [selectedAdminPlaceCode, setSelectedAdminPlaceCode] = useState<
    string | null
    >(initialAdminCode);
    const [adminDetails, setAdminDetails] = useState<AdminAreaDetails | null>(null);

    // Data loader hook - manages layer loading, caching, and shared event data state
    const {
        eventData,
        reloadCountryEventData,
        selectedEventLayers,
        nonEventLayers,
        registerMapAddLayer,
        toggleMapLayer,
        hideAllLayers,
        visibleLayerNames,
        selectedEventDetails,
    } = useNrwDataLoader(scopedCountries, [], selectedEventId, initialLayerKeys);

    // Store map instance for PDF export
    const mapRef = useRef<MapOl | null>(null);

    // Sync the visible layer keys to the URL
    useEffect(() => {
        syncLayerIds(visibleLayerNames);
    }, [visibleLayerNames, syncLayerIds]);

    // Refresh page and put in a default start state
    const handleRefreshAll = async () => {
        resetToCountries(scopedCountries);

        // Deselect current event and admin areas
        setSelectedEventId(null);
        hideAllLayers();
        setSelectedAdminPlaceCode(null);
        setAdminDetails(null);

        // Reload event data
        await reloadCountryEventData();
    };

    // Handle event deselection (e.g. user goes back to all events view)
    const handleDeselectEvent = () => {
        setSelectedEventId(null);
        hideAllLayers();
        setSelectedAdminPlaceCode(null);
        setAdminDetails(null);
    };

    // Handle event selection from control panel
    const handleEventClick = (eventId: number) => {
        setSelectedEventId(eventId);
        // Clear any user-selected admin area when changing events
        setSelectedAdminPlaceCode(null);
        setAdminDetails(null);
        // Set search params for URL sharing only - does not reload data
        setEventParams({
            countries: scopedCountries,
            eventId,
            layerIds: visibleLayerNames,
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
            countries: scopedCountries,
            eventId: selectedEventId,
            adminCode: placeCode,
            mapView,
            layerIds: visibleLayerNames,
        });
    };

    const handleMapViewChanged = (mapView: MapSelectionView) => {
        setMapViewParams({
            countries: scopedCountries,
            eventId: selectedEventId,
            adminCode: selectedAdminPlaceCode ?? undefined,
            mapView,
            layerIds: visibleLayerNames,
        });
    };

    return (
        <div className={styles.container}>
            <div>
                <MapBoxDataMap
                    scopedCountries={scopedCountries}
                    initialMapView={initialMapView}
                    visibleLayerIds={visibleLayerNames}
                    availableEventLayers={selectedEventLayers}
                />
            </div>
            <div className={styles.mainContent}>
                <div className={styles.controlPanelColumn}>
                    <div >
                        <NrwEventsPanel
                            eventData={eventData}
                            activeEventId={selectedEventId}
                            onEventClick={handleEventClick}
                            onRefreshAll={handleRefreshAll}
                            onDeselectEvent={handleDeselectEvent}
                            countryCodes={scopedCountries}
                            selectedAdminPlaceCode={selectedAdminPlaceCode}
                        />
                    </div>
                </div>
                <div className={styles.mapColumn} >
                    <OlDataMap
                        scopedCountries={scopedCountries}
                        selectedEventDetails={selectedEventDetails}
                        initialMapView={initialMapView}
                        initialAdminCode={initialAdminCode}
                        addLayerFunction={registerMapAddLayer}
                        onSelect={handleMapItemSelected}
                        onViewChange={handleMapViewChanged}
                        onMapReady={(map: MapOl) => { mapRef.current = map; }}
                        layerPanel={(
                            <div >
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
