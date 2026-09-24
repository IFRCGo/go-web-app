import { createContext } from 'react';

import {
    DEFAULT_BUBBLE_COLOR,
    DEFAULT_RASTER_COLOR,
    DEFAULT_RASTER_OPACITY,
    DEFAULT_SHADE_COLOR,
    type LayerColor,
} from './constants';
import { type HdxMetricFormat } from './hdxMetrics';

export interface LayerSelection {
    key: string;
    format: HdxMetricFormat;
    // Captured on selection for the legend; the forecast label comes from the source
    label?: string;
}

interface MalawiLayersContextProps {
    shadeEnabled: boolean;
    setShadeEnabled: (value: boolean) => void;
    shadeLayer: LayerSelection | undefined;
    setShadeLayer: (value: LayerSelection | undefined) => void;
    shadeColor: LayerColor;
    setShadeColor: (value: LayerColor) => void;
    bubbleEnabled: boolean;
    setBubbleEnabled: (value: boolean) => void;
    bubbleLayer: LayerSelection | undefined;
    setBubbleLayer: (value: LayerSelection | undefined) => void;
    bubbleColor: LayerColor;
    setBubbleColor: (value: LayerColor) => void;
    rasterEnabled: boolean;
    setRasterEnabled: (value: boolean) => void;
    // Key of the source raster to show
    rasterLayer: string | undefined;
    setRasterLayer: (value: string | undefined) => void;
    rasterColor: LayerColor;
    setRasterColor: (value: LayerColor) => void;
    rasterOpacity: number;
    setRasterOpacity: (value: number) => void;
    showLocalUnits: boolean;
    setShowLocalUnits: (value: boolean) => void;
}

const MalawiLayersContext = createContext<MalawiLayersContextProps>({
    shadeEnabled: true,
    setShadeEnabled: () => {},
    shadeLayer: undefined,
    setShadeLayer: () => {},
    shadeColor: DEFAULT_SHADE_COLOR,
    setShadeColor: () => {},
    bubbleEnabled: false,
    setBubbleEnabled: () => {},
    bubbleLayer: undefined,
    setBubbleLayer: () => {},
    bubbleColor: DEFAULT_BUBBLE_COLOR,
    setBubbleColor: () => {},
    rasterEnabled: false,
    setRasterEnabled: () => {},
    rasterLayer: undefined,
    setRasterLayer: () => {},
    rasterColor: DEFAULT_RASTER_COLOR,
    setRasterColor: () => {},
    rasterOpacity: DEFAULT_RASTER_OPACITY,
    setRasterOpacity: () => {},
    showLocalUnits: false,
    setShowLocalUnits: () => {},
});

export default MalawiLayersContext;
