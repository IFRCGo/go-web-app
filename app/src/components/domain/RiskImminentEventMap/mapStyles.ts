import {
    isDefined,
    mapToList,
} from '@togglecorp/fujs';
import type {
    CircleLayer,
    CirclePaint,
    Expression,
    FillLayer,
    Layout,
    LineLayer,
    SymbolLayout,
} from 'mapbox-gl';

import cycloneIcon from '#assets/icons/risk/cyclone.png';
import droughtIcon from '#assets/icons/risk/drought.png';
import earthquakeIcon from '#assets/icons/risk/earthquake.png';
import floodIcon from '#assets/icons/risk/flood.png';
import wildfireIcon from '#assets/icons/risk/wildfire.png';
import { type components } from '#generated/riskTypes';
import {
    COLOR_BLACK,
    COLOR_DARK_GREY,
    COLOR_GREEN,
    COLOR_ORANGE,
    COLOR_RED,
    COLOR_WHITE,
} from '#utils/constants';
import { hazardTypeToColorMap } from '#utils/domain/risk';

import {
    type RiskLayerSeverity,
    type RiskLayerTypes,
} from './utils';

type HazardType = components<'read'>['schemas']['HazardTypeEnum'];

export const hazardKeyToIconMap: Record<HazardType, string | null> = {
    EQ: earthquakeIcon,
    FL: floodIcon,
    TC: cycloneIcon,
    EP: null,
    FI: null,
    SS: null,
    DR: droughtIcon,
    TS: cycloneIcon,
    CD: null,
    WF: wildfireIcon,
};

const mapIcons = mapToList(
    hazardKeyToIconMap,
    (icon, key) => (icon ? ({ key, icon }) : undefined),
).filter(isDefined);

const iconImage: SymbolLayout['icon-image'] = [
    'match',
    ['get', 'hazard_type'],
    ...(mapIcons).flatMap(({ key }) => [key, key]),
    '',
];

const severityColorStyle: Expression = [
    'match',
    ['get', 'severity'],
    'red' satisfies RiskLayerSeverity,
    COLOR_RED,
    'orange' satisfies RiskLayerSeverity,
    COLOR_ORANGE,
    'green' satisfies RiskLayerSeverity,
    COLOR_GREEN,
    COLOR_DARK_GREY,
];

export const geojsonSourceOptions: mapboxgl.GeoJSONSourceRaw = { type: 'geojson' };
const hazardTypeColorPaint: CirclePaint['circle-color'] = [
    'match',
    ['get', 'hazard_type'],
    ...mapToList(hazardTypeToColorMap, (value, key) => [key, value]).flat(),
    COLOR_BLACK,
];

export const activeHazardPointLayer: Omit<CircleLayer, 'id'> = {
    type: 'circle',
    filter: [
        '==',
        ['get', 'type'],
        'hazard-point' satisfies RiskLayerTypes,
    ],
    paint: {
        'circle-radius': 12,
        'circle-color': severityColorStyle,
        'circle-opacity': 1,
    },
};

export const hazardPointLayer: Omit<CircleLayer, 'id'> = {
    type: 'circle',
    paint: {
        'circle-radius': 12,
        'circle-color': hazardTypeColorPaint,
        'circle-opacity': [
            'case',
            ['boolean', ['feature-state', 'eventVisible'], true],
            1,
            0,
        ],
        /*
        'circle-opacity-transition': { duration: 2000, delay: 0 },
        */
    },
};

export const invisibleLayout: Layout = {
    visibility: 'none',
};

export const invisibleFillLayer: Omit<FillLayer, 'id'> = {
    type: 'fill',
    layout: invisibleLayout,
};

export const invisibleLineLayer: Omit<LineLayer, 'id'> = {
    type: 'line',
    layout: invisibleLayout,
};

export const invisibleCircleLayer: Omit<CircleLayer, 'id'> = {
    type: 'circle',
    layout: invisibleLayout,
};

export const hazardPointIconLayout: SymbolLayout = {
    visibility: 'visible',
    'icon-image': iconImage,
    'icon-size': 0.7,
    'icon-allow-overlap': true,
};

export const exposureFillLayer: Omit<FillLayer, 'id'> = {
    type: 'fill',
    filter: [
        '==',
        ['get', 'type'],
        'exposure' satisfies RiskLayerTypes,
    ],
    paint: {
        'fill-color': severityColorStyle,
        'fill-opacity': 0.4,
    },
    layout: { visibility: 'visible' },
};

export const exposureFillOutlineLayer: Omit<LineLayer, 'id'> = {
    type: 'line',
    filter: [
        '==',
        ['get', 'type'],
        'exposure' satisfies RiskLayerTypes,
    ],
    paint: {
        'line-color': COLOR_WHITE,
        'line-width': 1,
        'line-opacity': 1,
    },
    layout: { visibility: 'visible' },
};

export const uncertaintyConeLayer: Omit<LineLayer, 'id'> = {
    type: 'line',
    filter: [
        '==',
        ['get', 'type'],
        'uncertainty-cone' satisfies RiskLayerTypes,
    ],
    paint: {
        'line-color': COLOR_BLACK,
        'line-opacity': 1,
        'line-width': 1,
        'line-dasharray': [5, 7],
    },
    layout: { visibility: 'visible' },
};

export const trackLineLayer: Omit<LineLayer, 'id'> = {
    type: 'line',
    filter: [
        '==',
        ['get', 'type'],
        'track-linestring' satisfies RiskLayerTypes,
    ],
    paint: {
        'line-color': COLOR_BLACK,
        'line-width': 2,
        'line-opacity': 1,
    },
    layout: { visibility: 'visible' },
};

/*
export const trackArrowLayer: Omit<SymbolLayer, 'id'> = {
    type: 'symbol',
    filter: [
        '==',
        ['get', 'type'],
        'track-linestring' satisfies RiskLayerTypes,
    ],
    paint: {
        'icon-color': COLOR_BLACK,
        'icon-opacity': 0.6,
    },
    layout: {
        visibility: 'visible',
        'icon-allow-overlap': true,
        'symbol-placement': 'line',
        'icon-image': 'triangle-11',
        'icon-size': 0.6,
        'icon-rotate': 90,
    },
};
*/

export const trackPointLayer: Omit<CircleLayer, 'id'> = {
    type: 'circle',
    filter: [
        '==',
        ['get', 'type'],
        'track-point' satisfies RiskLayerTypes,
    ],
    paint: {
        'circle-radius': 4,
        'circle-color': COLOR_BLACK,
        'circle-opacity': 1,
        'circle-stroke-color': COLOR_WHITE,
        'circle-stroke-width': [
            'case',
            ['boolean', ['get', 'isFuture'], true],
            0,
            1,
        ],
    },
    layout: { visibility: 'visible' },
};

export const trackPointOuterCircleLayer: Omit<CircleLayer, 'id'> = {
    type: 'circle',
    filter: [
        '==',
        ['get', 'type'],
        'track-point' satisfies RiskLayerTypes,
    ],
    paint: {
        'circle-radius': 12,
        'circle-color': COLOR_BLACK,
        'circle-opacity': [
            'case',
            ['boolean', ['get', 'isFuture'], true],
            0.2,
            0.0,
        ],
        'circle-stroke-color': COLOR_WHITE,
        'circle-stroke-width': [
            'case',
            ['boolean', ['get', 'isFuture'], true],
            1,
            0,
        ],
    },
    layout: { visibility: 'visible' },
};
