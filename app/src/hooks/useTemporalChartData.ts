import {
    useCallback,
    useMemo,
} from 'react';
import { useSizeTracking } from '@ifrc-go/ui/hooks';
import {
    DateLike,
    formatNumber,
    getBounds,
    getEvenDistribution,
    getIntervals,
    getScaleFunction,
    maxSafe,
    minSafe,
    Rect,
} from '@ifrc-go/ui/utils';
import {
    bound,
    compareNumber,
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

import {
    getNumberOfDays,
    getNumberOfMonths,
} from '#utils/common';

type TemporalResolution = 'year' | 'month' | 'day';

const NUM_X_AXIS_TICKS_MIN = 3;
const NUM_X_AXIS_TICKS_MAX = 12;

interface CommonOptions<DATUM> {
    containerRef: React.RefObject<HTMLElement>;
    keySelector: (d: DATUM, index: number) => number | string;
    xValueSelector: (d: DATUM, index: number) => DateLike | undefined | null;
    yValueSelector: (d: DATUM, index: number) => number | undefined | null;
    chartOffset: Rect;
    chartMargin: Rect;
    chartPadding: Rect;
    numYAxisTicks?: number;
    yAxisLabelSelector?: (value: number, index: number) => React.ReactNode;
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
        chartOffset,
        chartMargin,
        chartPadding,
        containerRef,
        numYAxisTicks = 6,
        yAxisLabelSelector,
        yearlyChart = false,
    } = options;

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

    const temporalDiff = useMemo<Record<TemporalResolution, number> | undefined>(
        () => {
            if (isNotDefined(dataDomain)) {
                return undefined;
            }

            const minDate = new Date(dataDomain.min);
            const maxDate = new Date(dataDomain.max);

            const yearsDiff = maxDate.getFullYear() - minDate.getFullYear();
            const monthsDiff = getNumberOfMonths(minDate, maxDate);
            const daysDiff = getNumberOfDays(minDate, maxDate);

            return {
                year: yearsDiff,
                month: monthsDiff,
                day: daysDiff,
            };
        },
        [dataDomain],
    );

    const temporalResolution = useMemo(
        () => {
            if (yearlyChart) {
                return 'month';
            }

            if (temporalResolutionFromProps !== 'auto') {
                return temporalResolutionFromProps;
            }

            // NOTE: revisit
            if (isNotDefined(temporalDiff)) {
                return 'day';
            }

            if (temporalDiff.year > NUM_X_AXIS_TICKS_MIN) {
                return 'year';
            }

            if (temporalDiff.month > NUM_X_AXIS_TICKS_MIN) {
                return 'month';
            }

            return 'day';
        },
        [temporalDiff, temporalResolutionFromProps, yearlyChart],
    );

    const numXAxisTicks = useMemo(
        () => {
            if (yearlyChart) {
                return 12;
            }

            if (numXAxisTicksFromProps !== 'auto') {
                return bound(numXAxisTicksFromProps, NUM_X_AXIS_TICKS_MIN, NUM_X_AXIS_TICKS_MAX);
            }

            if (isNotDefined(temporalDiff)) {
                return NUM_X_AXIS_TICKS_MIN;
            }

            const currentDiff = temporalDiff[temporalResolution];

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
        [numXAxisTicksFromProps, temporalDiff, temporalResolution, yearlyChart],
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

            if (isNotDefined(dataDomain)) {
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
                const maxMonth = maxDataDate.getFullYear() * 12
                    + maxDataDate.getMonth();
                const minMonth = minDataDate.getFullYear() * 12
                    + minDataDate.getMonth();

                const { left, right } = getEvenDistribution(
                    minMonth,
                    maxMonth,
                    numXAxisTicks,
                );

                return {
                    min: new Date(minDataDate.getFullYear(), minDataDate.getMonth() - left, 1),
                    max: new Date(maxDataDate.getFullYear(), minDataDate.getMonth() + right, 1),
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
                    minDataDate.getMonth(),
                    minDataDate.getDate() + right,
                ),
            };
        },
        [temporalResolution, dataDomain, numXAxisTicks, yearlyChart],
    );

    const getRelativeX = useCallback(
        (dateLike: DateLike) => {
            const date = new Date(dateLike);

            if (temporalResolution === 'year') {
                return date.getFullYear() - chartDomain.min.getFullYear();
            }

            if (temporalResolution === 'month') {
                return getNumberOfMonths(chartDomain.min, date);
            }

            return getNumberOfDays(chartDomain.min, date);
        },
        [chartDomain, temporalResolution],
    );

    const initialLeftOffset = chartMargin.left + chartOffset.left + chartPadding.left;
    const initialRightOffset = chartMargin.right + chartOffset.right + chartPadding.right;
    const topOffset = chartMargin.top + chartOffset.top + chartPadding.top;
    const bottomOffset = chartMargin.bottom + chartOffset.bottom + chartPadding.bottom;

    const renderableDataAreaWidth = chartSize.width - initialLeftOffset - initialRightOffset;
    const additionalHorizontalOffset = renderableDataAreaWidth / (numXAxisTicks + 2);

    const dataAreaWidth = renderableDataAreaWidth - additionalHorizontalOffset;
    const leftOffset = initialLeftOffset + additionalHorizontalOffset / 2;
    const rightOffset = initialRightOffset + additionalHorizontalOffset / 2;
    const dataAreaHeight = chartSize.height - topOffset - bottomOffset;

    const xAxisDomain = useMemo(
        () => {
            if (yearlyChart) {
                return {
                    min: 0,
                    max: 12,
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
        [chartDomain, temporalResolution, yearlyChart],
    );

    const xScaleFnRelative = useMemo(
        () => getScaleFunction(
            xAxisDomain,
            { min: 0, max: chartSize.width },
            {
                start: leftOffset,
                end: rightOffset,
            },
        ),
        [leftOffset, rightOffset, xAxisDomain, chartSize.width],
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

    const yValues = chartData.map(({ yValue }) => yValue);
    const yAxisDomain = getBounds(yValues);

    const yScaleFn = useMemo(
        () => getScaleFunction(
            yAxisDomain,
            { min: 0, max: chartSize.height },
            { start: topOffset, end: bottomOffset },
            true,
        ),
        [yAxisDomain, topOffset, bottomOffset, chartSize.height],
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
            let diff: number;

            if (yearlyChart) {
                diff = 12;
            } else if (isNotDefined(temporalResolution) || isNotDefined(temporalDiff)) {
                diff = numXAxisTicks;
            } else {
                diff = temporalDiff[temporalResolution];
            }

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
                    label: tick,
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
            temporalDiff,
            chartDomain.min,
            xScaleFnRelative,
            yearlyChart,
        ],
    );

    const yAxisTicks = useMemo(
        () => getIntervals(
            yAxisDomain,
            numYAxisTicks,
        ).map((tick, i) => ({
            y: yScaleFn(tick),
            label: yAxisLabelSelector
                ? yAxisLabelSelector(tick, i)
                : formatNumber(tick, { compact: true }) ?? '',
        })),
        [yAxisDomain, yScaleFn, numYAxisTicks, yAxisLabelSelector],
    );

    return useMemo(
        () => ({
            chartPoints,
            xAxisTicks,
            yAxisTicks,
            chartSize,
            xScaleFn,
            yScaleFn,
            dataAreaSize: {
                width: dataAreaWidth,
                height: dataAreaHeight,
            },
            dataAreaWidth,
            dataAreaHeight,
            dataAreaOffset: {
                top: topOffset,
                right: rightOffset,
                bottom: bottomOffset,
                left: leftOffset,
            },
            chartMargin,
            temporalResolution,
            numXAxisTicks,
        }),
        [
            chartPoints,
            xAxisTicks,
            yAxisTicks,
            chartSize,
            xScaleFn,
            yScaleFn,
            chartMargin,
            dataAreaWidth,
            dataAreaHeight,
            topOffset,
            rightOffset,
            bottomOffset,
            leftOffset,
            temporalResolution,
            numXAxisTicks,
        ],
    );
}

export default useTemporalChartData;
