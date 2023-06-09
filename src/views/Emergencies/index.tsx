import { useMemo, useCallback } from 'react';
import {
    listToGroupList,
    mapToList,
    listToMap,
    encodeDate,
    isFalsyString,
    isDefined,
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
import { useRequest } from '#utils/restRequest';
import { getDatesSeparatedByMonths } from '#utils/chart';
import { sumSafe } from '#utils/common';
import { paths } from '#generated/types';

import type { AggregateEventResponse } from './types';
import Map from './Map';
import FieldReportTable from './FieldReportsTable';
import EmergenciesTable from './EmergenciesTable';
import FlashUpdateTable from './FlashUpdatesTable';
import i18n from './i18n.json';
import styles from './styles.module.css';

const getFormattedKey = (dateFromProps: string | Date) => {
    const date = new Date(dateFromProps);
    return `${date.getFullYear()}-${date.getMonth()}`;
};

function timeseriesChartClassNameSelector() {
    return styles.eventsChart;
}

const xAxisFormatter = (date: Date) => date.toLocaleString(
    undefined,
    { month: 'short' },
);

type EmergencyByType = {
    type: string;
    numOfEvents: number;
    typeName: string;
}
function typeSelector(groupedEvent: EmergencyByType) {
    return groupedEvent.type;
}
function numOfEventsSelector(groupedEvent: EmergencyByType) {
    return groupedEvent.numOfEvents;
}
function typeNameSelector(groupedEvent: EmergencyByType) {
    return groupedEvent.typeName;
}
const timeSeriesDataKeys = ['events'];

const thirtyDaysAgo = new Date();
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
thirtyDaysAgo.setHours(0, 0, 0, 0);

const oneYearAgo = new Date();
oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
oneYearAgo.setHours(0, 0, 0, 0);

type EventResponse = paths['/api/v2/event/']['get']['responses']['200']['content']['application/json'];

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    const {
        pending: eventsPending,
        response: eventsResponse,
    } = useRequest<EventResponse>({
        url: 'api/v2/event/',
        query: {
            limit: 500,
            disaster_start_date__gt: thirtyDaysAgo.toISOString(),
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
                (events?.map(
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
                events?.map(
                    (event) => (
                        sumSafe(event.appeals.map((appeal) => Number(appeal.amount_requested)))
                    ),
                ),
            );

            const fundingCalculated = sumSafe(
                events?.map(
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

    const emergenciesByType = useMemo(
        () => {
            const emergenciesMapByType = listToGroupList(
                eventsResponse?.results ?? [],
                (event) => event.dtype.id,
            );

            return mapToList(
                emergenciesMapByType,
                (event, disasterType) => {
                    if (isFalsyString(event[0].dtype.name)) {
                        return undefined;
                    }

                    return {
                        type: disasterType,
                        typeName: event[0].dtype.name,
                        numOfEvents: event.length,
                    };
                },
            ).filter(isDefined);
        },
        [eventsResponse],
    );

    const aggregateDataMap = useMemo(
        () => (
            listToMap(
                aggregateEventResponse?.aggregate ?? [],
                (aggregate) => getFormattedKey(aggregate.timespan),
            )
        ),
        [aggregateEventResponse],
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
                    heading={strings.emergenciesByTypeTitle}
                    className={styles.emergenciesByType}
                    withHeaderBorder
                >
                    <BarChart
                        data={emergenciesByType}
                        keySelector={typeSelector}
                        valueSelector={numOfEventsSelector}
                        labelSelector={typeNameSelector}
                    />
                </Container>
                <Container
                    heading={strings.emergenciesOverLastYearTitle}
                    className={styles.emergenciesOverLastYear}
                    withHeaderBorder
                >
                    {aggregateEventResponse && (
                        <TimeSeriesChart
                            className={styles.timeSeriesChart}
                            timePoints={dateList}
                            dataKeys={timeSeriesDataKeys}
                            valueSelector={timeSeriesValueSelector}
                            classNameSelector={timeseriesChartClassNameSelector}
                            xAxisFormatter={xAxisFormatter}
                        />
                    )}
                </Container>
            </div>
            <div>
                {eventsResponse && (
                    <Map eventList={eventsResponse.results} />
                )}
                <EmergenciesTable />
            </div>
            <FlashUpdateTable />
            <FieldReportTable />
        </Page>
    );
}

Component.displayName = 'Emergencies';
