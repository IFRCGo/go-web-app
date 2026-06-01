import {
    useEffect,
    useMemo,
    useState,
} from 'react';
import {
    MapLayer,
    MapSource,
} from '@togglecorp/re-map';
import { fromUrl } from 'geotiff';
import type { RasterLayer } from 'mapbox-gl';

import {
    COLOR_BLUE,
    COLOR_PRIMARY_RED,
} from '#utils/constants';

import { BASEMAP_ADMIN_1_BOUNDARY_LAYER } from '../mapStyles';

interface Decoded {
    dataUrl: string;
    coordinates: [
        [number, number],
        [number, number],
        [number, number],
        [number, number],
    ];
}

const TARGET_OVERVIEW_PIXELS = 512 * 512;
const UPSCALE = 4;

// The backend tiles forecast COGs to Web Mercator (EPSG:3857, see
// malawi-risk-watch-backend apps/pipeline/cog.py), so the GeoTIFF bounding
// box is in meters. The Mapbox image source only accepts lon/lat corners and
// rejects the whole image otherwise ("Invalid LngLat latitude value"), so the
// bbox must be inverse-projected before use.
const EPSG_WEB_MERCATOR = 3857;
const WEB_MERCATOR_EARTH_RADIUS = 6378137;

function webMercatorToLngLat(x: number, y: number): [number, number] {
    const lng = (x / WEB_MERCATOR_EARTH_RADIUS) * (180 / Math.PI);
    const lat = (
        2 * Math.atan(Math.exp(y / WEB_MERCATOR_EARTH_RADIUS)) - Math.PI / 2
    ) * (180 / Math.PI);
    return [lng, lat];
}

function hexToRgb(hex: string): [number, number, number] {
    const cleaned = hex.replace('#', '');
    const r = parseInt(cleaned.slice(0, 2), 16);
    const g = parseInt(cleaned.slice(2, 4), 16);
    const b = parseInt(cleaned.slice(4, 6), 16);
    return [r, g, b];
}

const [START_R, START_G, START_B] = hexToRgb(COLOR_BLUE);
const [END_R, END_G, END_B] = hexToRgb(COLOR_PRIMARY_RED);

// Interpolation between the two endpoint colors. Flood rasters are heavily
// skewed (most non-zero pixels sit near the minimum), so a linear ramp leaves
// almost everything at the faint end — the sqrt pushes low/mid values up the
// ramp. Alpha floor needs to be high enough to stay visible against a light
// basemap, while still letting raster-opacity dial the whole thing back if
// it's too loud.
function valueToRgba(linearT: number): [number, number, number, number] {
    const t = Math.sqrt(linearT);
    const r = Math.round(START_R + (END_R - START_R) * t);
    const g = Math.round(START_G + (END_G - START_G) * t);
    const b = Math.round(START_B + (END_B - START_B) * t);
    const a = Math.round(160 + 95 * t);
    return [r, g, b, a];
}

interface Props {
    cogUrl: string;
    opacity: number;
}

function JbaCogRasterLayer(props: Props) {
    const { cogUrl, opacity } = props;

    const [decoded, setDecoded] = useState<Decoded | undefined>();

    useEffect(() => {
        let cancelled = false;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setDecoded(undefined);

        (async () => {
            try {
                const tiff = await fromUrl(cogUrl);
                const imageCount = await tiff.getImageCount();
                const fullImage = await tiff.getImage(0);
                const bbox = fullImage.getBoundingBox();
                let west = bbox[0] ?? 0;
                let south = bbox[1] ?? 0;
                let east = bbox[2] ?? 0;
                let north = bbox[3] ?? 0;

                const geoKeys = fullImage.getGeoKeys() as
                    | { ProjectedCSTypeGeoKey?: number }
                    | null;
                const projectedCrs = geoKeys?.ProjectedCSTypeGeoKey;
                if (projectedCrs === EPSG_WEB_MERCATOR) {
                    [west, south] = webMercatorToLngLat(west, south);
                    [east, north] = webMercatorToLngLat(east, north);
                } else if (typeof projectedCrs === 'number') {
                    // No reprojection support beyond Web Mercator; bail
                    // loudly instead of handing mapbox invalid lon/lat.
                    // eslint-disable-next-line no-console
                    console.warn(
                        `[JbaCogRasterLayer] unsupported projected CRS EPSG:${projectedCrs} in ${cogUrl}; expected EPSG:3857 or geographic lon/lat`,
                    );
                    return;
                }

                // Pick the overview level closest to TARGET_OVERVIEW_PIXELS.
                let renderImage = fullImage;
                let bestDiff = Math.abs(
                    fullImage.getWidth() * fullImage.getHeight() - TARGET_OVERVIEW_PIXELS,
                );
                for (let i = 1; i < imageCount; i += 1) {
                    // eslint-disable-next-line no-await-in-loop
                    const img = await tiff.getImage(i);
                    const pixels = img.getWidth() * img.getHeight();
                    const diff = Math.abs(pixels - TARGET_OVERVIEW_PIXELS);
                    if (diff < bestDiff) {
                        bestDiff = diff;
                        renderImage = img;
                    }
                }

                const rasters = await renderImage.readRasters({ samples: [0] });
                const band = rasters[0] as unknown as ArrayLike<number>;
                const width = renderImage.getWidth();
                const height = renderImage.getHeight();

                // Per-image min/max over non-zero values for normalisation.
                let min = Infinity;
                let max = -Infinity;
                for (let i = 0; i < band.length; i += 1) {
                    const v = band[i] ?? 0;
                    if (v > 0) {
                        if (v < min) min = v;
                        if (v > max) max = v;
                    }
                }
                const range = max - min || 1;

                const raw = document.createElement('canvas');
                raw.width = width;
                raw.height = height;
                const rawCtx = raw.getContext('2d');
                if (!rawCtx) {
                    return;
                }
                const imgData = rawCtx.createImageData(width, height);
                for (let i = 0; i < band.length; i += 1) {
                    const v = band[i] ?? 0;
                    const idx = i * 4;
                    if (v <= 0) {
                        imgData.data[idx + 3] = 0;
                    } else {
                        const t = Math.min((v - min) / range, 1);
                        const [r, g, b, a] = valueToRgba(t);
                        imgData.data[idx] = r;
                        imgData.data[idx + 1] = g;
                        imgData.data[idx + 2] = b;
                        imgData.data[idx + 3] = a;
                    }
                }
                rawCtx.putImageData(imgData, 0, 0);

                // Upscale with smoothing to soften block edges at display size.
                const canvas = document.createElement('canvas');
                canvas.width = width * UPSCALE;
                canvas.height = height * UPSCALE;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    return;
                }
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                ctx.drawImage(raw, 0, 0, canvas.width, canvas.height);

                if (cancelled) {
                    return;
                }

                setDecoded({
                    dataUrl: canvas.toDataURL(),
                    coordinates: [
                        [west, north],
                        [east, north],
                        [east, south],
                        [west, south],
                    ],
                });
            } catch (err) {
                if (!cancelled) {
                    // eslint-disable-next-line no-console
                    console.warn(`[JbaCogRasterLayer] failed to decode ${cogUrl}:`, err);
                }
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [cogUrl]);

    const sourceOptions = useMemo(() => {
        if (!decoded) {
            return undefined;
        }
        return {
            type: 'image' as const,
            url: decoded.dataUrl,
            coordinates: decoded.coordinates,
        };
    }, [decoded]);

    const rasterLayer = useMemo<Omit<RasterLayer, 'id'>>(() => ({
        type: 'raster',
        paint: {
            'raster-opacity': opacity,
            'raster-resampling': 'nearest',
        },
        layout: { visibility: 'visible' },
    }), [opacity]);

    if (!sourceOptions) {
        return null;
    }

    return (
        <MapSource
            sourceKey="jba-cog"
            sourceOptions={sourceOptions}
        >
            {/* beneath is required here, not just cosmetic: this layer mounts
            from component-local state after the async COG decode, when the
            parent's MapOrder has already run and won't run again — without an
            anchor, addLayer would append it above the event markers. */}
            <MapLayer
                layerKey="jba-cog-layer"
                layerOptions={rasterLayer}
                beneath={BASEMAP_ADMIN_1_BOUNDARY_LAYER}
            />
        </MapSource>
    );
}

export default JbaCogRasterLayer;
