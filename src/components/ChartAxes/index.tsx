import { Fragment } from 'react';
import { isDefined } from '@togglecorp/fujs';

import styles from './styles.module.css';

interface TickX {
    x: number;
    label: number | string | undefined;
}

interface TickY {
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
        left: number;
    };
    xAxisTickSelector: (dataPoint: X) => TickX;
    yAxisTickSelector: (dataPoint: Y) => TickY;
    chartBounds: {
        width: number;
        height: number;
    };
    boundRectsShown?: boolean,
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
        boundRectsShown: showBoundRects,
    } = props;

    const xAxisTickWidth = Math.max(
        Math.abs((chartBounds.width - chartMargin.right - chartMargin.left) / xAxisPoints.length),
        30,
    );
    const yAxisTickHeight = Math.max(
        (chartBounds.height - chartMargin.top - chartMargin.bottom) / yAxisPoints.length,
        0,
    );

    return (
        <g>
            {yAxisPoints.map((pointData) => {
                const tick = yAxisTickSelector(pointData);

                return (
                    <Fragment key={tick.y}>
                        <line
                            className={styles.xAxisGridLine}
                            x1={chartMargin.left}
                            y1={tick.y}
                            x2={chartBounds.width - chartMargin.right}
                            y2={tick.y}
                        />
                        <foreignObject
                            x={chartOffset}
                            y={tick.y - yAxisTickHeight / 2}
                            width={chartMargin.left - chartOffset}
                            height={yAxisTickHeight}
                        >
                            <div
                                className={styles.yAxisTickText}
                                style={{
                                    width: chartMargin.left - chartOffset,
                                    height: yAxisTickHeight,
                                }}
                                title={isDefined(tick.label) ? String(tick.label) : undefined}
                            >
                                {tick.label}
                            </div>
                        </foreignObject>
                    </Fragment>
                );
            })}
            {xAxisPoints.map((pointData, i) => {
                const tick = xAxisTickSelector(pointData);
                const nextTickX = i === (xAxisPoints.length - 1)
                    ? (chartBounds.width - chartMargin.right)
                    : xAxisTickSelector(xAxisPoints[i + 1]).x;

                const rectX1 = tick.x;
                const rectX2 = nextTickX;

                const y = chartBounds.height - chartMargin.bottom;

                return (
                    <Fragment key={tick.x}>
                        <line
                            className={styles.yAxisGridLine}
                            x1={tick.x}
                            y1={chartMargin.top}
                            x2={tick.x}
                            y2={y}
                        />
                        <foreignObject
                            x={tick.x}
                            y={y}
                            width={xAxisTickWidth}
                            height={chartMargin.bottom - chartOffset}
                            style={{
                                transformOrigin: `${tick.x}px ${y}px`,
                            }}
                        >
                            <div
                                className={styles.xAxisTickText}
                                style={{
                                    width: xAxisTickWidth,
                                    height: chartMargin.bottom - chartOffset,
                                }}
                                title={isDefined(tick.label) ? String(tick.label) : undefined}
                            >
                                {tick.label}
                            </div>
                        </foreignObject>
                        {showBoundRects && (
                            <rect
                                x={rectX1}
                                width={rectX2 - rectX1}
                                y={chartMargin.top}
                                height={y - chartMargin.top}
                                className={styles.boundRect}
                            />
                        )}
                    </Fragment>
                );
            })}
        </g>
    );
}

export default ChartAxes;
