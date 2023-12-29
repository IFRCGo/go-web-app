import { _cs } from '@togglecorp/fujs';

import DateOutput from '#components/DateOutput';

import styles from './styles.module.css';

export interface Props{
    className?: string;
    startDate: string;
    endDate: string;
}

function DateRangeOutput(props: Props) {
    const {
        className,
        startDate,
        endDate,
    } = props;

    // TODO: Add startDate and endDate validation
    return (
        <div className={_cs(styles.dateRange, className)}>
            <DateOutput
                value={startDate}
            />
            -
            <DateOutput
                value={endDate}
            />
        </div>
    );
}

export default DateRangeOutput;
