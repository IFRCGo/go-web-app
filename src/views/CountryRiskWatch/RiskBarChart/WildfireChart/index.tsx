import { useMemo, useRef } from 'react';
import { isDefined, listToGroupList, mapToList } from '@togglecorp/fujs';

import ChartAxes from '#components/ChartAxes';
import useSizeTracking from '#hooks/useSizeTracking';
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

import styles from './styles.module.css';

type GetCountryRisk = paths['/api/v1/country-seasonal/']['get'];
type CountryRiskResponse = GetCountryRisk['responses']['200']['content']['application/json'];
type RiskData = CountryRiskResponse[number];

const X_AXIS_HEIGHT = 24;
const Y_AXIS_WIDTH = 32;
const CHART_OFFSET = 16;

const chartMargin = {
    left: Y_AXIS_WIDTH + CHART_OFFSET,
    top: CHART_OFFSET,
    right: CHART_OFFSET,
    bottom: X_AXIS_HEIGHT + CHART_OFFSET,
};

const formatDate = (date: Date) => date.toLocaleString(
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

function WildfireChart(props: Props) {
    const { gwisData } = props;

    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartBounds = useSizeTracking(chartContainerRef);

    const points = useMemo(
        () => {
            const monthGroupedData = listToGroupList(
                gwisData?.filter((dataItem) => dataItem.dsr_type === 'monthly') ?? [],
                (gwisItem) => gwisItem.month,
            );

            const currentYear = new Date().getFullYear();

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

            const minMaxPoints = [
                ...minPoints,
                ...[...maxPoints].reverse(),
            ];

            const currentPoints = aggregatedList.map(
                (dataItem) => ({
                    // NOTE: offsetting to middle of the month
                    x: xScale(dataItem.month + 0.5),
                    y: isDefined(dataItem.current) ? yScale(dataItem.current) : undefined,
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
                    label: formatDate(dataItem.date),
                }),
            );

            return {
                average: averagePoints,
                minMax: minMaxPoints,
                current: currentPoints,
                yAxis: yAxisPoints,
                xAxis: xAxisPoints,
            };
        },
        [chartBounds, gwisData],
    );

    return (
        <div
            className={styles.wildfireChart}
            ref={chartContainerRef}
        >
            <svg className={styles.svg}>
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
            </svg>
        </div>
    );
}

export default WildfireChart;
