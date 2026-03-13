import { useMemo } from 'react';
import {
    Container,
    Message,
    TextOutput,
    Tooltip,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { splitList } from '@ifrc-go/ui/utils';
import {
    compareNumber,
    isDefined,
    isNotDefined,
    listToGroupList,
    listToMap,
    mapToList,
} from '@togglecorp/fujs';

import {
    type GoApiResponse,
    useRequest,
} from '#utils/restRequest';

import i18n from './i18n.json';
import styles from './styles.module.css';

// NOTE: these labels should not be translated
const colorMap: Record<string, string> = {
    'Planting and growing': '#d8e800',
    Harvest: '#cbbb73',
    'Seasonal hazard': '#f69650',
    'Lean season': '#c88d5b',
    Livestock: '#fedf65',
    Outbreak: '#fd3900',
};

interface SeasonalCalendarEventProps {
    data: GoApiResponse<'/api/v2/country/{id}/databank/'>['acaps'][number] & {
        monthIndices: { key: number; start: number; end: number; }[];
    }
}

function SeasonalCalendarEvent(props: SeasonalCalendarEventProps) {
    const { data } = props;
    const strings = useTranslation(i18n);

    if (isNotDefined(data)) {
        return null;
    }

    const {
        event_type,
    } = data;

    if (isNotDefined(event_type)) {
        return null;
    }

    return data.monthIndices.map(({ key, start, end }) => (
        <div
            key={key}
            className={styles.event}
            style={{
                gridColumnStart: start,
                gridColumnEnd: end,
                backgroundColor: colorMap[event_type[0]!],
            }}
        >
            {data.label}
            <Tooltip
                title={data.label}
                description={(
                    <>
                        <TextOutput
                            strongLabel
                            label={strings.seasonalCalendarTooltipEventTypeLabel}
                            value={event_type}
                        />
                        <TextOutput
                            strongLabel
                            label={strings.seasonalCalendarTooltipEventLabel}
                            value={data.event?.join(', ')}
                        />
                        <TextOutput
                            strongLabel
                            label={strings.seasonalCalendarTooltipMonthsLabel}
                            value={data.month?.join(', ')}
                        />
                        <TextOutput
                            strongLabel
                            label={strings.seasonalCalendarTooltipSourceLabel}
                            value={data.source}
                        />
                    </>
                )}
            />
        </div>
    ));
}

interface Props {
    countryId: string | undefined;
}

function SeasonalCalender(props: Props) {
    const { countryId } = props;

    const strings = useTranslation(i18n);

    const {
        pending: databankResponsePending,
        response: databankResponse,
    } = useRequest({
        url: '/api/v2/country/{id}/databank/',
        skip: isNotDefined(countryId),
        pathVariables: isDefined(countryId) ? {
            id: Number(countryId),
        } : undefined,
    });
        // NOTE: these are keys in the data
    const monthsWithOrder = [
        { month: 'January', order: 1 },
        { month: 'February', order: 2 },
        { month: 'March', order: 3 },
        { month: 'April', order: 4 },
        { month: 'May', order: 5 },
        { month: 'June', order: 6 },
        { month: 'July', order: 7 },
        { month: 'August', order: 8 },
        { month: 'September', order: 9 },
        { month: 'October', order: 10 },
        { month: 'November', order: 11 },
        { month: 'December', order: 12 },
    ];

    const monthToOrderMap = listToMap(
        monthsWithOrder,
        ({ month }) => month,
        ({ order }) => order,
    );

    const seasonalCalendarData = useMemo(
        () => (
            databankResponse?.acaps?.map(
                ({ month, event_type, ...otherProps }) => {
                    if (isNotDefined(month) || isNotDefined(event_type)) {
                        return undefined;
                    }

                    // FIXME: this sort will mutate the data
                    const orderedMonth = month.sort(
                        (a, b) => compareNumber(monthToOrderMap[a], monthToOrderMap[b]),
                    );

                    const monthIndices = orderedMonth.map(
                        (monthName) => monthToOrderMap[monthName]!,
                    );

                    const discreteMonthIndices = splitList<number, number>(
                        monthIndices,
                        (item, index): item is number => (
                            index === 0
                                ? false
                                : (item - monthIndices[index - 1]!) > 1
                        ),
                        true,
                    );

                    return {
                        ...otherProps,
                        event_type,
                        month: orderedMonth,
                        monthIndices: discreteMonthIndices.map(
                            (continuousList, index) => ({
                                key: index,
                                start: continuousList[0]!,
                                end: continuousList[continuousList.length - 1]! + 1,
                            }),
                        ).sort((a, b) => compareNumber(a.start, b.start)),
                        startMonth: monthToOrderMap[orderedMonth[0]!],
                    };
                },
            ).filter(isDefined).sort(
                (a, b) => compareNumber(a.startMonth, b.startMonth),
            )
        ),
        [databankResponse, monthToOrderMap],
    );

    const eventTypeGroupedData = mapToList(
        listToGroupList(
            seasonalCalendarData,
            ({ event_type }) => event_type[0]!,
        ),
        (list, key) => ({
            event_type: key,
            events: list,
        }),
    );

    return (
        <Container
            heading={strings.seasonalCalendarHeading}
            pending={databankResponsePending}
            withHeaderBorder
        >
            {isDefined(databankResponse) && (
                <div className={styles.seasonalCalendarContent}>
                    <div className={styles.eventList}>
                        {monthsWithOrder.map(
                            ({ month, order }) => (
                                <div
                                    key={order}
                                    className={styles.monthName}
                                >
                                    {month.substring(0, 3)}
                                </div>
                            ),
                        )}
                    </div>
                    {(isNotDefined(eventTypeGroupedData)
                        || eventTypeGroupedData.length === 0
                    ) && (
                        <Message
                            title={strings.seasonalCalenderDataNotAvailable}
                        />
                    )}
                    {eventTypeGroupedData?.map(
                        ({ event_type, events }) => (
                            <div
                                key={event_type}
                                className={styles.eventList}
                            >
                                {events.map((event) => (
                                    <SeasonalCalendarEvent
                                        key={event.id}
                                        data={event}
                                    />
                                ))}
                            </div>
                        ),
                    )}
                </div>
            )}
        </Container>
    );
}

export default SeasonalCalender;
