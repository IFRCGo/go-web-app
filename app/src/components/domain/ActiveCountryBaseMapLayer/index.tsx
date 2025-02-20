import { useMemo } from 'react';
import { MapLayer } from '@togglecorp/re-map';
import {
    type FillLayer,
    type LineLayer,
    type SymbolLayer,
} from 'mapbox-gl';

import {
    COLOR_ACTIVE_REGION,
    COLOR_LIGHT_GREY,
    COLOR_WHITE,
} from '#utils/constants';

const hiddenFillLayerOptions: Omit<FillLayer, 'id'> = {
    type: 'fill',
    layout: {
        visibility: 'none',
    },
};

interface Props {
    activeCountryIso3: string | undefined | null;
}

function ActiveCountryBaseMapLayer(props: Props) {
    const { activeCountryIso3 } = props;

    const adminZeroHighlightLayerOptions = useMemo<Omit<FillLayer, 'id'>>(
        () => ({
            type: 'fill',
            layout: { visibility: 'visible' },
            paint: {
                'fill-color': [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    2,
                    [
                        'match',
                        ['get', 'iso3'],
                        activeCountryIso3,
                        COLOR_ACTIVE_REGION,
                        COLOR_LIGHT_GREY,
                    ],
                    10,
                    COLOR_LIGHT_GREY,
                ],
            },
        }),
        [activeCountryIso3],
    );

    const adminOneBoundaryLayerOptions = useMemo<Omit<LineLayer, 'id'>>(
        () => ({
            type: 'line',
            layout: { visibility: 'visible' },
            paint: {
                'line-color': [
                    'match',
                    ['get', 'country_iso3'],
                    activeCountryIso3,
                    COLOR_WHITE,
                    COLOR_LIGHT_GREY,
                ],
                'line-opacity': 1,
            },
        }),
        [activeCountryIso3],
    );

    const adminOneLabelLayerOptions = useMemo<Omit<SymbolLayer, 'id'>>(
        () => ({
            type: 'symbol',
            layout: {
                visibility: 'visible',
                'text-size': 12,
            },
            paint: {
                'text-opacity': [
                    'match',
                    ['get', 'country_iso3'],
                    activeCountryIso3,
                    1.0,
                    0,
                ],
            },
        }),
        [activeCountryIso3],
    );

    return (
        <>
            <MapLayer
                layerKey="admin-0"
                layerOptions={adminZeroHighlightLayerOptions}
            />
            <MapLayer
                layerKey="admin-0-highlight"
                layerOptions={hiddenFillLayerOptions}
            />
            <MapLayer
                layerKey="admin-1-boundary"
                layerOptions={adminOneBoundaryLayerOptions}
            />
            <MapLayer
                layerKey="admin-1-label"
                layerOptions={adminOneLabelLayerOptions}
            />
            <MapLayer
                layerKey="admin-1-label-selected"
                layerOptions={adminOneLabelLayerOptions}
            />
        </>
    );
}

export default ActiveCountryBaseMapLayer;
