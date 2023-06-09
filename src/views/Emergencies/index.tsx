import { useMemo } from 'react';
import {
    sum,
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
import useTranslation from '#hooks/useTranslation';
import {
    useRequest,
    ListResponse,
} from '#utils/restRequest';

import i18n from './i18n.json';
import styles from './styles.module.css';

function sumSafe(list: (number | undefined | null)[] | undefined) {
    if (!list) {
        return undefined;
    }

    const safeList = list.filter(isDefined);
    return sum(safeList);
}

const oneMonthAgo = new Date();
oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
oneMonthAgo.setHours(0, 0, 0, 0);

interface EventItem {
    active_deployments: number;
    appeals: {
        aid: string;
        amount_funded: string;
        amount_requested: string;
        code: string;
        ind: number;
        num_beneficiaries: number;
        start_date: string;
        status: number;
        status_display: string;
    }[];
    auto_generated: boolean;
    countries: unknown[];
    created_at: string;
    disaster_start_date: string;
    dtype: {
        id: number;
    }
    emergency_response_contact_email: string | null;
    field_reports: {
        num_affected: number | null;
        updated_at: string,
    }[];
    glide: string;
    id: number;
    ifrc_severity_label: number;
    ifrc_severity_label_display: string;
    is_featured: boolean;
    is_featured_region: boolean;
    name: string;
    num_affected: number | null;
    parent_event: number | null;
    slug: string | null;
    summary: string;
    tab_one_title: string;
    tab_three_title: string | null;
    tab_two_title: string | null;
    updated_at: string;
}

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

    const [
        numAffected,
        amountRequested,
        funding,
    ] = useMemo(
        () => {
            if (!eventsResponse) {
                return [];
            }

            const numAffectedCalculated = sumSafe(
                (eventsResponse.results.map(
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
                eventsResponse.results.map(
                    (event) => (
                        sumSafe(event.appeals.map((appeal) => Number(appeal.amount_requested)))
                    ),
                ),
            );

            const fundingCalculated = sumSafe(
                eventsResponse.results.map(
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
        >
            Emergencies Page
        </Page>
    );
}

Component.displayName = 'Emergencies';
