import { useMemo } from 'react';
import {
    ChartAxes,
    ChartContainer,
    Tooltip,
} from '@ifrc-go/ui';
import { getDiscretePathDataList } from '@ifrc-go/ui/utils';
import { _cs } from '@togglecorp/fujs';

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

function LeadTimeChart(props: Props) {
    const { timeline, activeLeadTimeDays } = props;

    const chartData = useNumericChartData(timeline, {
        keySelector,
        xValueSelector,
        yValueSelector,
        xAxisTickLabelSelector,
        chartMargin: defaultChartMargin,
        xDomain: { min: 1, max: 10 },
        numXAxisTicks: 10,
        numYAxisTicks: 4,
        yValueStartsFromZero: true,
    });

    const linePath = useMemo(
        () => getDiscretePathDataList(chartData.chartPoints)?.join(' ') ?? '',
        [chartData.chartPoints],
    );

    const thresholdY = chartData.yScaleFn(JBA_IMPACT_THRESHOLD);

    return (
        <ChartContainer
            className={styles.chartContainer}
            chartData={chartData}
        >
            <ChartAxes chartData={chartData} />
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
                const isActive = point.originalData.leadTimeDays === activeLeadTimeDays;
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
                            title={`Lead time: ${point.originalData.leadTimeDays}d`}
                            description={`Impact (mean): ${point.originalData.band5Mean.toFixed(3)}`}
                        />
                    </circle>
                );
            })}
        </ChartContainer>
    );
}

export default LeadTimeChart;
