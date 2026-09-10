import { useCallback } from 'react';
import {
    ChartAxes,
    ChartContainer,
    ChartPoint,
    Description,
    TextOutput,
    Tooltip,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    formatNumber,
    getPathData,
    resolveToString,
} from '@ifrc-go/ui/utils';

import useNumericChartData from '#hooks/useNumericChartData';
import { DEFAULT_Y_AXIS_WIDTH_WITH_LABEL } from '#utils/constants';

import {
    impactSelector,
    type JbaForecastRow,
} from '../../utils';

import i18n from './i18n.json';
import styles from './styles.module.css';

const MAX_X_AXIS_TICKS = 6;

function leadTimeSelector(row: JbaForecastRow) {
    return row.leadTimeDays;
}
function tickLabelSelector(value: number) {
    return value;
}
function yTickLabelSelector(value: number) {
    return formatNumber(Math.round(value), { compact: true, maximumFractionDigits: 1 });
}

interface Props {
    rows: JbaForecastRow[];
    activeLeadTimeDays: number;
}

function TrajectoryChart(props: Props) {
    const {
        rows,
        activeLeadTimeDays,
    } = props;

    const strings = useTranslation(i18n);

    const leadTimes = rows.map(leadTimeSelector);
    const xDomain = {
        min: Math.min(...leadTimes),
        max: Math.max(...leadTimes),
    };

    const chartData = useNumericChartData(
        rows,
        {
            keySelector: leadTimeSelector,
            xValueSelector: leadTimeSelector,
            yValueSelector: impactSelector,
            xAxisTickLabelSelector: tickLabelSelector,
            yAxisTickLabelSelector: yTickLabelSelector,
            xDomain,
            // Fewer ticks than lead days, otherwise the axis rotates the labels
            numXAxisTicks: Math.min(rows.length, MAX_X_AXIS_TICKS),
            yValueStartsFromZero: true,
            yAxisWidth: DEFAULT_Y_AXIS_WIDTH_WITH_LABEL,
        },
    );

    const tooltipSelector = useCallback(
        (leadTimeDays: number | string) => {
            const row = rows.find((item) => item.leadTimeDays === leadTimeDays);
            return (
                <Tooltip
                    title={resolveToString(
                        strings.jbaTrajectoryChartTooltipTitle,
                        { leadTime: leadTimeDays },
                    )}
                    description={(
                        <>
                            <TextOutput
                                label={strings.jbaTrajectoryChartTooltipTargetDate}
                                value={row?.forecastTargetDate}
                                valueType="date"
                            />
                            <TextOutput
                                label={strings.jbaTrajectoryChartTooltipPopulationImpacted}
                                value={row ? impactSelector(row) : undefined}
                                valueType="number"
                                maximumFractionDigits={0}
                                strongValue
                            />
                        </>
                    )}
                />
            );
        },
        [rows, strings],
    );

    return (
        <>
            <ChartContainer
                className={styles.chartContainer}
                chartData={chartData}
            >
                <g className={styles.trajectory}>
                    <path
                        className={styles.line}
                        d={getPathData(chartData.chartPoints)}
                    />
                    {chartData.chartPoints.map((point) => (
                        <ChartPoint
                            key={point.key}
                            active={point.key === activeLeadTimeDays}
                            x={point.x}
                            y={point.y}
                        />
                    ))}
                </g>
                <ChartAxes
                    chartData={chartData}
                    yAxisLabel={strings.jbaTrajectoryChartYAxisLabel}
                    tooltipSelector={tooltipSelector}
                />
            </ChartContainer>
            <Description
                textSize="sm"
                withCenteredContent
            >
                {strings.jbaTrajectoryChartXAxisLabel}
            </Description>
        </>
    );
}

export default TrajectoryChart;
