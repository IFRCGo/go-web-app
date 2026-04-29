import { useMemo } from 'react';
import {
    ListView,
    TextOutput,
} from '@ifrc-go/ui';
import {
    type DateLike,
    getNumberOfDays,
} from '@ifrc-go/ui/utils';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

import styles from './styles.module.css';

interface Props {
    startDate: DateLike | undefined | null;
    endDate: DateLike | undefined | null;
}

function TimelineProgressBar(props: Props) {
    const {
        startDate,
        endDate,
    } = props;

    const start = useMemo(() => (
        isDefined(startDate) ? new Date(startDate) : undefined
    ), [startDate]);
    const end = useMemo(() => (
        isDefined(endDate) ? new Date(endDate) : undefined
    ), [endDate]);
    const today = useMemo(() => new Date(), []);

    const progress = useMemo(() => {
        if (isNotDefined(start) || isNotDefined(end)) {
            return 0;
        }

        if (today <= start) {
            return 0;
        }

        if (today >= end) {
            return 100;
        }

        const total = getNumberOfDays(start, end);
        const numDaysSinceStart = getNumberOfDays(start, today);
        return (100 * numDaysSinceStart) / total;
    }, [end, start, today]);

    if (isNotDefined(start) || isNotDefined(end)) {
        return null;
    }

    return (
        <ListView
            className={styles.timelineProgressBar}
            spacing="none"
        >
            <div className={styles.startBorder} />
            <ListView
                layout="block"
                className={styles.progressSection}
                withPadding
                spacing="2xs"
            >
                <div className={styles.barTrack}>
                    <div
                        className={styles.progress}
                        style={{ width: `calc(${progress}%` }}
                    />
                    <div
                        className={styles.thumb}
                        style={{ left: `calc(${progress}% - 0.5rem * ${progress / 100})` }}
                    />
                </div>
                <ListView withSpaceBetweenContents>
                    <TextOutput
                        label="Start"
                        value={start}
                        valueType="date"
                        textSize="sm"
                        withBlockLayout
                        strongLabel
                        withoutLabelColon
                        spacing="none"
                    />
                    <TextOutput
                        className={styles.endLabel}
                        label="End"
                        value={end}
                        valueType="date"
                        textSize="sm"
                        withBlockLayout
                        strongLabel
                        withoutLabelColon
                        spacing="none"
                    />
                </ListView>
            </ListView>
            <div className={styles.endBorder} />
        </ListView>
    );
}

export default TimelineProgressBar;
