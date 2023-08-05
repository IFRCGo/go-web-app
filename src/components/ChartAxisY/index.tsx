import { Fragment } from 'react';
import { isDefined } from '@togglecorp/fujs';

import styles from './styles.module.css';

interface Props {
    ticks: {
        y: number;
        label: React.ReactNode;
    }[];
    chartMargin: {
        top: number;
        right: number;
        bottom: number;
        left: number;
    };
    chartBounds: {
        width: number;
        height: number;
    };
    chartInnerOffset: number;
}

function ChartAxisY(props: Props) {
    const {
        ticks,
        chartMargin,
        chartBounds,
        chartInnerOffset,
    } = props;

    const yAxisTickHeight = Math.max(
        (chartBounds.height - chartMargin.top - chartMargin.bottom)
            / ticks.length,
        0,
    );

    return (
        <g className={styles.chartAxisY}>
            {ticks.map((tick) => (
                <Fragment key={tick.y}>
                    <line
                        className={styles.axisLine}
                        x1={chartMargin.left}
                        y1={tick.y}
                        x2={chartBounds.width - chartMargin.right}
                        y2={tick.y}
                    />
                    <foreignObject
                        x={chartInnerOffset}
                        y={tick.y - yAxisTickHeight / 2}
                        width={chartMargin.left - chartInnerOffset}
                        height={yAxisTickHeight}
                    >
                        <div
                            className={styles.yAxisTickText}
                            style={{
                                width: chartMargin.left - chartInnerOffset,
                                height: yAxisTickHeight,
                            }}
                            title={isDefined(tick.label) ? String(tick.label) : undefined}
                        >
                            {tick.label}
                        </div>
                    </foreignObject>
                </Fragment>
            ))}
        </g>
    );
}

export default ChartAxisY;
