import {
    useContext,
    useEffect,
    useMemo,
} from 'react';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
import {
    MapChildContext,
    MapLayer,
    MapSource,
} from '@togglecorp/re-map';
import type {
    ImageSource,
    MapSourceDataEvent,
    RasterLayer,
} from 'mapbox-gl';

import {
    type CogInfo,
    getLngLatCorners,
    getRenderWindow,
    renderWindow,
} from '../cog';
import { BASEMAP_ADMIN_1_BOUNDARY_LAYER } from '../constants';

// 1x1 transparent PNG: the source needs an image before it can be updated
const TRANSPARENT_PIXEL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVR4nGNgAAIAAAUAAXpeqz8AAAAASUVORK5CYII=';

interface Props {
    sourceKey: string;
    cog: CogInfo;
    colors: readonly string[];
    opacity: number;
}

// Reads only the viewport window of a Cloud Optimized GeoTIFF, at the overview
// matching the zoom, and shows it as an image source refreshed on each move
function CogRasterLayer(props: Props) {
    const {
        sourceKey,
        cog,
        colors,
        opacity,
    } = props;

    const { map } = useContext(MapChildContext);

    // MapSource only reads these once; the image and corners come from updateImage
    const sourceOptions = useMemo<mapboxgl.ImageSourceRaw>(
        () => ({
            type: 'image',
            url: TRANSPARENT_PIXEL,
            coordinates: getLngLatCorners(cog.lngLatBounds),
        }),
        [cog],
    );
    const layerOptions = useMemo<Omit<RasterLayer, 'id'>>(
        () => ({
            type: 'raster',
            paint: {
                'raster-opacity': opacity,
                'raster-fade-duration': 0,
            },
        }),
        [opacity],
    );

    useEffect(
        () => {
            if (isNotDefined(map)) {
                return undefined;
            }
            // updateImage is silently ignored until the current image has loaded,
            // which the source reports with a metadata event
            let ready = isDefined(map.getSource(sourceKey)) && map.isSourceLoaded(sourceKey);
            let lastKey: string | undefined;
            let controller: AbortController | undefined;

            const update = () => {
                const source = map.getSource(sourceKey) as ImageSource | undefined;
                if (!ready || isNotDefined(source) || source.type !== 'image') {
                    return;
                }

                const bounds = map.getBounds();
                const target = getRenderWindow(cog, {
                    bounds: [
                        bounds.getWest(),
                        bounds.getSouth(),
                        bounds.getEast(),
                        bounds.getNorth(),
                    ],
                    widthPx: map.getContainer().clientWidth,
                });
                const key = isDefined(target)
                    ? `${target.levelIndex}:${target.window.join(',')}`
                    : 'none';
                if (key === lastKey) {
                    return;
                }
                lastKey = key;
                controller?.abort();

                if (isNotDefined(target)) {
                    source.updateImage({
                        url: TRANSPARENT_PIXEL,
                        coordinates: getLngLatCorners(cog.lngLatBounds),
                    });
                    return;
                }

                const current = new AbortController();
                controller = current;
                renderWindow(cog, target, colors, current.signal).then(
                    (dataUrl) => {
                        if (current.signal.aborted || isNotDefined(dataUrl)) {
                            return;
                        }
                        source.updateImage({
                            url: dataUrl,
                            coordinates: target.corners,
                        });
                    },
                    (error: unknown) => {
                        if (!current.signal.aborted) {
                            lastKey = undefined;
                            // eslint-disable-next-line no-console
                            console.warn(`Could not render raster ${cog.url}`, error);
                        }
                    },
                );
            };

            const handleSourceData = (event: MapSourceDataEvent) => {
                if (event.sourceId !== sourceKey) {
                    return;
                }
                if (event.sourceDataType === 'metadata') {
                    ready = true;
                }
                update();
            };

            update();
            map.on('moveend', update);
            map.on('sourcedata', handleSourceData);
            return () => {
                controller?.abort();
                map.off('moveend', update);
                map.off('sourcedata', handleSourceData);
            };
        },
        [map, sourceKey, cog, colors],
    );

    return (
        <MapSource
            sourceKey={sourceKey}
            sourceOptions={sourceOptions}
        >
            <MapLayer
                layerKey="raster"
                layerOptions={layerOptions}
                beneath={BASEMAP_ADMIN_1_BOUNDARY_LAYER}
            />
        </MapSource>
    );
}

export default CogRasterLayer;
