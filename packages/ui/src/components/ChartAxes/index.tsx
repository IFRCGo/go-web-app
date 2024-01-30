import React, {
    Fragment,
    useCallback,
    useRef,
} from 'react';
import { isDefined } from '@togglecorp/fujs';

import {
    type Rect,
    Size,
} from '#utils/chart';

import styles from './styles.module.css';

type Key = string | number;

interface TickX {
    key: Key;
    x: number;
    label: React.ReactNode;
}

interface TickY {
    y: number;
    label: React.ReactNode;
}

interface Props {
    xAxisPoints: TickX[];
    yAxisPoints: TickY[];
    chartMargin: Rect;
    xAxisHeight: number;
    yAxisWidth: number;
    chartSize: Size;
    xAxisAlignment?: 'left' | 'right' | 'center',
    tooltipSelector?: (key: Key, i: number) => React.ReactNode;
    onHover?: (key: Key | undefined, i: number | undefined) => void;
    onClick?: (key: Key, i: number) => void;
    yAxisLabel?: React.ReactNode;
}

function ChartAxes(props: Props) {
    const {
        xAxisPoints,
        yAxisPoints,
        chartMargin,
        xAxisHeight,
        yAxisWidth,
        chartSize,
        xAxisAlignment = 'left',
        tooltipSelector,
        onHover,
        onClick,
        yAxisLabel,
    } = props;

    const hoverOutTimeoutRef = useRef<number | undefined>();

    const yAxisTickHeight = Math.max(
        (chartSize.height - chartMargin.top - chartMargin.bottom) / yAxisPoints.length,
        0,
    );

    const getMouseOverHandler = useCallback(
        (key: Key, i: number) => {
            if (!onHover) {
                return undefined;
            }

            return () => {
                window.clearTimeout(hoverOutTimeoutRef.current);
                onHover(key, i);
            };
        },
        [onHover],
    );

    const getClickHandler = useCallback(
        (key: Key, i: number) => {
            if (!onClick) {
                return undefined;
            }

            return () => {
                onClick(key, i);
            };
        },
        [onClick],
    );

    const handleMouseOut = useCallback(
        () => {
            if (onHover) {
                window.clearTimeout(hoverOutTimeoutRef.current);
                hoverOutTimeoutRef.current = window.setTimeout(
                    () => {
                        // FIXME: check if component still mounted
                        onHover(undefined, undefined);
                    },
                    200,
                );
            }
        },
        [onHover],
    );

    function getLineX(startX: number, endX: number) {
        if (xAxisAlignment === 'left') {
            return startX;
        }

        if (xAxisAlignment === 'right') {
            return endX;
        }

        return (endX + startX) / 2;
    }

    if (xAxisPoints.length === 0) {
        return null;
    }

    const xAxisDiff = xAxisPoints.length === 1
        ? (chartSize.width - chartMargin.left - chartMargin.right) / 2
        : Math.max(xAxisPoints[1].x - xAxisPoints[0].x, 0);

    return (
        <g className={styles.chartAxes}>
            {isDefined(yAxisLabel) && (
                <foreignObject
                    x={0}
                    y={chartSize.height - 20}
                    width={chartSize.height}
                    height={20}
                    className={styles.yAxisLabelContainer}
                    style={{ transformOrigin: `0 ${chartSize.height - 20}px` }}
                >
                    <div className={styles.yAxisLabel}>
                        {yAxisLabel}
                    </div>
                </foreignObject>
            )}
            <g>
                {yAxisPoints.map((pointData) => (
                    <Fragment key={pointData.y}>
                        <line
                            className={styles.xAxisGridLine}
                            x1={chartMargin.left + yAxisWidth}
                            y1={pointData.y}
                            x2={chartSize.width - chartMargin.right}
                            y2={pointData.y}
                        />
                        <foreignObject
                            x={chartMargin.left}
                            y={pointData.y - yAxisTickHeight / 2}
                            width={yAxisWidth}
                            height={yAxisTickHeight}
                        >
                            <div
                                className={styles.yAxisTickText}
                                style={{
                                    width: yAxisWidth,
                                    height: yAxisTickHeight,
                                }}
                                title={typeof pointData.label === 'string' ? String(pointData.label) : undefined}
                            >
                                {pointData.label}
                            </div>
                        </foreignObject>
                    </Fragment>
                ))}
            </g>
            <g>
                {xAxisPoints.map((pointData, i) => {
                    const tick = pointData;

                    const startX = tick.x;
                    const endX = tick.x + xAxisDiff;

                    const x = getLineX(startX, endX);
                    const y = chartSize.height - chartMargin.bottom - xAxisHeight;

                    const xTickLabel = x - xAxisDiff / 2;
                    const xTickWidth = xAxisDiff;

                    return (
                        <Fragment key={tick.x}>
                            <line
                                className={styles.yAxisGridLine}
                                x1={x}
                                y1={chartMargin.top}
                                x2={x}
                                y2={y}
                            />
                            <foreignObject
                                className={styles.xAxisTick}
                                x={xTickLabel}
                                y={y}
                                width={xTickWidth}
                                height={xAxisHeight}
                                style={{
                                    transformOrigin: `${xTickLabel}px ${y}px`,
                                }}
                            >
                                <div
                                    className={styles.xAxisTickText}
                                    style={{
                                        width: xTickWidth,
                                        height: xAxisHeight,
                                    }}
                                    title={typeof tick.label === 'string' ? String(tick.label) : undefined}
                                >
                                    {tick.label}
                                </div>
                            </foreignObject>
                            {(isDefined(tooltipSelector) || isDefined(onHover)) && (
                                <rect
                                    x={startX - xTickWidth / 2}
                                    width={xTickWidth}
                                    y={chartMargin.top}
                                    height={Math.max(y - chartMargin.top, 0)}
                                    className={styles.boundRect}
                                    onClick={getClickHandler(tick.key, i)}
                                    onMouseOver={getMouseOverHandler(tick.key, i)}
                                    onMouseOut={handleMouseOut}
                                >
                                    {tooltipSelector?.(tick.key, i)}
                                </rect>
                            )}
                        </Fragment>
                    );
                })}
            </g>
        </g>
    );
}

export default ChartAxes;
