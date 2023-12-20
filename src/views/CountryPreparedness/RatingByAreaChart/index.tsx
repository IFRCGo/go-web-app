import { ElementRef, useRef } from 'react';
import { listToMap } from '@togglecorp/fujs';

import ChartAxes from '#components/ChartAxes';
import useChartData from '#hooks/useChartData';
import { defaultChartMargin, defaultChartPadding } from '#utils/constants';
import { type GoApiResponse } from '#utils/restRequest';

import styles from './styles.module.css';

type PerOptionsResponse = GoApiResponse<'/api/v2/per-options/'>;
// type PerFormAreaResponse = GoApiResponse<'/api/v2/per-formarea/'>;

const X_AXIS_HEIGHT = 50;
const Y_AXIS_WIDTH = 90;

const chartOffset = {
    left: Y_AXIS_WIDTH,
    top: 10,
    right: 30,
    bottom: X_AXIS_HEIGHT,
};

interface Props {
    data: {
        id: number;
        areaNum: number | undefined;
        title: string;
        value: number;
    }[] | undefined;
    ratingOptions: PerOptionsResponse['componentratings'] | undefined;
    // formAreaOptions: PerFormAreaResponse['results'] | undefined;
}

function RatingByAreaChart(props: Props) {
    const {
        data,
        ratingOptions,
        // formAreaOptions,
    } = props;

    const containerRef = useRef<ElementRef<'div'>>(null);
    const ratingTitleMap = listToMap(
        ratingOptions,
        (option) => option.value,
        (option) => option.title,
    );

    const {
        dataPoints,
        chartSize,
        xAxisTicks,
        yAxisTicks,
    } = useChartData(
        data,
        {
            containerRef,
            chartOffset,
            chartMargin: defaultChartMargin,
            chartPadding: defaultChartPadding,
            keySelector: (datum) => datum.id,
            xValueSelector: (datum) => datum.areaNum ?? 0,
            yValueSelector: (datum) => datum.value,
            xAxisLabelSelector: (datum) => datum.title,
            yAxisLabelSelector: (rating) => ratingTitleMap?.[rating],
            type: 'categorical',
            yDomain: { min: 0, max: 5 },
        },
    );

    const barWidth = 10;

    return (
        <div
            className={styles.ratingByAreaChart}
            ref={containerRef}
        >
            <svg className={styles.svg}>
                <ChartAxes
                    xAxisHeight={X_AXIS_HEIGHT}
                    yAxisWidth={Y_AXIS_WIDTH}
                    xAxisPoints={xAxisTicks}
                    yAxisPoints={yAxisTicks}
                    chartMargin={defaultChartMargin}
                    chartSize={chartSize}
                />
                {dataPoints.map(
                    (point) => (
                        <g key={point.key}>
                            {point.originalData.value !== 0 && (
                                <text
                                    className={styles.text}
                                    textAnchor="middle"
                                    dy={-10}
                                    dx={barWidth / 2}
                                    x={point.x - barWidth / 2}
                                    y={point.y}
                                >
                                    {Number(point.originalData.value.toFixed(2)) ?? '-'}
                                </text>
                            )}
                            <rect
                                className={styles.rect}
                                x={point.x - barWidth / 2}
                                y={point.y}
                                ry={barWidth / 2}
                                width={barWidth}
                                height={
                                    Math.max(
                                        // eslint-disable-next-line max-len
                                        chartSize.height - point.y - defaultChartMargin.bottom - chartOffset.bottom,
                                        0,
                                    )
                                }
                            />
                        </g>
                    ),
                )}
            </svg>
        </div>
    );
}

export default RatingByAreaChart;
