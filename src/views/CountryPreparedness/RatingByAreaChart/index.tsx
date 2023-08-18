import { useMemo, useRef } from 'react';
import { isNotDefined } from '@togglecorp/fujs';

import { type GoApiResponse } from '#utils/restRequest';
import ChartAxes from '#components/ChartAxes';
import useSizeTracking from '#hooks/useSizeTracking';
import { getScaleFunction } from '#utils/chart';

import styles from './styles.module.css';

type PerOptionsResponse = GoApiResponse<'/api/v2/per-options/'>;
type PerFormAreaResponse = GoApiResponse<'/api/v2/per-formarea/'>;

interface ChartPoint {
    x: number;
    y: number;
    label: string | undefined;
}

function chartPointSelector(chartPoint: ChartPoint) {
    return chartPoint;
}

const X_AXIS_HEIGHT = 50;
const Y_AXIS_WIDTH = 90;
const CHART_OFFSET = 10;

const chartMargin = {
    left: Y_AXIS_WIDTH + CHART_OFFSET,
    top: CHART_OFFSET,
    right: CHART_OFFSET,
    bottom: X_AXIS_HEIGHT + CHART_OFFSET,
};

interface Props {
    data: {
        id: number;
        areaNum: number | undefined;
        title: string;
        value: number;
    }[] | undefined;
    ratingOptions: PerOptionsResponse['componentratings'] | undefined;
    formAreaOptions: PerFormAreaResponse['results'] | undefined;
}

function RatingByAreaChart(props: Props) {
    const {
        data,
        ratingOptions,
        formAreaOptions,
    } = props;

    const containerRef = useRef<HTMLDivElement>(null);
    const chartBounds = useSizeTracking(containerRef);

    const points = useMemo(
        () => {
            if (isNotDefined(data) || data.length === 0) {
                return undefined;
            }

            const xScale = getScaleFunction(
                { min: 0, max: 5 },
                { min: 0, max: chartBounds.width },
                { start: chartMargin.left, end: chartMargin.right },
            );

            const yScale = getScaleFunction(
                { min: 0, max: 5 },
                { min: 0, max: chartBounds.height },
                { start: chartMargin.top, end: chartMargin.bottom },
                true,
            );

            const xAxisPoints = formAreaOptions?.map(
                (areaOption, i) => ({
                    x: xScale(i),
                    y: Math.max(chartBounds.height - chartMargin.bottom, 0),
                    label: areaOption.title,
                }),
            ) ?? [];

            const yAxisPoints = ratingOptions?.map(
                (option, i) => ({
                    x: 0,
                    y: yScale(i),
                    label: option.title,
                }),
            ) ?? [];

            const chartPoints = data.map(
                (datum, i) => ({
                    key: i,
                    x: xScale(i),
                    y: yScale(datum.value),
                    label: datum.title,
                    value: datum.value,
                }),
            );

            return {
                chart: chartPoints,
                xAxis: xAxisPoints,
                yAxis: yAxisPoints,
            };
        },
        [data, chartBounds, ratingOptions, formAreaOptions],
    );

    const maxBarWidth = (chartBounds.width / 5);
    const barWidth = Math.max(maxBarWidth * 0.6, 10);
    const barGap = (maxBarWidth - barWidth) / 4;

    return (
        <div
            className={styles.ratingByAreaChart}
            ref={containerRef}
        >
            <svg className={styles.svg}>
                {points && (
                    // FIXME: we should also check that points has at least one
                    // element
                    <ChartAxes
                        xAxisPoints={points.xAxis}
                        yAxisPoints={points.yAxis}
                        chartOffset={CHART_OFFSET}
                        chartMargin={chartMargin}
                        chartBounds={chartBounds}
                        xAxisTickSelector={chartPointSelector}
                        yAxisTickSelector={chartPointSelector}
                    />
                )}
                {points?.chart.map(
                    (point) => (
                        <rect
                            key={point.key}
                            className={styles.rect}
                            x={point.x + barGap}
                            y={point.y}
                            width={barWidth}
                            height={Math.max(chartBounds.height - point.y - chartMargin.bottom, 0)}
                        >
                            <title>
                                {`${point.label}: ${point.value}`}
                            </title>
                        </rect>
                    ),
                )}
            </svg>
        </div>
    );
}

export default RatingByAreaChart;
