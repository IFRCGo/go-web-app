import {
    useEffect,
    useMemo,
    useRef,
} from 'react';
import { isDefined, listToMap, compareNumber } from '@togglecorp/fujs';

import { getBounds, getScaleFunction } from '#utils/chart';
import { formatNumber } from '#utils/common';

import useSizeTracking from '#hooks/useSizeTracking';

type Key = string | number;

const X_AXIS_HEIGHT = 24;
const Y_AXIS_WIDTH = 32;
const CHART_PADDING = 16;

type ChartMargin = {
    left: number;
    top: number;
    right: number;
    bottom: number;
}

type ChartOptions<T> = {
    keySelector: (datum: T, index: number) => Key;
    xValueSelector: (datum: T, index: number) => number;
    yValueSelector: (datum: T, index: number) => number | undefined;
    xAxisHeight?: number;
    yAxisWidth?: number;
    maxYValue?: number;
    chartPadding?: number;
    xAxisLabelFormatter?: (
        datum: T,
        size: { width: number; height: number },
        index: number,
    ) => React.ReactNode;
}

function useChartData<T>(
    data: Array<T>,
    containerRef: React.RefObject<HTMLElement>,
    options: ChartOptions<T>,
) {
    const optionsRef = useRef(options);
    const chartBounds = useSizeTracking(containerRef);

    useEffect(
        () => {
            optionsRef.current = options;
        },
        [options],
    );

    const chartData = useMemo(
        () => {
            const {
                keySelector,
                xValueSelector,
                yValueSelector,
                xAxisHeight = X_AXIS_HEIGHT,
                yAxisWidth = Y_AXIS_WIDTH,
                chartPadding = CHART_PADDING,
                xAxisLabelFormatter,
                maxYValue,
            } = optionsRef.current;

            const chartMargin: ChartMargin = {
                left: yAxisWidth + chartPadding,
                top: chartPadding,
                right: chartPadding,
                bottom: xAxisHeight + chartPadding,
            };

            const dataByKey = listToMap(
                data,
                keySelector,
            );

            // NOTE: sorting the x axis value
            const dataPoints = data.map(
                (datum, i) => ({
                    xValue: xValueSelector(datum, i),
                    yValue: yValueSelector(datum, i),
                    key: keySelector(datum, i),
                }),
            ).sort((foo, bar) => compareNumber(foo.xValue, bar.xValue));

            const xValues = dataPoints.map((datum) => datum.xValue);
            const yValues = dataPoints.map((datum) => datum.yValue);

            const xScale = getScaleFunction(
                getBounds(xValues),
                { min: 0, max: chartBounds.width },
                { start: chartMargin.left, end: chartMargin.right },
            );

            const yDataBounds = isDefined(maxYValue)
                ? { min: 0, max: maxYValue }
                : getBounds(yValues, { min: 0, max: Infinity });
            const yScale = getScaleFunction(
                yDataBounds,
                { min: 0, max: chartBounds.height },
                { start: chartMargin.top, end: chartMargin.bottom },
                true,
            );

            const points = dataPoints.map(
                (datum) => ({
                    ...datum,
                    x: xScale(datum.xValue),
                    y: isDefined(datum.yValue) ? yScale(datum.yValue) : undefined,
                }),
            );

            const numYAxisPoints = 6;
            const diff = yDataBounds.max / (numYAxisPoints - 1);
            const yAxisTicks = yDataBounds.max === 0
                ? []
                : Array.from(Array(numYAxisPoints).keys()).map(
                    (key) => {
                        const value = diff * key;
                        return {
                            y: yScale(value),
                            label: formatNumber(value, { compact: true, maximumFractionDigits: 0 }) ?? '',
                        };
                    },
                );

            const xAxisTickWidth = Math.max(
                (chartBounds.width - chartMargin.right - chartMargin.left)
                / points.length,
                0,
            );

            const xAxisTicks = points.map(
                (point, i) => ({
                    key: point.key,
                    x: point.x,
                    label: xAxisLabelFormatter
                        ? xAxisLabelFormatter(
                            dataByKey[point.key],
                            { width: xAxisTickWidth, height: xAxisHeight },
                            i,
                        ) : point.xValue,
                }),
            ).filter(isDefined);

            return {
                points,
                xAxisTicks,
                yAxisTicks,
                chartMargin,
                innerOffset: chartPadding,
                // xAxisTickSelector: (axisPoint: typeof xAxisTicks[number]) => axisPoint.x,
                // yAxisTickSelector: (axisPoint: typeof yAxisTicks[number]) => axisPoint.y,
            };
        },
        [data, chartBounds],
    );

    return {
        chartData,
        chartBounds,
    };
}

export default useChartData;
