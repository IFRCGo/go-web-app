import {
    isDefined,
    mapToList,
} from '@togglecorp/fujs';
import type {
    CircleLayer,
    CirclePaint,
    FillLayer,
    Layout,
    LineLayer,
    SymbolLayer,
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
    COLOR_BLUE,
    COLOR_GREEN,
    COLOR_ORANGE,
    COLOR_PRIMARY_BLUE,
    COLOR_RED,
    COLOR_WHITE,
} from '#utils/constants';
import { hazardTypeToColorMap } from '#utils/domain/risk';

type HazardType = components<'read'>['schemas']['HazardTypeEnum'];

export const hazardKeyToIconmap: Record<HazardType, string | null> = {
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
    hazardKeyToIconmap,
    (icon, key) => (icon ? ({ key, icon }) : undefined),
).filter(isDefined);

const iconImage: SymbolLayout['icon-image'] = [
    'match',
    ['get', 'hazard_type'],
    ...(mapIcons).flatMap(({ key }) => [key, key]),
    '',
];

export const geojsonSourceOptions: mapboxgl.GeoJSONSourceRaw = { type: 'geojson' };
export const hazardTypeColorPaint: CirclePaint['circle-color'] = [
    'match',
    ['get', 'hazard_type'],
    ...mapToList(hazardTypeToColorMap, (value, key) => [key, value]).flat(),
    COLOR_BLACK,
];

export const hazardPointLayer: Omit<CircleLayer, 'id'> = {
    type: 'circle',
    paint: {
        'circle-radius': 12,
        'circle-color': hazardTypeColorPaint,
        'circle-opacity': 1,
    },
};

export const invisibleLayout: Layout = {
    visibility: 'none',
};

export const hazardPointIconLayout: SymbolLayout = {
    visibility: 'visible',
    'icon-image': iconImage,
    'icon-size': 0.7,
    'icon-allow-overlap': true,
    'icon-ignore-placement': true,
};

export const trackOutlineLayer: Omit<LineLayer, 'id'> = {
    type: 'line',
    filter: ['==', ['get', 'type'], 'track'],
    paint: {
        'line-color': COLOR_BLACK,
        'line-opacity': 0.5,
    },
};

export const trackArrowLayer: Omit<SymbolLayer, 'id'> = {
    type: 'symbol',
    filter: ['==', ['get', 'type'], 'track'],
    paint: {
        'icon-color': COLOR_BLACK,
        'icon-opacity': 0.5,
    },
    layout: {
        'icon-allow-overlap': true,
        'icon-image': 'triangle-11',
        'icon-size': 0.8,
        'icon-rotate': 90,
    },
};

export const trackPointLayer: Omit<CircleLayer, 'id'> = {
    type: 'circle',
    filter: ['==', ['get', 'type'], 'track-point'],
    paint: {
        'circle-radius': 4,
        'circle-color': COLOR_BLACK,
        'circle-opacity': 0.5,
    },
};

export const exposureFillLayer: Omit<FillLayer, 'id'> = {
    type: 'fill',
    filter: [
        'all',
        ['==', ['get', 'type'], 'exposure'],
        ['!=', ['get', 'eventtype'], 'TC'],
    ],
    paint: {
        'fill-color': COLOR_PRIMARY_BLUE,
        'fill-opacity': 0.5,
    },
};

export const cycloneExposureFillLayer: Omit<FillLayer, 'id'> = {
    type: 'fill',
    filter: ['==', ['get', 'type'], 'exposure'],
    paint: {
        'fill-color': [
            'match',
            ['get', 'alertType'],
            'Red', COLOR_RED,
            'Orange', COLOR_ORANGE,
            'Green', COLOR_GREEN,
            'Blue', COLOR_BLUE,
            COLOR_BLACK,
        ],
        'fill-opacity': 0.5,
    },
};

export const uncertaintyTrackOutlineLayer: Omit<LineLayer, 'id'> = {
    type: 'line',
    filter: [
        '==',
        ['get', 'type'],
        'uncertainty',
    ],
    paint: {
        'line-color': COLOR_BLACK,
        'line-opacity': 0.5,
        'line-dasharray': [4, 3],
        'line-width': 1.5,
    },
};

export const uncertaintyTrackOutlineFiveDaysLayer: Omit<LineLayer, 'id'> = {
    type: 'line',
    filter: [
        '==',
        ['get', 'type'],
        'uncertainty-five-days',
    ],
    paint: {
        'line-color': COLOR_BLACK,
        'line-opacity': 0.5,
        'line-dasharray': [4, 3],
        'line-width': 1.5,
    },
};

export const cycloneTrackOutlineLayer: Omit<LineLayer, 'id'> = {
    type: 'line',
    filter: ['==', ['get', 'type'], 'track'],
    paint: {
        'line-color': COLOR_BLACK,
        'line-opacity': 1,
    },
};

export const cycloneTrackPointLayer: Omit<CircleLayer, 'id'> = {
    type: 'circle',
    filter: ['==', ['get', 'type'], 'track-point'],
    paint: {
        'circle-color': [
            'match',
            ['get', 'alertType'],
            'Red', COLOR_RED,
            'Orange', COLOR_ORANGE,
            'Green', COLOR_GREEN,
            'Blue', COLOR_BLUE,
            COLOR_BLACK,
        ],
        'circle-radius': 12,
        'circle-opacity': 1,
    },
};

export const cycloneTrackPointIconLayer: Omit<SymbolLayer, 'id'> = {
    type: 'symbol',
    filter: ['==', ['get', 'type'], 'track-point'],
    paint: {
        'icon-color': COLOR_WHITE,
        'icon-opacity': 1,
    },
    layout: {
        'icon-image': 'TC',
        'icon-size': 0.7,
        'icon-rotate': 90,
        'icon-allow-overlap': true,
        'icon-ignore-placement': true,
    },
};

export const cycloneTrackPointLabelLayer: Omit<SymbolLayer, 'id'> = {
    type: 'symbol',
    filter: ['==', ['get', 'type'], 'track-point'],
    paint: {
        'text-color': COLOR_BLACK,
        'text-halo-color': COLOR_WHITE,
    },
    layout: {
        'text-size': 12,
        'text-field': ['get', 'trackDate'],
        'text-anchor': 'bottom-left',
        'text-offset': [0.5, 0],
        'text-max-width': 20,
    },
};
