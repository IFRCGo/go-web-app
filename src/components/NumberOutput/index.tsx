import { useMemo } from 'react';
import {
    isNotDefined,
    isDefined,
    _cs,
} from '@togglecorp/fujs';

import { formatNumber } from '#utils/common';

import styles from './styles.module.css';

export interface Props {
    className?: string;
    /**
     * Text to show if invalid value is supplied
     */
    invalidText?: React.ReactNode;
    /**
     * Normalize numer into Millions(M), Billion(B)
     */
    compact?: boolean;
    /**
     * Specify which separator to use for thousands
     */
    separatorHidden?: boolean,
    /**
     * The value of the numeral
     */
    value: number | undefined | null,
    /**
     * Text for tooltip
     */
    tooltip?: number | string | null | undefined;
    currency?: boolean;
    unit?: Intl.NumberFormatOptions['unit'];
    suffix?: React.ReactNode;
    maximumFractionDigits?: Intl.NumberFormatOptions['maximumFractionDigits'];

}

/**
 * NumberOutput component for formatted numbers
 */
function NumberOutput(props: Props) {
    const {
        className,
        invalidText = '-',
        separatorHidden,
        compact,
        currency,
        value,
        tooltip,
        unit,
        suffix,
        maximumFractionDigits,
    } = props;

    const val = useMemo(
        () => {
            if (isNotDefined(value)) {
                return invalidText;
            }

            return formatNumber(
                value,
                {
                    currency,
                    compact,
                    separatorHidden,
                    maximumFractionDigits,
                    unit,
                },
            );
        },
        [
            invalidText,
            value,
            compact,
            separatorHidden,
            currency,
            unit,
            maximumFractionDigits,
        ],
    );

    return (
        <div
            className={_cs(styles.numberOutput, className)}
            title={isDefined(tooltip) ? String(tooltip) : undefined}
        >
            {val}
            {suffix}
        </div>
    );
}

export default NumberOutput;
