// TODO: This component has debug UI, and much will be rewritten.
// The same for the CSS file.
// It will be rereviewed fully later.
// The functions/callbacks passed in and calling out are planned to be kept though,
// so those can be reviewed.

import { Button } from '@ifrc-go/ui';

import {
    type MapLayerDetails,
    MapLayerInfoType,
} from '#utils/ibfMapTypes';
import mockCountryLayers from '#utils/ibfMockCountryData_debug';

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

interface IbfLayerPanelProps {
  eventLayers: MapLayerDetails[];
  countryCode: string;
  onToggleMapLayer: (layerDetails: MapLayerDetails) => void;
  onHideAllLayers: () => void;
}

/**
 * Control panel showing layers that can be toggled for the selected country and event.
 */
export default function IbfLayerPanel({
    eventLayers,
    countryCode,
    onToggleMapLayer,
    onHideAllLayers,
}: IbfLayerPanelProps) {
    // TODO: use real data instead of mock. Pending IBF API
    const countryLayers = mockCountryLayers[countryCode] ?? [];

    const hasAnyLayers = eventLayers.length > 0 || countryLayers.length > 0;

    if (!hasAnyLayers) {
        return (
            <div className={styles.container}>
                <div className={styles.title}>Map Layers</div>
                <p>No layers available</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.title}>Map Layers</div>

            {eventLayers.length > 0 && (
                <>
                    <div className={styles.sectionTitle}>Event Layers</div>
                    <div className={styles.buttonGroup}>
                        {eventLayers.map((layer) => (
                            <Button
                                key={`${layer.dataType}_${layer.resourceId}`}
                                name={`toggle_${layer.dataType}_${layer.resourceId}`}
                                onClick={() => onToggleMapLayer(layer)}
                            >
                                Toggle
                                {' '}
                                {getLayerLabel(layer)}
                            </Button>
                        ))}
                    </div>
                </>
            )}

            {countryLayers.length > 0 && (
                <>
                    <div className={styles.sectionTitle}>Country Layers</div>
                    <div className={styles.buttonGroup}>
                        {countryLayers.map((layer) => (
                            <Button
                                key={`${layer.dataType}_${layer.resourceId}`}
                                name={`toggle_country_${layer.dataType}`}
                                onClick={() => onToggleMapLayer(layer)}
                            >
                                Toggle
                                {' '}
                                {getLayerLabel(layer)}
                            </Button>
                        ))}
                    </div>
                </>
            )}

            <div className={styles.hideAllButton}>
                <Button name="hide-all-layers" onClick={onHideAllLayers}>
                    Hide All Layers
                </Button>
            </div>
        </div>
    );
}
