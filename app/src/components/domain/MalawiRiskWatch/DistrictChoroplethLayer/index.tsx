import { useMemo } from 'react';
import {
    MapLayer,
    MapSource,
} from '@togglecorp/re-map';
import type {
    FillLayer,
    LineLayer,
} from 'mapbox-gl';

import { COLOR_DARK_GREY } from '#utils/constants';
import { getAdmin2Tileset } from '#utils/map';

import { BASEMAP_ADMIN_1_BOUNDARY_LAYER } from '../constants';

const TRANSPARENT = 'rgba(0, 0, 0, 0)';

interface Props {
    iso3: string;
    colorByPcode: Record<string, string>;
}

function DistrictChoroplethLayer(props: Props) {
    const {
        iso3,
        colorByPcode,
    } = props;

    const tileset = getAdmin2Tileset(iso3);

    const fillLayerOptions = useMemo<Omit<FillLayer, 'id'>>(
        () => {
            const entries = Object.entries(colorByPcode).flat();
            return {
                type: 'fill',
                'source-layer': tileset.sourceLayer,
                paint: {
                    'fill-color': entries.length > 0
                        ? ['match', ['get', 'code'], ...entries, TRANSPARENT]
                        : TRANSPARENT,
                    'fill-opacity': 0.7,
                },
            };
        },
        [colorByPcode, tileset.sourceLayer],
    );

    const outlineLayerOptions = useMemo<Omit<LineLayer, 'id'>>(
        () => ({
            type: 'line',
            'source-layer': tileset.sourceLayer,
            paint: {
                'line-color': COLOR_DARK_GREY,
                'line-width': 0.5,
            },
        }),
        [tileset.sourceLayer],
    );

    return (
        <MapSource
            sourceKey="malawi-districts"
            sourceOptions={{
                type: 'vector',
                url: tileset.url,
            }}
        >
            <MapLayer
                layerKey="district-fill"
                layerOptions={fillLayerOptions}
                beneath={BASEMAP_ADMIN_1_BOUNDARY_LAYER}
            />
            <MapLayer
                layerKey="district-outline"
                layerOptions={outlineLayerOptions}
                beneath={BASEMAP_ADMIN_1_BOUNDARY_LAYER}
            />
        </MapSource>
    );
}

export default DistrictChoroplethLayer;
