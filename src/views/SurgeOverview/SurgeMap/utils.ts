import type {
    CirclePaint,
    CircleLayer,
    FillLayer,
    SymbolLayer,
} from 'mapbox-gl';
import {
    COLOR_BLACK,
    COLOR_RED,
    COLOR_YELLOW,
    COLOR_BLUE,
    COLOR_LIGHT_GREY,
    COLOR_DARK_GREY,
} from '#utils/constants';

type i18nType = typeof import('./i18n.json');

const COLOR_ERU_AND_PERSONNEL = COLOR_BLUE;
const COLOR_ERU_ONLY = COLOR_RED;
const COLOR_PERSONNEL_ONLY = COLOR_YELLOW;
const COLOR_DEFAULT = COLOR_BLACK;

const SURGE_TYPE_ERU = 0;
const SURGE_TYPE_PERSONNEL = 1;
const SURGE_TYPE_ERU_AND_PERSONNEL = 2;

export const adminLabelLayerOptions : Omit<SymbolLayer, 'id'> = {
    type: 'symbol',
    layout: {
        'text-offset': [
            0, 1,
        ],
    },
};

export const adminFillLayerOptions: Omit<FillLayer, 'id'> = {
    type: 'fill',
    paint: {
        'fill-color': [
            'case',
            ['boolean', ['feature-state', 'hovered'], false],
            COLOR_DARK_GREY,
            COLOR_LIGHT_GREY,
        ],
    },
};

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

const outerCirclePaintForEru: CirclePaint = {
    ...baseOuterCirclePaint,
    'circle-radius': [
        'interpolate',
        ['linear', 1],
        ['get', 'units'],
        2,
        5,
        4,
        7,
        6,
        9,
        8,
        11,
        10,
        13,
        12,
        15,
    ],
};

const outerCirclePaintForPersonnel: CirclePaint = {
    ...baseOuterCirclePaint,
    'circle-radius': [
        'interpolate',
        ['linear', 1],
        ['get', 'personnel'],

        2,
        5,
        4,
        7,
        6,
        9,
        8,
        11,
        10,
        13,
        12,
        15,
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
