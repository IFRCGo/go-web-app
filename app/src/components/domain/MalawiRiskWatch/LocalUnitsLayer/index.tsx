import {
    MapLayer,
    MapSource,
} from '@togglecorp/re-map';
import type { CircleLayer } from 'mapbox-gl';

import {
    COLOR_PRIMARY_RED,
    COLOR_WHITE,
} from '#utils/constants';

import { BASEMAP_ADMIN_1_BOUNDARY_LAYER } from '../constants';
import useLocalUnits from '../useLocalUnits';

const sourceOptions: mapboxgl.GeoJSONSourceRaw = {
    type: 'geojson',
};

const circleLayerOptions: Omit<CircleLayer, 'id'> = {
    type: 'circle',
    paint: {
        'circle-radius': 4,
        'circle-color': COLOR_PRIMARY_RED,
        'circle-stroke-color': COLOR_WHITE,
        'circle-stroke-width': 1,
    },
};

function LocalUnitsLayer() {
    const { featureCollection } = useLocalUnits();

    return (
        <MapSource
            sourceKey="malawi-local-units"
            sourceOptions={sourceOptions}
            geoJson={featureCollection}
        >
            <MapLayer
                layerKey="local-unit-point"
                layerOptions={circleLayerOptions}
                beneath={BASEMAP_ADMIN_1_BOUNDARY_LAYER}
            />
        </MapSource>
    );
}

export default LocalUnitsLayer;
