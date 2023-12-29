import {
    useCallback,
    useMemo,
    useRef,
    useState,
} from 'react';
import {
    ChartAxes,
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

import { paths } from '#generated/riskTypes';
import useChartData from '#hooks/useChartData';
import {
    COLOR_PRIMARY_BLUE,
    defaultChartMargin,
    defaultChartPadding,
} from '#utils/constants';

import i18n from './i18n.json';
import styles from './styles.module.css';

type GetCountryRisk = paths['/api/v1/country-seasonal/']['get'];
type CountryRiskResponse = GetCountryRisk['responses']['200']['content']['application/json'];
type RiskData = CountryRiskResponse[number];

const X_AXIS_HEIGHT = 32;
const Y_AXIS_WIDTH = 48;

const chartOffset = {
    left: Y_AXIS_WIDTH,
    top: 0,
    right: 0,
    bottom: X_AXIS_HEIGHT,
};

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
    const chartContainerRef = useRef<HTMLDivElement>(null);

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

    const {
        dataPoints,
        xAxisTicks,
        yAxisTicks,
        chartSize,
        yScaleFn,
    } = useChartData(
        aggregatedList,
        {
            containerRef: chartContainerRef,
            chartOffset,
            chartMargin: defaultChartMargin,
            chartPadding: defaultChartPadding,
            type: 'numeric',
            keySelector: (datum) => datum.month,
            xValueSelector: (datum) => datum.month,
            yValueSelector: (datum) => datum.maxValue,
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

    const minPoints = dataPoints.map(
        (dataPoint) => ({
            ...dataPoint,
            y: yScaleFn(dataPoint.originalData.min),
        }),
    );

    const maxPoints = dataPoints.map(
        (dataPoint) => ({
            ...dataPoint,
            y: yScaleFn(dataPoint.originalData.max),
        }),
    );

    const minMaxPoints = [...minPoints, ...[...maxPoints].reverse()];

    const currentYearPoints = dataPoints.map(
        (dataPoint) => {
            if (isNotDefined(dataPoint.originalData.current)) {
                return undefined;
            }

            return {
                ...dataPoint,
                y: yScaleFn(dataPoint.originalData.current),
            };
        },
    ).filter(isDefined);

    const averagePoints = dataPoints.map(
        (dataPoint) => ({
            ...dataPoint,
            y: yScaleFn(dataPoint.originalData.average),
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
        <div
            className={styles.wildfireChart}
            ref={chartContainerRef}
        >
            <svg className={styles.svg}>
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
                    xAxisPoints={xAxisTicks}
                    yAxisPoints={yAxisTicks}
                    chartMargin={defaultChartMargin}
                    chartSize={chartSize}
                    xAxisHeight={X_AXIS_HEIGHT}
                    yAxisWidth={Y_AXIS_WIDTH}
                    tooltipSelector={tooltipSelector}
                    onHover={handleHover}
                    yAxisLabel={strings.monthlySeverityRating}
                />
            </svg>
        </div>
    );
}

export default WildfireChart;
