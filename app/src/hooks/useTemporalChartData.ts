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
    type DateLike,
    formatNumber,
    getBounds,
    getChartDimensions,
    getEvenDistribution,
    getIntervals,
    getNumberOfDays,
    getNumberOfMonths,
    getScaleFunction,
    getTemporalDiff,
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

type TemporalResolution = 'year' | 'month' | 'day';

interface CommonOptions<DATUM> {
    keySelector: (d: DATUM, index: number) => number | string;
    xValueSelector: (d: DATUM, index: number) => DateLike | undefined | null;
    yValueSelector: (d: DATUM, index: number) => number | undefined | null;
    xAxisHeight?: number;
    yAxisWidth?: number;
    chartMargin?: Rect;
    chartPadding?: Rect;
    numYAxisTicks?: number;
    yAxisTickLabelSelector?: (value: number, index: number) => React.ReactNode;
    yValueStartsFromZero?: boolean;
    yScale?: ChartScale;
    yDomain?: Bounds;
}

interface NonYearlyChartOptions {
    yearlyChart?: never;
    temporalResolution?: 'auto' | TemporalResolution;
    // NOTE: should be between 3 - 12
    numXAxisTicks?: 'auto' | number;
}

interface YearlyChartOptions {
    yearlyChart: true;
    temporalResolution?: never;
    numXAxisTicks?: never;
}

type Options<DATUM> = CommonOptions<DATUM> & (
    NonYearlyChartOptions | YearlyChartOptions
)

function useTemporalChartData<DATUM>(data: DATUM[] | undefined | null, options: Options<DATUM>) {
    const {
        keySelector,
        xValueSelector,
        yValueSelector,
        temporalResolution: temporalResolutionFromProps = 'auto',
        numXAxisTicks: numXAxisTicksFromProps = 'auto',
        yAxisWidth = DEFAULT_Y_AXIS_WIDTH,
        xAxisHeight = DEFAULT_X_AXIS_HEIGHT,
        chartMargin = defaultChartMargin,
        chartPadding = defaultChartPadding,
        numYAxisTicks = 6,
        yAxisTickLabelSelector,
        yearlyChart = false,
        yValueStartsFromZero,
        yScale = 'linear',
        yDomain,
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
                const xValue = xValueSelector(datum, i);
                const yValue = yValueSelector(datum, i);

                if (isNotDefined(xValue) || isNotDefined(yValue)) {
                    return undefined;
                }

                return {
                    key,
                    originalData: datum,
                    xValue,
                    yValue,
                };
            },
        ).filter(isDefined) ?? [],
        [data, keySelector, xValueSelector, yValueSelector],
    );

    const dataDomain = useMemo(
        () => {
            if (isNotDefined(chartData) || chartData.length === 0) {
                return undefined;
            }

            const timestampList = chartData.map(({ xValue }) => {
                const date = new Date(xValue);

                if (Number.isNaN(date.getTime())) {
                    return undefined;
                }

                return date.getTime();
            }).filter(isDefined);

            const dataMinTimestamp = minSafe(timestampList);
            const dataMaxTimestamp = maxSafe(timestampList);

            if (isNotDefined(dataMinTimestamp) || isNotDefined(dataMaxTimestamp)) {
                return undefined;
            }

            return {
                min: dataMinTimestamp,
                max: dataMaxTimestamp,
            };
        },
        [chartData],
    );

    const dataTemporalDiff = useMemo<Record<TemporalResolution, number> | undefined>(
        () => {
            if (isNotDefined(dataDomain)) {
                return undefined;
            }

            return getTemporalDiff(dataDomain.min, dataDomain.max);
        },
        [dataDomain],
    );

    const temporalResolution = useMemo(
        () => {
            if (yearlyChart) {
                return 'month';
            }

            if (
                temporalResolutionFromProps !== 'auto'
                    && (
                        temporalResolutionFromProps === 'day'
                            || temporalResolutionFromProps === 'month'
                            || temporalResolutionFromProps === 'year'
                    )
            ) {
                return temporalResolutionFromProps;
            }

            // NOTE: revisit
            if (isNotDefined(dataTemporalDiff)) {
                return 'day';
            }

            if (dataTemporalDiff.year > NUM_X_AXIS_TICKS_MIN) {
                return 'year';
            }

            if (dataTemporalDiff.month > NUM_X_AXIS_TICKS_MIN) {
                return 'month';
            }

            return 'day';
        },
        [dataTemporalDiff, temporalResolutionFromProps, yearlyChart],
    );

    const numXAxisTicks = useMemo(
        () => {
            if (yearlyChart) {
                return 12;
            }

            if (numXAxisTicksFromProps !== 'auto') {
                return bound(numXAxisTicksFromProps, NUM_X_AXIS_TICKS_MIN, NUM_X_AXIS_TICKS_MAX);
            }

            if (isNotDefined(dataTemporalDiff)) {
                return NUM_X_AXIS_TICKS_MIN;
            }

            const currentDiff = dataTemporalDiff[temporalResolution] + 2;

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
                        rank: numTicks / (offset + 3),
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
        [numXAxisTicksFromProps, dataTemporalDiff, temporalResolution, yearlyChart],
    );

    const chartDomain = useMemo(
        () => {
            if (yearlyChart) {
                const now = new Date();

                return {
                    min: new Date(now.getFullYear(), 0, 1),
                    max: new Date(now.getFullYear(), 11, 1),
                };
            }

            if (isNotDefined(dataDomain) || isNotDefined(dataTemporalDiff)) {
                const now = new Date();

                if (temporalResolution === 'year') {
                    return {
                        min: new Date(
                            now.getFullYear() - numXAxisTicks,
                            now.getMonth(),
                            now.getDate(),
                        ),
                        max: now,
                    };
                }

                if (temporalResolution === 'month') {
                    now.setDate(1);

                    return {
                        min: new Date(
                            now.getFullYear(),
                            now.getMonth() - numXAxisTicks,
                            now.getDate(),
                        ),
                        max: now,
                    };
                }

                return {
                    min: new Date(
                        now.getFullYear(),
                        now.getMonth(),
                        now.getDate() - numXAxisTicks,
                    ),
                    max: now,
                };
            }

            const minDataDate = new Date(dataDomain.min);
            const maxDataDate = new Date(dataDomain.max);

            if (temporalResolution === 'year') {
                const { left, right } = getEvenDistribution(
                    minDataDate.getFullYear(),
                    maxDataDate.getFullYear(),
                    numXAxisTicks,
                );

                return {
                    min: new Date(minDataDate.getFullYear() - left, 0, 1),
                    max: new Date(maxDataDate.getFullYear() + right, 0, 1),
                };
            }

            if (temporalResolution === 'month') {
                const { left, right } = getEvenDistribution(
                    0,
                    dataTemporalDiff.month,
                    numXAxisTicks,
                );

                return {
                    min: new Date(
                        minDataDate.getFullYear(),
                        minDataDate.getMonth() - left,
                        1,
                    ),
                    max: new Date(
                        maxDataDate.getFullYear(),
                        maxDataDate.getMonth() + right,
                        1,
                    ),
                };
            }

            const { left, right } = getEvenDistribution(
                0,
                getNumberOfDays(minDataDate, maxDataDate),
                numXAxisTicks,
            );

            return {
                min: new Date(
                    minDataDate.getFullYear(),
                    minDataDate.getMonth(),
                    minDataDate.getDate() - left,
                ),
                max: new Date(
                    maxDataDate.getFullYear(),
                    maxDataDate.getMonth(),
                    maxDataDate.getDate() + right,
                ),
            };
        },
        [temporalResolution, dataDomain, numXAxisTicks, yearlyChart, dataTemporalDiff],
    );

    const chartTemporalDiff = useMemo<Record<TemporalResolution, number>>(
        () => getTemporalDiff(chartDomain.min, chartDomain.max),
        [chartDomain],
    );

    const getRelativeX = useCallback(
        (dateLike: DateLike) => {
            const date = new Date(dateLike);
            const monthDiff = getNumberOfMonths(chartDomain.min, date);

            if (temporalResolution === 'year') {
                const yearDiff = date.getFullYear() - chartDomain.min.getFullYear();

                return yearDiff + (monthDiff - yearDiff * 12) / 12;
            }

            if (temporalResolution === 'month') {
                return monthDiff;
            }

            return getNumberOfDays(chartDomain.min, date);
        },
        [chartDomain, temporalResolution],
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

    const xAxisDomain = useMemo(
        () => {
            if (yearlyChart) {
                return {
                    min: 0,
                    max: 11,
                };
            }

            if (isNotDefined(dataTemporalDiff)) {
                return {
                    min: 0,
                    max: numXAxisTicks,
                };
            }

            if (temporalResolution === 'year') {
                return {
                    min: 0,
                    max: chartDomain.max.getFullYear() - chartDomain.min.getFullYear(),
                };
            }

            if (temporalResolution === 'month') {
                return {
                    min: 0,
                    max: getNumberOfMonths(chartDomain.min, chartDomain.max),
                };
            }

            return {
                min: 0,
                max: getNumberOfDays(chartDomain.min, chartDomain.max),
            };
        },
        [chartDomain, temporalResolution, yearlyChart, dataTemporalDiff, numXAxisTicks],
    );

    const xScaleFnRelative = useMemo(
        () => getScaleFunction(
            xAxisDomain,
            { min: 0, max: chartSize.width },
            { start: dataAreaOffset.left, end: dataAreaOffset.right },
        ),
        [dataAreaOffset, xAxisDomain, chartSize.width],
    );

    const xScaleFn = useCallback(
        (value: DateLike) => {
            if (yearlyChart) {
                const now = new Date();
                const date = new Date(value);
                return xScaleFnRelative(
                    getRelativeX(new Date(now.getFullYear(), date.getMonth(), 1)),
                );
            }

            return xScaleFnRelative(getRelativeX(value));
        },
        [xScaleFnRelative, getRelativeX, yearlyChart],
    );

    const yAxisDomain = useMemo(
        () => {
            if (isDefined(yDomain)) {
                return yDomain;
            }

            const yValues = chartData.map(({ yValue }) => yValue);
            const yBounds = getBounds(yValues);

            if (yValueStartsFromZero) {
                const { left, right } = getEvenDistribution(
                    0,
                    yBounds.max,
                    numYAxisTicks,
                );

                return {
                    min: 0,
                    max: yBounds.max + left + right,
                };
            }

            const { left, right } = getEvenDistribution(
                yBounds.min,
                yBounds.max,
                numYAxisTicks,
            );

            return {
                min: yBounds.min - left,
                max: yBounds.max + right,
            };
        },
        [chartData, yValueStartsFromZero, yDomain, numYAxisTicks],
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
            const diff = yearlyChart ? 12 : chartTemporalDiff[temporalResolution];

            const step = Math.max(Math.ceil(diff / numXAxisTicks), 1);
            const ticks = Array.from(Array(numXAxisTicks).keys()).map(
                (key) => key * step,
            );

            if (yearlyChart) {
                const currentYear = new Date().getFullYear();

                return ticks.map((tick) => {
                    const date = new Date(
                        currentYear,
                        tick,
                        1,
                    );

                    return {
                        key: tick,
                        x: xScaleFnRelative(tick),
                        label: date.toLocaleString(
                            'default',
                            { month: 'short' },
                        ),
                    };
                });
            }

            if (temporalResolution === 'year') {
                return ticks.map((tick) => ({
                    key: tick,
                    x: xScaleFnRelative(tick),
                    label: chartDomain.min.getFullYear() + tick,
                }));
            }

            if (temporalResolution === 'month') {
                return ticks.map((tick) => {
                    const date = new Date(
                        chartDomain.min.getFullYear(),
                        chartDomain.min.getMonth() + tick,
                        1,
                    );

                    return {
                        key: tick,
                        x: xScaleFnRelative(tick),
                        label: date.toLocaleString(
                            'default',
                            {
                                year: 'numeric',
                                month: 'short',
                            },
                        ),
                    };
                });
            }

            return ticks.map((tick) => {
                const date = new Date(
                    chartDomain.min.getFullYear(),
                    chartDomain.min.getMonth(),
                    chartDomain.min.getDate() + tick,
                );

                return {
                    key: tick,
                    x: xScaleFnRelative(tick),
                    label: date.toLocaleString(
                        'default',
                        {
                            year: 'numeric',
                            month: 'short',
                            day: '2-digit',
                        },
                    ),
                };
            });
        },
        [
            numXAxisTicks,
            temporalResolution,
            chartDomain.min,
            xScaleFnRelative,
            yearlyChart,
            chartTemporalDiff,
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
            temporalResolution,
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
            temporalResolution,
            numXAxisTicks,
            xAxisHeight,
            yAxisWidth,
            handleRefChange,
        ],
    );
}

export default useTemporalChartData;
