import 'ol/ol.css';

import {
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { useSearchParams } from 'react-router-dom';
import type MapOl from 'ol/Map';

import useAlert from '#hooks/useAlert';
import {
    countryParamsKey,
    eventIdParamsKey,
    noCountrySelectedValue,
} from '#utils/ibfMap';
import {
    getCurrentCountryEventData,
    getEventDetails,
    getSelectedEventMapDetails,
} from '#utils/ibfMapHelpers';
import { PrintElementId } from '#utils/nrwMapToPdfExporter';

import IbfControlPanel from './IbfControlPanel';
import IbfDataPanel from './IbfDataPanel';
import IbfLayerPanel from './IbfLayerPanel';
import OlDataMap from './OlDataMap';
import useIbfDataLoader from './useIbfDataLoader';

import styles from './styles.module.css';

/**
 * Base map component for IBF data maps
 * This component manages multiple nested components including for map data fetching,
 * display, and control.
 * @returns A standalone component
 */
export default function IbfMapContainer() {
    const alert = useAlert();

    // Search params are used to create a shareable URL to a specific view.
    // TODO: add more data to the params, and also handle scrubbing the values
    // to prevent injection attacks (if needed)
    // See task: https://dev.azure.com/redcrossnl/IBF/_workitems/edit/40917
    const [searchParams, setSearchParams] = useSearchParams();

    // Load the view details from the search params
    // This is only done once at page load
    const selectedCountry = searchParams.get(countryParamsKey)?.toUpperCase()
    || noCountrySelectedValue;
    const selectedEventId = searchParams.get(eventIdParamsKey) || '';

    // Check if a country is in the search params
    if (selectedCountry === noCountrySelectedValue) {
    // TODO: Redirect to NRW landing page or show some error since we can't load the portal.
    // This is pending design.
        console.error('No country selected. Cannot load the portal.');
    }

    // Event data is loaded once on page load, then only updated via the refresh function
    const initialEventData = selectedEventId
        ? getEventDetails(selectedEventId)
        : getCurrentCountryEventData(selectedCountry);

    const [selectedAdminPlaceCode, setSelectedAdminPlaceCode] = useState<
    string | null
  >(null);

    // Store map instance for PDF export
    const mapRef = useRef<MapOl | null>(null);

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
    } = useIbfDataLoader(selectedCountry, initialEventData, selectedEventId);

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

    // Refresh page and put in a default start state
    const handleRefreshAll = () => {
    // Clear search params except for the country
        setSearchParams({
            [countryParamsKey]: selectedCountry,
        });

        // Deselect current event and admin areas
        deselectEvent();

        // Reload event data and set it
        setEventData(getCurrentCountryEventData(selectedCountry));
    };

    // Handle event selection from control panel
    const handleEventClick = (eventId: string) => {
        selectEvent(eventId);
        // Set search params for URL sharing only - does not reload data
        setSearchParams({
            [countryParamsKey]: selectedCountry,
            [eventIdParamsKey]: eventId,
        });
    };

    // Callback to update search params based on user interactions.
    const handleMapItemSelected = (placeCode: string) => {
    // TODO: pass what is clicked on to the data panel and UI panel.
        setSelectedAdminPlaceCode(placeCode);
        console.debug(`TODO: [IbfMap] Admin area selected: ${placeCode}`);
    };

    return (
        <div className={styles.container}>
            <div id={PrintElementId.DataPanel}>
                <IbfDataPanel selectedCountry={selectedCountry} />
            </div>
            <div className={styles.mainContent}>
                <div className={styles.controlPanelColumn}>
                    <div id={PrintElementId.LayerPanel}>
                        <IbfLayerPanel
                            eventLayers={selectedEventLayers}
                            countryCode={selectedCountry}
                            onToggleMapLayer={toggleMapLayer}
                            onHideAllLayers={hideAllLayers}
                            mapRef={mapRef}
                            eventId={activeEventId ?? undefined}
                            peakDay={selectedEventPeakDay}
                        />
                    </div>
                    <div id={PrintElementId.ControlPanel}>
                        <IbfControlPanel
                            eventData={eventData}
                            activeEventId={activeEventId}
                            onEventClick={handleEventClick}
                            onRefreshAll={handleRefreshAll}
                            onDeselectEvent={deselectEvent}
                            countryCode={selectedCountry}
                            selectedAdminPlaceCode={selectedAdminPlaceCode}
                        />
                    </div>
                </div>
                <div className={styles.mapColumn} id={PrintElementId.Map}>
                    <OlDataMap
                        selectedCountry={selectedCountry}
                        selectedEventDetails={selectedEventMapDetails}
                        addLayerFunction={registerMapAddLayer}
                        onSelect={handleMapItemSelected}
                        onMapReady={(map: MapOl) => { mapRef.current = map; }}
                    />
                </div>
            </div>
        </div>
    );
}
