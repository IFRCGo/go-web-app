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
    highlightedStartDate: DateLike | null | undefined;
    highlightedEndDate: DateLike | null | undefined;
    startDateLabel: string;
    endDateLabel: string;
    highlightedStartDateLabel: string;
    highlightedEndDateLabel: string;
}

function MultiTimelineItem(props: Props) {
    const {
        className,
        startDate,
        endDate,
        dateRange,
        highlightedStartDate,
        highlightedEndDate,
        startDateLabel,
        endDateLabel,
        highlightedStartDateLabel,
        highlightedEndDateLabel,
    } = props;

    if (isNotDefined(dateRange)) {
        return null;
    }

    if (!isValidDate(startDate) || !isValidDate(endDate)) {
        return null;
    }

    if (!isValidDate(highlightedStartDate) || !isValidDate(highlightedEndDate)) {
        return null;
    }

    const domainWidth = dateRange.end.getTime() - dateRange.start.getTime();

    const start = 1 - (dateRange.end.getTime() - new Date(startDate).getTime()) / domainWidth;
    const end = (dateRange.end.getTime() - new Date(endDate).getTime()) / domainWidth;
    const today = 1 - (dateRange.end.getTime() - new Date().getTime()) / domainWidth;

    const highlightedStart = 1 - (dateRange.end.getTime()
        - new Date(highlightedStartDate).getTime()) / domainWidth;
    const highlightedEnd = (
        dateRange.end.getTime() - new Date(highlightedEndDate).getTime()
    ) / domainWidth;

    return (
        <>
            <div className={_cs(styles.multiTimelineItem, className)}>
                <div className={styles.startDateMarker} />
                <div className={styles.endDateMarker} />
                <div
                    className={styles.todayMarker}
                    style={{
                        left: `${100 * today}%`,
                    }}
                />
                <div
                    className={styles.timelineProgressBar}
                    style={{
                        left: `${100 * start}%`,
                        right: `${100 * end}%`,
                    }}
                />
                <div
                    className={styles.highlightedTimelineProgressBar}
                    style={{
                        left: `${100 * highlightedStart}%`,
                        right: `${100 * highlightedEnd}%`,
                    }}
                />
            </div>
            <Tooltip
                description={(
                    <>
                        <TextOutput
                            valueType="date"
                            label={startDateLabel}
                            value={startDate}
                        />
                        <TextOutput
                            label={endDateLabel}
                            value={endDate}
                            valueType="date"
                        />
                        {highlightedStartDate && highlightedEndDate && (
                            <>
                                <TextOutput
                                    label={highlightedStartDateLabel}
                                    value={highlightedStartDate}
                                    valueType="date"
                                />
                                <TextOutput
                                    label={highlightedEndDateLabel}
                                    value={highlightedEndDate}
                                    valueType="date"
                                />
                            </>
                        )}
                    </>
                )}
            />
        </>
    );
}

export default MultiTimelineItem;
