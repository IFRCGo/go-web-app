import {
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
import { type RiskApiResponse } from '#utils/restRequest';

import styles from './styles.module.css';

type CountryRiskResponse = RiskApiResponse<'/api/v1/country-seasonal/'>;
type RiskData = CountryRiskResponse[number];

const colors = [
    'var(--go-ui-color-gray-30)',
    'var(--go-ui-color-gray-40)',
    'var(--go-ui-color-gray-50)',
    'var(--go-ui-color-gray-60)',
    'var(--go-ui-color-gray-70)',
    'var(--go-ui-color-gray-80)',
    'var(--go-ui-color-gray-90)',
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

const localeFormatDate = (date: Date) => date.toLocaleString(
    navigator.language,
    {
        year: 'numeric',
        month: 'short',
    },
);

const localeFormatMonth = (date: Date) => date.toLocaleString(
    navigator.language,
    { month: 'short' },
);

const currentYear = new Date().getFullYear();

interface Props {
    ipcData: RiskData['ipc_displacement_data'] | undefined;
    showHistoricalData?: boolean;
    showProjection?: boolean;
}

function FoodInsecurityChart(props: Props) {
    const {
        ipcData,
        showHistoricalData,
        showProjection,
    } = props;

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

                    const dates = mapToMap(
                        value,
                        (key) => key,
                        (_, year) => new Date(+year, monthKey, 1),
                    );

                    return {
                        key: monthKey,
                        x: xScale(monthKey + 0.5),
                        xStart: xScale(monthKey),
                        y,
                        value,
                        dates,
                        month: monthKey,
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
                    year,
                    points: chartPoints.map((point) => ({
                        key: `${year}-${point.key}`,
                        x: point.x,
                        y: point.y[year],
                        v: point.value[year],
                        date: point.dates[year],
                    })),
                }),
            );

            const averagePathPoints = chartPoints.map((point) => ({
                x: point.x,
                y: point.y.average,
                value: point.value.average,
                date: new Date(currentYear, point.month, 1),
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
            // Year and date doesn't matter here
            label: xAxisFormatter(new Date(2000, chartPoint.key, 1)),
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

    const predictionPointData = chartData.yearlyPathPoints.find(
        (pathPoints) => pathPoints.key === chartData.predictionYear,
    );

    const historicalPointsData = chartData.yearlyPathPoints.filter(
        (pathPoints) => pathPoints.key !== chartData.predictionYear,
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
                {showProjection && isDefined(predictionPointData) && (
                    getDiscretePathDataList(predictionPointData.points)?.map(
                        (discretePath) => (
                            <path
                                key={`prediction-${discretePath}`}
                                className={styles.path}
                                d={discretePath}
                                stroke={COLOR_PRIMARY_RED}
                            />
                        ),
                    )
                )}
                {showHistoricalData && historicalPointsData.map(
                    (pathPoints, i) => (
                        getDiscretePathDataList(pathPoints.points)?.map(
                            (discretePath) => (
                                <path
                                    className={styles.path}
                                    key={`${pathPoints.key}-${discretePath}`}
                                    d={discretePath}
                                    stroke={colors[i]}
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
                {showProjection && predictionPointData?.points.map(
                    (point) => {
                        if (isNotDefined(point.y) || isNotDefined(point.x)) {
                            return null;
                        }

                        return (
                            <circle
                                className={styles.averagePoint}
                                cx={point.x}
                                cy={point.y}
                                fill={COLOR_PRIMARY_RED}
                            >
                                <title>
                                    {`${localeFormatMonth(point.date)}: ${formatNumber(point.v)}`}
                                </title>
                            </circle>
                        );
                    },
                )}
                {showHistoricalData && historicalPointsData.map(
                    (pointData, i) => (
                        pointData.points.map(
                            (point) => (
                                isDefined(point.y) ? (
                                    <circle
                                        key={point.key}
                                        className={styles.point}
                                        cx={point.x}
                                        cy={point.y}
                                        stroke={colors[i]}
                                    >
                                        <title>
                                            {`${localeFormatDate(point.date)}: ${formatNumber(point.v)}`}
                                        </title>
                                    </circle>
                                ) : null
                            ),
                        )
                    ),
                )}
                {chartData.averagePathPoints.map(
                    (point) => {
                        if (isNotDefined(point.y)) {
                            return null;
                        }

                        return (
                            <circle
                                className={styles.averagePoint}
                                cx={point.x}
                                cy={point.y}
                                fill={COLOR_HAZARD_FOOD_INSECURITY}
                            >
                                <title>
                                    {`${localeFormatMonth(point.date)}: ${formatNumber(point.value)}`}
                                </title>
                            </circle>
                        );
                    },
                )}
            </svg>
        </div>
    );
}

export default FoodInsecurityChart;
