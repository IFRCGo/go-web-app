import {
    useMemo,
    useState,
} from 'react';
import { useOutletContext } from 'react-router-dom';
import {
    BarChart,
    Container,
    Message,
    SelectInput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { stringLabelSelector } from '@ifrc-go/ui/utils';
import {
    encodeDate,
    isDefined,
    isNotDefined,
    listToMap,
} from '@togglecorp/fujs';

import AppealsTable from '#components/domain/AppealsTable';
import CountryKeyFigures from '#components/domain/CountryKeyFigures';
import { type CountryOutletContext } from '#utils/outletContext';
import {
    GoApiResponse,
    useRequest,
} from '#utils/restRequest';

import EmergenciesOverMonth from './EmergenciesOverMonth';
import PastEventsChart from './PastEventsChart';

import i18n from './i18n.json';
import styles from './styles.module.css';

type TimePeriodKey = 'this-year' | 'past-year' | 'last-two-years' | 'last-five-years' | 'last-ten-years';
type DisasterCountItem = GoApiResponse<'/api/v2/country/{id}/disaster-count/'>[number];

function disasterIdSelector(item: DisasterCountItem) {
    return item.disaster_id;
}

function disasterNameSelector(item: DisasterCountItem) {
    return item.disaster_name;
}

function disasterCountSelector(item: DisasterCountItem) {
    return item.count;
}

function timePeriodKeySelector({ key }: { key: TimePeriodKey }) {
    return key;
}

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    const outletContext = useOutletContext<CountryOutletContext>();
    const { countryId } = outletContext;
    const [selectedTimePeriodKey, setSelectedTimePeriodKey] = useState<TimePeriodKey>('last-five-years');

    const timePeriodOptions = useMemo<{
        key: TimePeriodKey;
        label: string;
        startDate: Date;
        endDate: Date;
    }[]>(
        () => {
            const now = new Date();

            return [
                {
                    key: 'this-year',
                    label: strings.filterThisYearLabel,
                    startDate: new Date(now.getFullYear(), 0, 1),
                    endDate: new Date(now.getFullYear(), 11, 31),
                },
                {
                    key: 'past-year',
                    label: strings.filterPastYearLabel,
                    startDate: new Date(now.getFullYear() - 1, 0, 1),
                    endDate: new Date(now.getFullYear() - 1, 11, 31),
                },
                {
                    key: 'last-two-years',
                    label: strings.filterLastTwoYearsLabel,
                    startDate: new Date(now.getFullYear() - 2, 0, 1),
                    endDate: new Date(now.getFullYear(), 11, 31),
                },
                {
                    key: 'last-five-years',
                    label: strings.filterLastFiveYearsLabel,
                    startDate: new Date(now.getFullYear() - 5, 0, 1),
                    endDate: new Date(now.getFullYear(), 11, 31),
                },
                {
                    key: 'last-ten-years',
                    label: strings.filterLastTenYearsLabel,
                    startDate: new Date(now.getFullYear() - 10, 0, 1),
                    endDate: new Date(now.getFullYear(), 11, 31),
                },
            ];
        },
        [strings],
    );

    const timePeriodMap = useMemo(
        () => listToMap(timePeriodOptions, ({ key }) => key),
        [timePeriodOptions],
    );

    const selectedTimePeriod = isDefined(selectedTimePeriodKey)
        ? timePeriodMap[selectedTimePeriodKey]
        : undefined;

    const {
        pending: disasterCountPending,
        response: disasterCountResponse,
        error: disasterCountError,
    } = useRequest({
        skip: isNotDefined(countryId) || isNotDefined(selectedTimePeriod),
        url: '/api/v2/country/{id}/disaster-count/',
        pathVariables: { id: countryId },
        query: isDefined(selectedTimePeriod) ? ({
            start_date: encodeDate(selectedTimePeriod.startDate),
            end_date: encodeDate(selectedTimePeriod.endDate),
        }) : undefined,
    });

    const {
        // pending: figurePending,
        response: figureResponse,
        // error: figureResponseError,
    } = useRequest({
        skip: isNotDefined(countryId) || isNotDefined(selectedTimePeriod),
        url: '/api/v2/country/{id}/figure/',
        pathVariables: { id: countryId },
        query: isDefined(selectedTimePeriod) ? ({
            start_date: encodeDate(selectedTimePeriod.startDate),
            end_date: encodeDate(selectedTimePeriod.endDate),
        }) : undefined,
    });

    if (isNotDefined(selectedTimePeriod)) {
        return null;
    }

    // FIXME: properly handle low data and empty conditions in charts

    return (
        <div className={styles.countryProfilePreviousEvents}>
            {(disasterCountPending || isDefined(disasterCountError)) && (
                <Message
                    pending={disasterCountPending}
                    errored={isDefined(disasterCountError)}
                    erroredTitle={strings.dataLoadFailureMessage}
                    erroredDescription={disasterCountError?.value.messageForNotification}
                />
            )}
            <Container
                contentViewType="grid"
                numPreferredGridContentColumns={2}
                withGridViewInFilter
                spacing="relaxed"
                filters={(
                    <SelectInput
                        name="timePeriod"
                        options={timePeriodOptions}
                        value={selectedTimePeriodKey}
                        onChange={setSelectedTimePeriodKey}
                        keySelector={timePeriodKeySelector}
                        labelSelector={stringLabelSelector}
                        nonClearable
                    />

                )}
            >
                {isDefined(figureResponse) && (
                    <CountryKeyFigures
                        className={styles.keyFigures}
                        data={figureResponse}
                    />
                )}
                {!(disasterCountPending || isDefined(disasterCountError)) && (
                    <>
                        <Container
                            heading={strings.emergenciesByDisasterTypeHeading}
                            withHeaderBorder
                        >
                            <BarChart
                                data={disasterCountResponse}
                                keySelector={disasterIdSelector}
                                labelSelector={disasterNameSelector}
                                valueSelector={disasterCountSelector}
                                maxRows={8}
                            />
                        </Container>
                        <Container
                            heading={strings.emergenciesOverMonthHeading}
                            withHeaderBorder
                        >
                            <EmergenciesOverMonth
                                countryId={countryId}
                                startDate={encodeDate(selectedTimePeriod.startDate)}
                                endDate={encodeDate(selectedTimePeriod.endDate)}
                            />
                        </Container>
                        <PastEventsChart
                            className={styles.pastEvents}
                            countryId={countryId}
                            startDate={encodeDate(selectedTimePeriod.startDate)}
                            endDate={encodeDate(selectedTimePeriod.endDate)}
                        />
                    </>
                )}
            </Container>
            {isDefined(countryId) && (
                <AppealsTable
                    heading={strings.previousOperationsHeading}
                    variant="country"
                    countryId={Number(countryId)}
                    withPastOperations
                />
            )}
        </div>
    );
}

Component.displayName = 'CountryProfilePreviousEvents';
