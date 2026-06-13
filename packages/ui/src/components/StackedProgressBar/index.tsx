import React from 'react';
import { _cs } from '@togglecorp/fujs';

import LegendItem from '#components/LegendItem';
import ListView from '#components/ListView';
import NumberDisplay from '#components/NumberDisplay';
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
    /** CSS color for each segment (data-driven visualization exception) */
    colorSelector: (value: VALUE, index: number) => string;
}

/**
 * StackedProgressBar visualizes the proportions of multiple values as
 * segments of a single bar, with a legend.
 * Specific (data-viz) layer: segment colors come from data via
 * `colorSelector`, the blessed data-driven exception.
 */
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
                            <NumberDisplay
                                className={styles.value}
                                value={datum.value}
                            />
                            {(percentage > 10) && (
                                <NumberDisplay
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
            <ListView
                spacing="sm"
                withSpacingOpticalCorrection
                withWrap
            >
                {renderingData.map((datum) => (
                    <LegendItem
                        key={datum.color}
                        color={datum.color}
                        label={datum.label}
                    />
                ))}
            </ListView>
        </div>
    );
}

export default StackedProgressBar;
