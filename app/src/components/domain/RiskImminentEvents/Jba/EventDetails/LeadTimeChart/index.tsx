import { useMemo } from 'react';
import {
    ChartAxes,
    ChartContainer,
    Tooltip,
} from '@ifrc-go/ui';
import { getDiscretePathDataList } from '@ifrc-go/ui/utils';
import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';

import useNumericChartData from '#hooks/useNumericChartData';
import { defaultChartMargin } from '#utils/constants';

import { JBA_IMPACT_THRESHOLD } from '../../../malawi/constants';
import { type JbaEvent } from '../../index';

import styles from './styles.module.css';

interface Props {
    timeline: JbaEvent[];
    activeLeadTimeDays: number;
}

function keySelector(d: JbaEvent) { return d.id; }
function xValueSelector(d: JbaEvent) { return d.leadTimeDays ?? undefined; }
function yValueSelector(d: JbaEvent) { return d.band5Mean; }
function xAxisTickLabelSelector(v: number) { return `${v}d`; }

// Closed area path between a lower and an upper series across the chart points,
// skipping points where either bound is undefined. Returns undefined if there
// are fewer than two usable points.
function buildBandPath(
    points: { x: number; lower: number | null | undefined; upper: number | null | undefined }[],
    yScaleFn: (value: number) => number,
) {
    const usable = points.filter(
        (d): d is { x: number; lower: number; upper: number } => (
            isDefined(d.lower) && isDefined(d.upper)
        ),
    );
    if (usable.length < 2) {
        return undefined;
    }
    const upperEdge = usable.map((d) => `${d.x},${yScaleFn(d.upper)}`);
    const lowerEdge = [...usable].reverse().map((d) => `${d.x},${yScaleFn(d.lower)}`);
    return `M ${upperEdge.join(' L ')} L ${lowerEdge.join(' L ')} Z`;
}

function LeadTimeChart(props: Props) {
    const { timeline, activeLeadTimeDays } = props;

    // Scale the y-axis to cover the full ensemble spread (the max line / band),
    // not just the mean — otherwise the fan would clip.
    const yDomainMax = useMemo(() => {
        const values = timeline.flatMap(
            (d) => [d.band5Max, d.band5P90, d.band5Mean].filter(isDefined),
        );
        return values.length > 0 ? Math.max(...values) : undefined;
    }, [timeline]);

    const chartData = useNumericChartData(timeline, {
        keySelector,
        xValueSelector,
        yValueSelector,
        xAxisTickLabelSelector,
        chartMargin: defaultChartMargin,
        xDomain: { min: 1, max: 10 },
        yDomain: isDefined(yDomainMax) ? { min: 0, max: yDomainMax } : undefined,
        numXAxisTicks: 10,
        numYAxisTicks: 4,
        yValueStartsFromZero: true,
    });

    const linePath = useMemo(
        () => getDiscretePathDataList(chartData.chartPoints)?.join(' ') ?? '',
        [chartData.chartPoints],
    );

    // Outer envelope (median → max) and inner likely range (median → P90).
    const envelopePath = useMemo(
        () => buildBandPath(
            chartData.chartPoints.map((p) => ({
                x: p.x,
                lower: p.originalData.band5Median,
                upper: p.originalData.band5Max,
            })),
            chartData.yScaleFn,
        ),
        [chartData.chartPoints, chartData.yScaleFn],
    );

    const likelyPath = useMemo(
        () => buildBandPath(
            chartData.chartPoints.map((p) => ({
                x: p.x,
                lower: p.originalData.band5Median,
                upper: p.originalData.band5P90,
            })),
            chartData.yScaleFn,
        ),
        [chartData.chartPoints, chartData.yScaleFn],
    );

    const thresholdY = chartData.yScaleFn(JBA_IMPACT_THRESHOLD);

    return (
        <ChartContainer
            className={styles.chartContainer}
            chartData={chartData}
        >
            <ChartAxes
                chartData={chartData}
                // FIXME: use strings
                yAxisLabel="People exposed"
            />
            {isDefined(envelopePath) && (
                <path
                    className={styles.bandEnvelope}
                    d={envelopePath}
                />
            )}
            {isDefined(likelyPath) && (
                <path
                    className={styles.bandLikely}
                    d={likelyPath}
                />
            )}
            <line
                className={styles.threshold}
                x1={chartData.dataAreaOffset.left}
                x2={chartData.dataAreaOffset.left + chartData.dataAreaSize.width}
                y1={thresholdY}
                y2={thresholdY}
            />
            <path
                className={styles.line}
                d={linePath}
            />
            {chartData.chartPoints.map((point) => {
                const ev = point.originalData;
                const isActive = ev.leadTimeDays === activeLeadTimeDays;
                return (
                    <circle
                        key={point.key}
                        className={_cs(styles.point, isActive && styles.pointActive)}
                        cx={point.x}
                        cy={point.y}
                        r={isActive ? 5 : 3}
                    >
                        <Tooltip
                            // FIXME: use strings
                            title={`Lead time: ${ev.leadTimeDays}d`}
                            description={(
                                <>
                                    <div>{`Mean: ${Math.round(ev.band5Mean).toLocaleString()}`}</div>
                                    {isDefined(ev.band5Median) && (
                                        <div>{`Median: ${Math.round(ev.band5Median).toLocaleString()}`}</div>
                                    )}
                                    {isDefined(ev.band5P90) && (
                                        <div>{`P90: ${Math.round(ev.band5P90).toLocaleString()}`}</div>
                                    )}
                                    {isDefined(ev.band5Max) && (
                                        <div>{`Max: ${Math.round(ev.band5Max).toLocaleString()}`}</div>
                                    )}
                                </>
                            )}
                        />
                    </circle>
                );
            })}
        </ChartContainer>
    );
}

export default LeadTimeChart;
