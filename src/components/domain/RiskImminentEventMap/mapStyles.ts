import type {
    SymbolLayout,
    CirclePaint,
    FillLayer,
    LineLayer,
    CircleLayer,
    Layout,
} from 'mapbox-gl';
import { hazardTypeToColorMap } from '#utils/domain/risk';
import { COLOR_BLACK, COLOR_PRIMARY_BLUE } from '#utils/constants';
import { isDefined, mapToList } from '@togglecorp/fujs';

import earthquakeIcon from '#assets/icons/risk/earthquake.png';
import floodIcon from '#assets/icons/risk/flood.png';
import cycloneIcon from '#assets/icons/risk/cyclone.png';
import droughtIcon from '#assets/icons/risk/drought.png';
import wildfireIcon from '#assets/icons/risk/wildfire.png';

import type { components } from '#generated/riskTypes';

type HazardType = components['schemas']['HazardTypeEnum'];

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
};

export const exposureFillLayer: Omit<FillLayer, 'id'> = {
    type: 'fill',
    filter: [
        '==',
        ['get', 'type'],
        'exposure',
    ],
    paint: {
        'fill-color': COLOR_PRIMARY_BLUE,
        'fill-opacity': 0.3,
    },
};

export const trackOutlineLayer: Omit<LineLayer, 'id'> = {
    type: 'line',
    filter: [
        '==',
        ['get', 'type'],
        'track',
    ],
    paint: {
        'line-color': COLOR_BLACK,
        'line-opacity': 0.5,
    },
};

export const trackPointLayer: Omit<CircleLayer, 'id'> = {
    type: 'circle',
    filter: [
        '==',
        ['get', 'type'],
        'track-point',
    ],
    paint: {
        'circle-radius': 4,
        'circle-color': COLOR_BLACK,
        'circle-opacity': 0.5,
    },
};
