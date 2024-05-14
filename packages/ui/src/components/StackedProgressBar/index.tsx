import React from 'react';
import { _cs } from '@togglecorp/fujs';

import NumberOutput from '#components/NumberOutput';
import {
    getPercentage,
    sumSafe,
} from '#utils/common';

import styles from './styles.module.css';

export interface Props<VALUE> {
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

    const renderingData = data.map((datum, i) => ({
        value: valueSelector(datum, i),
        color: colorSelector(datum, i),
        label: labelSelector(datum, i),
    }));

    const values = renderingData.map((d) => d.value);

    const total = sumSafe(values) ?? 1;

    return (
        <div className={_cs(styles.stackedBarChart, className)}>
            <div className={styles.barInfoContainer}>
                {renderingData.map((datum) => {
                    const percentage = getPercentage(datum.value, total);
                    return (
                        <div
                            key={datum.color}
                            className={styles.barInfo}
                            style={{ width: `${percentage}%` }}
                        >
                            <NumberOutput
                                className={styles.value}
                                value={datum.value}
                            />
                            {(percentage > 10) && (
                                <NumberOutput
                                    className={styles.percentage}
                                    value={getPercentage(datum.value, total)}
                                    prefix="("
                                    suffix="%)"
                                    maximumFractionDigits={0}
                                />
                            )}
                        </div>
                    );
                })}
            </div>
            <div className={styles.track}>
                {renderingData.map((datum) => (
                    <div
                        key={datum.color}
                        className={styles.bar}
                        style={{
                            // FIXME: Use progress function
                            width: `${getPercentage(datum.value, total)}%`,
                            backgroundColor: datum.color,
                        }}
                    />
                ))}
            </div>
            <div className={styles.labelList}>
                {renderingData.map((datum) => (
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
