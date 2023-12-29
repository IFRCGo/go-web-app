import { useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
    BarChart,
    Container,
    Message,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    encodeDate,
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

import { type CountryOutletContext } from '#utils/outletContext';
import { useRequest } from '#utils/restRequest';

import EmergenciesOverMonth from './EmergenciesOverMonth';
import PastEventsChart from './PastEventsChart';

import i18n from './i18n.json';
import styles from './styles.module.css';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    const outletContext = useOutletContext<CountryOutletContext>();
    const { countryId } = outletContext;

    const startDate = useMemo(
        () => {
            const today = new Date();
            const startOfThisYear = new Date(today.getFullYear(), 0, 1);
            startOfThisYear.setHours(0, 0, 0, 0);
            const tenYearsAgo = new Date(startOfThisYear.getFullYear() - 10, 0, 1);
            tenYearsAgo.setHours(0, 0, 0, 0);

            return encodeDate(tenYearsAgo);
        },
        [],
    );

    const {
        pending: disasterCountPending,
        response: disasterCountResponse,
        error: disasterCountError,
    } = useRequest({
        skip: isNotDefined(countryId),
        url: '/api/v2/country/{id}/disaster-count/',
        pathVariables: { id: countryId },
        query: { start_date: startDate },
    });

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
            {!(disasterCountPending || isDefined(disasterCountError)) && (
                <Container
                    contentViewType="grid"
                    numPreferredGridContentColumns={2}
                    spacing="loose"
                >
                    <Container
                        heading={strings.emergenciesByDisasterTypeHeading}
                        withHeaderBorder
                    >
                        <BarChart
                            data={disasterCountResponse}
                            keySelector={(disasterCountItem) => disasterCountItem.disaster_name}
                            labelSelector={(disasterCountItem) => disasterCountItem.disaster_name}
                            valueSelector={(disasterCountItem) => disasterCountItem.count}
                            maxRows={8}
                        />
                    </Container>
                    <Container
                        heading={strings.emergenciesOverMonthHeading}
                        withHeaderBorder
                    >
                        <EmergenciesOverMonth
                            countryId={countryId}
                            startDate={startDate}
                        />
                    </Container>
                </Container>
            )}
            <PastEventsChart
                countryId={countryId}
            />
        </div>
    );
}

Component.displayName = 'CountryProfilePreviousEvents';
