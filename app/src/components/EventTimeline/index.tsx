import { useMemo } from 'react';
import {
    DateOutput,
    ListView,
    Message,
} from '@ifrc-go/ui';
import { getNumberOfDays } from '@ifrc-go/ui/utils';
import { isNotDefined } from '@togglecorp/fujs';

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

function EventTimeline(props: Props) {
    const { events } = props;

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

        const currentEvents = events.map((event) => {
            const numDaysSinceStart = getNumberOfDays(minDate, event.date);
            const relativePosition = (100 * numDaysSinceStart) / totalNumDays;

            return {
                data: event,
                relativePosition,
            };
        }, []);

        if (now > minDate && now < maxDate) {
            currentEvents.push({
                data: {
                    key: 'today',
                    // FIXME: use strings
                    label: 'Today',
                    date: now,
                    isMarker: true,
                },
                relativePosition: (100 * getNumberOfDays(minDate, now)) / totalNumDays,
            });
        }

        return currentEvents;
    }, [events]);

    if (isNotDefined(timelineRenderEvents) || timelineRenderEvents.length === 0) {
        return (
            <Message />
        );
    }

    return (
        <div className={styles.eventTimeline}>
            <div className={styles.eventsContainer}>
                {timelineRenderEvents.map((event) => {
                    if (event.data.isMarker) {
                        return (
                            <div
                                key={event.data.key}
                                className={styles.marker}
                                style={{ left: `${event.relativePosition}%` }}
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
                            style={{ left: `${event.relativePosition}%` }}
                        >
                            <div className={styles.border}>
                                <div className={styles.highlight} />
                            </div>
                            <ListView
                                className={styles.content}
                                layout="block"
                                withSpacingOpticalCorrection
                                spacing="2xs"
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
