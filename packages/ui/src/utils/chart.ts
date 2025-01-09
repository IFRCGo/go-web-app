import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

import {
    maxSafe,
    minSafe,
    splitList,
    type UnsafeNumberList,
} from '#utils/common';

export type ChartScale = 'linear' | 'exponential' | 'log10' | 'sqrt' | 'cbrt';

export interface Size {
    width: number;
    height: number;
}

export interface Rect {
    top: number;
    right: number;
    bottom: number;
    left: number;
}

export interface Point {
    x: number;
    y: number;
}

export interface Bounds {
    min: number;
    max: number;
}

interface UnsafePoint {
    x: number | undefined;
    y: number | undefined;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Func = (...args: any[]) => any;
export function isCallable<T, X extends Func>(value: T | X): value is X {
    return typeof value === 'function';
}

// TODO: Add test
export function getBounds(numList: UnsafeNumberList, bounds?: Bounds) {
    if (isNotDefined(numList) || numList.length === 0) {
        const min = bounds?.min ?? 0;
        const max = bounds?.max ?? (min + 1);

        return {
            min,
            max,
        };
    }

    let newList = [...numList];
    if (isDefined(bounds)) {
        newList = [...numList, bounds.min, bounds.max];
    }

    const min = minSafe(newList) ?? 0;
    const max = maxSafe(newList) ?? (min + 5);

    return {
        min,
        max: max === min ? min + 5 : max,
    };
}

// TODO: Add test
export function getPathData(pointList: undefined): undefined;
export function getPathData(pointList: Point[]): string;
export function getPathData(pointList: Point[] | undefined) {
    if (isNotDefined(pointList) || pointList.length < 2) {
        return undefined;
    }

    return pointList.map((point, i) => {
        if (i === 0) {
            return `M${point.x} ${point.y}`;
        }

        return `L${point.x} ${point.y}`;
    }).join(' ');
}

// TODO: Add test
function scaleNormalizedValue(normalizedValue: number, type: ChartScale) {
    if (type === 'exponential') {
        return Math.exp(normalizedValue) / Math.exp(1);
    }

    if (type === 'log10') {
        if (normalizedValue === 0) {
            return 0;
        }

        return normalizedValue * Math.log10(normalizedValue * 10);
    }

    if (type === 'sqrt') {
        return Math.sqrt(normalizedValue);
    }

    if (type === 'cbrt') {
        return Math.cbrt(normalizedValue);
    }

    return normalizedValue;
}

// TODO: Update test
export function getScaleFunction(
    domain: Bounds,
    range: Bounds,
    offset: {
        start: number,
        end: number,
    },
    inverted = false,
    scale: ChartScale = 'linear',
) {
    const rangeSize = (range.max - range.min) - (offset.start + offset.end);
    const domainSize = domain.max - domain.min;

    return (value: number) => {
        if (domainSize === 0) {
            return domain.min;
        }

        const normalizedValue = (value - domain.min) / domainSize;
        const scaledValue = scaleNormalizedValue(normalizedValue, scale);

        if (inverted) {
            return (rangeSize + offset.start) - (rangeSize * scaledValue);
        }

        return offset.start + rangeSize * scaledValue;
    };
}

// TODO: Add test
export function getDatesSeparatedByYear(startDate: Date, endDate: Date) {
    const currentDate = new Date(startDate);
    currentDate.setDate(1);
    currentDate.setHours(0, 0, 0, 0);

    const targetDate = new Date(endDate);
    targetDate.setDate(1);
    targetDate.setHours(0, 0, 0, 0);

    const dates = [];

    while (currentDate.getTime() <= targetDate.getTime()) {
        dates.push(new Date(currentDate));
        currentDate.setFullYear(currentDate.getFullYear() + 1);
        currentDate.setHours(0, 0, 0, 0);
    }

    return dates;
}

// TODO: Add test
export function getDatesSeparatedByMonths(startDate: Date, endDate: Date) {
    const currentDate = new Date(startDate);
    currentDate.setDate(1);
    currentDate.setHours(0, 0, 0, 0);

    const targetDate = new Date(endDate);
    targetDate.setDate(1);
    targetDate.setHours(0, 0, 0, 0);

    const dates = [];

    while (currentDate.getTime() <= targetDate.getTime()) {
        dates.push(new Date(currentDate));
        currentDate.setMonth(currentDate.getMonth() + 1);
        currentDate.setHours(0, 0, 0, 0);
    }

    return dates;
}

function isUnsafePoint(point: Point | UnsafePoint): point is UnsafePoint {
    return isNotDefined(point.x) || isNotDefined(point.y);
}

// TODO: Add test
export function getDiscretePathDataList(pointList: undefined): undefined
export function getDiscretePathDataList(pointList: UnsafePoint[]): string[]
export function getDiscretePathDataList(pointList: UnsafePoint[] | undefined) {
    if (isNotDefined(pointList)) {
        return undefined;
    }

    const separatedList = splitList<UnsafePoint, Point>(
        pointList,
        isUnsafePoint,
    );

    const discretePaths = separatedList.map(
        (pointListSplit) => getPathData(pointListSplit),
    );

    return discretePaths;
}

// TODO: Add test
export function getPrettyBreakableBounds(initialBounds: Bounds, numBreaks = 5): Bounds {
    const diff = initialBounds.max - initialBounds.min;
    const potentialGap = Math.ceil(diff / numBreaks);

    const newMax = initialBounds.min + potentialGap * numBreaks;

    return {
        ...initialBounds,
        max: newMax,
    };
}

// COLORS

function hexToRgb(hex: string) {
    return {
        r: +`0x${hex[1]}${hex[2]}`,
        g: +`0x${hex[3]}${hex[4]}`,
        b: +`0x${hex[5]}${hex[6]}`,
    };
}

function hex255(n: number) {
    return n.toString(16).padStart(2, '0');
}

function rgbToHex(rgb: { r: number, g: number, b: number }) {
    const { r, g, b } = rgb;

    return `#${hex255(r)}${hex255(g)}${hex255(b)}`;
}

function hslToRgb(hsl: { h: number, s: number, l: number }) {
    const { h, s, l } = hsl;

    if (h === 0) {
        const v = Math.round(l * 255);
        return {
            r: v,
            g: v,
            b: v,
        };
    }

    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;

    const lookUps = [
        [c, x, 0],
        [x, c, 0],
        [0, c, x],
        [0, x, c],
        [x, 0, c],
        [c, 0, x],
    ];

    const i = Math.ceil(h / 60) - 1;
    const [rp, gp, bp] = lookUps[i];

    return {
        r: Math.round((rp + m) * 255),
        g: Math.round((gp + m) * 255),
        b: Math.round((bp + m) * 255),
    };
}

function getHue(r: number, g: number, b: number, max: number, diff: number) {
    if (r === max) {
        const hue = 60 * ((g - b) / diff);
        if (hue > 0) {
            return hue;
        }

        return 360 + hue;
    }

    if (g === max) {
        return 60 * (2 + (b - r) / diff);
    }

    if (b === max) {
        return 60 * (4 + (r - g) / diff);
    }

    return 0;
}

function hexToHsl(hex: string) {
    const c = hexToRgb(hex);
    const r = c.r / 255;
    const g = c.g / 255;
    const b = c.b / 255;

    const min = Math.min(r, g, b);
    const max = Math.max(r, g, b);
    const diff = max - min;
    const sum = max + min;
    const l = sum / 2;

    if (diff === 0) {
        return { h: 0, s: 0, l };
    }

    const s = diff / Math.abs(1 - (2 * l - 1));
    const h = getHue(r, g, b, max, diff);
    return { h, s, l };
}

function interpolate255(a: number, b: number, factor: number) {
    return Math.min(Math.round(a + (b - a) * factor), 255);
}

function interpolateHexColor(ha: string, hb: string, factor: number) {
    const ca = hexToRgb(ha);
    const cb = hexToRgb(hb);

    const r = hex255(interpolate255(ca.r, cb.r, factor));
    const g = hex255(interpolate255(ca.g, cb.g, factor));
    const b = hex255(interpolate255(ca.b, cb.b, factor));

    return `#${r}${g}${b}`;
}

type Callable<T> = T | ((t: T) => T);
function resolveCallable<T>(callable: Callable<T>, arg: T) {
    if (!isCallable(callable)) {
        return callable;
    }

    return callable(arg);
}

export function modifyHexSL(hex: string, s?: Callable<number>, l?: Callable<number>) {
    if (isNotDefined(s) && isNotDefined(l)) {
        return hex;
    }

    const hsl = hexToHsl(hex);
    const rgb = hslToRgb({
        h: hsl.h,
        s: Math.min(hsl.s * resolveCallable(s ?? 1, hsl.s), 1),
        l: Math.min(hsl.l * resolveCallable(l ?? 1, hsl.l), 1),
    });

    return rgbToHex(rgb);
}

export function getColorScaleFunction(
    domain: {
        min: number;
        max: number;
    },
    rangeValues: string[],
) {
    const domainSize = domain.max - domain.min;

    return (value: number, s?: Callable<number>, l?: Callable<number>) => {
        const normalizedValue = (value - domain.min) / domainSize;
        const location = (rangeValues.length - 1) * normalizedValue;
        const startIndex = Math.floor(location);
        const endIndex = Math.ceil(location);

        // exact match
        if (startIndex === endIndex) {
            return modifyHexSL(rangeValues[startIndex], s, l);
        }

        const locallyNormalizedValue = (location - startIndex) / (endIndex - startIndex);
        const color = interpolateHexColor(
            rangeValues[startIndex],
            rangeValues[endIndex],
            locallyNormalizedValue,
        );

        return modifyHexSL(color, s, l);
    };
}

export function getIntervals(bounds: Bounds, numPoints: number) {
    if (isNotDefined(numPoints) || numPoints === 0) {
        return [];
    }

    if (numPoints === 1) {
        return [bounds.min];
    }

    const diff = (bounds.max - bounds.min) / (numPoints - 1);
    const ticks = bounds.max === 0
        ? []
        : Array.from(Array(numPoints).keys()).map(
            (key) => {
                const tick = bounds.min + diff * key;
                return tick;
            },
        );

    return ticks;
}

export function getEvenlyDistributedExcess(excess: number) {
    return {
        left: Math.floor(excess / 2),
        right: Math.ceil(excess / 2),
    };
}

export function getEvenDistribution(min: number, max: number, distribution: number) {
    const diff = max - min;

    if (diff === 0) {
        return {
            left: Math.floor(distribution / 2),
            right: Math.ceil(distribution / 2),
        };
    }

    const remainder = diff % distribution;

    const additional = remainder === 0
        ? 0
        : distribution - remainder;

    return getEvenlyDistributedExcess(additional);
}

export function getEvenlyDistributableBounds(bounds: Bounds, numBreaks: number): Bounds {
    const { left, right } = getEvenDistribution(
        bounds.min,
        bounds.max,
        numBreaks,
    );

    return {
        min: bounds.min - left,
        max: bounds.max + right,
    };
}

export function getChartDimensions({
    chartMargin,
    chartPadding,
    xAxisHeight,
    yAxisWidth,
    chartSize,
    numXAxisTicks,
}: {
    chartMargin: Rect;
    chartPadding: Rect;
    xAxisHeight: number;
    yAxisWidth: number;
    chartSize: Size;
    numXAxisTicks: number;
}) {
    const initialLeftOffset = chartMargin.left + yAxisWidth + chartPadding.left;
    const initialRightOffset = chartMargin.right + chartPadding.right;

    const topOffset = chartMargin.top + chartPadding.top;
    const bottomOffset = chartMargin.bottom + chartPadding.bottom + xAxisHeight;

    const renderableDataAreaWidth = chartSize.width - initialLeftOffset - initialRightOffset;
    const additionalHorizontalOffset = renderableDataAreaWidth / (numXAxisTicks + 1);

    const dataAreaWidth = Math.max(
        additionalHorizontalOffset * (numXAxisTicks - 1),
        0,
    );

    const leftOffset = initialLeftOffset + additionalHorizontalOffset;
    const rightOffset = initialRightOffset + additionalHorizontalOffset;

    const dataAreaHeight = Math.max(
        chartSize.height - topOffset - bottomOffset,
        0,
    );

    return {
        dataAreaSize: {
            width: dataAreaWidth,
            height: dataAreaHeight,
        },
        dataAreaOffset: {
            top: topOffset,
            right: rightOffset,
            bottom: bottomOffset,
            left: leftOffset,
        },
    };
}
