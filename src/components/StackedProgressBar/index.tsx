import React from 'react';
import { _cs } from '@togglecorp/fujs';

import NumberOutput from '#components/NumberOutput';
import { sumSafe } from '#utils/common';

import styles from './styles.module.css';

interface Props<VALUE> {
    className?: string;
    data: VALUE[];
    valueSelector: (value: VALUE, index: number) => number;
    labelSelector: (value: VALUE, index: number) => React.ReactNode;
    colorSelector: (value: VALUE, index: number) => string;
}

function StackedProgressBar<VALUE>(props: Props<VALUE>) {
    const {
        className,
        data,
        valueSelector,
        labelSelector,
        colorSelector,
    } = props;

    const renderData = data.map((datum, i) => ({
        value: valueSelector(datum, i),
        color: colorSelector(datum, i),
        label: labelSelector(datum, i),
    }));

    const values = renderData.map((d) => d.value);
    const total = sumSafe(values) ?? 1;

    return (
        <div className={_cs(styles.stackedBarChart, className)}>
            <div className={styles.barInfoContainer}>
                {renderData.map((datum) => {
                    // FIXME: use percent function
                    const percentage = (100 * datum.value) / total;
                    return (
                        <div
                            className={styles.barInfo}
                            style={{ width: `${percentage}%` }}
                        >
                            <NumberOutput
                                className={styles.value}
                                value={datum.value}
                            />
                            <NumberOutput
                                className={styles.percentage}
                                value={(100 * datum.value) / total}
                                prefix="("
                                suffix="%)"
                                maximumFractionDigits={0}
                            />
                        </div>
                    );
                })}
            </div>
            <div className={styles.track}>
                {renderData.map((datum) => (
                    <div
                        key={datum.color}
                        className={styles.bar}
                        style={{
                            width: `${(100 * datum.value) / total}%`,
                            backgroundColor: datum.color,
                        }}
                    />
                ))}
            </div>
            <div className={styles.labelList}>
                {renderData.map((datum) => (
                    <div
                        className={styles.labelContainer}
                        key={datum.color}
                    >
                        <div
                            className={styles.colorDot}
                            style={{ backgroundColor: datum.color }}
                        />
                        <div
                            className={styles.label}
                            title={typeof datum.label === 'string' ? datum.label : undefined}
                        >
                            {datum.label}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default StackedProgressBar;
