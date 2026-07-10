import type {
    CircleLayerSpecification,
    FillLayerSpecification,
    LineLayerSpecification,
} from 'mapbox-gl-v3';

import { EXPOSURE_COLOR_FIELD_KEY } from './nrwConstants';
import { AlertClass } from './shared-enums';

const defaultPointStrokeWidth = 2;

// Fill opacity for exposed admin area polygons
export const exposedAreaFillOpacity = 0.65;

// Color steps for each alert class
export const alertColors: Record<AlertClass, string[]> = {
    [AlertClass.low]: ['#FFF9EA', '#FFEDBC', '#FFDF8A', '#FFC635', '#D99A00'],
    [AlertClass.medium]: ['#FFF5EA', '#FFD3AA', '#FFB066', '#FF6E00', '#C24E00'],
    [AlertClass.high]: ['#FEF1F2', '#FCC6CA', '#FA999F', '#F5333F', '#C01825'],
};

// Convert a tier level to a number based on the highest value the tier may represent
export const tierLevelToNumber = (
    tierLevel: number,
    tierCount: number,
    highestNumberValue: number,
    roundToNearest: number,
) : number => {
    const rawNumber = (tierLevel / tierCount) * highestNumberValue;
    return Math.round(rawNumber / roundToNearest) * roundToNearest;
};

// Convert a number to a tier level, but group the highest value into one tier lower.
// This is so the top tier is not just a value equal to the highest value.
export const numberToTierLevel = (
    value: number,
    highestNumberValue: number,
    tierCount: number,
): number => {
    // Get the normalized value between 0 and 1 compared to the highest value
    let normalizedValue = 0;
    if (highestNumberValue > 0) {
        normalizedValue = Math.min(value / highestNumberValue, 1);
    }
    // Scale this to the number of tiers
    const tier = Math.floor(normalizedValue * tierCount);
    // If this is the highest value (so if this is the highest value), set it in one tier lower
    const adjustedTier = Math.min(tier, tierCount - 1);
    return adjustedTier;
};

// Get the color string for an exposed area
export const getExposureColor = (
    value: number,
    highestValue: number,
    alertClass: AlertClass,
): string => {
    const colors = alertColors[alertClass];
    const index = numberToTierLevel(value, highestValue, colors.length);
    return colors[index]!;
};

// Mapbox circle paint for Red Cross branch point features
export const rcBranchPointPaint: CircleLayerSpecification['paint'] = {
    'circle-radius': 6,
    'circle-color': '#cc1111', // Debug color
    'circle-stroke-color': '#ffffff',
    'circle-stroke-width': defaultPointStrokeWidth,
};

// Mapbox circle paint for clinic point features
export const clinicPointPaint: CircleLayerSpecification['paint'] = {
    'circle-radius': 6,
    'circle-color': '#6a1b9a', // Debug color
    'circle-stroke-color': '#ffffff',
    'circle-stroke-width': defaultPointStrokeWidth,
};

// Set the fill for exposed admin areas based on the precomputed exposure
// color property in the feature properties.
export const exposedAreasFillPaint: FillLayerSpecification['paint'] = {
    'fill-color': ['get', EXPOSURE_COLOR_FIELD_KEY],
    'fill-opacity': exposedAreaFillOpacity,
    'fill-outline-color': ['get', EXPOSURE_COLOR_FIELD_KEY],
};

// Border paint for scoped-country admin0 polygons on initial map load.
export const scopedCountriesAdmin0BorderPaint: LineLayerSpecification['paint'] = {
    'line-color': '#ff60ea', // Debug color
    'line-width': 3,
};
