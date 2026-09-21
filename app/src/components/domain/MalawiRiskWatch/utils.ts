import {
    isDefined,
    isNotDefined,
    isTruthyString,
} from '@togglecorp/fujs';

import { type EventPointFeature } from '#components/domain/RiskImminentEventMap';
import { type RiskLayerProperties } from '#components/domain/RiskImminentEventMap/utils';
import { malawiRiskWatchGraphqlApi } from '#config';
import { type GoApiResponse } from '#utils/restRequest';

import { MALAWI_ISO3 } from './constants';

export type MalawiRiskWatchSource = 'jba' | 'arc';

export type AdminArea = NonNullable<GoApiResponse<'/api/v2/admin2/'>['results']>[number];

export function isMalawiRiskWatchEnabled(iso3: string | undefined) {
    return isTruthyString(malawiRiskWatchGraphqlApi) && iso3 === MALAWI_ISO3;
}

export function getAdminAreaCentroid(adminArea: AdminArea | undefined) {
    const centroid = adminArea?.centroid as GeoJSON.Geometry | undefined;
    if (centroid?.type !== 'Point') {
        return undefined;
    }
    return centroid;
}

function getAdminAreaBbox(adminArea: AdminArea | undefined) {
    const bbox = adminArea?.bbox as GeoJSON.Geometry | undefined;
    if (bbox?.type !== 'Polygon') {
        return undefined;
    }
    return bbox;
}

interface DistrictEvent {
    id: string;
    adminArea: AdminArea | undefined;
}

export function getDistrictPointFeature(event: DistrictEvent): EventPointFeature | undefined {
    const centroid = getAdminAreaCentroid(event.adminArea);
    if (isNotDefined(centroid)) {
        return undefined;
    }
    return {
        type: 'Feature',
        geometry: centroid,
        properties: {
            id: event.id,
            hazard_type: 'FL',
        },
    };
}

export function getDistrictFootprint(adminArea: AdminArea | undefined) {
    const bbox = getAdminAreaBbox(adminArea);
    if (isNotDefined(bbox)) {
        return undefined;
    }
    const footprint: GeoJSON.FeatureCollection<GeoJSON.Geometry, RiskLayerProperties> = {
        type: 'FeatureCollection',
        features: [{
            type: 'Feature',
            geometry: bbox,
            properties: {
                type: 'exposure',
                severity: 'unknown',
            },
        }],
    };
    return footprint;
}

export function parseNumber(value: string | null | undefined) {
    if (isNotDefined(value) || value === '') {
        return undefined;
    }
    const numericValue = Number(value);
    return Number.isNaN(numericValue) ? undefined : numericValue;
}

export interface ValueBin {
    min: number;
    max: number;
    color: string;
}

// Quantile classes, one colour per class
export function getValueBins(values: number[], colors: string[]): ValueBin[] {
    const sortedValues = [...values].sort((a, b) => a - b);

    if (sortedValues.length === 0) {
        return [];
    }

    const quantile = (fraction: number) => (
        sortedValues[Math.min(
            Math.floor(sortedValues.length * fraction),
            sortedValues.length - 1,
        )]
    );
    const breaks = [...new Set(
        colors.map((_, index) => quantile((index + 1) / colors.length)).filter(isDefined),
    )];
    const lastColorIndex = colors.length - 1;
    const lastBreakIndex = Math.max(breaks.length - 1, 1);

    return breaks.map((max, index) => ({
        min: index === 0 ? sortedValues[0]! : breaks[index - 1]!,
        max,
        color: colors[Math.round((index * lastColorIndex) / lastBreakIndex)]!,
    }));
}

export function getBinColor(value: number | undefined, bins: ValueBin[]) {
    const firstBin = bins[0];
    if (isNotDefined(value) || isNotDefined(firstBin) || value < firstBin.min) {
        return undefined;
    }
    const bin = bins.find((item) => value <= item.max) ?? bins[bins.length - 1];
    return bin?.color;
}
