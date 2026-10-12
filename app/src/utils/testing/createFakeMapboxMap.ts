import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
import { type Map as MapboxMap } from 'mapbox-gl-v3';

type LayerSpecification = Parameters<MapboxMap['addLayer']>[0];

// The source a layer uses. Mapbox registers an inline source under the id of its layer.
function getSourceId(layer: LayerSpecification) {
    if (!('source' in layer)) return undefined;

    return typeof layer.source === 'object' ? layer.id : layer.source;
}

// The subset of the Mapbox map that the NRW layer hooks use. It records every
// call in order so a test can assert the layer lifecycle sequence. Mapbox reports
// a wrong source order as an error event; the fake throws so the test fails.
interface FakeMapboxMap {
    map: MapboxMap;
    calls: string[];
    getLayerSpecification: (id: string) => LayerSpecification | undefined;
    getVisibility: (id: string) => string | undefined;
}

function createFakeMapboxMap(): FakeMapboxMap {
    const layers = new Map<string, LayerSpecification>();
    const visibilities = new Map<string, string>();
    const sources = new Set<string>();
    const calls: string[] = [];
    let style: object | undefined = {};

    function assertStyle(method: string) {
        if (isNotDefined(style)) {
            throw new TypeError(`Cannot read map.style in ${method}(): the map was removed`);
        }
    }

    const fakeMap = {
        get style() {
            return style;
        },
        addLayer(layer: LayerSpecification) {
            calls.push(`addLayer ${layer.id}`);
            assertStyle('addLayer');
            if (layers.has(layer.id)) {
                throw new Error(`Layer with id "${layer.id}" already exists on this map`);
            }
            if ('source' in layer && typeof layer.source === 'string' && !sources.has(layer.source)) {
                throw new Error(`Source "${layer.source}" not found`);
            }
            layers.set(layer.id, layer);
            // Mapbox shows a new layer unless its layout says otherwise.
            const visibility = 'layout' in layer ? layer.layout?.visibility : undefined;
            visibilities.set(layer.id, typeof visibility === 'string' ? visibility : 'visible');
            if ('source' in layer && typeof layer.source === 'object') {
                sources.add(layer.id);
            }
        },
        getLayer(id: string) {
            assertStyle('getLayer');
            return layers.get(id);
        },
        removeLayer(id: string) {
            calls.push(`removeLayer ${id}`);
            assertStyle('removeLayer');
            layers.delete(id);
            visibilities.delete(id);
        },
        getSource(id: string) {
            assertStyle('getSource');
            return sources.has(id) ? { id } : undefined;
        },
        removeSource(id: string) {
            calls.push(`removeSource ${id}`);
            assertStyle('removeSource');
            const usingLayer = [...layers.values()].find((layer) => getSourceId(layer) === id);
            if (isDefined(usingLayer)) {
                throw new Error(
                    `Source "${id}" cannot be removed while layer "${usingLayer.id}" is using it.`,
                );
            }
            sources.delete(id);
        },
        setLayoutProperty(id: string, name: string, value: string) {
            calls.push(`setLayoutProperty ${id} ${name} ${value}`);
            assertStyle('setLayoutProperty');
            if (name === 'visibility') {
                visibilities.set(id, value);
            }
        },
        remove() {
            calls.push('remove');
            style = undefined;
        },
    };

    return {
        // Only the methods above are implemented.
        map: fakeMap as unknown as MapboxMap,
        calls,
        getLayerSpecification: (id) => layers.get(id),
        getVisibility: (id) => visibilities.get(id),
    };
}

export default createFakeMapboxMap;
