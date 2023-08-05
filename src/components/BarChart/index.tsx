import { useMemo } from 'react';
import { _cs, isDefined, isNotDefined } from '@togglecorp/fujs';

import NumberOutput from '#components/NumberOutput';

import styles from './styles.module.css';

interface Props<D> {
    className?: string;
    data: D[] | null | undefined;
    keySelector: (datum: D) => number | string;
    valueSelector: (datum: D) => number | null | undefined;
    labelSelector: (datum: D) => React.ReactNode;
    maxValue?: number;
}

function BarChart<D>(props: Props<D>) {
    const {
        className,
        data,
        valueSelector,
        labelSelector,
        keySelector,
        maxValue: maxValueFromProps,
    } = props;

    const renderData = useMemo(
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
            }).filter(isDefined).sort((a, b) => b.value - a.value).slice(0, 5) ?? []
        ),
        [data, keySelector, valueSelector, labelSelector],
    );

    // NOTE: we do not need to check if Math.max will be Infinity as the render
    // loop will not run
    const maxValue = isDefined(maxValueFromProps)
        ? maxValueFromProps
        : Math.max(...renderData.map((datum) => datum.value));
    const maxValueSafe = maxValue === 0 ? 1 : maxValue;

    return (
        <div className={_cs(styles.barChart, className)}>
            {renderData.map((datum) => {
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
                                    width: `${100 * (datum.value / maxValueSafe)}%`,
                                }}
                            />
                        </div>
                        <NumberOutput
                            className={styles.value}
                            value={datum.value}
                        />
                    </div>
                );
            })}
        </div>
    );
}

export default BarChart;
