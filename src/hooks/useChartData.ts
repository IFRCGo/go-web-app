import { useMemo } from 'react';
import { isDefined } from '@togglecorp/fujs';

import {
    type Bounds,
    type Rect,
    getBounds,
    getIntervals,
    getScaleFunction,
    ChartScale,
} from '#utils/chart';
import { formatNumber } from '#utils/common';

import useSizeTracking from '#hooks/useSizeTracking';

type Key = string | number;

type CategoricalOptions<DATUM> = {
    type: 'categorical',
    xAxisLabelSelector: (d: DATUM) => React.ReactNode,
    numXAxisTicks?: never;
}

type NumericOptions = {
    type: 'numeric';
    xAxisLabelSelector: (d: number) => React.ReactNode;
    numXAxisTicks?: number;
}

type TemporalOptions = {
    type: 'temporal',
    xAxisLabelSelector: (d: number) => React.ReactNode,
    numXAxisTicks?: number;
}

interface BaseChartOptions<DATUM> {
    containerRef: React.RefObject<HTMLElement>;
    chartOffset: Rect;
    chartMargin: Rect;
    chartPadding: Rect;
    keySelector: (d: DATUM, index: number) => Key;
    xValueSelector: (d: DATUM, index: number) => number;
    yValueSelector: (d: DATUM, index: number) => number;
    yAxisLabelSelector?: (value: number, index: number) => React.ReactNode;
    yAxisScale?: ChartScale;
    xDomain?: Bounds;
    yDomain?: Bounds;
    numYAxisTicks?: number;
    yAxisStartsFromZero?: boolean;
}

export type ChartOptions<DATUM> = BaseChartOptions<DATUM> & (
    CategoricalOptions<DATUM> | NumericOptions | TemporalOptions
);

function useChartData<DATUM>(
    data: DATUM[] | undefined | null,
    options: ChartOptions<DATUM>,
) {
    const {
        type,
        xAxisLabelSelector,
        yAxisLabelSelector,
        keySelector,
        xValueSelector,
        yValueSelector,
        containerRef,
        chartOffset,
        chartMargin,
        chartPadding,
        xDomain,
        yDomain,
        numXAxisTicks = 12,
        numYAxisTicks = 6,
        yAxisScale,
        yAxisStartsFromZero,
    } = options;

    const chartSize = useSizeTracking(containerRef);

    const xValues = useMemo(
        () => data?.map(xValueSelector) ?? [],
        [data, xValueSelector],
    );
    const yValues = useMemo(
        () => data?.map(yValueSelector) ?? [],
        [data, yValueSelector],
    );

    const xDataBounds = useMemo(
        () => xDomain ?? getBounds(xValues),
        [xValues, xDomain],
    );
    const yDataBounds = useMemo(
        () => {
            if (isDefined(yDomain)) {
                return yDomain;
            }

            const bounds = getBounds(yValues);

            if (!yAxisStartsFromZero) {
                return bounds;
            }

            return {
                ...bounds,
                min: 0,
            };
        },
        [yValues, yDomain, yAxisStartsFromZero],
    );

    // eslint-disable-next-line max-len
    const horizontalGap = (chartSize.width - chartOffset.left - chartMargin.left - chartPadding.left) / (numXAxisTicks + 2);

    const xScaleFn = useMemo(
        () => getScaleFunction(
            xDataBounds,
            { min: 0, max: chartSize.width },
            {
                start: chartOffset.left + chartMargin.left + chartPadding.left + horizontalGap / 2,
                end: chartOffset.right + chartMargin.right + chartPadding.right + horizontalGap / 2,
            },
        ),
        [xDataBounds, chartOffset, chartMargin, chartSize, chartPadding, horizontalGap],
    );

    const yScaleFn = useMemo(
        () => getScaleFunction(
            yDataBounds,
            { min: 0, max: chartSize.height },
            {
                start: chartOffset.top + chartMargin.top + chartPadding.top,
                end: chartOffset.bottom + chartMargin.bottom + chartPadding.bottom,
            },
            true,
            yAxisScale,
        ),
        [yDataBounds, chartOffset, chartMargin, chartSize, chartPadding, yAxisScale],
    );

    const dataPoints = useMemo(
        () => data?.map(
            (datum, i) => ({
                originalData: datum,
                key: keySelector(datum, i),
                x: xScaleFn(xValues[i]),
                y: yScaleFn(yValues[i]),
            }),
        ) ?? [],
        [data, keySelector, xScaleFn, yScaleFn, xValues, yValues],
    );

    const yAxisTicks = useMemo(
        () => getIntervals(
            yDataBounds,
            numYAxisTicks,
        ).map((tick, i) => ({
            y: yScaleFn(tick),
            label: yAxisLabelSelector
                ? yAxisLabelSelector(tick, i)
                : formatNumber(tick, { compact: true, maximumFractionDigits: 0 }) ?? '',
        })),
        [yDataBounds, yScaleFn, numYAxisTicks, yAxisLabelSelector],
    );

    const xAxisTicks = useMemo(
        () => {
            if (type === 'numeric') {
                const intervals = getIntervals(
                    xDataBounds,
                    numXAxisTicks,
                );

                return intervals.map(
                    (tick) => ({
                        key: tick,
                        x: xScaleFn(tick),
                        label: xAxisLabelSelector(tick),
                    }),
                );
            }

            if (type === 'temporal') {
                const intervals = getIntervals(
                    xDataBounds,
                    numXAxisTicks,
                );

                return intervals.map(
                    (tick) => {
                        const timestamp = Math.round(tick);

                        return {
                            key: tick,
                            x: xScaleFn(timestamp),
                            label: xAxisLabelSelector(timestamp),
                        };
                    },
                );
            }

            return dataPoints.map(
                (dataPoint) => ({
                    key: dataPoint.key,
                    x: dataPoint.x,
                    label: xAxisLabelSelector(dataPoint.originalData),
                }),
            );
        },
        [dataPoints, xAxisLabelSelector, type, xDataBounds, xScaleFn, numXAxisTicks],
    );

    return {
        dataPoints,
        xAxisTicks,
        yAxisTicks,
        chartSize,
        yScaleFn,
        xScaleFn,
    };
}

export default useChartData;
