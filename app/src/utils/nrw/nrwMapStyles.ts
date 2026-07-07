import type {
    CircleLayerSpecification,
    FillLayerSpecification,
    LineLayerSpecification,
} from 'mapbox-gl-v3';

import { AlertClass } from './shared-enums';

const defaultPointStrokeWidth = 2;
// const exposedAreaFillAlphaHexLight = '33'; // 0.2

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

/*
// Style for an admin area when an event is selected
export const styleAdminAreaForEvent = (
    placeCode: string,
    selectedChildCode: string | null,
    exposedPopulation: Record<string, number> | null,
    highestExposedPopulationNumber: number,
    alertClass: AlertClass,
    isDeepestAdminLevel: boolean,
): Style => {
    // Only color the deepest level
    if (!isDeepestAdminLevel) {
        return new Style({});
    }

    // Unexposed areas not displayed
    if (!exposedPopulation || exposedPopulation[placeCode] === undefined) {
        return new Style({});
    }

    // Color based on exposed population
    const population = exposedPopulation[placeCode] ?? 0;
    const baseColor = getExposureColor(population, highestExposedPopulationNumber, alertClass);

    // If nothing selected at the deepest level is selected, or if the current area is selected,
    // render at standard opacity.
    // Else, render at a lighter opacity.
    const isStandardOpacity = selectedChildCode === null || selectedChildCode === placeCode;
    const alphaHex = isStandardOpacity ? exposedAreaFillAlphaHex : exposedAreaFillAlphaHexLight;

    return new Style({
        fill: new Fill({
            color: `${baseColor}${alphaHex}`,
        }),
        stroke: new Stroke({
            color: baseColor,
            width: defaultAdminAreaBorderWidth,
        }),
    });
}; */

// Mapbox circle paint for Red Cross branch point features
export const rcBranchPointPaint: CircleLayerSpecification['paint'] = {
    'circle-radius': 6,
    'circle-color': '#cc1111',
    'circle-stroke-color': '#ffffff',
    'circle-stroke-width': defaultPointStrokeWidth,
};

// Mapbox circle paint for clinic point features
export const clinicPointPaint: CircleLayerSpecification['paint'] = {
    'circle-radius': 6,
    'circle-color': '#6a1b9a',
    'circle-stroke-color': '#ffffff',
    'circle-stroke-width': defaultPointStrokeWidth,
};

// Fill paint for scoped-country admin0 polygons on initial map load.
export const scopedCountriesAdmin0FillPaint: FillLayerSpecification['paint'] = {
    'fill-color': '#ffffff',
    'fill-opacity': 0,
};

// Border paint for scoped-country admin0 polygons on initial map load.
export const scopedCountriesAdmin0BorderPaint: LineLayerSpecification['paint'] = {
    'line-color': '#ffffff',
    'line-width': 3,
};
