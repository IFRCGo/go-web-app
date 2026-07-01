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
 * Parent map component for NRW
 * This creates the NRW components and facilitates their interactions.
 * @returns A standalone component
 */
export default function NrwMapContainer() {
    // All URL search param handling lives in this hook.
    const {
        initialParams: {
            selectedCountry,
            selectedEventId: initialEventId,
            initialAdminCode,
            initialLayerIds,
            initialMapView,
        },
        syncLayerIds,
        resetToCountry,
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
        registerMapAddLayer,
        toggleMapLayer,
        hideAllLayers,
        activeLayerIds: visibleLayerIds,
        isMapReady,
        selectedEventDetails,
    } = useNrwDataLoader(selectedCountry, [], selectedEventId, initialLayerIds);

    // Store map instance for PDF export
    const mapRef = useRef<MapOl | null>(null);

    // Sync the active layer IDs to the URL
    useEffect(() => {
        syncLayerIds(visibleLayerIds);
    }, [visibleLayerIds, syncLayerIds]);

    // Refresh page and put in a default start state
    const handleRefreshAll = async () => {
        resetToCountry(selectedCountry);

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
            eventId: selectedEventId,
            adminCode: placeCode,
            mapView,
            layerIds: visibleLayerIds,
        });
    };

    const handleMapViewChanged = (mapView: MapSelectionView) => {
        setMapViewParams({
            country: selectedCountry,
            eventId: selectedEventId,
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
                    eventId={selectedEventId ?? undefined}
                />
            </div>
            <div className={styles.mainContent}>
                <div className={styles.controlPanelColumn}>
                    <div id={PrintElementId.ControlPanel}>
                        <NrwControlPanel
                            eventData={eventData}
                            activeEventId={selectedEventId}
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
                        initialMapView={initialMapView}
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
