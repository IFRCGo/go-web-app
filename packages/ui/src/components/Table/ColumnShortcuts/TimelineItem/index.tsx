import {
    _cs,
    isNotDefined,
} from '@togglecorp/fujs';

import TextOutput from '#components/TextOutput';
import Tooltip from '#components/Tooltip';
import {
    type DateLike,
    isValidDate,
} from '#utils/common';

import styles from './styles.module.css';

export interface Props {
    className?: string;
    startDate: DateLike | null | undefined;
    endDate: DateLike | null | undefined;
    dateRange: {
        start: Date,
        end: Date,
    } | undefined;
}

function TimelineItem(props: Props) {
    const {
        className,
        startDate,
        endDate,
        dateRange,
    } = props;

    if (isNotDefined(dateRange)) {
        return null;
    }

    if (!isValidDate(startDate)) {
        return null;
    }

    if (!isValidDate(endDate)) {
        return null;
    }

    const domainWidth = dateRange.end.getTime() - dateRange.start.getTime();

    const start = 1 - (dateRange.end.getTime() - new Date(startDate).getTime()) / domainWidth;
    const end = (dateRange.end.getTime() - new Date(endDate).getTime()) / domainWidth;

    const today = 1 - (dateRange.end.getTime() - new Date().getTime()) / domainWidth;

    return (
        <>
            <div className={_cs(styles.timelineItem, className)}>
                <div className={styles.startDateMarker} />
                <div className={styles.endDateMarker} />
                <div
                    className={styles.todayMarker}
                    style={{
                        left: `${100 * today}%`,
                    }}
                />
                <div
                    className={styles.timelineProgress}
                    style={{
                        left: `${100 * start}%`,
                        right: `${100 * end}%`,
                    }}
                />
            </div>
            <Tooltip
                description={(
                    <>
                        <TextOutput
                            valueType="date"
                            // FIXME: use translation
                            label="Start Date"
                            value={startDate}
                        />
                        <TextOutput
                            // FIXME: use translation
                            label="End Date"
                            value={endDate}
                            valueType="date"
                        />
                    </>
                )}
            />
        </>
    );
}

export default TimelineItem;
