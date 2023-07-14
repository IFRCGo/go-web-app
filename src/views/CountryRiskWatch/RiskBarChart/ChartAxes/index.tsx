import { Fragment } from 'react';

import styles from './styles.module.css';

interface Tick {
    x: number;
    y: number;
    label: number | string | undefined;
}

interface Props<X, Y> {
    xAxisPoints: X[];
    yAxisPoints: Y[];
    chartOffset: number;
    chartMargin: {
        top: number;
        right: number;
        bottom: number;
        left: number; };
    xAxisTickSelector: (dataPoint: X) => Tick;
    yAxisTickSelector: (dataPoint: Y) => Tick;
    chartBounds: {
        width: number;
        height: number;
    };
}

function ChartAxes<X, Y>(props: Props<X, Y>) {
    const {
        xAxisPoints,
        yAxisPoints,
        xAxisTickSelector,
        yAxisTickSelector,
        chartMargin,
        chartOffset,
        chartBounds,
    } = props;

    return (
        <g>
            {xAxisPoints.map((pointData) => {
                const tick = xAxisTickSelector(pointData);

                return (
                    <Fragment key={tick.x}>
                        <line
                            className={styles.yAxisGridLine}
                            x1={tick.x}
                            y1={chartMargin.top}
                            x2={tick.x}
                            y2={tick.y}
                        />
                        <text
                            className={styles.xAxisTickText}
                            x={tick.x}
                            y={tick.y}
                            style={{
                                transformOrigin: `${tick.x}px ${tick.y}px`,
                            }}
                        >
                            {tick.label}
                        </text>
                    </Fragment>
                );
            })}
            {yAxisPoints.map((pointData) => {
                const tick = yAxisTickSelector(pointData);

                return (
                    <Fragment key={tick.y}>
                        <text
                            className={styles.yAxisTickText}
                            x={tick.x}
                            y={tick.y}
                        >
                            {tick.label}
                        </text>
                        <line
                            className={styles.xAxisGridLine}
                            x1={tick.x}
                            y1={tick.y}
                            x2={chartBounds.width - chartOffset}
                            y2={tick.y}
                        />
                    </Fragment>
                );
            })}
        </g>
    );
}

export default ChartAxes;
