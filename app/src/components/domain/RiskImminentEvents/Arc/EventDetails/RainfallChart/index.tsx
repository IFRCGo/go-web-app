import { useMemo } from 'react';
import {
    ChartAxes,
    ChartContainer,
    TextOutput,
    Tooltip,
} from '@ifrc-go/ui';
import { getDiscretePathDataList } from '@ifrc-go/ui/utils';
import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';

import useTemporalChartData from '#hooks/useTemporalChartData';
import { defaultChartMargin } from '#utils/constants';

import { type ArcEvent } from '../../index';

import styles from './styles.module.css';

interface Props {
    timeline: ArcEvent[];
    activeObservationDate: string;
}

function keySelector(d: ArcEvent) { return d.id; }
function xValueSelector(d: ArcEvent) { return d.observationDate; }
function yValueSelector(d: ArcEvent) { return d.rainfall ?? undefined; }

function RainfallChart(props: Props) {
    const { timeline, activeObservationDate } = props;

    // Rows without a processed rainfall value cannot be plotted.
    const plottable = useMemo(
        () => timeline.filter((d) => isDefined(d.rainfall)),
        [timeline],
    );

    const chartData = useTemporalChartData(plottable, {
        keySelector,
        xValueSelector,
        yValueSelector,
        chartMargin: defaultChartMargin,
        temporalResolution: 'day',
        yValueStartsFromZero: true,
        numYAxisTicks: 4,
        numXAxisTicks: 5,
        xAxisHeight: 40,
        yAxisWidth: 60,
    });

    const linePath = useMemo(
        () => getDiscretePathDataList(chartData.chartPoints)?.join(' ') ?? '',
        [chartData.chartPoints],
    );

    return (
        <ChartContainer
            className={styles.chartContainer}
            chartData={chartData}
        >
            <ChartAxes
                chartData={chartData}
                // FIXME: use strings
                yAxisLabel="Rainfall (mm)"
            />
            <path
                className={styles.line}
                d={linePath}
            />
            {chartData.chartPoints.map((point) => {
                const ev = point.originalData;
                const isActive = ev.observationDate === activeObservationDate;
                return (
                    <circle
                        key={point.key}
                        className={_cs(
                            styles.point,
                            ev.cellTrigger && styles.pointTriggered,
                            isActive && styles.pointActive,
                        )}
                        cx={point.x}
                        cy={point.y}
                        r={isActive ? 5 : 3}
                    >
                        <Tooltip
                            title={ev.observationDate}
                            description={(
                                <>
                                    {isDefined(ev.rainfall) && (
                                        <TextOutput
                                            // FIXME: use strings
                                            label="Rainfall (mm)"
                                            value={ev.rainfall}
                                            valueType="number"
                                            maximumFractionDigits={2}
                                        />
                                    )}
                                    {isDefined(ev.impact) && (
                                        <TextOutput
                                            // FIXME: use strings
                                            label="Impact"
                                            value={ev.impact}
                                            valueType="number"
                                            maximumFractionDigits={3}
                                        />
                                    )}
                                    {isDefined(ev.eventRp) && (
                                        <TextOutput
                                            // FIXME: use strings
                                            label="Return period (yrs)"
                                            value={ev.eventRp}
                                            valueType="number"
                                        />
                                    )}
                                    <TextOutput
                                        // FIXME: use strings
                                        label="Cell trigger"
                                        value={ev.cellTrigger ? 'Active' : 'Below trigger'}
                                    />
                                </>
                            )}
                        />
                    </circle>
                );
            })}
        </ChartContainer>
    );
}

export default RainfallChart;
