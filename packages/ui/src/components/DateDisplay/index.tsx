import { useMemo } from 'react';
import {
    _cs,
    isNotDefined,
} from '@togglecorp/fujs';

import {
    DateLike,
    encodeDate,
    formatDate,
} from '#utils/common';

import styles from './styles.module.css';

// Full, spelled-out reading for assistive tech (e.g. '13 Jun 2026').
const FULL_DATE_FORMAT = 'dd MMM yyyy';

export interface Props {
    className?: string;
    value: DateLike | undefined | null;
    format?: string;
    invalidText?: React.ReactNode;
}

/**
 * Renders a localised, formatted date (raw layer).
 *
 * The root is a native `<time dateTime>` carrying the ISO date as the
 * machine-readable / test contract. When the visible (possibly
 * abbreviated/short) format differs from the full spelled-out reading,
 * the full date is exposed to assistive tech via `role="img"` +
 * `aria-label`; when they match, a plain `<time>` is rendered.
 */
function DateDisplay(props: Props) {
    const {
        value,
        format,
        className,
        invalidText,
    } = props;

    const formattedDate = useMemo(
        () => formatDate(
            value,
            format,
        ),
        [value, format],
    );

    const isoDate = useMemo(
        () => (isNotDefined(value) ? undefined : encodeDate(value)),
        [value],
    );

    const fullDate = useMemo(
        () => formatDate(
            value,
            FULL_DATE_FORMAT,
        ),
        [value],
    );

    if (isNotDefined(formattedDate)) {
        return (
            <time className={_cs(styles.dateDisplay, className)}>
                {invalidText}
            </time>
        );
    }

    // role="img" only when the visible string is lossy (differs from the
    // full reading) — typically short/abbreviated date formats.
    const isLossy = formattedDate !== fullDate;

    return (
        <time
            className={_cs(styles.dateDisplay, className)}
            dateTime={isoDate}
            role={isLossy ? 'img' : undefined}
            aria-label={isLossy ? fullDate : undefined}
        >
            {formattedDate}
        </time>
    );
}

export default DateDisplay;
