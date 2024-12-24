import {
    useCallback,
    useMemo,
    useState,
} from 'react';
import {
    ChartAxes,
    ChartContainer,
    ChartPoint,
    TextOutput,
    Tooltip,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    avgSafe,
    formatNumber,
    getDiscretePathDataList,
    getPathData,
    resolveToString,
} from '@ifrc-go/ui/utils';
import {
    isDefined,
    isNotDefined,
    listToGroupList,
    mapToList,
} from '@togglecorp/fujs';

import { type paths } from '#generated/riskTypes';
import useTemporalChartData from '#hooks/useTemporalChartData';
import {
    COLOR_PRIMARY_BLUE,
    DEFAULT_Y_AXIS_WIDTH_WITH_LABEL,
} from '#utils/constants';

import i18n from './i18n.json';
import styles from './styles.module.css';

type GetCountryRisk = paths['/api/v1/country-seasonal/']['get'];
type CountryRiskResponse = GetCountryRisk['responses']['200']['content']['application/json'];
type RiskData = CountryRiskResponse[number];

interface ChartPoint {
    x: number;
    y: number;
    label: string | undefined;
}

interface Props {
    gwisData: RiskData['gwis'] | undefined;
}

const currentYear = new Date().getFullYear();

function WildfireChart(props: Props) {
    const { gwisData } = props;

    const strings = useTranslation(i18n);

    const aggregatedList = useMemo(
        () => {
            const monthGroupedData = listToGroupList(
                gwisData?.filter((dataItem) => dataItem.dsr_type === 'monthly') ?? [],
                (gwisItem) => gwisItem.month,
            );

            return mapToList(
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
        },
        [gwisData],
    );

    const chartData = useTemporalChartData(
        aggregatedList,
        {
            keySelector: (datum) => datum.month,
            xValueSelector: (datum) => datum.date,
            yValueSelector: (datum) => datum.maxValue,
            yearlyChart: true,
            yAxisWidth: DEFAULT_Y_AXIS_WIDTH_WITH_LABEL,
            yValueStartsFromZero: true,
        },
    );

    const minPoints = chartData.chartPoints.map(
        (dataPoint) => ({
            ...dataPoint,
            y: chartData.yScaleFn(dataPoint.originalData.min),
        }),
    );

    const maxPoints = chartData.chartPoints.map(
        (dataPoint) => ({
            ...dataPoint,
            y: chartData.yScaleFn(dataPoint.originalData.max),
        }),
    );

    const minMaxPoints = [...minPoints, ...[...maxPoints].reverse()];

    const currentYearPoints = chartData.chartPoints.map(
        (dataPoint) => {
            if (isNotDefined(dataPoint.originalData.current)) {
                return undefined;
            }

            return {
                ...dataPoint,
                y: chartData.yScaleFn(dataPoint.originalData.current),
            };
        },
    ).filter(isDefined);

    const averagePoints = chartData.chartPoints.map(
        (dataPoint) => ({
            ...dataPoint,
            y: chartData.yScaleFn(dataPoint.originalData.average),
        }),
    );

    const tooltipSelector = useCallback(
        (_: number | string, i: number) => {
            const date = new Date(currentYear, i, 1);
            const monthData = aggregatedList[i];

            return (
                <Tooltip
                    title={date.toLocaleString(navigator.language, { month: 'long' })}
                    description={(
                        <>
                            <TextOutput
                                value={resolveToString(
                                    strings.minMaxValue,
                                    {
                                        min: formatNumber(monthData.min),
                                        max: formatNumber(monthData.max),
                                    },
                                )}
                                strongValue
                                label={resolveToString(strings.minMax, { currentYear })}
                            />
                            <TextOutput
                                value={monthData.average}
                                label={resolveToString(strings.average, { currentYear })}
                                valueType="number"
                                strongValue
                            />
                            <TextOutput
                                value={monthData.current}
                                label={resolveToString(strings.year, { currentYear })}
                                valueType="number"
                                strongValue
                            />
                        </>
                    )}
                />
            );
        },
        [strings, aggregatedList],
    );

    const [hoveredAxisIndex, setHoveredAxisIndex] = useState<number | undefined>();

    const handleHover = useCallback(
        (_: number | string | undefined, i: number | undefined) => {
            setHoveredAxisIndex(i);
        },
        [],
    );

    return (
        <ChartContainer
            className={styles.wildfireChart}
            chartData={chartData}
        >
            <path
                className={styles.minMaxPath}
                d={getPathData(minMaxPoints)}
            />
            <g className={styles.currentYear}>
                {getDiscretePathDataList(currentYearPoints).map(
                    (points) => (
                        <path
                            className={styles.path}
                            key={points}
                            d={points}
                        />
                    ),
                )}
                {currentYearPoints.map(
                    (pointData, i) => (
                        <ChartPoint
                            className={styles.point}
                            key={pointData.key}
                            x={pointData.x}
                            y={pointData.y}
                            active={i === hoveredAxisIndex}
                        />
                    ),
                )}
            </g>
            <g className={styles.average}>
                <path
                    className={styles.path}
                    d={getPathData(averagePoints)}
                    fill="none"
                    stroke={COLOR_PRIMARY_BLUE}
                />
                {averagePoints.map(
                    (pointData, i) => (
                        <ChartPoint
                            className={styles.point}
                            key={pointData.key}
                            x={pointData.x}
                            y={pointData.y}
                            active={i === hoveredAxisIndex}
                        />
                    ),
                )}
            </g>
            <ChartAxes
                chartData={chartData}
                tooltipSelector={tooltipSelector}
                onHover={handleHover}
                yAxisLabel={strings.monthlySeverityRating}
            />
        </ChartContainer>
    );
}

export default WildfireChart;
