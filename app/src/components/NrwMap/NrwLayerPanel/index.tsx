// TODO: This component has debug UI, and much will be rewritten.
// The same for the CSS file.
// It will be rereviewed fully later.
// The functions/callbacks passed in and calling out are planned to be kept though,
// so those can be reviewed.

import {
    useCallback,
    useEffect,
    useRef,
    useState,
} from 'react';
import { Button } from '@ifrc-go/ui';
import type MapOl from 'ol/Map';

import useAlert from '#hooks/useAlert';
import { getCountryMapData } from '#utils/nrw/nrwDataFetchHelpers';
import { exportMapToPdf } from '#utils/nrw/nrwMapToPdfExporter';
import {
    type MapLayerDetails,
    MapLayerInfoType,
} from '#utils/nrw/nrwMapTypes';

import styles from './styles.module.css';

// TODO: move to loc file. See task https://dev.azure.com/redcrossnl/IBF/_workitems/edit/41713
function getLayerLabel(layer: MapLayerDetails): string {
    const labels: Record<string, string> = {
        [MapLayerInfoType.Population]: 'Population',
        [MapLayerInfoType.EventExtent]: 'Event Extent',
        [MapLayerInfoType.RedCrossBranches]: 'Red Cross Branches',
        [MapLayerInfoType.Clinics]: 'Clinics',
    };
    return labels[layer.dataType] ?? layer.dataType;
}

interface NrwLayerPanelProps {
  eventLayers: MapLayerDetails[];
  countryCode: string;
  onToggleMapLayer: (layerDetails: MapLayerDetails) => void;
  onHideAllLayers: () => void;
  mapRef: React.RefObject<MapOl | null>;
  eventId?: string;
  peakDay?: string;
  // Resource IDs of layers that should be on on initial view
  initialLayerIds: string[];
  // Is the map setup complete
  isMapReady: boolean;
}

/**
 * Control panel showing layers that can be toggled for the selected country and event.
 */
export default function NrwLayerPanel({
    eventLayers,
    countryCode,
    onToggleMapLayer,
    onHideAllLayers,
    mapRef,
    eventId,
    peakDay,
    initialLayerIds,
    isMapReady,
}: NrwLayerPanelProps) {
    const alert = useAlert();

    // Whether the panel is still in its initial state (no user interaction yet).
    const isInitialStateRef = useRef(true);

    // Track which initial layer IDs still need to be auto-toggled on.
    // Layers are removed from this set as they are toggled, so we never toggle
    // the same layer twice.
    const pendingInitialIdsRef = useRef<Set<string>>(new Set(initialLayerIds));

    // Get the list of country-level layers available for a country
    // TODO: use real data instead of mock. Pending IBF API
    const [countryLayers, setCountryLayers] = useState<MapLayerDetails[]>([]);

    useEffect(() => {
        const loadCountryLayers = async () => {
            const data = await getCountryMapData();
            setCountryLayers(data[countryCode]?.availableLayers ?? []);
        };
        loadCountryLayers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Toggle on any layer with a matching resource ID
    // This only makes changes if the panel is still in its initial state
    useEffect(() => {
        if (!isInitialStateRef.current || !isMapReady) {
            return;
        }
        if (pendingInitialIdsRef.current.size === 0) {
            return;
        }
        const allLayers = [...eventLayers, ...countryLayers];
        allLayers.forEach((layer) => {
            if (pendingInitialIdsRef.current.has(layer.resourceId)) {
                // Remove the layer id from the pending layer list, and toggle it on
                pendingInitialIdsRef.current.delete(layer.resourceId);
                onToggleMapLayer(layer);
            }
        });
    }, [isMapReady, eventLayers, countryLayers, onToggleMapLayer]);

    // Wrapper for the toggle callback that was passed in as a component prop
    const handleToggleClick = useCallback((layer: MapLayerDetails) => {
        isInitialStateRef.current = false;
        onToggleMapLayer(layer);
    }, [onToggleMapLayer]);

    // Wrapper for the hide all callback that was passed in as a component prop
    const handleHideAllClick = useCallback(() => {
        isInitialStateRef.current = false;
        onHideAllLayers();
    }, [onHideAllLayers]);

    const handleExportMapClick = useCallback(async () => {
        isInitialStateRef.current = false;
        if (mapRef.current) {
            const filenameParts = [countryCode];
            if (eventId) {
                filenameParts.push(`event_${eventId}`);
            }
            if (peakDay) {
                filenameParts.push(`peak_${peakDay}`);
            }
            try {
                await exportMapToPdf(mapRef.current, filenameParts);
            } catch (error) {
                alert.show('Failed to export map. Please try again.', { variant: 'danger' });
                console.error('Map export error:', error);
            }
        }
    }, [mapRef, countryCode, eventId, peakDay, alert]);

    const hasAnyLayers = eventLayers.length > 0 || countryLayers.length > 0;

    if (!hasAnyLayers) {
        return (
            <div className={styles.container}>
                <div className={styles.exportButtonRow}>
                    <Button
                        name="export-map"
                        onClick={handleExportMapClick}
                    >
                        Export
                    </Button>
                </div>
                <div className={styles.title}>Map Layers</div>
                <p>No layers available</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.exportButtonRow}>
                <Button
                    name="export-map"
                    onClick={handleExportMapClick}
                >
                    Export
                </Button>
            </div>
            <div className={styles.title}>Map Layers</div>

            {eventLayers.length > 0 && (
                <div className={styles.buttonGroup}>
                    {eventLayers.map((layer) => (
                        <Button
                            key={`${layer.dataType}_${layer.resourceId}`}
                            name={`toggle_${layer.dataType}_${layer.resourceId}`}
                            onClick={() => handleToggleClick(layer)}
                        >
                            Toggle
                            {' '}
                            {getLayerLabel(layer)}
                        </Button>
                    ))}
                </div>
            )}

            {countryLayers.length > 0 && (
                <div className={styles.buttonGroup}>
                    {countryLayers.map((layer) => (
                        <Button
                            key={`${layer.dataType}_${layer.resourceId}`}
                            name={`toggle_country_${layer.dataType}`}
                            onClick={() => handleToggleClick(layer)}
                        >
                            Toggle
                            {' '}
                            {getLayerLabel(layer)}
                        </Button>
                    ))}
                </div>
            )}

            <div className={styles.hideAllButton}>
                <Button name="hide-all-layers" onClick={handleHideAllClick}>
                    Hide All Layers
                </Button>
            </div>
        </div>
    );
}
