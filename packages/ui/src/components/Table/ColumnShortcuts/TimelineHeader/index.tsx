import { _cs } from '@togglecorp/fujs';

import DateDisplay from '#components/DateDisplay';

import HeaderCell, { HeaderCellProps } from '../../HeaderCell';

import styles from './styles.module.css';

export interface Props extends HeaderCellProps {
    className?: string;
    dateRange: {
        start: Date,
        end: Date,
    } | undefined;
}

/**
 * Specific table header cell that labels a timeline column with its
 * start and end dates.
 */
function TimelineHeader(props: Props) {
    const {
        className,
        dateRange,
        ...otherProps
    } = props;

    return (
        <HeaderCell
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...otherProps}
            className={_cs(styles.timelineHeader, className)}
            titleClassName={styles.title}
            title={(
                <>
                    <DateDisplay
                        value={dateRange?.start}
                    />
                    <DateDisplay
                        value={dateRange?.end}
                    />
                </>
            )}
        />
    );
}

export default TimelineHeader;
