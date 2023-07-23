import { useMemo, useRef } from 'react';
import { isNotDefined } from '@togglecorp/fujs';

import useSizeTracking from '#hooks/useSizeTracking';
import { getScaleFunction } from '#utils/chart';

import styles from './styles.module.css';

const X_AXIS_HEIGHT = 24;
const Y_AXIS_WIDTH = 32;
const CHART_OFFSET = 16;

const chartMargin = {
    left: Y_AXIS_WIDTH + CHART_OFFSET,
    top: CHART_OFFSET,
    right: CHART_OFFSET,
    bottom: X_AXIS_HEIGHT + CHART_OFFSET,
};

interface Props {
    data: {
        id: number;
        title: string;
        value: number;
    }[] | undefined;
}

function RatingByAreaChart(props: Props) {
    const { data } = props;

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
                { start: chartMargin.left, end: chartMargin.right },
                true,
            );

            return data.map(
                (datum, i) => ({
                    key: i,
                    x: xScale(i),
                    y: yScale(datum.value),
                    label: datum.title,
                    value: datum.value,
                }),
            );
        },
        [data, chartBounds],
    );

    const barWidth = (chartBounds.width / 5) * 0.9;

    return (
        <div
            className={styles.ratingByAreaChart}
            ref={containerRef}
        >
            <svg className={styles.svg}>
                {points?.map(
                    (point) => (
                        <rect
                            key={point.key}
                            className={styles.rect}
                            x={point.x}
                            y={point.y}
                            width={barWidth}
                            height={Math.max(chartBounds.height - point.y, 0)}
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
