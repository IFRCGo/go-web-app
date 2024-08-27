import type {
    CircleLayer,
    FillLayer,
    LineLayer,
    SymbolLayer,
} from 'mapbox-gl';

import {
    COLOR_BLACK,
    COLOR_BLUE,
    COLOR_LIGHT_YELLOW,
    COLOR_PRIMARY_BLUE,
    COLOR_RED,
    COLOR_WHITE,
    COLOR_YELLOW,
} from '#utils/constants';

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
            ['get', 'severity'],
            'INFORMATION', COLOR_BLUE,
            'ADVISORY', COLOR_LIGHT_YELLOW,
            'WATCH', COLOR_YELLOW,
            'WARNING', COLOR_RED,
            COLOR_BLACK,
        ],
        'fill-opacity': 0.5,
    },
};

export const uncertaintyFiveDaysTrackOutlineLayer: Omit<LineLayer, 'id'> = {
    type: 'line',
    filter: [
        '==',
        ['get', 'type'],
        'uncertainty-five-days',
    ],
    paint: {
        'line-color': COLOR_BLACK,
        'line-opacity': 0.8,
        'line-dasharray': [5, 2],
    },
};

export const uncertaintyThreeDaysTrackOutlineLayer: Omit<LineLayer, 'id'> = {
    type: 'line',
    filter: [
        '==',
        ['get', 'type'],
        'uncertainty-three-days',
    ],
    paint: {
        'line-color': COLOR_BLACK,
        'line-opacity': 0.5,
        'line-dasharray': [2, 2],
    },
};

export const trackOutlineLayer: Omit<LineLayer, 'id'> = {
    type: 'line',
    filter: ['==', ['get', 'type'], 'track'],
    paint: {
        'line-color': COLOR_BLACK,
        'line-opacity': 0.5,
    },
};

export const trackPointLayer: Omit<CircleLayer, 'id'> = {
    type: 'circle',
    filter: ['==', ['get', 'type'], 'track-point'],
    paint: {
        'circle-color': [
            'match',
            ['get', 'severity'],
            'INFORMATION', COLOR_BLUE,
            'ADVISORY', COLOR_LIGHT_YELLOW,
            'WATCH', COLOR_YELLOW,
            'WARNING', COLOR_RED,
            COLOR_BLACK,
        ],
        'circle-radius': 6,
        'circle-opacity': 0.5,
    },
};

export const trackPointIconLayer: Omit<SymbolLayer, 'id'> = {
    type: 'symbol',
    filter: ['==', ['get', 'type'], 'track-point'],
    paint: {
        'icon-color': COLOR_WHITE,
        'icon-opacity': 0.5,
    },
    layout: {
        'icon-image': 'triangle-11',
        'icon-size': 0.7,
        'icon-rotate': 90,
        'icon-allow-overlap': true,
        'icon-ignore-placement': true,
    },
};

export const trackPointLabelLayer: Omit<SymbolLayer, 'id'> = {
    type: 'symbol',
    filter: ['==', ['get', 'type'], 'track-point'],
    paint: {
        'text-color': COLOR_BLACK,
        'text-halo-color': COLOR_WHITE,
    },
    layout: {
        'text-size': 12,
        'text-field': ['get', 'forecast_date_time'],
        'text-anchor': 'bottom-left',
        'text-offset': [0.5, 0],
        'text-max-width': 20,
    },
};
