import { useMemo } from 'react';
import {
    DateOutput,
    ListView,
    Message,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { getNumberOfDays } from '@ifrc-go/ui/utils';
import { isNotDefined } from '@togglecorp/fujs';

import i18n from './i18n.json';
import styles from './styles.module.css';

export interface EventTimelineItem {
    key: string | number;
    date: Date;
    label: React.ReactNode;
    isMarker?: boolean;
}

interface Props {
    events: EventTimelineItem[];
}

// Entries are spread so they don't overlap. The Today marker must use the same
// clamp (with a chronological index), else a past event can land right of it.
function getClampedLeft(index: number, count: number, relativePosition: number) {
    return `min(${100 - 40 * ((count - index) / count)}%, max(${40 * (index / count)}%, ${relativePosition}%))`;
}

function EventTimeline(props: Props) {
    const { events } = props;

    const strings = useTranslation(i18n);

    const timelineRenderEvents = useMemo(() => {
        if (isNotDefined(events) || events.length === 0) {
            return undefined;
        }

        const now = new Date();
        const firstEvent = events[0]!;
        const lastEvent = events[events.length - 1]!;

        const minDate = firstEvent.date;
        const maxDate = lastEvent.date;

        const totalNumDays = getNumberOfDays(minDate, maxDate);

        const getRelativePosition = (date: Date) => (
            // avoid divide-by-zero (NaN) on a single-day span
            totalNumDays === 0
                ? 0
                : (100 * getNumberOfDays(minDate, date)) / totalNumDays
        );

        // events are pre-sorted by date, so the array index is the chronological slot
        const currentEvents = events.map((event, i) => ({
            data: event,
            relativePosition: getRelativePosition(event.date),
            clampIndex: i,
        }));

        if (now > minDate && now < maxDate) {
            currentEvents.push({
                data: {
                    key: 'today',
                    label: strings.todayMarkerLabel,
                    date: now,
                    isMarker: true,
                },
                relativePosition: getRelativePosition(now),
                // appended last to keep real events' nth-child stagger; its slot
                // is the count of events on or before today
                clampIndex: events.filter((event) => event.date <= now).length,
            });
        }

        return currentEvents;
    }, [events, strings.todayMarkerLabel]);

    if (isNotDefined(timelineRenderEvents) || timelineRenderEvents.length === 0) {
        return (
            <Message />
        );
    }

    const numEvents = timelineRenderEvents.length;

    return (
        <div className={styles.eventTimeline}>
            <div className={styles.eventsContainer}>
                {timelineRenderEvents.map((event) => {
                    if (event.data.isMarker) {
                        return (
                            <div
                                key={event.data.key}
                                className={styles.marker}
                                style={{
                                    left: getClampedLeft(
                                        event.clampIndex,
                                        numEvents,
                                        event.relativePosition,
                                    ),
                                }}
                            >
                                <div className={styles.label}>
                                    {event.data.label}
                                </div>
                            </div>
                        );
                    }

                    return (
                        <div
                            key={event.data.key}
                            className={styles.event}
                            style={{
                                left: getClampedLeft(
                                    event.clampIndex,
                                    numEvents,
                                    event.relativePosition,
                                ),
                            }}
                        >
                            <div className={styles.border}>
                                <div className={styles.highlight} />
                            </div>
                            <ListView
                                className={styles.content}
                                layout="block"
                                spacing="xs"
                                withPadding
                            >
                                <DateOutput
                                    format="dd MMM yyyy"
                                    value={event.data.date}
                                />
                                {event.data.label}
                            </ListView>
                        </div>
                    );
                })}
            </div>
            <div className={styles.eventLine} />
        </div>
    );
}

export default EventTimeline;
