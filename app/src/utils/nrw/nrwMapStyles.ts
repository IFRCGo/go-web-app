import { type FeatureLike } from 'ol/Feature';
import {
    Circle,
    Fill,
    Stroke,
    Style,
} from 'ol/style';

import { COUNTRY_FIELD_KEY } from './nrwConstants';

export type MvtStyleCreator = (feature: FeatureLike, selected: string) => Style;
const deselectedColor = 'rgba(0, 0, 0, 0.07)';

// TODO: review the styling for perf in terms of what to render, and how to reduce
// the number of features that must be looped through when styling

export const styleAdmin0 = (
    feature: FeatureLike,
    selectedCountry: string,
) => {
    const country = feature.get(COUNTRY_FIELD_KEY);
    const isSelected = country === selectedCountry;
    return new Style({
        fill: new Fill({
            color: isSelected ? 'rgba(112, 119, 93, 0.55)' : 'rgba(0, 0, 0, 0.07)',
        }),
        stroke: new Stroke({
            color: '#8d8d8d',
            width: 1,
        }),
    });
};

export const styleAdmin1 = (
    feature: FeatureLike,
    selectedCountry: string,
) => {
    const country = feature.get(COUNTRY_FIELD_KEY);
    const isSelectedCountry = country === selectedCountry;
    return new Style({
        fill: new Fill({
            color: isSelectedCountry ? 'rgba(87, 152, 227, 0.35)' : 'rgba(87, 152, 227, 0.2)',
        }),
        stroke: new Stroke({
            color: 'rgba(35, 113, 203, 0.84)',
            width: 1,
        }),
    });
};

// Admin child borders style (e.g., admin3 regions)
export const styleAdmin3Region = (
    code: string,
    selectedChildCode: string | null,
    affectedRegions: string[] | null,
    isEventSelected: boolean,
): Style => {
    // Highlight selected child region in orange
    if (code === selectedChildCode) {
        return new Style({
            fill: new Fill({
                color: 'rgba(255, 106, 0, 0)',
            }),
            stroke: new Stroke({
                color: '#e65100',
                width: 2,
            }),
        });
    }
    if (isEventSelected && affectedRegions && affectedRegions.includes(code)) {
        return new Style({
            fill: new Fill({
                color: 'rgba(255, 123, 0, 0.72)',
            }),
            stroke: new Stroke({
                color: '#d58711c2',
                width: 2,
            }),
        });
    }
    if (!isEventSelected) {
        return new Style({

            fill: new Fill({
                color: 'rgba(32, 194, 29, 0.72)',
            }),
            stroke: new Stroke({
                color: '#169b248e',
                width: 2,
            }),
        });
    }
    return new Style({
        fill: new Fill({
            color: deselectedColor,
        }),
        stroke: new Stroke({
            color: deselectedColor,
            width: 2,
        }),
    });
};

export const styleAdmin2region = (
    code: string,
    selectedCode: string | null,
    isEventSelected: boolean,
): Style => {
    // Don't fill the selected region if the selected code starts with code
    if (selectedCode && selectedCode.startsWith(code)) {
        return new Style({

        });
    }
    // If an event is selected, return white at 50% alpha
    if (isEventSelected) {
        return new Style({
            fill: new Fill({
                color: deselectedColor,
            }),
            stroke: new Stroke({
                color: deselectedColor,
                width: 2,
            }),
        });
    }
    return new Style({
        fill: new Fill({
            color: 'rgba(87, 152, 227, 0.84)',
        }),
        stroke: new Stroke({
            color: 'rgba(35, 113, 203, 0.84)',
            width: 2,
        }),
    });
};

export const styleAdmin1region = (
    code: string,
    selectedCode: string | null,
    isEventSelected: boolean,
): Style => {
    // Don't fill the selected region
    if (selectedCode && selectedCode.startsWith(code)) {
        return new Style({
            stroke: new Stroke({
                color: '#fcfc1d',
                width: 1,
            }),
        });
    }
    // If an event is selected, return white at 50% alpha
    if (isEventSelected) {
        return new Style({
            fill: new Fill({
                color: 'rgba(255, 255, 255, 0.5)',
            }),
            stroke: new Stroke({
                color: 'rgba(255, 255, 255, 0.5)',
                width: 2,
            }),
        });
    }
    return new Style({
        fill: new Fill({
            color: 'rgba(112, 119, 93, 0.38)',
        }),
        stroke: new Stroke({
            color: '#595959',
            width: 2,
        }),
    });
};

export const styleRcBranchPoint = new Style({
    image: new Circle({
        radius: 6,
        fill: new Fill({
            color: '#cc1111',
        }),
        stroke: new Stroke({
            color: '#ffffff',
            width: 2,
        }),
    }),
});

export const styleClinicPoint = new Style({
    image: new Circle({
        radius: 6,
        fill: new Fill({
            color: '#6a1b9a',
        }),
        stroke: new Stroke({
            color: '#ffffff',
            width: 2,
        }),
    }),
});
