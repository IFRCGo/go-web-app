import React from 'react';
import {
    addSeparator,
    isTruthy,
    isDefined,
    formattedNormalize,
    _cs,
} from '@togglecorp/fujs';

import { isValidNumber } from '#utils/common';

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
    normal?: boolean;
    /**
    * Numer of digits after decimal point. Rounding is also applied.
    */
    precision?: number | 'auto';
    /**
    * Prefix the output with certain string. Eg. $
    */
    prefix?: string;
    /**
    * Specify which separator to use for thousands
    */
    separator?: string | null;
    /**
    * Show both positive and negative sign for number
    */
    showSign?: boolean;
    /**
    * Prefix the output with certain string. Eg. %
    */
    suffix?: React.ReactNode;
    /**
    * The value of the numeral
    */
    value?: number | null;

    valueModifier?: (value: string | undefined) => React.ReactNode;
    signClassName?: string;
    prefixClassName?: string;
    numberClassName?: string;
    normalizationSuffixClassName?: string;
    suffixClassName?: string;
}

/**
* NumberOutput component for formatted numbers
*/
function NumberOutput(props: Props) {
    const {
        className,
        invalidText = '-',
        normal,
        precision = 'auto',
        prefix,
        separator = ',',
        showSign,
        suffix,
        valueModifier,
        value,
        signClassName,
        prefixClassName,
        numberClassName,
        normalizationSuffixClassName,
        suffixClassName,
    } = props;

    const [number, normalizationSuffix] = React.useMemo(() => {
        if (!isValidNumber(value)) {
            return [];
        }

        // Only use absolute part if showSign is true (sign are added later)
        let num = isTruthy(showSign) ? Math.abs(value) : value;

        // Get normalize-suffix and reduce the number
        let nSuffix;

        if (normal) {
            const {
                number: n,
                normalizeSuffix: ns,
            } = formattedNormalize(num);

            num = n;
            nSuffix = ns;
        }

        const integer = Math.floor(num);
        const fraction = num - integer;

        let formattedNumber = String(num);

        // Convert number to fixed precision
        if (isTruthy(precision)) {
            let p = 2;

            if (precision === 'auto') {
                const absoluteValue = Math.abs(num);

                if (absoluteValue < 1) {
                    p = Math.ceil(-Math.log10(absoluteValue)) + 1;
                }
                if (integer > 100) {
                    // 140.1234M -> 140 M
                    p = 0;
                } else {
                    // 96.96834M -> 97 M
                    if (fraction > 0.95) {
                        p = 0;
                    }
                    // 96.0334M -> 96.03 M
                    else if (fraction > 0.01) {
                        p = 2;
                    } else {
                        p = 0;
                    }
                }
            } else {
                p = precision;
            }

            formattedNumber = num.toFixed(p);
        }

        // Convert number to add separator
        if (isDefined(separator) && fraction === 0) {
            const withSeparator = addSeparator(num, separator);
            if (withSeparator) {
                formattedNumber = withSeparator;
            }
        }

        return [formattedNumber, nSuffix];
    }, [
            value,
            showSign,
            normal,
            precision,
            separator,
        ]);

    return (
        <div className={_cs(styles.numberOutput, className)}>
            { !isValidNumber(value) ? (
                invalidText
            ) : (
                    <>
                        { isTruthy(prefix) && (
                            <div className={_cs(styles.prefix, prefixClassName)}>
                                {prefix}
                            </div>
                        )}
                        { isTruthy(showSign) && value !== 0 && (
                            <div className={_cs(styles.sign, signClassName)}>
                                {value > 0 ? '+' : '-'}
                            </div>
                        )}
                        <div className={_cs(styles.number, numberClassName)}>
                            {valueModifier ? valueModifier(number) : number}
                        </div>
                        { isTruthy(normalizationSuffix) && (
                            <div
                                className={_cs(
                                    styles.normalizationSuffix,
                                    normalizationSuffixClassName,
                                )}
                            >
                                {normalizationSuffix}
                            </div>
                        )}
                        { isTruthy(suffix) && (
                            <div className={_cs(styles.suffix, suffixClassName)}>
                                {suffix}
                            </div>
                        )}
                    </>
                )}
        </div>
    );
}

export default NumberOutput;
