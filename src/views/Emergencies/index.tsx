import { useMemo, useCallback, Fragment } from 'react';
import {
    listToGroupList,
    mapToList,
    listToMap,
    encodeDate,
    isFalsyString,
    isDefined,
    isNotDefined,
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
import Link from '#components/Link';
import usePermissions from '#hooks/domain/usePermissions';
import useTranslation from '#hooks/useTranslation';
import { useRequest } from '#utils/restRequest';
import { getDatesSeparatedByMonths } from '#utils/chart';
import { sumSafe, getFormattedDateKey } from '#utils/common';

import Map from './Map';
import FieldReportTable from './FieldReportsTable';
import EmergenciesTable from './EmergenciesTable';
import FlashUpdateTable from './FlashUpdatesTable';
import i18n from './i18n.json';
import styles from './styles.module.css';

function timeseriesChartClassNameSelector() {
    return styles.eventsChart;
}

const xAxisFormatter = (date: Date) => date.toLocaleString(
    navigator.language,
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

// FIXME: use a separate utility
const thirtyDaysAgo = new Date();
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
thirtyDaysAgo.setHours(0, 0, 0, 0);

// FIXME: use a separate utility
const oneYearAgo = new Date();
oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
oneYearAgo.setHours(0, 0, 0, 0);

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    const { isIfrcAdmin } = usePermissions();
    const {
        pending: eventsPending,
        response: eventsResponse,
    } = useRequest({
        url: '/api/v2/event/',
        query: {
            limit: 9999,
            disaster_start_date__gte: thirtyDaysAgo.toISOString(),
            ordering: '-disaster_start_date',
        },
    });

    const {
        response: regionResponse,
    } = useRequest({
        url: '/api/v2/region/',
    });

    const {
        // pending: aggregateEventPending,
        response: aggregateEventResponse,
    } = useRequest({
        url: '/api/v1/aggregate/',
        // FIXME: fix typing in server (low priority)
        query: {
            model_type: 'event',
            unit: 'month',
            start_date: encodeDate(oneYearAgo),
        } as never,
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
            if (isNotDefined(eventsResponse)) {
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

            // FIXME: Let's use flatMap then sumSafe
            const amountRequestedCalculated = sumSafe(
                events?.map(
                    (event) => (
                        sumSafe(event.appeals.map((appeal) => appeal.amount_requested))
                    ),
                ),
            );

            // FIXME: Let's use flatMap then sumSafe
            const fundingCalculated = sumSafe(
                events?.map(
                    (event) => (
                        sumSafe(event.appeals.map((appeal) => appeal.amount_funded))
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
                (event) => event.dtype?.id ?? '<no-key>',
            );

            return mapToList(
                emergenciesMapByType,
                (event, disasterType) => {
                    const dtype = event[0].dtype?.name;
                    if (isFalsyString(dtype)) {
                        return undefined;
                    }

                    return {
                        type: disasterType,
                        typeName: dtype,
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
                aggregateEventResponse ?? [],
                (aggregate) => getFormattedDateKey(aggregate.timespan),
            )
        ),
        [aggregateEventResponse],
    );

    const timeSeriesValueSelector = useCallback(
        (_: string, date: Date) => aggregateDataMap[getFormattedDateKey(date)]?.count ?? 0,
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
                                label={strings.emergenciesStatsTitle}
                            />
                            <KeyFigure
                                className={styles.keyFigure}
                                icon={<TargetedPopulationIcon />}
                                value={numAffected}
                                label={strings.emergenciesStatsAffected}
                            />
                            <KeyFigure
                                className={styles.keyFigure}
                                icon={<FundingCoverageIcon />}
                                value={amountRequested}
                                label={strings.emergenciesStatsRequested}
                            />
                            <KeyFigure
                                className={styles.keyFigure}
                                icon={<FundingIcon />}
                                value={funding}
                                label={strings.emergenciesStatsFunding}
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
                    withInternalPadding
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
                    withInternalPadding
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
            {isIfrcAdmin && (
                <FlashUpdateTable />
            )}
            <FieldReportTable />
            <div className={styles.tableFooter}>
                <div className={styles.regionList}>
                    {strings.emergencyViewAllReport}
                    {regionResponse?.results?.map((region, index) => (
                        <Fragment key={region.region_name}>
                            {index !== 0 && '/ '}
                            <Link
                                key={region.region_name}
                                to="allFieldReports"
                                urlSearch={`region=${region.id}`}
                            >
                                {region.region_name}
                            </Link>
                        </Fragment>
                    ))}
                </div>
                <div>
                    {strings.emergencyPerformanceProblems}
                </div>
            </div>
        </Page>
    );
}

Component.displayName = 'Emergencies';
