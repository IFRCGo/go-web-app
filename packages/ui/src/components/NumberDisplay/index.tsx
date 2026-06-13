import {
    useContext,
    useMemo,
} from 'react';
import {
    _cs,
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

import LanguageContext from '#contexts/language';
import { formatNumber } from '#utils/common';
import { DEFAULT_INVALID_TEXT } from '#utils/constants';

import styles from './styles.module.css';

export interface Props {
    className?: string;
    /**
     * Text to show if invalid value is supplied
     */
    invalidText?: React.ReactNode;
    /**
     * Normalize number into Millions(M), Billion(B)
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
    prefix?: React.ReactNode;
    suffix?: React.ReactNode;
    maximumFractionDigits?: Intl.NumberFormatOptions['maximumFractionDigits'];

}

/**
 * Renders a localised, formatted number (raw layer).
 *
 * The root is a native `<data value>` carrying the raw numeric value as
 * the machine-readable / test contract. When abbreviation makes the
 * visible string lossy (e.g. `compact`), the same formatter is re-run
 * with abbreviation off to produce the full reading, exposed to
 * assistive tech via `role="img"` + `aria-label`; when the visible text
 * already equals the full reading, a plain `<data>` is rendered (no role
 * / aria-label).
 */
function NumberDisplay(props: Props) {
    const {
        className,
        invalidText = DEFAULT_INVALID_TEXT,
        separatorHidden,
        compact,
        currency,
        value,
        tooltip,
        unit,
        prefix,
        suffix,
        maximumFractionDigits = 1,
    } = props;

    const { currentLanguage } = useContext(LanguageContext);

    const formattedValue = useMemo(
        () => formatNumber(
            value,
            {
                currency,
                compact,
                separatorHidden,
                maximumFractionDigits,
                unit,
                language: currentLanguage,
            },
        ),
        [
            value,
            compact,
            separatorHidden,
            currency,
            unit,
            maximumFractionDigits,
            currentLanguage,
        ],
    );

    // The full, un-abbreviated reading for assistive tech: the same
    // formatter with abbreviation (compact) off, keeping
    // currency/unit/locale.
    const fullFormattedValue = useMemo(
        () => formatNumber(
            value,
            {
                currency,
                compact: false,
                separatorHidden,
                unit,
                language: currentLanguage,
            },
        ),
        [
            value,
            separatorHidden,
            currency,
            unit,
            currentLanguage,
        ],
    );

    if (isNotDefined(value)) {
        return (
            <data
                className={_cs(styles.numberDisplay, className)}
                value=""
            >
                {invalidText}
            </data>
        );
    }

    // role="img" only when the visible (possibly compacted) string is
    // lossy, i.e. differs from the full reading. String prefix/suffix are
    // folded into the label so the reading stays complete; non-string
    // prefix/suffix (nodes) are left to their own semantics.
    const isLossy = formattedValue !== fullFormattedValue;
    const labelPrefix = typeof prefix === 'string' ? prefix : '';
    const labelSuffix = typeof suffix === 'string' ? suffix : '';
    const fullLabel = `${labelPrefix}${fullFormattedValue ?? ''}${labelSuffix}`;

    return (
        <data
            className={_cs(styles.numberDisplay, className)}
            value={String(value)}
            title={isDefined(tooltip) ? String(tooltip) : undefined}
            role={isLossy ? 'img' : undefined}
            aria-label={isLossy ? fullLabel : undefined}
        >
            {prefix}
            {formattedValue}
            {suffix}
        </data>
    );
}

export default NumberDisplay;
