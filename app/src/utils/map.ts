import { isDefined } from '@togglecorp/fujs';
import getBbox from '@turf/bbox';
import type {
    FillLayer,
    Map,
    NavigationControl,
    SymbolLayer,
} from 'mapbox-gl';

import { type Country } from '#hooks/domain/useCountryRaw';
import {
    COLOR_BLUE,
    COLOR_DARK_GREY,
    COLOR_LIGHT_GREY,
    COLOR_ORANGE,
    COLOR_RED,
    OPERATION_TYPE_EMERGENCY,
    OPERATION_TYPE_MULTI,
    OPERATION_TYPE_PROGRAMME,
} from '#utils/constants';

export const defaultMapStyle = 'mapbox://styles/go-ifrc/ckrfe16ru4c8718phmckdfjh0';
export const localUnitMapStyle = 'mapbox://styles/go-ifrc/clvvgugzh00x501pc1n00b8cz';

type NavControlOptions = NonNullable<ConstructorParameters<typeof NavigationControl>[0]>;
export const defaultNavControlOptions: NavControlOptions = {
    showCompass: false,
};

type ControlPosition = NonNullable<Parameters<Map['addControl']>[1]>;
export const defaultNavControlPosition: ControlPosition = 'top-right';

export const defaultMapOptions: Omit<mapboxgl.MapboxOptions, 'style' | 'container'> = {
    logoPosition: 'bottom-left' as const,
    zoom: 1.5,
    minZoom: 1,
    maxZoom: 18,
    scrollZoom: false,
    pitchWithRotate: false,
    dragRotate: false,
    renderWorldCopies: true,
    attributionControl: false,
    preserveDrawingBuffer: true,
    // interactive: false,
};

export const pointColorMap: {
  [key: number]: string;
} = {
    [OPERATION_TYPE_EMERGENCY]: COLOR_BLUE,
    [OPERATION_TYPE_PROGRAMME]: COLOR_RED,
    [OPERATION_TYPE_MULTI]: COLOR_ORANGE,
};

const DEFAULT_CIRCLE_SIZE = 'medium';
const DEFAULT_CIRCLE_OPACITY = 'full';

export const CIRCLE_RADIUS_SMALL = 3;
export const CIRCLE_RADIUS_MEDIUM = 5;
export const CIRCLE_RADIUS_LARGE = 8;
export const CIRCLE_RADIUS_EXTRA_LARGE = 12;
export const CIRCLE_RADIUS_SUPER_LARGE = 16;

export function getPointCirclePaint(
    color: string,
    size: 'small' | 'medium' | 'large' | 'extraLarge' = DEFAULT_CIRCLE_SIZE,
    opacity: 'full' | 'light' = DEFAULT_CIRCLE_OPACITY,
): mapboxgl.CirclePaint {
    const sizeMap = {
        small: CIRCLE_RADIUS_SMALL,
        medium: CIRCLE_RADIUS_MEDIUM,
        large: CIRCLE_RADIUS_LARGE,
        extraLarge: CIRCLE_RADIUS_EXTRA_LARGE,
    };

    const opacityMap = {
        full: 1,
        light: 0.7,
    };

    return {
        'circle-color': color,
        'circle-radius': sizeMap[size] ?? DEFAULT_CIRCLE_SIZE,
        'circle-opacity': opacityMap[opacity] ?? DEFAULT_CIRCLE_OPACITY,
        'circle-pitch-alignment': 'map',
    };
}

export function getPointCircleHaloPaint(
    color: string,
    scaleProp: string,
    maxScaleValue: number,
): mapboxgl.CirclePaint {
    // NOTE: setting this value as 2 because there are already stops of 0
    // and 1
    const maxScale = Math.max(maxScaleValue, 2);

    return {
        ...getPointCirclePaint(color),
        'circle-opacity': 0.4,
        'circle-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            3, [
                'interpolate',
                ['exponential', 1],
                ['number', ['get', scaleProp]],
                0,
                0,
                1,
                10,
                maxScale,
                15,
            ],
            8, [
                'interpolate',
                ['exponential', 1],
                ['number', ['get', scaleProp]],
                0,
                0,
                1,
                20,
                maxScale,
                40,
            ],
        ],
    };
}

export const defaultTooltipOptions: mapboxgl.PopupOptions = {
    closeButton: false,
    offset: 10,
};

export const adminLabelLayerOptions : Omit<SymbolLayer, 'id'> = {
    type: 'symbol',
    layout: {
        visibility: 'none',
    },
};

export const adminLabelOverrideOptions: Omit<SymbolLayer, 'id'> = {
    type: 'symbol',
    layout: {
        'text-field': ['get', 'name'],
        'text-font': ['Poppins Regular', 'Arial Unicode MS Regular'],
        'text-letter-spacing': 0.15,
        'text-line-height': 1.2,
        'text-max-width': 8,
        'text-justify': 'center',
        'text-anchor': 'top',
        'text-padding': 2,
        'text-size': [
            'interpolate', ['linear', 1], ['zoom'],
            0, 6,
            6, 16,
        ],
    },
    paint: {
        'text-color': '#000000',
        'text-halo-color': '#000000',
        'text-halo-width': 0.2,
    },
};

export const adminFillLayerOptions: Omit<FillLayer, 'id'> = {
    type: 'fill',
    layout: {
        visibility: 'visible',
    },
    paint: {
        'fill-color': [
            'case',
            ['boolean', ['feature-state', 'hovered'], false],
            COLOR_DARK_GREY,
            COLOR_LIGHT_GREY,
        ],
    },
};

export function getCountryListBoundingBox(countryList: Country[]) {
    if (countryList.length < 1) {
        return undefined;
    }

    const countryWithBbox = countryList.filter((country) => isDefined(country.bbox));

    if (countryWithBbox.length < 1) {
        return undefined;
    }
    const collection = {
        type: 'FeatureCollection' as const,
        features: countryWithBbox.map((country) => ({
            type: 'Feature' as const,
            geometry: country.bbox,
        })),
    };

    return getBbox(collection);
}
