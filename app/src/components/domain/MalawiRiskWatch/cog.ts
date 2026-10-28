import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
import {
    fromUrl,
    type GeoTIFFImage,
    type TypedArray,
} from 'geotiff';

import { RASTER_MAX_WINDOW_PIXELS } from './constants';

type CogCrs = 'EPSG:3857' | 'EPSG:4326';

// [west, south, east, north]
export type Bounds = [number, number, number, number];
type LngLatCorners = [
    [number, number],
    [number, number],
    [number, number],
    [number, number],
];

interface CogLevel {
    image: GeoTIFFImage;
    width: number;
    height: number;
    // CRS units per pixel
    resolution: number;
}

export interface CogInfo {
    url: string;
    crs: CogCrs;
    bounds: Bounds;
    lngLatBounds: Bounds;
    // Full resolution first, then each overview
    levels: CogLevel[];
    noDataValue: number | undefined;
    // Value range of the valid pixels, from the smallest overview
    domain: [number, number];
}

interface RenderWindow {
    levelIndex: number;
    // [x0, y0, x1, y1] in pixels of that level
    window: [number, number, number, number];
    corners: LngLatCorners;
}

interface Viewport {
    bounds: Bounds;
    widthPx: number;
}

const EARTH_RADIUS = 6378137;
const MAX_MERCATOR_LATITUDE = 85.051129;
// Extra window around the viewport so small pans do not expose blank edges
const WINDOW_PADDING = 0.25;

function lngLatToWebMercator(lng: number, lat: number): [number, number] {
    const clampedLat = Math.max(-MAX_MERCATOR_LATITUDE, Math.min(MAX_MERCATOR_LATITUDE, lat));
    return [
        EARTH_RADIUS * ((lng * Math.PI) / 180),
        EARTH_RADIUS * Math.log(Math.tan(Math.PI / 4 + (clampedLat * Math.PI) / 360)),
    ];
}

function webMercatorToLngLat(x: number, y: number): [number, number] {
    return [
        (x / EARTH_RADIUS) * (180 / Math.PI),
        (2 * Math.atan(Math.exp(y / EARTH_RADIUS)) - Math.PI / 2) * (180 / Math.PI),
    ];
}

function toCrs(crs: CogCrs, lng: number, lat: number): [number, number] {
    return crs === 'EPSG:3857' ? lngLatToWebMercator(lng, lat) : [lng, lat];
}

function toLngLat(crs: CogCrs, x: number, y: number): [number, number] {
    return crs === 'EPSG:3857' ? webMercatorToLngLat(x, y) : [x, y];
}

function getCrs(image: GeoTIFFImage): CogCrs | undefined {
    const geoKeys = image.getGeoKeys() as {
        GTModelTypeGeoKey?: number;
        ProjectedCSTypeGeoKey?: number;
        GeographicTypeGeoKey?: number;
    } | null;
    if (geoKeys?.ProjectedCSTypeGeoKey === 3857) {
        return 'EPSG:3857';
    }
    // 2 is a geographic model; only WGS84 lon/lat lines up with the map
    if (geoKeys?.GTModelTypeGeoKey === 2
        && (isNotDefined(geoKeys.GeographicTypeGeoKey) || geoKeys.GeographicTypeGeoKey === 4326)) {
        return 'EPSG:4326';
    }
    return undefined;
}

function isValidValue(value: number, noDataValue: number | undefined) {
    return !Number.isNaN(value) && value !== noDataValue;
}

function getFirstBand(result: TypedArray | TypedArray[]): TypedArray | undefined {
    return Array.isArray(result) ? result[0] : result;
}

function getDomain(values: TypedArray, noDataValue: number | undefined): [number, number] {
    let min = Infinity;
    let max = -Infinity;
    for (let i = 0; i < values.length; i += 1) {
        const value = values[i];
        if (isDefined(value) && isValidValue(value, noDataValue)) {
            min = Math.min(min, value);
            max = Math.max(max, value);
        }
    }
    if (min === Infinity) {
        return [0, 1];
    }
    // A single-valued raster (a mask) still needs a range to colour and label
    if (min === max) {
        return [Math.min(0, max), max];
    }
    return [min, max];
}

async function readCog(url: string): Promise<CogInfo> {
    const tiff = await fromUrl(url);
    const imageCount = await tiff.getImageCount();
    const images = await Promise.all(
        Array.from({ length: imageCount }, (_, index) => tiff.getImage(index)),
    );
    const [fullImage] = images;
    if (isNotDefined(fullImage)) {
        throw new Error(`No image in ${url}`);
    }

    const crs = getCrs(fullImage);
    if (isNotDefined(crs)) {
        throw new Error(`Unsupported CRS in ${url}; expected EPSG:3857 or EPSG:4326`);
    }

    const [west, south, east, north] = fullImage.getBoundingBox();
    if (isNotDefined(west) || isNotDefined(south) || isNotDefined(east) || isNotDefined(north)) {
        throw new Error(`Missing bounding box in ${url}`);
    }
    const bounds: Bounds = [west, south, east, north];
    const [lngWest, latSouth] = toLngLat(crs, west, south);
    const [lngEast, latNorth] = toLngLat(crs, east, north);

    // Overviews are sorted by size in a COG, but keep it explicit
    const levels = images
        .map((image) => ({
            image,
            width: image.getWidth(),
            height: image.getHeight(),
            resolution: Math.abs(image.getResolution(fullImage)[0] ?? 0),
        }))
        .sort((a, b) => a.resolution - b.resolution);
    const smallest = levels[levels.length - 1];
    if (isNotDefined(smallest)) {
        throw new Error(`No image in ${url}`);
    }

    const noDataValue = fullImage.getGDALNoData() ?? undefined;
    const band = getFirstBand(await smallest.image.readRasters({ samples: [0] }));

    return {
        url,
        crs,
        bounds,
        lngLatBounds: [lngWest, latSouth, lngEast, latNorth],
        levels,
        noDataValue,
        domain: isDefined(band) ? getDomain(band, noDataValue) : [0, 1],
    };
}

const cogCache = new Map<string, Promise<CogInfo>>();

export function loadCog(url: string) {
    const cached = cogCache.get(url);
    if (isDefined(cached)) {
        return cached;
    }
    const promise = readCog(url);
    promise.catch(() => cogCache.delete(url));
    cogCache.set(url, promise);
    return promise;
}

export function getLngLatCorners(bounds: Bounds): LngLatCorners {
    const [west, south, east, north] = bounds;
    return [
        [west, north],
        [east, north],
        [east, south],
        [west, south],
    ];
}

// Coarsest level that still has at least one pixel per screen pixel
function pickLevelIndex(levels: CogLevel[], targetResolution: number) {
    let index = 0;
    levels.forEach((level, i) => {
        if (level.resolution <= targetResolution) {
            index = i;
        }
    });
    return index;
}

export function getRenderWindow(cog: CogInfo, viewport: Viewport): RenderWindow | undefined {
    const [vWest, vSouth, vEast, vNorth] = viewport.bounds;
    const [minX, minY] = toCrs(cog.crs, vWest, vSouth);
    const [maxX, maxY] = toCrs(cog.crs, vEast, vNorth);
    const padX = (maxX - minX) * WINDOW_PADDING;
    const padY = (maxY - minY) * WINDOW_PADDING;

    const [cogMinX, cogMinY, cogMaxX, cogMaxY] = cog.bounds;
    const x0 = Math.max(minX - padX, cogMinX);
    const y0 = Math.max(minY - padY, cogMinY);
    const x1 = Math.min(maxX + padX, cogMaxX);
    const y1 = Math.min(maxY + padY, cogMaxY);
    if (x0 >= x1 || y0 >= y1) {
        return undefined;
    }

    const targetResolution = (maxX - minX) / Math.max(viewport.widthPx, 1);
    let levelIndex = pickLevelIndex(cog.levels, targetResolution);

    for (;;) {
        const level = cog.levels[levelIndex];
        if (isNotDefined(level)) {
            return undefined;
        }
        // Pixel rows count down from the north edge
        const px0 = Math.max(0, Math.floor((x0 - cogMinX) / level.resolution));
        const px1 = Math.min(level.width, Math.ceil((x1 - cogMinX) / level.resolution));
        const py0 = Math.max(0, Math.floor((cogMaxY - y1) / level.resolution));
        const py1 = Math.min(level.height, Math.ceil((cogMaxY - y0) / level.resolution));
        if (px0 >= px1 || py0 >= py1) {
            return undefined;
        }

        const isLastLevel = levelIndex === cog.levels.length - 1;
        if ((px1 - px0) * (py1 - py0) <= RASTER_MAX_WINDOW_PIXELS || isLastLevel) {
            const west = cogMinX + px0 * level.resolution;
            const east = cogMinX + px1 * level.resolution;
            const north = cogMaxY - py0 * level.resolution;
            const south = cogMaxY - py1 * level.resolution;
            const [lngWest, latNorth] = toLngLat(cog.crs, west, north);
            const [lngEast, latSouth] = toLngLat(cog.crs, east, south);
            return {
                levelIndex,
                window: [px0, py0, px1, py1],
                corners: getLngLatCorners([lngWest, latSouth, lngEast, latNorth]),
            };
        }
        levelIndex += 1;
    }
}

function hexToRgb(hex: string): [number, number, number] {
    const value = parseInt(hex.replace('#', ''), 16);
    // eslint-disable-next-line no-bitwise
    return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

// 256-entry RGBA lookup interpolated across the ramp stops
function getColorTable(colors: readonly string[]) {
    const stops = colors.map(hexToRgb);
    const table = new Uint8ClampedArray(256 * 4);
    for (let i = 0; i < 256; i += 1) {
        const position = (i / 255) * (stops.length - 1);
        const from = stops[Math.floor(position)];
        const to = stops[Math.ceil(position)];
        if (isDefined(from) && isDefined(to)) {
            const t = position - Math.floor(position);
            table[i * 4] = from[0] + (to[0] - from[0]) * t;
            table[i * 4 + 1] = from[1] + (to[1] - from[1]) * t;
            table[i * 4 + 2] = from[2] + (to[2] - from[2]) * t;
            table[i * 4 + 3] = 255;
        }
    }
    return table;
}

export async function renderWindow(
    cog: CogInfo,
    renderTarget: RenderWindow,
    colors: readonly string[],
    signal: AbortSignal,
): Promise<string | undefined> {
    const level = cog.levels[renderTarget.levelIndex];
    if (isNotDefined(level)) {
        return undefined;
    }
    const [px0, py0, px1, py1] = renderTarget.window;
    const width = px1 - px0;
    const height = py1 - py0;
    const band = getFirstBand(await level.image.readRasters({
        window: renderTarget.window,
        samples: [0],
        signal,
    }));
    if (isNotDefined(band) || signal.aborted) {
        return undefined;
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (isNotDefined(context)) {
        return undefined;
    }

    const table = getColorTable(colors);
    const [min, max] = cog.domain;
    const range = max - min;
    const imageData = context.createImageData(width, height);
    for (let i = 0; i < width * height; i += 1) {
        const value = band[i];
        if (isDefined(value) && isValidValue(value, cog.noDataValue)) {
            const t = range > 0 ? Math.min(Math.max((value - min) / range, 0), 1) : 1;
            const offset = Math.round(t * 255) * 4;
            imageData.data.set(table.subarray(offset, offset + 4), i * 4);
        }
    }
    context.putImageData(imageData, 0, 0);
    return canvas.toDataURL();
}
