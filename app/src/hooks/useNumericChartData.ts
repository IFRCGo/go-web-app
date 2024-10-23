import {
    createRef,
    useCallback,
    useMemo,
    useState,
} from 'react';
import { useSizeTracking } from '@ifrc-go/ui/hooks';
import {
    type Bounds,
    type ChartScale,
    formatNumber,
    getBounds,
    getChartDimensions,
    getEvenDistribution,
    getIntervals,
    getScaleFunction,
    maxSafe,
    minSafe,
    type Rect,
} from '@ifrc-go/ui/utils';
import {
    bound,
    compareNumber,
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

import {
    DEFAULT_X_AXIS_HEIGHT,
    DEFAULT_Y_AXIS_WIDTH,
    defaultChartMargin,
    defaultChartPadding,
    NUM_X_AXIS_TICKS_MAX,
    NUM_X_AXIS_TICKS_MIN,
} from '#utils/constants';

interface Options<DATUM> {
    keySelector: (d: DATUM, index: number) => number | string;
    xValueSelector: (d: DATUM, index: number) => number | undefined | null;
    yValueSelector: (d: DATUM, index: number) => number | undefined | null;
    colorSelector?: (d: DATUM, index: number) => string;
    xAxisHeight?: number;
    yAxisWidth?: number;
    chartMargin?: Rect;
    chartPadding?: Rect;
    numXAxisTicks?: 'auto' | number;
    numYAxisTicks?: number;
    yAxisTickLabelSelector?: (value: number, index: number) => React.ReactNode;
    xAxisTickLabelSelector?: (value: number, index: number) => React.ReactNode;
    xDomain?: Bounds;
    yDomain?: Bounds;
    yValueStartsFromZero?: boolean;
    yScale?: ChartScale;
}

function useNumericChartData<DATUM>(data: DATUM[] | null | undefined, options: Options<DATUM>) {
    const {
        keySelector,
        xValueSelector,
        yValueSelector,
        colorSelector,
        chartMargin = defaultChartMargin,
        chartPadding = defaultChartPadding,
        numXAxisTicks: numXAxisTicksFromProps = 'auto',
        numYAxisTicks = 6,
        xAxisTickLabelSelector,
        yAxisTickLabelSelector,
        yAxisWidth = DEFAULT_Y_AXIS_WIDTH,
        xAxisHeight = DEFAULT_X_AXIS_HEIGHT,
        xDomain,
        yDomain,
        yValueStartsFromZero,
        yScale = 'linear',
    } = options;

    const [containerRef, setContainerRef] = useState<React.RefObject<HTMLDivElement>>(
        createRef,
    );

    const handleRefChange = useCallback(
        (element: HTMLDivElement) => {
            setContainerRef({ current: element });
        },
        [],
    );
    const chartSize = useSizeTracking(containerRef);

    const chartData = useMemo(
        () => data?.map(
            (datum, i) => {
                const key = keySelector(datum, i);
                const color = isDefined(colorSelector) ? colorSelector(datum, i) : undefined;
                const xValue = xValueSelector(datum, i);
                const yValue = yValueSelector(datum, i);

                if (isNotDefined(xValue) || isNotDefined(yValue)) {
                    return undefined;
                }

                return {
                    key,
                    color,
                    originalData: datum,
                    xValue,
                    yValue,
                };
            },
        ).filter(isDefined).sort(
            (a, b) => compareNumber(a.xValue, b.xValue),
        ) ?? [],
        [data, keySelector, xValueSelector, yValueSelector, colorSelector],
    );

    const dataDomain = useMemo(
        () => {
            if (isDefined(xDomain)) {
                return xDomain;
            }

            const xValueList = chartData.map(({ xValue }) => xValue);
            const min = minSafe(xValueList);
            const max = maxSafe(xValueList);

            if (isNotDefined(min) || isNotDefined(max)) {
                return undefined;
            }

            return {
                min,
                max,
            };
        },
        [chartData, xDomain],
    );

    const numXAxisTicks = useMemo(
        () => {
            if (numXAxisTicksFromProps !== 'auto') {
                return bound(numXAxisTicksFromProps, NUM_X_AXIS_TICKS_MIN, NUM_X_AXIS_TICKS_MAX);
            }

            if (isNotDefined(dataDomain)) {
                return NUM_X_AXIS_TICKS_MIN;
            }

            const currentDiff = dataDomain.max - dataDomain.min;

            if (currentDiff <= NUM_X_AXIS_TICKS_MIN) {
                return NUM_X_AXIS_TICKS_MIN;
            }

            const tickRange = NUM_X_AXIS_TICKS_MAX - NUM_X_AXIS_TICKS_MIN;
            const numTicksList = Array.from(Array(tickRange + 1).keys()).map(
                (key) => NUM_X_AXIS_TICKS_MIN + key,
            );

            const potentialTicks = numTicksList.reverse().map(
                (numTicks) => {
                    const tickDiff = Math.ceil(currentDiff / numTicks);
                    const offset = numTicks * tickDiff - currentDiff;

                    return {
                        numTicks,
                        offset,
                        rank: numTicks / (offset + 5),
                    };
                },
            );

            const tickWithLowestOffset = [...potentialTicks].sort(
                (a, b) => compareNumber(a.rank, b.rank, -1),
            )[0];

            return bound(
                tickWithLowestOffset.numTicks,
                NUM_X_AXIS_TICKS_MIN,
                NUM_X_AXIS_TICKS_MAX,
            );
        },
        [numXAxisTicksFromProps, dataDomain],
    );

    const chartDomain = useMemo(
        () => {
            if (isDefined(xDomain)) {
                return xDomain;
            }

            if (isNotDefined(dataDomain)) {
                return {
                    min: 0,
                    max: numXAxisTicks - 1,
                };
            }

            const { left, right } = getEvenDistribution(
                dataDomain.min,
                dataDomain.max,
                numXAxisTicks,
            );

            return {
                min: dataDomain.min - left,
                max: dataDomain.max + right,
            };
        },
        [dataDomain, numXAxisTicks, xDomain],
    );

    const {
        dataAreaSize,
        dataAreaOffset,
    } = useMemo(
        () => getChartDimensions({
            chartSize,
            chartMargin,
            chartPadding,
            xAxisHeight,
            yAxisWidth,
            numXAxisTicks,
        }),
        [chartSize, chartMargin, chartPadding, xAxisHeight, yAxisWidth, numXAxisTicks],
    );

    const xAxisDomain = chartDomain;
    const xScaleFn = useMemo(
        () => getScaleFunction(
            xAxisDomain,
            { min: 0, max: chartSize.width },
            { start: dataAreaOffset.left, end: dataAreaOffset.right },
        ),
        [dataAreaOffset, xAxisDomain, chartSize.width],
    );

    const yAxisDomain = useMemo(
        () => {
            if (isDefined(yDomain)) {
                return yDomain;
            }

            const yValues = chartData.map(({ yValue }) => yValue);
            const yBounds = getBounds(yValues);

            if (yValueStartsFromZero) {
                return {
                    ...yBounds,
                    min: 0,
                };
            }

            return yBounds;
        },
        [chartData, yDomain, yValueStartsFromZero],
    );

    const yScaleFn = useMemo(
        () => getScaleFunction(
            yAxisDomain,
            { min: 0, max: chartSize.height },
            { start: dataAreaOffset.top, end: dataAreaOffset.bottom },
            true,
            yScale,
        ),
        [yAxisDomain, dataAreaOffset, chartSize.height, yScale],
    );

    const chartPoints = useMemo(
        () => chartData.map(
            (datum) => ({
                ...datum,
                x: xScaleFn(datum.xValue),
                y: yScaleFn(datum.yValue),
            }),
        ),
        [chartData, xScaleFn, yScaleFn],
    );

    const xAxisTicks = useMemo(
        () => {
            const diff = chartDomain.max - chartDomain.min;

            const step = Math.max(Math.ceil(diff / numXAxisTicks), 1);
            const ticks = Array.from(Array(numXAxisTicks).keys()).map(
                (key) => chartDomain.min + key * step,
            );

            return ticks.map((tick, i) => ({
                key: tick,
                x: xScaleFn(tick),
                label: xAxisTickLabelSelector
                    ? xAxisTickLabelSelector(tick, i)
                    : formatNumber(tick, { compact: true }),
            }));
        },
        [
            numXAxisTicks,
            chartDomain.min,
            chartDomain.max,
            xScaleFn,
            xAxisTickLabelSelector,
        ],
    );

    const yAxisTicks = useMemo(
        () => getIntervals(
            yAxisDomain,
            numYAxisTicks,
        ).map((tick, i) => ({
            y: yScaleFn(tick),
            label: yAxisTickLabelSelector
                ? yAxisTickLabelSelector(tick, i)
                : formatNumber(tick, { compact: true }) ?? '',
        })),
        [yAxisDomain, yScaleFn, numYAxisTicks, yAxisTickLabelSelector],
    );

    return useMemo(
        () => ({
            chartPoints,
            xAxisTicks,
            yAxisTicks,
            chartSize,
            xScaleFn,
            yScaleFn,
            dataAreaSize,
            dataAreaOffset,
            xAxisHeight,
            yAxisWidth,
            chartMargin,
            numXAxisTicks,
            containerRef: handleRefChange,
        }),
        [
            chartPoints,
            xAxisTicks,
            yAxisTicks,
            chartSize,
            xScaleFn,
            yScaleFn,
            dataAreaSize,
            dataAreaOffset,
            chartMargin,
            numXAxisTicks,
            xAxisHeight,
            yAxisWidth,
            handleRefChange,
        ],
    );
}

export default useNumericChartData;
