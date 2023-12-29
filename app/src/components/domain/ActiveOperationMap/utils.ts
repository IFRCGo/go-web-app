import type {
    CircleLayer,
    CirclePaint,
} from 'mapbox-gl';

import {
    COLOR_BLACK,
    COLOR_BLUE,
    COLOR_ORANGE,
    COLOR_RED,
    COLOR_YELLOW,
} from '#utils/constants';

export const COLOR_EMERGENCY_APPEAL = COLOR_RED;
export const COLOR_DREF = COLOR_YELLOW;
export const COLOR_EAP = COLOR_BLUE;
export const COLOR_MULTIPLE_TYPES = COLOR_ORANGE;

// FIXME: these must be a constant defined somewhere else
export const APPEAL_TYPE_DREF = 0;
export const APPEAL_TYPE_EMERGENCY = 1;
// const APPEAL_TYPE_INTERNATIONAL = 2; // TODO: we are not showing this?
export const APPEAL_TYPE_EAP = 3;
export const APPEAL_TYPE_MULTIPLE = -1;

const circleColor: CirclePaint['circle-color'] = [
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
    COLOR_BLACK,
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
