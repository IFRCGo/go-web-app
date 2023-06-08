import { useMemo } from 'react';
import {
    isNotDefined,
    isDefined,
    _cs,
} from '@togglecorp/fujs';

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

    unit?: React.ReactNode;
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
    } = props;

    const val = useMemo(
        () => {
            if (isNotDefined(value)) {
                return invalidText;
            }
            const options: Intl.NumberFormatOptions = {};
            if (currency) {
                options.currencyDisplay = 'narrowSymbol';
                options.style = 'currency';
            }
            if (compact) {
                options.notation = 'compact';
                options.compactDisplay = 'short';
            }

            options.useGrouping = !separatorHidden;
            options.maximumFractionDigits = 2;

            if (Math.abs(value) >= 1000) {
                options.maximumFractionDigits = 0;
            }

            const newValue = new Intl.NumberFormat(navigator.language, options)
                .format(value);

            return newValue;
        },
        [invalidText, value, compact, separatorHidden, currency],
    );

    return (
        <div
            className={_cs(styles.numberOutput, className)}
            title={isDefined(tooltip) ? String(tooltip) : undefined}
        >
            {val}
            {isDefined(value) && unit && (
                <span>
                    {unit}
                </span>
            )}
        </div>
    );
}

export default NumberOutput;
