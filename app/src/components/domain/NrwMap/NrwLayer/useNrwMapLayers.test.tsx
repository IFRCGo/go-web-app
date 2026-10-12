import { useMemo } from 'react';
import { render } from '@testing-library/react';
import { type Map as MapboxMap } from 'mapbox-gl-v3';
import {
    describe,
    expect,
    test,
    vi,
} from 'vitest';

import createFakeMapboxMap from '#utils/testing/createFakeMapboxMap';

import NrwMapContext from '../NrwMapContext';
import useNrwMapLayers, { type MapLayer } from './useNrwMapLayers';

const layerAnchorId = 'anchor-adminAreas';

function createFillLayer(id: string): MapLayer {
    return {
        id,
        type: 'fill',
        source: {
            type: 'geojson',
            data: { type: 'FeatureCollection', features: [] },
        },
    };
}

// An outline that shares the source of its fill layer, like the admin areas.
function createOutlineLayer(fillId: string): MapLayer {
    return {
        id: `${fillId}-outline`,
        type: 'line',
        source: fillId,
    };
}

function Layers(props: { mapLayers: MapLayer[] | undefined; isVisible: boolean }) {
    const { mapLayers, isVisible } = props;

    useNrwMapLayers(mapLayers, isVisible, layerAnchorId);

    return null;
}

// Mirrors NrwMapContainer, which provides the map only after its style has loaded.
function MapHost(props: {
    map: MapboxMap | undefined;
    mapLayers: MapLayer[] | undefined;
    isVisible: boolean;
}) {
    const { map, mapLayers, isVisible } = props;

    const mapContext = useMemo(() => ({ map }), [map]);

    return (
        <NrwMapContext.Provider value={mapContext}>
            <Layers mapLayers={mapLayers} isVisible={isVisible} />
        </NrwMapContext.Provider>
    );
}

// The calls that add or remove a layer. The visibility calls are not part of the
// lifecycle order; the tests assert the visibility end state instead.
function getLifecycleCalls(calls: string[]) {
    return calls.filter((call) => !call.startsWith('setLayoutProperty'));
}

describe('useNrwMapLayers', () => {
    test('waits for the map before it adds the layers', () => {
        // Arrange
        const { map, calls, getLayerSpecification } = createFakeMapboxMap();
        const adminAreas = [createFillLayer('layer-SSD-adminAreas')];

        // Act
        const { rerender } = render(<MapHost map={undefined} mapLayers={adminAreas} isVisible />);

        // Assert
        expect(calls).toEqual([]);

        // Act
        rerender(<MapHost map={map} mapLayers={adminAreas} isVisible />);

        // Assert
        expect(getLifecycleCalls(calls)).toEqual(['addLayer layer-SSD-adminAreas']);
        expect(getLayerSpecification('layer-SSD-adminAreas')).toBe(adminAreas[0]);
    });

    test('waits for the layer specifications before it adds the layers', () => {
        // Arrange
        const { map, calls, getLayerSpecification } = createFakeMapboxMap();
        const adminAreas = [createFillLayer('layer-SSD-adminAreas')];

        // Act
        const { rerender } = render(<MapHost map={map} mapLayers={undefined} isVisible />);

        // Assert
        expect(calls).toEqual([]);

        // Act
        rerender(<MapHost map={map} mapLayers={adminAreas} isVisible />);

        // Assert
        expect(getLifecycleCalls(calls)).toEqual(['addLayer layer-SSD-adminAreas']);
        expect(getLayerSpecification('layer-SSD-adminAreas')).toBe(adminAreas[0]);
    });

    test('shows visible layers and hides hidden layers as soon as they are added', () => {
        // Arrange
        const visible = createFakeMapboxMap();
        const hidden = createFakeMapboxMap();
        const adminAreas = [createFillLayer('layer-SSD-adminAreas')];

        // Act
        render(<MapHost map={visible.map} mapLayers={adminAreas} isVisible />);
        render(<MapHost map={hidden.map} mapLayers={adminAreas} isVisible={false} />);

        // Assert
        expect(visible.getVisibility('layer-SSD-adminAreas')).toBe('visible');
        expect(hidden.getVisibility('layer-SSD-adminAreas')).toBe('none');
    });

    test('keeps the layers across renders with the same specifications', () => {
        // Arrange
        const { map, calls } = createFakeMapboxMap();
        const adminAreas = [createFillLayer('layer-SSD-adminAreas')];

        // Act
        const { rerender } = render(<MapHost map={map} mapLayers={adminAreas} isVisible />);
        rerender(<MapHost map={map} mapLayers={adminAreas} isVisible />);
        rerender(<MapHost map={map} mapLayers={adminAreas} isVisible />);

        // Assert
        expect(getLifecycleCalls(calls)).toEqual(['addLayer layer-SSD-adminAreas']);
    });

    test('replaces the layers and their sources when the specifications change', () => {
        // Arrange
        const {
            map,
            calls,
            getLayerSpecification,
            getVisibility,
        } = createFakeMapboxMap();
        const southSudan = [createFillLayer('layer-SSD-adminAreas')];
        const kenya = [createFillLayer('layer-KEN-adminAreas')];

        const { rerender } = render(<MapHost map={map} mapLayers={southSudan} isVisible />);
        calls.length = 0;

        // Act
        rerender(<MapHost map={map} mapLayers={kenya} isVisible />);

        // Assert
        expect(getLifecycleCalls(calls)).toEqual([
            'removeLayer layer-SSD-adminAreas',
            'removeSource layer-SSD-adminAreas',
            'addLayer layer-KEN-adminAreas',
        ]);
        expect(getLayerSpecification('layer-SSD-adminAreas')).toBeUndefined();
        expect(getLayerSpecification('layer-KEN-adminAreas')).toBe(kenya[0]);
        expect(getVisibility('layer-KEN-adminAreas')).toBe('visible');
    });

    test('adds the layers in order, each below the anchor', () => {
        // Arrange
        const { map, getLayerSpecification } = createFakeMapboxMap();
        const addLayer = vi.spyOn(map, 'addLayer');
        const fill = createFillLayer('layer-SSD-adminAreas');
        const outline = createOutlineLayer('layer-SSD-adminAreas');

        // Act
        render(<MapHost map={map} mapLayers={[fill, outline]} isVisible />);

        // Assert
        expect(addLayer.mock.calls).toEqual([[fill, layerAnchorId], [outline, layerAnchorId]]);
        expect(getLayerSpecification('layer-SSD-adminAreas')).toBe(fill);
        expect(getLayerSpecification('layer-SSD-adminAreas-outline')).toBe(outline);
    });

    test('removes the layers in reverse order and the shared source last on unmount', () => {
        // Arrange
        const { map, calls, getLayerSpecification } = createFakeMapboxMap();
        const adminAreas = [
            createFillLayer('layer-SSD-adminAreas'),
            createOutlineLayer('layer-SSD-adminAreas'),
        ];
        const { unmount } = render(<MapHost map={map} mapLayers={adminAreas} isVisible />);
        calls.length = 0;

        // Act
        unmount();

        // Assert
        expect(calls).toEqual([
            'removeLayer layer-SSD-adminAreas-outline',
            'removeLayer layer-SSD-adminAreas',
            'removeSource layer-SSD-adminAreas',
        ]);
        expect(getLayerSpecification('layer-SSD-adminAreas')).toBeUndefined();
        expect(getLayerSpecification('layer-SSD-adminAreas-outline')).toBeUndefined();
        expect(map.getSource('layer-SSD-adminAreas')).toBeUndefined();
    });

    test('replaces every layer when new specifications have the same ids', () => {
        // Arrange
        const { map, calls, getLayerSpecification } = createFakeMapboxMap();
        const { rerender } = render(
            <MapHost
                map={map}
                mapLayers={[
                    createFillLayer('layer-SSD-adminAreas'),
                    createOutlineLayer('layer-SSD-adminAreas'),
                ]}
                isVisible
            />,
        );
        calls.length = 0;
        const fill = createFillLayer('layer-SSD-adminAreas');
        const outline = createOutlineLayer('layer-SSD-adminAreas');

        // Act
        rerender(<MapHost map={map} mapLayers={[fill, outline]} isVisible />);

        // Assert
        // Mapbox refuses a second layer with the same id, so the old ones go first.
        expect(getLifecycleCalls(calls)).toEqual([
            'removeLayer layer-SSD-adminAreas-outline',
            'removeLayer layer-SSD-adminAreas',
            'removeSource layer-SSD-adminAreas',
            'addLayer layer-SSD-adminAreas',
            'addLayer layer-SSD-adminAreas-outline',
        ]);
        expect(getLayerSpecification('layer-SSD-adminAreas')).toBe(fill);
        expect(getLayerSpecification('layer-SSD-adminAreas-outline')).toBe(outline);
    });

    test('toggles the visibility of every layer without adding the layers again', () => {
        // Arrange
        const { map, calls, getVisibility } = createFakeMapboxMap();
        const adminAreas = [
            createFillLayer('layer-SSD-adminAreas'),
            createOutlineLayer('layer-SSD-adminAreas'),
        ];
        const { rerender } = render(<MapHost map={map} mapLayers={adminAreas} isVisible />);

        // Act & Assert
        rerender(<MapHost map={map} mapLayers={adminAreas} isVisible={false} />);
        expect(getVisibility('layer-SSD-adminAreas')).toBe('none');
        expect(getVisibility('layer-SSD-adminAreas-outline')).toBe('none');

        rerender(<MapHost map={map} mapLayers={adminAreas} isVisible />);
        expect(getVisibility('layer-SSD-adminAreas')).toBe('visible');
        expect(getVisibility('layer-SSD-adminAreas-outline')).toBe('visible');

        // Assert
        expect(getLifecycleCalls(calls)).toEqual([
            'addLayer layer-SSD-adminAreas',
            'addLayer layer-SSD-adminAreas-outline',
        ]);
    });

    // React runs the cleanup of NrwMapContainer (map.remove()) before the cleanup of
    // this hook, so the cleanup can hold a removed map.
    test('does not touch a map that was removed before the layer cleanup', () => {
        // Arrange
        const { map, calls } = createFakeMapboxMap();
        const adminAreas = [
            createFillLayer('layer-SSD-adminAreas'),
            createOutlineLayer('layer-SSD-adminAreas'),
        ];
        const { unmount } = render(<MapHost map={map} mapLayers={adminAreas} isVisible />);
        calls.length = 0;

        // Act
        map.remove();
        unmount();

        // Assert
        expect(calls).toEqual(['remove']);
    });
});
