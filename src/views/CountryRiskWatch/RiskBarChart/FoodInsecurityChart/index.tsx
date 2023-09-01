import {
    Fragment,
    useCallback,
    useMemo,
    useRef,
} from 'react';
import {
    isDefined,
    isNotDefined,
    listToGroupList,
    listToMap,
    mapToMap,
} from '@togglecorp/fujs';

import ChartAxes from '#components/ChartAxes';
import useSizeTracking from '#hooks/useSizeTracking';
import { formatNumber, maxSafe } from '#utils/common';
import {
    getAverageIpcData,
    getPrioritizedIpcData,
    monthNumberToNameMap,
} from '#utils/domain/risk';
import { getDiscretePathDataList, getScaleFunction } from '#utils/chart';
import {
    COLOR_HAZARD_FOOD_INSECURITY,
    COLOR_PRIMARY_RED,
} from '#utils/constants';
import { paths } from '#generated/riskTypes';

import styles from './styles.module.css';

type GetCountryRisk = paths['/api/v1/country-seasonal/']['get'];
type CountryRiskResponse = GetCountryRisk['responses']['200']['content']['application/json'];
type RiskData = CountryRiskResponse[number];

const colors = [
    '#cbcedb',
    '#a9adbf',
    '#878ea5',
    '#676f8a',
    '#475271',
    '#283759',
    '#011e41',
];

const X_AXIS_HEIGHT = 24;
const Y_AXIS_WIDTH = 48;
const CHART_OFFSET = 16;

const chartMargin = {
    left: Y_AXIS_WIDTH + CHART_OFFSET,
    top: CHART_OFFSET,
    right: CHART_OFFSET,
    bottom: X_AXIS_HEIGHT + CHART_OFFSET,
};

const xAxisFormatter = (date: Date) => date.toLocaleString(
    navigator.language,
    { month: 'short' },
);

// FIXME: rename this formatDate
const formatDate = (date: Date) => date.toLocaleString(
    navigator.language,
    {
        year: 'numeric',
        month: 'short',
    },
);

interface Props {
    ipcData: RiskData['ipc_displacement_data'] | undefined;
}

function FoodInsecurityChart(props: Props) {
    const { ipcData } = props;

    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartBounds = useSizeTracking(chartContainerRef);

    const chartData = useMemo(
        () => {
            const uniqueData = getPrioritizedIpcData(ipcData ?? []);
            const averageDataItem = getAverageIpcData(uniqueData);
            const maxValue = maxSafe(uniqueData.map((item) => item.total_displacement)) ?? 0;

            const xScale = getScaleFunction(
                { min: 0, max: 12 },
                { min: 0, max: chartBounds.width },
                { start: chartMargin.left, end: chartMargin.right },
            );

            const yScale = getScaleFunction(
                { min: 0, max: maxValue },
                { min: 0, max: chartBounds.height },
                { start: chartMargin.top, end: chartMargin.bottom },
                true,
            );

            const yearGroupedData = mapToMap(
                listToGroupList(
                    uniqueData,
                    (item) => item.year,
                ),
                (year) => year,
                (ipcDataList) => getAverageIpcData(ipcDataList),
            );

            const yearKeys = Object.keys(yearGroupedData);
            const currentYear = new Date().getFullYear();
            const predictionYear = yearKeys.length === 0
                ? undefined
                : yearKeys[yearKeys.length - 1];

            const chartPoints = Array.from(Array(12).keys()).map(
                (monthKey) => {
                    const month = monthNumberToNameMap[monthKey];
                    const average = averageDataItem[month] ?? 0;

                    const value = listToMap(
                        yearKeys,
                        (year) => year,
                        (year) => yearGroupedData?.[Number(year)]?.[month],
                    );

                    value.average = average;

                    const y = mapToMap(
                        value,
                        (key) => key,
                        (item) => (isDefined(item) ? yScale(item) : undefined),
                    );

                    const date = new Date(currentYear, monthKey, 1);

                    return {
                        key: monthKey,
                        x: xScale(monthKey + 0.5),
                        xStart: xScale(monthKey),
                        y,
                        value,
                        date,
                    };
                },
            );

            const numYAxisPoints = 6;
            const diff = maxValue / (numYAxisPoints - 1);
            const yAxisPoints = Array.from(Array(numYAxisPoints).keys()).map(
                (key) => {
                    const value = diff * key;
                    return {
                        key,
                        dataValue: value,
                        value: yScale(value),
                    };
                },
            );

            const yearlyPathPoints = yearKeys.map(
                (year) => ({
                    key: year,
                    points: chartPoints.map((point) => ({
                        x: point.x,
                        y: point.y[year],
                        v: point.value[year],
                    })),
                }),
            );

            const averagePathPoints = chartPoints.map((point) => ({
                x: point.x,
                y: point.y.average,
            }));

            return {
                points: chartPoints,
                predictionYear,
                yAxisPoints,
                yearlyPathPoints,
                averagePathPoints,
                yearKeys,
            };
        },
        [chartBounds, ipcData],
    );

    const xAxisTickSelector = useCallback(
        (chartPoint: (typeof chartData)['points'][number]) => ({
            x: chartPoint.xStart,
            label: xAxisFormatter(chartPoint.date),
        }),
        [],
    );

    const yAxisTickSelector = useCallback(
        (chartPoint: (typeof chartData)['yAxisPoints'][number]) => ({
            y: chartPoint.value,
            label: formatNumber(
                chartPoint.dataValue,
                { compact: true, maximumFractionDigits: 0 },
            ),
        }),
        [],
    );

    return (
        <div
            className={styles.foodInsecurityChart}
            ref={chartContainerRef}
        >
            <svg className={styles.svg}>
                <ChartAxes
                    xAxisPoints={chartData.points}
                    yAxisPoints={chartData.yAxisPoints}
                    chartBounds={chartBounds}
                    chartMargin={chartMargin}
                    chartOffset={CHART_OFFSET}
                    xAxisTickSelector={xAxisTickSelector}
                    yAxisTickSelector={yAxisTickSelector}
                />
                {chartData.yearlyPathPoints.map(
                    (pathPoints, i) => (
                        getDiscretePathDataList(pathPoints.points)?.map(
                            (discretePath) => (
                                <path
                                    className={styles.path}
                                    key={`${pathPoints.key}-${discretePath}`}
                                    d={discretePath}
                                    stroke={pathPoints.key === chartData.predictionYear
                                        ? COLOR_PRIMARY_RED : colors[i]}
                                />
                            ),
                        )
                    ),
                )}
                {getDiscretePathDataList(chartData.averagePathPoints)?.map(
                    (discretePath) => (
                        <path
                            key={discretePath}
                            className={styles.averagePath}
                            d={discretePath}
                            stroke={COLOR_HAZARD_FOOD_INSECURITY}
                        />
                    ),
                )}
                {chartData.points.map(
                    (point) => {
                        if (isNotDefined(point.y.average)) {
                            return null;
                        }

                        return (
                            <Fragment key={point.key}>
                                {chartData.yearKeys.map(
                                    (year, i) => {
                                        const y = point.y[year];

                                        if (isNotDefined(y)) {
                                            return null;
                                        }

                                        return (
                                            <circle
                                                key={year}
                                                className={styles.point}
                                                cx={point.x}
                                                cy={y}
                                                stroke={year === chartData.predictionYear
                                                    ? COLOR_PRIMARY_RED : colors[i]}
                                            >
                                                <title>
                                                    {`${formatDate(point.date)}: ${formatNumber(point.value[year])}`}
                                                </title>
                                            </circle>
                                        );
                                    },
                                )}
                                <circle
                                    className={styles.averagePoint}
                                    cx={point.x}
                                    cy={point.y.average}
                                    fill={COLOR_HAZARD_FOOD_INSECURITY}
                                >
                                    <title>
                                        {formatNumber(point.value.average)}
                                    </title>
                                </circle>
                            </Fragment>
                        );
                    },
                )}
            </svg>
        </div>
    );
}

export default FoodInsecurityChart;
