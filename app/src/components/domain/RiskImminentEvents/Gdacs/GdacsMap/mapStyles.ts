import type {
    CircleLayer,
    FillLayer,
    LineLayer,
    SymbolLayer,
} from 'mapbox-gl';

import {
    COLOR_BLACK,
    COLOR_GREEN,
    COLOR_ORANGE,
    COLOR_PRIMARY_BLUE,
    COLOR_RED,
    COLOR_WHITE,
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
            ['get', 'alertlevel'],
            'Red', COLOR_RED,
            'Orange', COLOR_ORANGE,
            'Green', COLOR_GREEN,
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
export const trackOutlineLayer: Omit<LineLayer, 'id'> = {
    type: 'line',
    filter: ['==', ['get', 'type'], 'track'],
    paint: {
        'line-color': COLOR_BLACK,
        'line-opacity': 1,
    },
};

export const trackPointLayer: Omit<CircleLayer, 'id'> = {
    type: 'circle',
    filter: ['==', ['get', 'type'], 'track-point'],
    paint: {
        'circle-color': [
            'match',
            ['get', 'alertlevel'],
            'Red', COLOR_RED,
            'Orange', COLOR_ORANGE,
            'Green', COLOR_GREEN,
            COLOR_BLACK,
        ],
        'circle-radius': 12,
        'circle-opacity': 1,
    },
};

export const trackPointIconLayer: Omit<SymbolLayer, 'id'> = {
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
