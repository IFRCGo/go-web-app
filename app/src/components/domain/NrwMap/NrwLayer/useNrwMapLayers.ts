import {
    useContext,
    useEffect,
} from 'react';
import { isNotDefined } from '@togglecorp/fujs';
import { type Map as MapboxMap } from 'mapbox-gl-v3';

import NrwMapContext from '../NrwMapContext';

export type MapLayer = Parameters<MapboxMap['addLayer']>[0];

// Add the layers in order after the anchor layer. A layer with
// a string source shares the source of an earlier layer in the list.
function useNrwMapLayers(
    mapLayers: MapLayer[] | undefined,
    isVisible: boolean,
    layerAnchorId: string,
) {
    const { map } = useContext(NrwMapContext);

    // on mount
    useEffect(
        () => {
            if (isNotDefined(map) || isNotDefined(mapLayers)) {
                return undefined;
            }

            mapLayers.forEach((mapLayer) => map.addLayer(mapLayer, layerAnchorId));

            return () => {
                if (isNotDefined(map.style)) {
                    return;
                }

                // Mapbox keeps a source while a layer uses it, so every layer goes first.
                mapLayers.toReversed().forEach(({ id }) => {
                    if (map.getLayer(id)) map.removeLayer(id);
                });
                mapLayers.forEach(({ id }) => {
                    if (map.getSource(id)) map.removeSource(id);
                });
            };
        },
        [map, mapLayers, layerAnchorId],
    );

    // control visibility
    useEffect(
        () => {
            if (isNotDefined(map) || isNotDefined(mapLayers)) {
                return;
            }

            mapLayers.forEach(({ id }) => {
                if (map.getLayer(id)) {
                    map.setLayoutProperty(id, 'visibility', isVisible ? 'visible' : 'none');
                }
            });
        },
        [map, mapLayers, isVisible],
    );
}

export default useNrwMapLayers;
