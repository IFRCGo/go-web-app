import { useMemo } from 'react';
import {
    ChartAxes,
    ChartContainer,
} from '@ifrc-go/ui';
import {
    avgSafe,
    getDiscretePathDataList,
} from '@ifrc-go/ui/utils';
import {
    isDefined,
    isNotDefined,
    listToGroupList,
    mapToList,
} from '@togglecorp/fujs';

import useTemporalChartData from '#hooks/useTemporalChartData';
import { getPrioritizedIpcData } from '#utils/domain/risk';
import { type RiskApiResponse } from '#utils/restRequest';

import FiChartPoint from './FiChartPoint';

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

    const uniqueData = useMemo(
        () => getPrioritizedIpcData(ipcData ?? []),
        [ipcData],
    );

    const chartData = useTemporalChartData(
        uniqueData,
        {
            keySelector: (datum) => datum.id,
            xValueSelector: (datum) => new Date(datum.year, datum.month - 1, 1),
            yValueSelector: (datum) => datum.total_displacement,
            yValueStartsFromZero: true,
            yearlyChart: true,
        },
    );

    const latestProjectionYear = useMemo(
        () => {
            const projectionData = uniqueData.filter(
                (fiData) => fiData.estimation_type !== 'current',
            ).map(
                (fiData) => fiData.year,
            );

            return Math.max(...projectionData);
        },
        [uniqueData],
    );

    const historicalPointsDataList = useMemo(
        () => {
            const yearGroupedDataPoints = listToGroupList(
                chartData.chartPoints.filter(
                    (pathPoints) => pathPoints.originalData.year !== latestProjectionYear,
                ),
                (dataPoint) => dataPoint.originalData.year,
            );

            return mapToList(
                yearGroupedDataPoints,
                (list, key) => ({
                    key,
                    list,
                }),
            );
        },
        [latestProjectionYear, chartData.chartPoints],
    );

    const averagePointsData = useMemo(
        () => {
            const monthGroupedDataPoints = listToGroupList(
                chartData.chartPoints,
                (dataPoint) => dataPoint.originalData.month,
            );

            return mapToList(
                monthGroupedDataPoints,
                (list, month) => {
                    const averageDisplacement = avgSafe(
                        list.map(
                            (fiData) => fiData.originalData.total_displacement,
                        ),
                    );

                    if (isNotDefined(averageDisplacement)) {
                        return undefined;
                    }

                    return {
                        key: month,
                        x: list[0]!.x,
                        y: chartData.yScaleFn(averageDisplacement),
                        originalData: {
                            total_displacement: averageDisplacement,
                            month: Number(month),
                        },
                    };
                },
            ).filter(isDefined);
        },
        [chartData],
    );

    const predictionPointsData = useMemo(
        () => (
            chartData.chartPoints.filter(
                (pathPoints) => pathPoints.originalData.year === latestProjectionYear,
            )
        ),
        [chartData.chartPoints, latestProjectionYear],
    );

    return (
        <ChartContainer
            className={styles.foodInsecurityChart}
            chartData={chartData}
        >
            <ChartAxes chartData={chartData} />
            {showHistoricalData && historicalPointsDataList.map(
                (historicalPointsData, i) => (
                    <g
                        className={styles.historicalData}
                        key={historicalPointsData.key}
                        style={{
                            color: colors[i],
                        }}
                    >
                        {getDiscretePathDataList(historicalPointsData.list).map(
                            (discretePath) => (
                                <path
                                    key={discretePath}
                                    className={styles.path}
                                    d={discretePath}
                                />
                            ),
                        )}
                        {historicalPointsData.list.map(
                            (pointData) => (
                                <FiChartPoint
                                    className={styles.point}
                                    dataPoint={pointData}
                                    key={pointData.key}
                                />
                            ),
                        )}
                    </g>
                ),
            )}
            {showProjection && (
                <g className={styles.prediction}>
                    {getDiscretePathDataList(predictionPointsData).map(
                        (discretePath) => (
                            <path
                                key={discretePath}
                                className={styles.path}
                                d={discretePath}
                            />
                        ),
                    )}
                    {predictionPointsData.map(
                        (pointData) => (
                            <FiChartPoint
                                key={pointData.key}
                                dataPoint={pointData}
                            />
                        ),
                    )}
                </g>
            )}
            <g className={styles.average}>
                {getDiscretePathDataList(averagePointsData).map(
                    (discretePath) => (
                        <path
                            key={discretePath}
                            className={styles.path}
                            d={discretePath}
                        />
                    ),
                )}
                {averagePointsData.map(
                    (pointData) => (
                        <FiChartPoint
                            key={pointData.key}
                            dataPoint={pointData}
                        />
                    ),
                )}
            </g>
        </ChartContainer>
    );
}

export default FoodInsecurityChart;
