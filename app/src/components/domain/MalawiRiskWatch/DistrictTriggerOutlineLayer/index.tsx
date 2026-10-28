import { useMemo } from 'react';
import {
    MapLayer,
    MapSource,
} from '@togglecorp/re-map';
import type { LineLayer } from 'mapbox-gl';

import { COLOR_PRIMARY_RED } from '#utils/constants';
import { getAdmin2Tileset } from '#utils/map';

interface Props {
    iso3: string;
    // Districts where the parametric trigger is active
    triggeredPcodes: string[];
}

// Rendered on top of every other map layer (no `beneath`) so the trigger
// outline is never obscured by the shading, raster or bubble layers.
function DistrictTriggerOutlineLayer(props: Props) {
    const {
        iso3,
        triggeredPcodes,
    } = props;

    const tileset = getAdmin2Tileset(iso3);

    const outlineLayerOptions = useMemo<Omit<LineLayer, 'id'>>(
        () => ({
            type: 'line',
            'source-layer': tileset.sourceLayer,
            filter: ['in', ['get', 'code'], ['literal', triggeredPcodes]],
            paint: {
                'line-color': COLOR_PRIMARY_RED,
                'line-width': 2,
            },
        }),
        [tileset.sourceLayer, triggeredPcodes],
    );

    if (triggeredPcodes.length === 0) {
        return null;
    }

    return (
        <MapSource
            sourceKey="malawi-trigger-outline"
            sourceOptions={{
                type: 'vector',
                url: tileset.url,
            }}
        >
            <MapLayer
                layerKey="district-trigger-outline"
                layerOptions={outlineLayerOptions}
            />
        </MapSource>
    );
}

export default DistrictTriggerOutlineLayer;
