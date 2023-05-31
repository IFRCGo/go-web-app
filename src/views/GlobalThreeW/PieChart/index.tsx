import { useMemo } from 'react';
import { _cs, sum } from '@togglecorp/fujs';

import LegendItem from '#components/LegendItem';
import styles from './styles.module.css';

const PIE_RADIUS = 70;
const CHART_PADDING = 40;

function round(n: number) {
    return Math.round(n * 10) / 10;
}

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

interface Props<D> {
    className?: string;
    data: D[];
    valueSelector: (datum: D) => number;
    labelSelector: (datum: D) => React.ReactNode;
    keySelector: (datum: D) => number | string;
    colors: string[];
}

function PieChart<D>(props: Props<D>) {
    const {
        className,
        data,
        valueSelector,
        labelSelector,
        keySelector,
        colors,
    } = props;

    const totalValue = sum(data.map((datum) => valueSelector(datum)));
    const totalValueSafe = totalValue === 0 ? 1 : totalValue;

    const renderData = useMemo(
        () => {
            let endAngle = 0;
            return data.map((datum) => {
                const value = valueSelector(datum);
                const currentAngle = 360 * (value / totalValueSafe);
                endAngle += currentAngle;

                return {
                    key: keySelector(datum),
                    value,
                    label: labelSelector(datum),
                    startAngle: endAngle - currentAngle,
                    endAngle,
                };
            });
        },
        [data, keySelector, valueSelector, labelSelector, totalValueSafe],
    );

    return (
        <div className={_cs(styles.pieChart, className)}>
            <svg
                className={styles.svg}
                style={{
                    width: `${CHART_PADDING + PIE_RADIUS * 2}px`,
                    height: `${CHART_PADDING + PIE_RADIUS * 2}px`,
                }}
            >
                <g style={{ transform: `translate(${CHART_PADDING / 2}px, ${CHART_PADDING / 2}px)` }}>
                    {renderData.map((datum, i) => (
                        <path
                            key={datum.key}
                            className={styles.path}
                            d={getPathData(PIE_RADIUS, datum.startAngle, datum.endAngle)}
                            fill={colors[i]}
                        />
                    ))}
                </g>
            </svg>
            <div className={styles.legend}>
                {renderData.map((datum, i) => (
                    <LegendItem
                        key={datum.key}
                        label={datum.label}
                        color={colors[i]}
                    />
                ))}
            </div>
        </div>
    );
}

export default PieChart;
