import { isNotDefined } from '@togglecorp/fujs';
import { maxSafe, minSafe, splitList } from '#utils/common';
import type { UnsafeNumberList } from '#utils/common';

export interface Point {
    x: number;
    y: number;
}

export interface Bounds {
    min: number;
    max: number;
}

type Scale = 'linear' | 'exponential' | 'log10' | 'sqrt' | 'cbrt';
// TODO: Add test
function scaleNormalizedValue(normalizedValue: number, type: Scale) {
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
    scale: Scale = 'linear',
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
export function getBounds(numList: UnsafeNumberList, zeroMin = false) {
    if (!numList || numList.length === 0) {
        return {
            min: 0,
            max: 0,
        };
    }

    return {
        min: zeroMin ? 0 : minSafe(numList) ?? 0,
        max: maxSafe(numList) ?? 0,

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

    while (currentDate.getTime() < targetDate.getTime()) {
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

    const targetDate = new Date(endDate);
    targetDate.setDate(1);

    const dates = [];

    while (currentDate.getTime() <= targetDate.getTime()) {
        dates.push(new Date(currentDate));
        currentDate.setMonth(currentDate.getMonth() + 1);
        currentDate.setHours(0, 0, 0, 0);
    }

    return dates;
}

// TODO: Add test
export function getPathData(pointList: Point[] | undefined) {
    if (!pointList || pointList.length < 2) {
        return undefined;
    }

    return pointList.map((point, i) => {
        if (i === 0) {
            return `M${point.x} ${point.y}`;
        }

        return `L${point.x} ${point.y}`;
    }).join(' ');
}

interface UnsafePoint {
    x: number | undefined;
    y: number | undefined;
}

function isUnsafePoint(point: Point | UnsafePoint): point is UnsafePoint {
    return isNotDefined(point.x) || isNotDefined(point.y);
}

// TODO: Add test
export function getDiscretePathDataList(pointList: UnsafePoint[] | undefined) {
    if (isNotDefined(pointList)) {
        return undefined;
    }

    const splittedList = splitList<UnsafePoint, Point>(
        pointList,
        isUnsafePoint,
    );

    const discretePaths = splittedList.map(
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
