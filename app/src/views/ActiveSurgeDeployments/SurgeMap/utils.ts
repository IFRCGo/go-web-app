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

type i18nType = typeof import('./i18n.json');

const COLOR_ERU_AND_PERSONNEL = COLOR_BLUE;
const COLOR_ERU_ONLY = COLOR_RED;
const COLOR_PERSONNEL_ONLY = COLOR_YELLOW;
const COLOR_DEFAULT = COLOR_BLACK;

const SURGE_TYPE_ERU = 0;
const SURGE_TYPE_PERSONNEL = 1;
const SURGE_TYPE_ERU_AND_PERSONNEL = 2;

export function getLegendOptions(strings: i18nType['strings']) {
    const legendOptions = [
        {
            value: SURGE_TYPE_ERU_AND_PERSONNEL,
            label: strings.eruAndPersonnel,
            color: COLOR_ERU_AND_PERSONNEL,
        },
        {
            value: SURGE_TYPE_ERU,
            label: strings.surgeEruOnly,
            color: COLOR_ERU_ONLY,
        },
        {
            value: SURGE_TYPE_PERSONNEL,
            label: strings.surgePersonnelOnly,
            color: COLOR_PERSONNEL_ONLY,
        },
    ];

    return legendOptions;
}

const circleColor: CirclePaint['circle-color'] = [
    'case',
    ['all', ['>', ['get', 'units'], 0], ['>', ['get', 'personnel'], 0]],
    COLOR_ERU_AND_PERSONNEL,
    ['>', ['get', 'units'], 0],
    COLOR_ERU_ONLY,
    ['>', ['get', 'personnel'], 0],
    COLOR_PERSONNEL_ONLY,
    COLOR_DEFAULT,
];

const basePointPaint: CirclePaint = {
    'circle-radius': 6,
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

const outerCirclePaintForEru: CirclePaint = {
    ...baseOuterCirclePaint,
    'circle-radius': [
        'interpolate',
        ['linear'],
        ['get', 'units'],
        1, 6,
        2, 7,
        3, 8,
        5, 10,
        7, 12,
        9, 16,
        10, 22,
    ],
};

const outerCirclePaintForPersonnel: CirclePaint = {
    ...baseOuterCirclePaint,
    'circle-radius': [
        'interpolate',
        ['linear'],
        ['get', 'personnel'],
        1, 6,
        3, 8,
        5, 10,
        8, 12,
        12, 14,
        18, 16,
        25, 18,
        35, 20,
        50, 22,
    ],
};

export const outerCircleLayerOptionsForEru: Omit<CircleLayer, 'id'> = {
    type: 'circle',
    paint: outerCirclePaintForEru,
};

export const outerCircleLayerOptionsForPersonnel: Omit<CircleLayer, 'id'> = {
    type: 'circle',
    paint: outerCirclePaintForPersonnel,
};

export interface ScaleOption {
    label: string;
    value: 'eru' | 'personnel';
}

export function getScaleOptions(strings: i18nType['strings']) {
    const scaleOptions: ScaleOption[] = [
        { value: 'eru', label: strings.eruLabel },
        { value: 'personnel', label: strings.personnelLabel },
    ];

    return scaleOptions;
}

export function optionKeySelector(option: ScaleOption) {
    return option.value;
}

export function optionLabelSelector(option: ScaleOption) {
    return option.label;
}
