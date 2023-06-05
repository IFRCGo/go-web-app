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

export function getPointScaleFunction(
    domain: {
        x: Boundary,
        y: Boundary,
    },
    range: {
        x: Boundary,
        y: Boundary,
    },
    margin: {
        left: number,
        top: number,
        right: number,
        bottom: number,
    },
) {
    const xRangeWidth = (range.x.max - range.x.min) - (margin.right + margin.left);
    const yRangeWidth = (range.y.max - range.y.min) - (margin.top + margin.bottom);

    const xDomainWidth = domain.x.max - domain.x.min;
    const yDomainWidth = domain.y.max - domain.y.min;

    return (point: Point) => {
        const normalizedX = (point.x - domain.x.min) / xDomainWidth;
        const normalizedY = (point.y - domain.y.min) / yDomainWidth;

        return {
            x: margin.left + xRangeWidth * normalizedX,
            y: (yRangeWidth + margin.top)
                - (yRangeWidth * normalizedY),
        };
    };
}

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

export function getPointBoundaries(pointList: Point[], forceZeroMinY = false) {
    const xValues = pointList.map((point) => point.x);
    const yValues = pointList.map((point) => point.y);

    return {
        x: {
            min: Math.min(...xValues),
            max: Math.max(...xValues),
        },
        y: {
            min: forceZeroMinY ? 0 : Math.min(...yValues),
            max: Math.max(...yValues),
        },
    };
}

export function getContainerBounds(size: {
    width: number,
    height: number,
}) {
    return {
        x: {
            min: 0,
            max: size.width,
        },
        y: {
            min: 0,
            max: size.height,
        },
    };
}

export function getDatesSeparatedByYear(startDate: Date, endDate: Date) {
    const currentDate = new Date(startDate);
    currentDate.setDate(1);

    const targetDate = new Date(endDate);
    targetDate.setDate(1);

    const dates = [];

    while (currentDate.getTime() < targetDate.getTime()) {
        dates.push(new Date(currentDate));
        currentDate.setFullYear(currentDate.getFullYear() + 1);
    }

    return dates;
}

export function getDatesSeparatedByMonths(startDate: Date, endDate: Date) {
    const currentDate = new Date(startDate);
    currentDate.setDate(1);

    const targetDate = new Date(endDate);
    targetDate.setDate(1);

    const dates = [];

    while (currentDate.getTime() <= targetDate.getTime()) {
        dates.push(new Date(currentDate));
        currentDate.setMonth(currentDate.getMonth() + 1);
    }

    return dates;
}

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
