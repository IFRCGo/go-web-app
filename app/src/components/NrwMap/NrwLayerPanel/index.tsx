// TODO: This component has debug UI, and much will be rewritten.
// The same for the CSS file.

import { byPrefixAndName } from '@awesome.me/kit-92f09b5225/icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { type LayerDto } from '#utils/nrw/shared-dtos';
import { LayerName } from '#utils/nrw/shared-enums';

import styles from './styles.module.css';

// TODO: move to loc file. See task https://dev.azure.com/redcrossnl/IBF/_workitems/edit/41713
function getLayerLabel(layer: LayerDto): string {
    const labels: Partial<Record<LayerName, string>> = {
        [LayerName.population]: 'Population',
        [LayerName.floodDepth]: 'Flood Depth',
        [LayerName.redCrossBranches]: 'Red Cross Branches',
        [LayerName.clinics]: 'Clinics',
    };
    return labels[layer.layerName] ?? layer.layerName;
}

interface NrwLayerPanelProps {
    eventLayers: LayerDto[];
    countryLayers: Record<string, LayerDto[]>;
    onToggleMapLayer: (layerDetails: LayerDto, country?: string) => void;
    onHideAllLayers: () => void;
    visibleLayerKeys: string[];
    getLayerKey: (layer: LayerDto, country?: string) => string;
}

/**
 * Control panel showing layers that can be toggled for the selected event and scoped countries.
 */
export default function NrwLayerPanel({
    eventLayers,
    countryLayers,
    onToggleMapLayer,
    onHideAllLayers,
    visibleLayerKeys,
    getLayerKey,
}: NrwLayerPanelProps) {
    const hasAnyCountryLayers = Object.values(countryLayers)
        .some((layers) => layers.length > 0);
    const hasAnyLayers = eventLayers.length > 0 || hasAnyCountryLayers;

    if (!hasAnyLayers) {
        return (
            <div className={styles.container}>
                <div className={styles.title}>Map Layers</div>
                <p>No layers available</p>
            </div>
        );
    }

    const renderLayerButton = (layer: LayerDto, country?: string, labelPrefix?: string) => {
        const key = getLayerKey(layer, country);
        const isVisible = visibleLayerKeys.includes(key);
        return (
            <button
                key={key}
                name={`toggle_${key}`}
                type="button"
                className={styles.layerLink}
                onClick={() => onToggleMapLayer(layer, country)}
            >
                {isVisible
                    ? <FontAwesomeIcon icon={byPrefixAndName.fas!['square-check']!} />
                    : <FontAwesomeIcon icon={byPrefixAndName.far!.square!} />}
                {' '}
                {labelPrefix ? `${labelPrefix}: ${getLayerLabel(layer)}` : getLayerLabel(layer)}
            </button>
        );
    };

    return (
        <div className={styles.container}>
            <div className={styles.title}>Map Layers</div>

            {eventLayers.length > 0 && (
                <div className={styles.buttonGroup}>
                    {eventLayers.map((layer) => renderLayerButton(layer))}
                </div>
            )}

            {Object.entries(countryLayers).map(([countryCode, layers]) => (
                layers.length > 0 && (
                    <div key={countryCode} className={styles.buttonGroup}>
                        {layers.map((layer) => renderLayerButton(layer, countryCode, countryCode))}
                    </div>
                )
            ))}

            <div className={styles.hideAllButton}>
                <button
                    name="hide-all-layers"
                    type="button"
                    className={styles.layerLink}
                    onClick={onHideAllLayers}
                >
                    ✖️
                    {' '}
                    Hide All Layers
                </button>
            </div>
        </div>
    );
}
