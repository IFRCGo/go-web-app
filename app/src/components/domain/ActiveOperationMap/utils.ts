import type {
    CircleLayer,
    CirclePaint,
} from 'mapbox-gl';

import {
    COLOR_BLUE,
    COLOR_DREF_YELLOW,
    COLOR_LIGHT_GREY,
    COLOR_ORANGE,
    COLOR_RED,
    DISASTER_CATEGORY_ORANGE,
    DISASTER_CATEGORY_RED,
    DISASTER_CATEGORY_YELLOW,
    type DisasterCategory,
} from '#utils/constants';

export const COLOR_EMERGENCY_APPEAL = COLOR_RED;
export const COLOR_DREF = COLOR_DREF_YELLOW;
export const COLOR_EAP = COLOR_BLUE;
export const COLOR_MULTIPLE_TYPES = COLOR_ORANGE;

export const COLOR_YELLOW_SEVERITY = COLOR_DREF_YELLOW;
export const COLOR_ORANGE_SEVERITY = COLOR_ORANGE;
export const COLOR_RED_SEVERITY = COLOR_RED;

// FIXME: these must be a constant defined somewhere else
export const APPEAL_TYPE_DREF = 0;
export const APPEAL_TYPE_EMERGENCY = 1;
// const APPEAL_TYPE_INTERNATIONAL = 2; // TODO: we are not showing this?
export const APPEAL_TYPE_EAP = 3;
export const APPEAL_TYPE_MULTIPLE = -1;

export const severityOrderMapping: Record<DisasterCategory, number> = {
    [DISASTER_CATEGORY_RED]: 1,
    [DISASTER_CATEGORY_ORANGE]: 2,
    [DISASTER_CATEGORY_YELLOW]: 3,
};

const circleColor: CirclePaint['circle-color'] = [
    'match',
    ['get', 'variant'],
    'appeal',
    [
        'match',
        ['get', 'appealType'],
        APPEAL_TYPE_DREF,
        COLOR_DREF,
        APPEAL_TYPE_EMERGENCY,
        COLOR_EMERGENCY_APPEAL,
        APPEAL_TYPE_EAP,
        COLOR_EAP,
        APPEAL_TYPE_MULTIPLE,
        COLOR_MULTIPLE_TYPES,
        COLOR_LIGHT_GREY,
    ],
    'crisis',
    [
        'match',
        ['get', 'severityLevel'],
        DISASTER_CATEGORY_ORANGE,
        COLOR_ORANGE_SEVERITY,
        DISASTER_CATEGORY_RED,
        COLOR_RED_SEVERITY,
        DISASTER_CATEGORY_YELLOW,
        COLOR_YELLOW_SEVERITY,
        COLOR_LIGHT_GREY,
    ],
    COLOR_LIGHT_GREY,
];

const basePointPaint: CirclePaint = {
    'circle-radius': 5,
    'circle-color': circleColor,
    'circle-opacity': 0.8,
};

export const basePointLayerOptions: Omit<CircleLayer, 'id'> = {
    type: 'circle',
    paint: basePointPaint,
};

const baseOuterCirclePaint: CirclePaint = {
    'circle-color': circleColor,
    'circle-opacity': 0.4,
};

const outerCirclePaintForFinancialRequirements: CirclePaint = {
    ...baseOuterCirclePaint,
    'circle-radius': [
        'interpolate',
        ['linear', 1],
        ['get', 'financialRequirements'],
        1000,
        7,
        10000,
        9,
        100000,
        11,
        1000000,
        15,
    ],
};

const outerCirclePaintForPeopleTargeted: CirclePaint = {
    ...baseOuterCirclePaint,
    'circle-radius': [
        'interpolate',
        ['linear', 1],
        ['get', 'peopleTargeted'],
        1000,
        7,
        10000,
        9,
        100000,
        11,
        1000000,
        15,
    ],
};

export const outerCircleLayerOptionsForFinancialRequirements: Omit<CircleLayer, 'id'> = {
    type: 'circle',
    paint: outerCirclePaintForFinancialRequirements,
};

export const outerCircleLayerOptionsForPeopleTargeted: Omit<CircleLayer, 'id'> = {
    type: 'circle',
    paint: outerCirclePaintForPeopleTargeted,
};

export interface ScaleOption {
    label: string;
    value: 'financialRequirements' | 'peopleTargeted';
}

export function optionKeySelector(option: ScaleOption) {
    return option.value;
}

export function optionLabelSelector(option: ScaleOption) {
    return option.label;
}
