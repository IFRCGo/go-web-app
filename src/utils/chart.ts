export interface Point {
    x: number;
    y: number;
}

export interface Boundary {
    min: number;
    max: number;
}

export function getScaleFunction(
    domain: Boundary,
    range: Boundary,
    offset: {
        start: number,
        end: number,
    },
    inverted = false,
) {
    const rangeSize = (range.max - range.min) - (offset.start + offset.end);
    const domainSize = domain.max - domain.min;

    return (value: number) => {
        const normalizedValue = (value - domain.min) / domainSize;

        if (inverted) {
            return (rangeSize + offset.start) - (rangeSize * normalizedValue);
        }

        return offset.start + rangeSize * normalizedValue;
    };
}

// TODO: Add test
export function getBounds(numList: number[]) {
    if (!numList || numList.length === 0) {
        return {
            min: 0,
            max: 0,
        };
    }

    return {
        min: Math.min(...numList),
        max: Math.max(...numList),
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
