import { useMemo, useCallback } from 'react';
import {
    listToGroupList,
    mapToList,
    listToMap,
    encodeDate,
} from '@togglecorp/fujs';
import {
    EmergenciesIcon,
    TargetedPopulationIcon,
    FundingIcon,
    FundingCoverageIcon,
} from '@ifrc-go/icons';

import Page from '#components/Page';
import BlockLoading from '#components/BlockLoading';
import KeyFigure from '#components/KeyFigure';
import BarChart from '#components/BarChart';
import Container from '#components/Container';
import TimeSeriesChart from '#components/TimeSeriesChart';
import useTranslation from '#hooks/useTranslation';
import {
    useRequest,
    ListResponse,
} from '#utils/restRequest';
import { getDatesSeparatedByMonths } from '#utils/chart';
import { sumSafe } from '#utils/common';

import type { EventItem, AggregateEventResponse } from './types';
import Map from './Map';
import i18n from './i18n.json';
import styles from './styles.module.css';

const getFormattedKey = (dateFromProps: string | Date) => {
    const date = new Date(dateFromProps);
    return `${date.getFullYear()}-${date.getMonth()}`;
};

const xAxisFormatter = (date: Date) => date.toLocaleString(
    undefined,
    { month: 'short' },
);

const timeSeriesDataKeys = ['events'];

const oneMonthAgo = new Date();
// Fixme: 2 monthago
oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 4);
oneMonthAgo.setHours(0, 0, 0, 0);

const oneYearAgo = new Date();
oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
oneYearAgo.setHours(0, 0, 0, 0);

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    const {
        pending: eventsPending,
        response: eventsResponse,
    } = useRequest<ListResponse<EventItem>>({
        url: 'api/v2/event/',
        query: {
            limit: 500,
            disaster_start_date__gt: oneMonthAgo.toISOString(),
            ordering: '-disaster_start_date',
        },
    });

    const {
        // pending: aggregateEventPending,
        response: aggregateEventResponse,
    } = useRequest<AggregateEventResponse>({
        url: 'api/v1/aggregate/',
        query: {
            model_type: 'event',
            unit: 'month',
            start_date: encodeDate(oneYearAgo),
        },
    });

    const dateList = useMemo(
        () => {
            const startDate = oneYearAgo;
            const endDate = new Date();
            return getDatesSeparatedByMonths(startDate, endDate);
        },
        [],
    );

    const [
        numAffected,
        amountRequested,
        funding,
    ] = useMemo(
        () => {
            if (!eventsResponse) {
                return [];
            }

            const { results: events } = eventsResponse;

            const numAffectedCalculated = sumSafe(
                (events.map(
                    (event) => {
                        const latestFieldReport = event.field_reports.sort(
                            (a, b) => (
                                new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
                            ),
                        )[0];

                        return sumSafe([event.num_affected, latestFieldReport?.num_affected]);
                    },
                )),
            );

            const amountRequestedCalculated = sumSafe(
                events.map(
                    (event) => (
                        sumSafe(event.appeals.map((appeal) => Number(appeal.amount_requested)))
                    ),
                ),
            );

            const fundingCalculated = sumSafe(
                events.map(
                    (event) => (
                        sumSafe(event.appeals.map((appeal) => Number(appeal.amount_funded)))
                    ),
                ),
            );

            return [
                numAffectedCalculated,
                amountRequestedCalculated,
                fundingCalculated,
            ];
        },
        [eventsResponse],
    );

    const emergenciesMapByType = listToGroupList(
        eventsResponse?.results ?? [],
        (event) => event.dtype.id,
    );

    const emergenciesByType = mapToList(
        emergenciesMapByType,
        (event, disasterType) => ({
            type: disasterType,
            typeName: event[0].dtype.name,
            numOfEvents: event.length,
        }),
    );

    const aggregateDataMap = listToMap(
        aggregateEventResponse?.aggregate ?? [],
        (aggregate) => getFormattedKey(aggregate.timespan),
    );

    const timeSeriesValueSelector = useCallback(
        (_: string, date: Date) => aggregateDataMap[getFormattedKey(date)]?.count ?? 0,
        [aggregateDataMap],
    );

    return (
        <Page
            className={styles.emergencies}
            title={strings.emergenciesTitle}
            heading={strings.emergenciesTableTitle}
            infoContainerClassName={styles.keyFigureList}
            info={(
                <>
                    {eventsPending && <BlockLoading />}
                    {eventsResponse && (
                        <>
                            <KeyFigure
                                className={styles.keyFigure}
                                icon={<EmergenciesIcon />}
                                value={eventsResponse?.count}
                                description={strings.emergenciesStatsTitle}
                            />
                            <KeyFigure
                                className={styles.keyFigure}
                                icon={<TargetedPopulationIcon />}
                                value={numAffected}
                                description={strings.emergenciesStatsAffected}
                            />
                            <KeyFigure
                                className={styles.keyFigure}
                                icon={<FundingCoverageIcon />}
                                value={amountRequested}
                                description={strings.emergenciesStatsRequested}
                            />
                            <KeyFigure
                                className={styles.keyFigure}
                                icon={<FundingIcon />}
                                value={funding}
                                description={strings.emergenciesStatsFunding}
                            />
                        </>
                    )}
                </>
            )}
            mainSectionClassName={styles.mainContent}
        >
            <div className={styles.charts}>
                <Container
                    heading="Emergencies by Type"
                    className={styles.emergenciesByType}
                    withHeaderBorder
                >
                    <BarChart
                        data={emergenciesByType}
                        keySelector={(groupedEvent) => groupedEvent.type}
                        valueSelector={(groupedEvent) => groupedEvent.numOfEvents}
                        labelSelector={(groupedEvent) => groupedEvent.typeName}
                    />
                </Container>
                <Container
                    heading="Emergencies over the last year"
                    className={styles.emergenciesOverLastYear}
                    withHeaderBorder
                >
                    {aggregateEventResponse && (
                        <TimeSeriesChart
                            className={styles.timeSeriesChart}
                            timePoints={dateList}
                            dataKeys={timeSeriesDataKeys}
                            valueSelector={timeSeriesValueSelector}
                            classNameSelector={() => styles.eventsChart}
                            xAxisFormatter={xAxisFormatter}
                        />
                    )}
                </Container>
            </div>
            {eventsResponse && (
                <Map eventList={eventsResponse.results} />
            )}
        </Page>
    );
}

Component.displayName = 'Emergencies';
