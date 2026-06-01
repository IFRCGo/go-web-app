import { useMemo } from 'react';
import { MapLayer } from '@togglecorp/re-map';
import {
    type BackgroundLayer,
    type FillLayer,
    type LineLayer,
    type SymbolLayer,
} from 'mapbox-gl';

import {
    COLOR_ACTIVE_REGION,
    COLOR_WHITE,
} from '#utils/constants';

const hiddenFillLayerOptions: Omit<FillLayer, 'id'> = {
    type: 'fill',
    layout: {
        visibility: 'none',
    },
};

const hiddenLineLayerOptions: Omit<LineLayer, 'id'> = {
    type: 'line',
    layout: {
        visibility: 'none',
    },
};

const backgroundLayerOptions: Omit<BackgroundLayer, 'id'> = {
    type: 'background',
    paint: { 'background-color': COLOR_WHITE },
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
                    'match',
                    ['get', 'iso3'],
                    activeCountryIso3,
                    COLOR_ACTIVE_REGION,
                    COLOR_WHITE,
                ],
                'fill-opacity': 0.2,
            },
        }),
        [activeCountryIso3],
    );

    const adminOneBoundaryLayerOptions = useMemo<Omit<LineLayer, 'id'>>(
        () => ({
            type: 'line',
            layout: { visibility: 'visible' },
            paint: {
                'line-color': COLOR_WHITE,
                'line-opacity': 1,
            },
        }),
        [],
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

    const adminZeroLabelLayerOptions = useMemo<Omit<SymbolLayer, 'id'>>(
        () => ({
            type: 'symbol',
            layout: {
                visibility: 'none',
            },
        }),
        [],
    );

    return (
        <>
            <MapLayer
                layerKey="background"
                layerOptions={backgroundLayerOptions}
            />
            <MapLayer
                layerKey="hillshade"
                layerOptions={hiddenFillLayerOptions}
            />
            <MapLayer
                layerKey="admin-0-boundary-mask"
                layerOptions={hiddenLineLayerOptions}
            />
            <MapLayer
                layerKey="admin-0-boundary"
                layerOptions={hiddenLineLayerOptions}
            />
            <MapLayer
                layerKey="admin-0-boundary-disputed"
                layerOptions={hiddenLineLayerOptions}
            />
            <MapLayer
                layerKey="admin-0-highlight"
                layerOptions={hiddenFillLayerOptions}
            />
            <MapLayer
                layerKey="admin-0-label"
                layerOptions={adminZeroLabelLayerOptions}
            />
            <MapLayer
                layerKey="admin-0-label-priority"
                layerOptions={adminZeroLabelLayerOptions}
            />
            <MapLayer
                layerKey="admin-0-label-non-independent"
                layerOptions={adminZeroLabelLayerOptions}
            />
            <MapLayer
                layerKey="admin-0"
                layerOptions={adminZeroHighlightLayerOptions}
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
