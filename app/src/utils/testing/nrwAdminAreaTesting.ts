import type createFakeMapboxMap from './createFakeMapboxMap';

export const adminAreaLayerId = 'layer-SSD-adminAreas';

export function createAdminAreaProperties(placeCode: string, adminLevel: number) {
    return {
        adminLevel,
        placeCode,
        nameEn: `Name of ${placeCode}`,
    };
}

export function createAdminAreaFeature(properties: unknown) {
    return { properties };
}

export type FakeNrwMap = ReturnType<typeof createFakeMapboxMap>;

// The click handler bails when the layer is absent from the map.
export function addAdminAreaLayer(fake: FakeNrwMap) {
    fake.map.addLayer({
        id: adminAreaLayerId,
        type: 'fill',
        source: {
            type: 'geojson',
            data: { type: 'FeatureCollection', features: [] },
        },
    });
}
