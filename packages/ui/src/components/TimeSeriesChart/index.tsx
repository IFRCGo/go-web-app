import {
    Fragment,
    useCallback,
    useMemo,
    useRef,
    useState,
} from 'react';
import {
    _cs,
    bound,
    isDefined,
    isNotDefined,
    listToMap,
} from '@togglecorp/fujs';

import useSizeTracking from '#hooks/useSizeTracking';
import {
    getBounds,
    getPathData,
    getScaleFunction,
} from '#utils/chart';
import { formatDate } from '#utils/common';

import ChartPoint from './ChartPoint';

import styles from './styles.module.css';

const X_AXIS_HEIGHT = 20;
const Y_AXIS_WIDTH = 10;
const CHART_OFFSET = 10;

const chartMargin = {
    left: 2 * Y_AXIS_WIDTH + CHART_OFFSET,
    top: CHART_OFFSET,
    right: CHART_OFFSET * 2,
    bottom: 2 * X_AXIS_HEIGHT + CHART_OFFSET,
};

const getFormattedKey = (dateFromProps: string | Date) => {
    const date = new Date(dateFromProps);
    return formatDate(date, 'yyyy-MM');
};

export interface Props<K> {
    className?: string;
    xAxisTickClassName?: string;
    dataKeys: K[];
    timePoints: Date[];
    valueSelector: (dataKey: K, date: Date) => number | undefined;
    classNameSelector: (dataKey: K) => string;
    activePointKey?: string;
    onTimePointClick?: (dateKey: string) => void;
    xAxisFormatter: (date: Date) => string;
}

function TimeSeriesChart<const K extends string>(props: Props<K>) {
    const {
        className,
        xAxisTickClassName,
        dataKeys,
        timePoints,
        valueSelector,
        classNameSelector,
        activePointKey,
        onTimePointClick,
        xAxisFormatter,
    } = props;

    const [hoveredPointKey, setHoveredPointKey] = useState<string | undefined>();

    const svgRef = useRef<SVGSVGElement>(null);
    const chartBounds = useSizeTracking(svgRef);

    const [
        chartPoints,
        yAxisPoints,
    ] = useMemo(
        () => {
            if (isNotDefined(chartBounds)) {
                return [
                    [],
                    [],
                ];
            }

            const timePointsWithData = timePoints.map((timePoint) => {
                const dataValues = dataKeys.map((dataKey) => ({
                    key: dataKey,
                    value: valueSelector(dataKey, timePoint),
                }));

                const valueList = dataValues.map((value) => value.value).filter(isDefined);
                const maxValue = valueList.length === 0 ? 0 : Math.max(...valueList);

                return {
                    date: timePoint,
                    numMonths: timePoint.getFullYear() * 12 + timePoint.getMonth(),
                    dataValues,
                    maxValue,
                };
            });

            const maxValueList = timePointsWithData.map((datum) => datum.maxValue);
            const maxValue = maxValueList.length === 0 ? 0 : Math.max(...maxValueList);
            const numMonthsList = timePointsWithData.map((datum) => datum.numMonths);

            const xBounds = getBounds(numMonthsList);
            const xScale = getScaleFunction(
                xBounds,
                { min: 0, max: chartBounds.width },
                { start: chartMargin.left, end: chartMargin.right },
            );

            const numYAxisPoints = 5;
            const approxYDiff = Math.ceil(maxValue / numYAxisPoints);
            const newMaxValue = approxYDiff * numYAxisPoints;

            const yBounds = {
                min: 0,
                max: newMaxValue,
            };
            const yScale = getScaleFunction(
                { min: 0, max: yBounds.max },
                { min: 0, max: chartBounds.height },
                { start: chartMargin.top, end: chartMargin.bottom },
                true,
            );

            const diff = newMaxValue / numYAxisPoints;
            const yAxisData = Array.from(Array(numYAxisPoints + 1).keys()).map((key) => {
                const value = yBounds.min + (diff * key);
                return {
                    key,
                    dataValue: value,
                    value: yScale(value),
                };
            });

            const chartData = timePointsWithData.map((timePoint, i) => {
                const x = xScale(timePoint.numMonths);

                const isStart = i === 0;
                const isEnd = i === (timePointsWithData.length - 1);

                const prevDatum = isStart ? timePoint : timePointsWithData[i - 1];
                const nextDatum = isEnd ? timePoint : timePointsWithData[i + 1];
                const rectStart = xScale(
                    (prevDatum.numMonths + timePoint.numMonths) / 2,
                ) + (isStart ? -CHART_OFFSET : 0);
                const rectEnd = xScale(
                    (timePoint.numMonths + nextDatum.numMonths) / 2,
                ) + (isEnd ? CHART_OFFSET : 0);

                return {
                    key: getFormattedKey(timePoint.date),
                    x,
                    yValues: listToMap(
                        timePoint.dataValues,
                        (datum) => datum.key,
                        (datum) => (isDefined(datum.value) ? yScale(datum.value) : undefined),
                    ),
                    rect: {
                        start: rectStart,
                        width: bound(rectEnd - rectStart, 0, chartBounds.width),
                    },
                    date: timePoint.date,
                    numMonths: timePoint.numMonths,
                    values: timePoint.dataValues,
                };
            });

            return [
                chartData,
                yAxisData,
            ] as const;
        },
        [chartBounds, dataKeys, timePoints, valueSelector],
    );

    const handleRectMouseClick: React.MouseEventHandler<SVGRectElement> = useCallback((e) => {
        const key = (e.target as HTMLElement).getAttribute('data-key');
        if (key && onTimePointClick) {
            onTimePointClick(key);
        }
    }, [onTimePointClick]);

    const handleRectMouseEnter: React.MouseEventHandler<SVGRectElement> = useCallback((e) => {
        setHoveredPointKey((e.target as HTMLElement).getAttribute('data-key') ?? undefined);
    }, []);

    const handleRectMouseOut: React.MouseEventHandler<SVGRectElement> = useCallback(() => {
        setHoveredPointKey(undefined);
    }, []);

    return (
        <svg
            className={_cs(styles.timelineChart, className)}
            ref={svgRef}
        >
            {yAxisPoints && yAxisPoints.map((point, i) => (
                <Fragment key={point.key}>
                    <text
                        className={styles.yAxisTickText}
                        x={Y_AXIS_WIDTH}
                        y={point.value + i * 2}
                    >
                        {point.dataValue}
                    </text>
                    <line
                        className={styles.xAxisGridLine}
                        x1={chartMargin.left - CHART_OFFSET}
                        y1={point.value}
                        x2={chartBounds.width - CHART_OFFSET}
                        y2={point.value}
                    />
                </Fragment>
            ))}
            {dataKeys.map((dataKey) => (
                <path
                    key={dataKey}
                    className={_cs(styles.path, classNameSelector(dataKey))}
                    d={getPathData(
                        chartPoints.map((point) => {
                            const { x } = point;
                            const y = point.yValues[dataKey];

                            if (isNotDefined(x) || isNotDefined(y)) {
                                return undefined;
                            }

                            return {
                                x,
                                y: y as number,
                            };
                        }).filter(isDefined),
                    )}
                />
            ))}
            {chartPoints.map((point) => {
                const isActive = point.key === activePointKey;
                const isHovered = point.key === hoveredPointKey;

                return (
                    <Fragment key={point.key}>
                        <text
                            className={_cs(xAxisTickClassName, styles.xAxisTickText)}
                            x={point.x}
                            y={chartBounds.height - X_AXIS_HEIGHT}
                            style={{
                                transformOrigin: `${point.x}px ${chartBounds.height - X_AXIS_HEIGHT}px`,
                            }}
                        >
                            {xAxisFormatter(point.date)}
                        </text>
                        <line
                            className={_cs(
                                styles.yAxisGridLine,
                                hoveredPointKey === point.key && styles.hovered,
                            )}
                            x1={point.x}
                            y1={0}
                            x2={point.x}
                            y2={chartBounds.height - chartMargin.bottom + CHART_OFFSET}
                        />
                        {dataKeys.map((dataKey) => (
                            <ChartPoint
                                key={dataKey}
                                active={isActive}
                                hovered={isHovered}
                                className={_cs(styles.point, classNameSelector(dataKey))}
                                x={point.x}
                                y={point.yValues[dataKey]}
                            />
                        ))}
                        <rect
                            className={styles.rect}
                            data-key={point.key}
                            x={point.rect.start}
                            y={CHART_OFFSET}
                            width={point.rect.width}
                            height={bound(
                                chartBounds.height - chartMargin.bottom,
                                0,
                                chartBounds.height,
                            )}
                            onMouseEnter={handleRectMouseEnter}
                            onMouseOut={handleRectMouseOut}
                            onMouseDown={handleRectMouseClick}
                        />
                    </Fragment>
                );
            })}
        </svg>
    );
}

export default TimeSeriesChart;
