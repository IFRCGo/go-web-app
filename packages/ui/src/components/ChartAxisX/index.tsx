import {
    Fragment,
    useMemo,
} from 'react';
import {
    _cs,
    compareNumber,
    isDefined,
} from '@togglecorp/fujs';

import styles from './styles.module.css';

interface Props {
    ticks: {
        x: number;
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

function ChartAxisX(props: Props) {
    const {
        ticks: ticksFromProps,
        chartMargin,
        chartBounds,
        chartInnerOffset,
    } = props;

    const ticks = useMemo(
        () => [...ticksFromProps].sort((a, b) => compareNumber(a.x, b.x)),
        [ticksFromProps],
    );

    return (
        <g className={styles.chartAxisX}>
            {ticks.map((tick, i) => {
                const isFirst = i === 0;
                const isLast = i === (ticks.length - 1);

                const nextTick = isLast ? tick : ticks[i + 1];
                const prevTick = isFirst ? tick : ticks[i - 1];

                const x1 = (prevTick.x + tick.x) / 2;
                const x2 = (tick.x + nextTick.x) / 2;

                const y = chartBounds.height - chartMargin.bottom;

                return (
                    <Fragment key={tick.x}>
                        <line
                            className={styles.axisLines}
                            x1={tick.x}
                            y1={chartMargin.top}
                            x2={tick.x}
                            y2={y}
                        />
                        <foreignObject
                            x={x1}
                            y={y}
                            width={Math.abs(x2 - x1)}
                            height={chartMargin.bottom - chartInnerOffset}
                            style={{
                                transformOrigin: `${tick.x}px ${y}px`,
                            }}
                        >
                            <div
                                className={_cs(
                                    styles.xAxisTickText,
                                    isFirst && styles.first,
                                    isLast && styles.last,
                                )}
                                style={{
                                    width: Math.abs(x2 - x1),
                                    height: chartMargin.bottom - chartInnerOffset,
                                }}
                                title={isDefined(tick.label) ? String(tick.label) : undefined}
                            >
                                {tick.label}
                            </div>
                        </foreignObject>
                    </Fragment>
                );
            })}
        </g>
    );
}

export default ChartAxisX;
