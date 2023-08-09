import type {
    CirclePaint,
    CircleLayer,
} from 'mapbox-gl';

import {
    COLOR_BLACK,
    COLOR_RED,
    COLOR_YELLOW,
    COLOR_ORANGE,
    COLOR_BLUE,
} from '#utils/constants';

import i18n from './i18n.json';

const COLOR_EMERGENCY_APPEAL = COLOR_RED;
const COLOR_DREF = COLOR_YELLOW;
const COLOR_EAP = COLOR_BLUE;
const COLOR_MULTIPLE_TYPES = COLOR_ORANGE;

// FIXME: these must be a constant defined somewhere else
const APPEAL_TYPE_DREF = 0;
const APPEAL_TYPE_EMERGENCY = 1;
const APPEAL_TYPE_EAP = 2;
export const APPEAL_TYPE_MULTIPLE = -1;

export function getLegendOptions(strings: typeof i18n.strings) {
    const legendOptions = [
        {
            value: APPEAL_TYPE_EMERGENCY,
            label: strings.explanationBubbleEmergencyAppeal,
            color: COLOR_EMERGENCY_APPEAL,
        },
        {
            value: APPEAL_TYPE_DREF,
            label: strings.explanationBubbleDref,
            color: COLOR_DREF,
        },
        {
            value: APPEAL_TYPE_EAP,
            label: strings.explanationBubbleEAP,
            color: COLOR_EAP,
        },
        {
            value: APPEAL_TYPE_MULTIPLE,
            label: strings.explanationBubbleMultiple,
            color: COLOR_MULTIPLE_TYPES,
        },
    ];

    return legendOptions;
}

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

export function getScaleOptions(strings: typeof i18n.strings) {
    const scaleOptions: ScaleOption[] = [
        { value: 'peopleTargeted', label: strings.explanationBubblePopulationLabel },
        { value: 'financialRequirements', label: strings.explanationBubbleAmountLabel },
    ];

    return scaleOptions;
}

export function optionKeySelector(option: ScaleOption) {
    return option.value;
}

export function optionLabelSelector(option: ScaleOption) {
    return option.label;
}
