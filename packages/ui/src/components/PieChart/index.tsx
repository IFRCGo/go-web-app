import { useMemo } from 'react';
import {
    _cs,
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

import LegendItem from '#components/LegendItem';
import TextOutput from '#components/TextOutput';
import Tooltip from '#components/Tooltip';
import {
    getPercentage,
    sumSafe,
} from '#utils/common';

import styles from './styles.module.css';

const DEFAULT_PIE_RADIUS = 70;
const DEFAULT_CHART_PADDING = 40;

// FIXME: Let's move this to utils
function round(n: number, precision = 1) {
    return Math.round(n * (10 ** precision)) / (10 ** precision);
}

// FIXME: Let's move this to utils
function polarToCartesian(radius: number, angleInDegrees: number) {
    const radians = ((angleInDegrees - 90) * Math.PI) / 180;

    return {
        x: round(radius + (radius * Math.cos(radians))),
        y: round(radius + (radius * Math.sin(radians))),
    };
}

function getPathData(radius: number, startAngle: number, endAngleFromParams: number) {
    let endAngle = endAngleFromParams;
    const isCircle = endAngle - startAngle === 360;

    if (isCircle) {
        endAngle -= 1;
    }

    const start = polarToCartesian(radius, startAngle);
    const end = polarToCartesian(radius, endAngle);

    const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;
    const d = [
        'M',
        start.x,
        start.y,
        'A',
        radius,
        radius,
        0,
        largeArcFlag,
        1,
        end.x,
        end.y,
    ];

    if (isCircle) {
        d.push('Z');
    } else {
        d.push('L', radius, radius, 'L', start.x, start.y, 'Z');
    }

    return d.join(' ');
}

export type Props<D> = {
    className?: string;
    legendClassName?: string;
    data: D[] | undefined | null;
    valueSelector: (datum: D) => number | undefined | null;
    labelSelector: (datum: D) => React.ReactNode;
    keySelector: (datum: D) => number | string;
    pieRadius?: number;
    chartPadding?: number;
    showPercentageInLegend?: boolean;
} & ({
    colorSelector: (datum: D) => string;
    colors?: never;
} | {
    colors: string[];
    colorSelector?: never;
})

function PieChart<D>(props: Props<D>) {
    const {
        className,
        data,
        valueSelector,
        labelSelector,
        keySelector,
        colorSelector,
        colors,
        pieRadius = DEFAULT_PIE_RADIUS,
        chartPadding = DEFAULT_CHART_PADDING,
        legendClassName,
        showPercentageInLegend,
    } = props;

    const totalValue = sumSafe(data?.map((datum) => valueSelector(datum)));
    const totalValueSafe = isNotDefined(totalValue) || totalValue === 0 ? 1 : totalValue;

    const renderingData = useMemo(
        () => {
            let endAngle = 0;

            const result = data?.map((datum) => {
                const value = valueSelector(datum);
                if (isNotDefined(value)) {
                    return undefined;
                }

                const currentAngle = 360 * (value / totalValueSafe);
                endAngle += currentAngle;

                return {
                    key: keySelector(datum),
                    value,
                    label: labelSelector(datum),
                    startAngle: endAngle - currentAngle,
                    percentage: getPercentage(value, totalValueSafe),
                    endAngle,

                    datum,
                };
            }).filter(isDefined) ?? [];

            if (colorSelector) {
                return result.map(({ datum, ...other }) => ({
                    ...other,
                    color: colorSelector(datum),
                }));
            }
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            return result.map(({ datum, ...other }, i) => ({
                ...other,
                color: colors[i % colors.length],
            }));
        },
        [data, keySelector, valueSelector, labelSelector, totalValueSafe, colorSelector, colors],
    );

    return (
        <div className={_cs(styles.pieChart, className)}>
            <svg
                className={styles.svg}
                style={{
                    width: `${chartPadding + pieRadius * 2}px`,
                    height: `${chartPadding + pieRadius * 2}px`,
                }}
            >
                <g style={{ transform: `translate(${chartPadding / 2}px, ${chartPadding / 2}px)` }}>
                    {renderingData.map((datum) => (
                        <path
                            key={datum.key}
                            className={styles.path}
                            d={getPathData(pieRadius, datum.startAngle, datum.endAngle)}
                            fill={datum.color}
                        >
                            <Tooltip
                                description={(
                                    <TextOutput
                                        label={datum.label}
                                        value={datum.value}
                                    />
                                )}
                            />
                        </path>
                    ))}
                </g>
            </svg>
            <div className={_cs(styles.legend, legendClassName)}>
                {renderingData.map((datum) => (
                    <LegendItem
                        className={styles.legendItem}
                        key={datum.key}
                        label={showPercentageInLegend ? (
                            <TextOutput
                                label={datum.label}
                                value={datum.percentage}
                                valueType="number"
                                prefix="("
                                suffix="%)"
                                withoutLabelColon
                            />
                        ) : datum.label}
                        color={datum.color}
                    />
                ))}
            </div>
        </div>
    );
}

export default PieChart;
