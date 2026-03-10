import styles from './styles.module.css';
import {
    Button,
} from '@ifrc-go/ui';

interface IbfControlPanelProps {
    onToggleImageLayer: () => void;
    isLayerVisible: boolean;
}

/**
 * Debug component for UI to control the map. *
 * This will change once we have a design. *
 * The available controls here will depend on the event and available data. *
 * @returns A component that is intended to be nested within a IbfMapContainer.
 */
export function IbfControlPanel({ onToggleImageLayer, isLayerVisible }: IbfControlPanelProps) {
    // TODO: pass the fetching function to the control panel so that the control panel can more easily
    // track the loading/loaded state.

    let buttonText = 'wwww Show Flood Map Layer';

    if (isLayerVisible) {
        buttonText = 'wwww Hide Flood Map Layer';
    }

    return (
        <div className={styles.dataContainer}>
            <Button
                name={"test_button_ID"}
                onClick={onToggleImageLayer}
            >
                {buttonText}
            </Button>
        </div>
    );
}