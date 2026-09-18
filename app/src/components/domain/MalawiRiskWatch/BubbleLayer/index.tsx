import { useMemo } from 'react';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
import {
    MapLayer,
    MapSource,
} from '@togglecorp/re-map';
import type { CircleLayer } from 'mapbox-gl';

import { COLOR_WHITE } from '#utils/constants';

import {
    BASEMAP_ADMIN_1_BOUNDARY_LAYER,
    BUBBLE_MAX_RADIUS,
} from '../constants';
import {
    type AdminArea,
    getAdminAreaCentroid,
} from '../utils';

const sourceOptions: mapboxgl.GeoJSONSourceRaw = {
    type: 'geojson',
};

interface Props {
    valueByPcode: Record<string, number>;
    maxValue: number;
    color: string;
    adminAreaByCode: Record<string, AdminArea | undefined>;
}

function BubbleLayer(props: Props) {
    const {
        valueByPcode,
        maxValue,
        color,
        adminAreaByCode,
    } = props;

    const featureCollection = useMemo<GeoJSON.FeatureCollection<GeoJSON.Point>>(
        () => ({
            type: 'FeatureCollection',
            features: Object.entries(valueByPcode).map(([pcode, value]) => {
                const centroid = getAdminAreaCentroid(adminAreaByCode[pcode]);
                if (isNotDefined(centroid) || value <= 0) {
                    return undefined;
                }
                return {
                    type: 'Feature' as const,
                    geometry: centroid,
                    properties: { value },
                };
            }).filter(isDefined),
        }),
        [valueByPcode, adminAreaByCode],
    );

    const layerOptions = useMemo<Omit<CircleLayer, 'id'>>(
        () => ({
            type: 'circle',
            paint: {
                // Area carries the value, so the radius follows the square root
                'circle-radius': [
                    'interpolate',
                    ['linear'],
                    ['sqrt', ['get', 'value']],
                    0,
                    0,
                    Math.sqrt(maxValue),
                    BUBBLE_MAX_RADIUS,
                ],
                'circle-color': color,
                'circle-opacity': 0.6,
                'circle-stroke-color': COLOR_WHITE,
                'circle-stroke-width': 1,
            },
        }),
        [maxValue, color],
    );

    if (maxValue <= 0) {
        return null;
    }

    return (
        <MapSource
            sourceKey="malawi-bubbles"
            sourceOptions={sourceOptions}
            geoJson={featureCollection}
        >
            <MapLayer
                layerKey="bubble"
                layerOptions={layerOptions}
                beneath={BASEMAP_ADMIN_1_BOUNDARY_LAYER}
            />
        </MapSource>
    );
}

export default BubbleLayer;
