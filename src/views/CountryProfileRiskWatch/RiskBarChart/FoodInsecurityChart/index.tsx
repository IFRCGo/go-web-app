import {
    useMemo,
    useRef,
} from 'react';
import {
    isDefined,
    isNotDefined,
    listToGroupList,
    mapToList,
} from '@togglecorp/fujs';

import ChartAxes from '#components/ChartAxes';
import useChartData from '#hooks/useChartData';
import { avgSafe } from '#utils/common';
import { getPrioritizedIpcData } from '#utils/domain/risk';
import { getDiscretePathDataList } from '#utils/chart';
import {
    defaultChartMargin,
    defaultChartPadding,
} from '#utils/constants';
import { type RiskApiResponse } from '#utils/restRequest';

import ChartPoint from '#components/TimeSeriesChart/ChartPoint';
import Tooltip from '#components/Tooltip';
import TextOutput from '#components/TextOutput';

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

const chartOffset = {
    left: Y_AXIS_WIDTH,
    top: 10,
    right: 0,
    bottom: X_AXIS_HEIGHT,
};

const currentYear = new Date().getFullYear();

type FiChartPointProps = {
    dataPoint: {
        originalData: {
            year?: number;
            month: number;
            analysis_date?: string;
            total_displacement: number;
        },
        key: number | string;
        x: number;
        y: number;
    };
};
function FiChartPoint(props: FiChartPointProps) {
    const {
        dataPoint: {
            x,
            y,
            originalData,
        },
    } = props;

    const title = useMemo(
        () => {
            const {
                year,
                month,
            } = originalData;

            if (isDefined(year)) {
                return new Date(year, month - 1, 1).toLocaleString(
                    navigator.language,
                    {
                        year: 'numeric',
                        month: 'long',
                    },
                );
            }

            const formattedMonth = new Date(currentYear, month - 1, 1).toLocaleString(
                navigator.language,
                { month: 'long' },
            );

            // FIXME: use translations
            return `Average for ${formattedMonth}`;
        },
        [originalData],
    );

    return (
        <ChartPoint
            className={styles.point}
            x={x}
            y={y}
        >
            <Tooltip
                title={title}
                description={(
                    <>
                        {isDefined(originalData.analysis_date) && (
                            <TextOutput
                                // FIXME: use translations
                                label="Analysis date"
                                value={originalData.analysis_date}
                                valueType="date"
                            />
                        )}
                        <TextOutput
                            // FIXME: use translations
                            label="People Exposed"
                            value={originalData.total_displacement}
                            valueType="number"
                            maximumFractionDigits={0}
                        />
                    </>
                )}
            />
        </ChartPoint>
    );
}

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
    const uniqueData = useMemo(
        () => getPrioritizedIpcData(ipcData ?? []),
        [ipcData],
    );

    const {
        dataPoints,
        chartSize,
        xAxisTicks,
        yAxisTicks,
        yScaleFn,
    } = useChartData(
        uniqueData,
        {
            containerRef: chartContainerRef,
            chartMargin: defaultChartMargin,
            chartPadding: defaultChartPadding,
            chartOffset,
            type: 'numeric',
            keySelector: (datum) => datum.month,
            xValueSelector: (datum) => (
                datum.month - 1
            ),
            yValueSelector: (datum) => datum.total_displacement,
            xAxisLabelSelector: (month) => new Date(currentYear, month, 1).toLocaleString(
                navigator.language,
                { month: 'short' },
            ),
            xDomain: {
                min: 0,
                max: 11,
            },
            yAxisStartsFromZero: true,
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
                dataPoints.filter(
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
        [latestProjectionYear, dataPoints],
    );

    const averagePointsData = useMemo(
        () => {
            const monthGroupedDataPoints = listToGroupList(
                dataPoints,
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
                        x: list[0].x,
                        y: yScaleFn(averageDisplacement),
                        originalData: {
                            total_displacement: averageDisplacement,
                            month: Number(month),
                        },
                    };
                },
            ).filter(isDefined);
        },
        [dataPoints, yScaleFn],
    );

    const predictionPointsData = useMemo(
        () => (
            dataPoints.filter(
                (pathPoints) => pathPoints.originalData.year === latestProjectionYear,
            )
        ),
        [dataPoints, latestProjectionYear],
    );

    return (
        <div
            className={styles.foodInsecurityChart}
            ref={chartContainerRef}
        >
            <svg className={styles.svg}>
                <ChartAxes
                    xAxisPoints={xAxisTicks}
                    yAxisPoints={yAxisTicks}
                    chartSize={chartSize}
                    chartMargin={defaultChartMargin}
                    xAxisHeight={X_AXIS_HEIGHT}
                    yAxisWidth={Y_AXIS_WIDTH}
                />
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
            </svg>
        </div>
    );
}

export default FoodInsecurityChart;
