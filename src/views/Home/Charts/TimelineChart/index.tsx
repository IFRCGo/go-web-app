import {
    useRef,
    useCallback,
    useMemo,
    useState,
    Fragment,
} from 'react';
import { listToMap, _cs } from '@togglecorp/fujs';
import useSizeTracking from '#hooks/useSizeTracking';
import {
    getBounds,
    getPathData,
    getScaleFunction,
} from '#utils/chart';

import ChartPoint from './ChartPoint';
import styles from './styles.module.css';

const X_AXIS_HEIGHT = 20;
const Y_AXIS_WIDTH = 20;
const CHART_OFFSET = 20;

const chartMargin = {
    left: 2 * Y_AXIS_WIDTH + CHART_OFFSET,
    top: CHART_OFFSET,
    right: CHART_OFFSET * 2,
    bottom: 2 * X_AXIS_HEIGHT + CHART_OFFSET,
};

const getFormattedKey = (dateFromProps: string | Date) => {
    const date = new Date(dateFromProps);
    return `${date.getFullYear()}-${date.getMonth()}`;
};

interface Props<K> {
    className?: string;
    dataKeys: K[];
    timePoints: Date[];
    valueSelector: (dataKey: K, date: Date) => number;
    classNameSelector: (dataKey: K) => string;
    activePointKey: string;
    onTimePointClick: (dateKey: string) => void;
    xAxisFormatter: (date: Date) => string;
}

function TimelineChart<const K extends string>(props: Props<K>) {
    const {
        className,
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
    const bounds = useSizeTracking(svgRef);

    const [
        chartPoints,
        yAxisPoints,
    ] = useMemo(
        () => {
            if (!bounds) {
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

                const valueList = dataValues.map((value) => value.value);
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
                { min: 0, max: bounds.width },
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
                { min: 0, max: bounds.height },
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
                        (datum) => yScale(datum.value),
                    ),
                    rect: {
                        start: rectStart,
                        width: Math.max(0, rectEnd - rectStart),
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
        [bounds, dataKeys, timePoints, valueSelector],
    );

    const handleRectMouseClick: React.MouseEventHandler<SVGRectElement> = useCallback((e) => {
        const key = (e.target as HTMLElement).getAttribute('data-key');
        if (key) {
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
                        x2={bounds.width - CHART_OFFSET}
                        y2={point.value}
                    />
                </Fragment>
            ))}
            {dataKeys.map((dataKey) => (
                <path
                    key={dataKey}
                    className={_cs(styles.path, classNameSelector(dataKey))}
                    d={getPathData(
                        chartPoints.map((point) => ({
                            x: point.x,
                            y: point.yValues[dataKey],
                        })),
                    )}
                />
            ))}
            {chartPoints.map((point) => {
                const isActive = point.key === activePointKey;
                const isHovered = point.key === hoveredPointKey;

                return (
                    <Fragment key={point.key}>
                        <text
                            className={styles.xAxisTickText}
                            x={point.x}
                            y={bounds.height - X_AXIS_HEIGHT}
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
                            y2={bounds.height - CHART_OFFSET}
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
                            height={Math.max(0, bounds.height - chartMargin.bottom)}
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

export default TimelineChart;
