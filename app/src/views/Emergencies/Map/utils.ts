import type {
    CircleLayer,
    CirclePaint,
} from 'mapbox-gl';

import {
    COLOR_BLACK,
    COLOR_BLUE,
    COLOR_RED,
    COLOR_YELLOW,
} from '#utils/constants';

export const COLOR_WITHOUT_IFRC_RESPONSE = COLOR_RED;
export const COLOR_WITH_IFRC_RESPONSE = COLOR_YELLOW;
export const COLOR_MIXED_RESPONSE = COLOR_BLUE;

export const RESPONSE_LEVEL_WITHOUT_IFRC_RESPONSE = 0;
export const RESPONSE_LEVEL_WITH_IFRC_RESPONSE = 1;
export const RESPONSE_LEVEL_MIXED_RESPONSE = 2;

const circleColor: CirclePaint['circle-color'] = [
    'match',
    ['get', 'responseLevel'],
    RESPONSE_LEVEL_WITH_IFRC_RESPONSE,
    COLOR_WITH_IFRC_RESPONSE,
    RESPONSE_LEVEL_WITHOUT_IFRC_RESPONSE,
    COLOR_WITHOUT_IFRC_RESPONSE,
    RESPONSE_LEVEL_MIXED_RESPONSE,
    COLOR_MIXED_RESPONSE,
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

const outerCirclePaintForNumEvents: CirclePaint = {
    ...baseOuterCirclePaint,
    'circle-radius': [
        'interpolate',
        ['linear', 1],
        ['get', 'numEvents'],
        2,
        7,
        4,
        9,
        8,
        11,
        16,
        15,
    ],
};

const outerCirclePaintForPeopleAffected: CirclePaint = {
    ...baseOuterCirclePaint,
    'circle-radius': [
        'interpolate',
        ['linear', 1],
        ['get', 'peopleAffected'],
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

export const outerCircleLayerOptionsForNumEvents: Omit<CircleLayer, 'id'> = {
    type: 'circle',
    paint: outerCirclePaintForNumEvents,
};

export const outerCircleLayerOptionsForPeopleTargeted: Omit<CircleLayer, 'id'> = {
    type: 'circle',
    paint: outerCirclePaintForPeopleAffected,
};

export interface ScaleOption {
    label: string;
    value: 'numAffected' | 'numEvents';
}

export function optionKeySelector(option: ScaleOption) {
    return option.value;
}

export function optionLabelSelector(option: ScaleOption) {
    return option.label;
}
