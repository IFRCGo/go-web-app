import { useMemo } from 'react';
import {
    _cs,
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

import NumberOutput from '#components/NumberOutput';
import { getPercentage } from '#utils/common';

import styles from './styles.module.css';

export interface Props<D> {
    className?: string;
    data: D[] | null | undefined;
    keySelector: (datum: D) => number | string;
    valueSelector: (datum: D) => number | null | undefined;
    labelSelector: (datum: D) => React.ReactNode;
    maxValue?: number;
    maxRows?: number;
    compactValue?: boolean;
}

function BarChart<D>(props: Props<D>) {
    const {
        className,
        data,
        valueSelector,
        labelSelector,
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
                };
                // FIXME: use compareNumber
            }).filter(isDefined).sort((a, b) => b.value - a.value).slice(0, maxRows) ?? []
        ),
        [data, keySelector, valueSelector, labelSelector, maxRows],
    );

    // NOTE: we do not need to check if Math.max will be Infinity as the render
    // loop will not run
    const maxValue = isDefined(maxValueFromProps)
        ? maxValueFromProps
        : Math.max(...renderingData.map((datum) => datum.value));

    const maxValueSafe = maxValue === 0 ? 1 : maxValue;

    return (
        <div className={_cs(styles.barChart, className)}>
            {renderingData.map((datum) => {
                const isStringLabel = typeof datum.label === 'string';
                let fontSize = 12;

                if (datum.label && typeof datum.label === 'string') {
                    const nl = Math.sqrt(datum.label.length);
                    if (!Number.isNaN(nl)) {
                        fontSize = Math.max(8, 16 - nl);
                    }
                }

                return (
                    <div
                        className={styles.barRow}
                        key={datum.key}
                    >
                        <div
                            className={styles.label}
                            style={isStringLabel ? { fontSize } : undefined}
                        >
                            {datum.label}
                        </div>
                        <div className={styles.barTrack}>
                            <div
                                className={styles.bar}
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
                );
            })}
        </div>
    );
}

export default BarChart;
