import { _cs } from '@togglecorp/fujs';

import DateDisplay from '#components/DateDisplay';

import styles from './styles.module.css';

export interface Props{
    className?: string;
    startDate: string;
    endDate: string;
}

/**
 * Renders a start–end date range as two `<time dateTime>` elements
 * (specific layer).
 *
 * Each endpoint is rendered via DateDisplay, so each carries its own ISO
 * `dateTime` machine contract and accessible full-date reading.
 */
function DateRangeDisplay(props: Props) {
    const {
        className,
        startDate,
        endDate,
    } = props;

    // TODO: Add startDate and endDate validation
    return (
        <div className={_cs(styles.dateRange, className)}>
            <DateDisplay
                value={startDate}
            />
            -
            <DateDisplay
                value={endDate}
            />
        </div>
    );
}

export default DateRangeDisplay;
