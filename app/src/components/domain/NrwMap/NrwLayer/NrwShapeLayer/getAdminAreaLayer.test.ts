import {
    type FillLayerSpecification,
    type LineLayerSpecification,
} from 'mapbox-gl-v3';
import {
    describe,
    expect,
    test,
} from 'vitest';

import {
    alertClassMapRamps,
    mapOutlineWidth,
} from '#utils/nrw/colors';
import { type NrwAdminAreaFeatureCollection } from '#views/CountryProfileNationalRiskWatch/types';

import { type MapLayer } from '../useNrwMapLayers';
import getAdminAreaLayer from './getAdminAreaLayer';

const adminAreas = {
    type: 'FeatureCollection',
    features: [
        { type: 'Feature', geometry: null, properties: { placeCode: 'SS03' } },
        { type: 'Feature', geometry: null, properties: { placeCode: 'SS04' } },
    ],
} as unknown as NrwAdminAreaFeatureCollection;

// The Mapbox addLayer parameter type does not narrow the paint by the layer type.
function getFillColor(layer: MapLayer | undefined) {
    return (layer as FillLayerSpecification | undefined)?.paint?.['fill-color'];
}

function getLineColor(layer: MapLayer | undefined) {
    return (layer as LineLayerSpecification | undefined)?.paint?.['line-color'];
}

describe('getAdminAreaLayer', () => {
    test('outlines each admin area in the colour of its fill, without transparency', () => {
        // Arrange
        const exposedPopulationByPlaceCode = new Map([['SS03', 1000], ['SS04', 5000]]);

        // Act
        const [fill, outline] = getAdminAreaLayer(
            'layer-SSD-adminAreas',
            adminAreas,
            exposedPopulationByPlaceCode,
            'high',
        );

        // Assert
        expect(fill).toMatchObject({ id: 'layer-SSD-adminAreas', type: 'fill' });
        expect(getFillColor(fill)).toEqual([
            'step',
            ['coalesce', ['get', 'exposedPopulation'], 0],
            '#fef1f2',
            1000,
            '#fcc6ca',
            2000,
            '#fa999f',
            3000,
            '#f5333f',
            4000,
            '#c01825',
        ]);
        expect(outline).toMatchObject({
            id: 'layer-SSD-adminAreas-outline',
            type: 'line',
            source: 'layer-SSD-adminAreas',
            paint: { 'line-width': mapOutlineWidth },
        });
        expect(getLineColor(outline)).toEqual(getFillColor(fill));
        expect(outline?.paint).not.toHaveProperty('line-opacity');
    });

    test('outlines the admin areas in the flat fill colour when none has exposed population', () => {
        // Arrange
        const exposedPopulationByPlaceCode = new Map<string, number>();

        // Act
        const [fill, outline] = getAdminAreaLayer(
            'layer-SSD-adminAreas',
            adminAreas,
            exposedPopulationByPlaceCode,
            'low',
        );

        // Assert
        expect(getFillColor(fill)).toBe(alertClassMapRamps.low[0]);
        expect(getLineColor(outline)).toBe(alertClassMapRamps.low[0]);
    });
});
