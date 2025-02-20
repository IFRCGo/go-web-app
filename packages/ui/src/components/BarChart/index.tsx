import { useMemo } from 'react';
import {
    _cs,
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

import NumberOutput from '#components/NumberOutput';
import Tooltip from '#components/Tooltip';
import {
    getPercentage,
    hasSomeDefinedValue,
} from '#utils/common';

import styles from './styles.module.css';

export interface Props<D> {
    className?: string;
    barClassName?: string;
    data: D[] | null | undefined;
    keySelector: (datum: D) => number | string;
    valueSelector: (datum: D) => number | null | undefined;
    labelSelector: (datum: D) => React.ReactNode;
    tooltipSelector?: (datum: D) => React.ReactNode;
    maxValue?: number;
    maxRows?: number;
    compactValue?: boolean;
}

function BarChart<D>(props: Props<D>) {
    const {
        className,
        barClassName,
        data,
        valueSelector,
        labelSelector,
        tooltipSelector,
        keySelector,
        maxValue: maxValueFromProps,
        maxRows = 5,
        compactValue,
    } = props;

    const renderingData = useMemo(
        () => (
            data?.map((datum) => {
                const value = valueSelector(datum);

                if (isNotDefined(value)) {
                    return undefined;
                }

                return {
                    key: keySelector(datum),
                    value,
                    label: labelSelector(datum),
                    tooltip: tooltipSelector?.(datum),
                };
                // FIXME: use compareNumber
            }).filter(isDefined).sort((a, b) => b.value - a.value).slice(0, maxRows) ?? []
        ),
        [data, keySelector, valueSelector, labelSelector, tooltipSelector, maxRows],
    );

    // NOTE: we do not need to check if Math.max will be Infinity as the render
    // loop will not run
    const maxValue = isDefined(maxValueFromProps)
        ? maxValueFromProps
        : Math.max(...renderingData.map((datum) => datum.value));

    const maxValueSafe = maxValue === 0 ? 1 : maxValue;

    return (
        <div className={_cs(styles.barChart, className)}>
            {renderingData.map((datum) => (
                <div
                    className={_cs(isDefined(datum.tooltip) && styles.hoverable, styles.barRow)}
                    key={datum.key}
                >
                    {isDefined(datum.tooltip)
                    && hasSomeDefinedValue(datum.tooltip) && (
                        <Tooltip
                            title={datum.label}
                            description={datum.tooltip}
                        />
                    )}
                    <div
                        className={styles.label}
                    >
                        {datum.label}
                    </div>
                    <div className={styles.barTrack}>
                        <div
                            className={_cs(styles.bar, barClassName)}
                            style={{
                                // FIXME: use percent function
                                width: `${getPercentage(datum.value, maxValueSafe)}%`,
                            }}
                        />
                    </div>
                    <NumberOutput
                        className={styles.value}
                        value={datum.value}
                        compact={compactValue}
                    />
                </div>
            ))}
        </div>
    );
}

export default BarChart;
