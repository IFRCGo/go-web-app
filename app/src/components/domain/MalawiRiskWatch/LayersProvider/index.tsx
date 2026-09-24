import {
    useMemo,
    useState,
} from 'react';

import {
    DEFAULT_BUBBLE_COLOR,
    DEFAULT_SHADE_COLOR,
    FORECAST_METRIC_KEY,
    type LayerColor,
} from '../constants';
import MalawiLayersContext, { type LayerSelection } from '../context';

interface Props {
    children: React.ReactNode;
}

function LayersProvider(props: Props) {
    const { children } = props;

    const [shadeEnabled, setShadeEnabled] = useState(true);
    const [shadeLayer, setShadeLayer] = useState<LayerSelection | undefined>(
        { key: FORECAST_METRIC_KEY, format: 'number' },
    );
    const [shadeColor, setShadeColor] = useState<LayerColor>(DEFAULT_SHADE_COLOR);
    const [bubbleEnabled, setBubbleEnabled] = useState(false);
    const [bubbleLayer, setBubbleLayer] = useState<LayerSelection | undefined>();
    const [bubbleColor, setBubbleColor] = useState<LayerColor>(DEFAULT_BUBBLE_COLOR);
    const [showLocalUnits, setShowLocalUnits] = useState(false);

    const contextValue = useMemo(
        () => ({
            shadeEnabled,
            setShadeEnabled,
            shadeLayer,
            setShadeLayer,
            shadeColor,
            setShadeColor,
            bubbleEnabled,
            setBubbleEnabled,
            bubbleLayer,
            setBubbleLayer,
            bubbleColor,
            setBubbleColor,
            showLocalUnits,
            setShowLocalUnits,
        }),
        [
            shadeEnabled,
            shadeLayer,
            shadeColor,
            bubbleEnabled,
            bubbleLayer,
            bubbleColor,
            showLocalUnits,
        ],
    );

    return (
        <MalawiLayersContext.Provider value={contextValue}>
            {children}
        </MalawiLayersContext.Provider>
    );
}

export default LayersProvider;
