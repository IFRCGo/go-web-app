import {
    Fragment,
    useCallback,
    useMemo,
    useRef,
    useState,
} from 'react';
import {
    _cs,
    isDefined,
    listToGroupList,
    mapToList,
    bound,
} from '@togglecorp/fujs';
import { resolveToString } from '#utils/translation';

import ChartAxes from '#components/ChartAxes';
import ChartPoint from '#components/TimeSeriesChart/ChartPoint';
import TextOutput from '#components/TextOutput';
import useSizeTracking from '#hooks/useSizeTracking';
import useTranslation from '#hooks/useTranslation';
import { avgSafe, formatNumber } from '#utils/common';
import {
    getDiscretePathDataList,
    getPathData,
    getScaleFunction,
} from '#utils/chart';
import {
    COLOR_LIGHT_GREY,
    COLOR_PRIMARY_BLUE,
    COLOR_PRIMARY_RED,
} from '#utils/constants';
import { paths } from '#generated/riskTypes';

import i18n from './i18n.json';
import styles from './styles.module.css';

type GetCountryRisk = paths['/api/v1/country-seasonal/']['get'];
type CountryRiskResponse = GetCountryRisk['responses']['200']['content']['application/json'];
type RiskData = CountryRiskResponse[number];

const X_AXIS_HEIGHT = 32;
const Y_AXIS_WIDTH = 48;
const CHART_OFFSET = 0;

const chartMargin = {
    left: Y_AXIS_WIDTH + CHART_OFFSET,
    top: CHART_OFFSET,
    right: CHART_OFFSET,
    bottom: X_AXIS_HEIGHT + CHART_OFFSET,
};

const localeFormatDate = (date: Date) => date.toLocaleString(
    navigator.language,
    { month: 'short' },
);

interface ChartPoint {
    x: number;
    y: number;
    label: string | undefined;
}

function chartPointSelector(chartPoint: ChartPoint) {
    return chartPoint;
}

interface Props {
    gwisData: RiskData['gwis'] | undefined;
}

const currentYear = new Date().getFullYear();

function WildfireChart(props: Props) {
    const { gwisData } = props;

    const strings = useTranslation(i18n);
    const [hoveredPointKey, setHoveredPointKey] = useState<number | undefined>();
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartBounds = useSizeTracking(chartContainerRef);

    const points = useMemo(
        () => {
            const monthGroupedData = listToGroupList(
                gwisData?.filter((dataItem) => dataItem.dsr_type === 'monthly') ?? [],
                (gwisItem) => gwisItem.month,
            );

            const aggregatedList = mapToList(
                monthGroupedData,
                (monthlyData, monthKey) => {
                    const average = avgSafe(monthlyData.map((dataItem) => dataItem.dsr)) ?? 0;
                    const min = avgSafe(monthlyData.map((dataItem) => dataItem.dsr_min)) ?? 0;
                    const max = avgSafe(monthlyData.map((dataItem) => dataItem.dsr_max)) ?? 0;

                    const current = monthlyData.find(
                        (dataItem) => dataItem.year === currentYear,
                    )?.dsr;

                    const month = Number(monthKey) - 1;

                    return {
                        date: new Date(currentYear, month, 1),
                        month,
                        min,
                        max,
                        average,
                        current,
                        maxValue: Math.max(min, max, average, current ?? 0),
                    };
                },
            );

            const maxValue = aggregatedList.length === 0
                ? 0
                : Math.max(...aggregatedList.map((dataItem) => dataItem.maxValue));

            const yScale = getScaleFunction(
                { min: 0, max: maxValue },
                { min: 0, max: chartBounds.height },
                { start: chartMargin.top, end: chartMargin.bottom },
                true,
            );
            const xScale = getScaleFunction(
                { min: 0, max: 12 },
                { min: 0, max: chartBounds.width },
                { start: chartMargin.left, end: chartMargin.right },
            );

            const averagePoints = aggregatedList.map(
                (dataItem) => ({
                    // NOTE: offsetting to middle of the month
                    x: xScale(dataItem.month + 0.5),
                    y: yScale(dataItem.average),
                    value: dataItem.average,
                    current: dataItem.current,
                    min: dataItem.min,
                    max: dataItem.max,
                }),
            );

            const minPoints = aggregatedList.map(
                (dataItem) => ({
                    // NOTE: offsetting to middle of the month
                    x: xScale(dataItem.month + 0.5),
                    y: yScale(dataItem.min),
                }),
            );

            const maxPoints = aggregatedList.map(
                (dataItem) => ({
                    // NOTE: offsetting to middle of the month
                    x: xScale(dataItem.month + 0.5),
                    y: yScale(dataItem.max),
                }),
            );

            const widthDifference = xScale(1) - xScale(0);
            const minMaxPoints = [
                ...minPoints,
                ...[...maxPoints].reverse(),
            ];

            const currentPoints = aggregatedList.map(
                (dataItem) => ({
                    // NOTE: offsetting to middle of the month
                    x: xScale(dataItem.month + 0.5),
                    y: isDefined(dataItem.current) ? yScale(dataItem.current) : undefined,
                    value: dataItem.current,
                }),
            );

            const numYAxisPoints = 6;
            const diff = maxValue / (numYAxisPoints - 1);
            const yAxisPoints = maxValue === 0
                ? []
                : Array.from(Array(numYAxisPoints).keys()).map(
                    (key) => {
                        const value = diff * key;
                        return {
                            x: Y_AXIS_WIDTH,
                            y: yScale(value),
                            label: formatNumber(value, { compact: true, maximumFractionDigits: 0 }),
                        };
                    },
                );

            const xAxisPoints = aggregatedList.map(
                (dataItem) => ({
                    x: xScale(dataItem.month),
                    y: chartBounds.height - X_AXIS_HEIGHT,
                    label: localeFormatDate(dataItem.date),
                }),
            );

            return {
                widthDifference,
                average: averagePoints,
                minMax: minMaxPoints,
                current: currentPoints,
                yAxis: yAxisPoints,
                xAxis: xAxisPoints,
            };
        },
        [chartBounds, gwisData],
    );

    const handleRectMouseEnter: React.MouseEventHandler<SVGRectElement> = useCallback((e) => {
        const value = (e.target as HTMLElement).getAttribute('data-key');
        setHoveredPointKey(value ? Number(value) : undefined);
    }, []);

    const handleRectMouseOut: React.MouseEventHandler<SVGRectElement> = useCallback(() => {
        setHoveredPointKey(undefined);
    }, []);

    return (
        <div
            className={styles.wildfireChart}
            ref={chartContainerRef}
        >
            <svg className={styles.svg}>
                {/* FIXME: Use a separate component for chart label */}
                <text
                    className={styles.yAxisLabel}
                    textAnchor="middle"
                    transform={`translate(${(chartMargin.left - CHART_OFFSET) / 3},
                            ${(chartBounds.height - chartMargin.bottom - chartMargin.top) / 2})
                            rotate(-90)`}
                >
                    {strings.monthlySeverityRating}
                </text>
                <ChartAxes
                    xAxisPoints={points.xAxis}
                    yAxisPoints={points.yAxis}
                    chartOffset={CHART_OFFSET}
                    chartMargin={chartMargin}
                    chartBounds={chartBounds}
                    xAxisTickSelector={chartPointSelector}
                    yAxisTickSelector={chartPointSelector}
                />
                <path
                    className={styles.minMaxPath}
                    d={getPathData(points.minMax)}
                    fill={COLOR_LIGHT_GREY}
                />
                <path
                    d={getPathData(points.average)}
                    fill="none"
                    stroke={COLOR_PRIMARY_BLUE}
                />
                <path
                    d={getDiscretePathDataList(points.current)?.[0]}
                    fill="none"
                    stroke={COLOR_PRIMARY_RED}
                />
                {points.average.map((point) => {
                    let x;
                    if (point.x + (290) > chartBounds.width) {
                        x = point.x - 290 - 30;
                    } else {
                        x = point.x + 30;
                    }

                    return (
                        <Fragment key={point.x}>
                            <line
                                className={_cs(
                                    styles.tooltipLine,
                                    hoveredPointKey === point.x && styles.hovered,
                                )}
                                x1={point.x}
                                y1={0}
                                x2={point.x}
                                y2={chartBounds.height - chartMargin.bottom + CHART_OFFSET}
                            />
                            <ChartPoint
                                className={_cs(
                                    styles.point,
                                    styles.averagePoint,
                                    (point.x === hoveredPointKey) && styles.hovered,
                                )}
                                key={point.x}
                                x={point.x}
                                y={point.y}
                                hovered={point.x === hoveredPointKey}
                            />
                            <foreignObject
                                className={_cs(
                                    styles.tooltipContainer,
                                    hoveredPointKey === point.x && styles.hovered,
                                )}
                                x={x}
                                y={point.y + 80 > (chartBounds.height)
                                    ? point.y - 80 : point.y}
                                width={290}
                                height={80}
                            >
                                <div
                                    className={styles.tooltip}
                                >
                                    <TextOutput
                                        value={resolveToString(
                                            strings.minMaxValue,
                                            {
                                                min: point.min.toFixed(2),
                                                max: point.max.toFixed(2),
                                            },
                                        )}
                                        strongValue
                                        label={resolveToString(strings.minMax, { currentYear })}
                                    />
                                    <TextOutput
                                        value={point.value}
                                        label={resolveToString(strings.average, { currentYear })}
                                        valueType="number"
                                        strongValue
                                    />
                                    <TextOutput
                                        value={point.current}
                                        label={resolveToString(strings.year, { currentYear })}
                                        valueType="number"
                                        strongValue
                                    />
                                </div>
                            </foreignObject>
                            <rect
                                className={styles.rect}
                                data-key={point.x}
                                x={point.x - (points.widthDifference / 2)}
                                y={CHART_OFFSET}
                                width={points.widthDifference}
                                height={bound(
                                    chartBounds.height - chartMargin.bottom,
                                    0,
                                    chartBounds.height,
                                )}
                                onMouseEnter={handleRectMouseEnter}
                                onMouseOut={handleRectMouseOut}
                            />
                        </Fragment>
                    );
                })}
                {points.current.map((point) => (
                    <ChartPoint
                        className={_cs(
                            styles.point,
                            styles.currentPoint,
                            (point.x === hoveredPointKey) && styles.hovered,
                        )}
                        key={point.x}
                        x={point.x}
                        y={point.y}
                        hovered={point.x === hoveredPointKey}
                    />
                ))}
            </svg>
        </div>
    );
}

export default WildfireChart;
