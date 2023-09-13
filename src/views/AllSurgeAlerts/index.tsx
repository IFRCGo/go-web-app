import { useMemo, useCallback } from 'react';
import { isDefined, isNotDefined } from '@togglecorp/fujs';

import Page from '#components/Page';
import Container from '#components/Container';
import Pager from '#components/Pager';
import Table from '#components/Table';
import {
    createStringColumn,
    createDateColumn,
    createLinkColumn,
} from '#components/Table/ColumnShortcuts';
import useTranslation from '#hooks/useTranslation';
import useFilterState from '#hooks/useFilterState';
import { useRequest, type GoApiResponse } from '#utils/restRequest';
import { resolveToComponent } from '#utils/translation';
import { numericIdSelector } from '#utils/selectors';
import { getDuration } from '#utils/common';

import i18n from './i18n.json';
import styles from './styles.module.css';

type SurgeResponse = GoApiResponse<'/api/v2/surge_alert/'>;
type SurgeListItem = NonNullable<SurgeResponse['results']>[number];

type TableKey = number;
const today = new Date().getTime();

function getPositionString(alert: SurgeListItem) {
    if (isNotDefined(alert.molnix_id)) {
        return alert.message;
    }
    return alert.message?.split(',')[0];
}

function getMolnixKeywords(molnixTags: SurgeListItem['molnix_tags']) {
    return molnixTags
        .map((tag) => tag.name)
        .filter((tag) => !tag.startsWith('OP-'))
        .filter((tag) => !['Nosuitable', 'NotSurge', 'OpsChange'].includes(tag))
        .join(', ');
}

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    const {
        page,
        setPage,
        limit,
        offset,
    } = useFilterState<object>(
        {},
        undefined,
        1,
        15,
    );

    const {
        response: surgeResponse,
        pending: surgeResponsePending,
    } = useRequest({
        url: '/api/v2/surge_alert/',
        preserveResponse: true,
        query: {
            limit,
            offset,
        },
    });

    const getStatus = useCallback(
        (alert: SurgeListItem) => {
            if (alert.is_stood_down) {
                return strings.surgeAlertStoodDown;
            }
            const closed = isDefined(alert.end) ? new Date(alert.end).getTime() < today : undefined;
            return closed ? strings.surgeAlertClosed : strings.surgeAlertOpen;
        },
        [strings],
    );

    const columns = useMemo(
        () => ([
            createDateColumn<SurgeListItem, TableKey>(
                'created_at',
                strings.surgeAlertDate,
                (item) => item.created_at,
            ),
            createStringColumn<SurgeListItem, TableKey>(
                'duration',
                strings.surgeAlertDuration,
                (item) => {
                    if (isNotDefined(item.created_at) || isNotDefined(item.end)) {
                        return undefined;
                    }

                    const alertDate = new Date(item.created_at);
                    const deadline = new Date(item.end);
                    const duration = getDuration(alertDate, deadline);

                    return duration;
                },
            ),
            createStringColumn<SurgeListItem, TableKey>(
                'start',
                strings.surgeAlertStartDate,
                (item) => {
                    if (isNotDefined(item.start)) {
                        return undefined;
                    }

                    const startDate = new Date(item.start);
                    const nowMs = new Date().getTime();

                    // FIXME: use translations
                    const duration = startDate.getTime() < nowMs
                        ? 'Immediately'
                        : startDate.toLocaleString();

                    return duration;
                },
            ),
            createStringColumn<SurgeListItem, TableKey>(
                'name',
                strings.surgeAlertPosition,
                (item) => getPositionString(item),
            ),
            createStringColumn<SurgeListItem, TableKey>(
                'keywords',
                strings.surgeAlertKeywords,
                (item) => getMolnixKeywords(item.molnix_tags),
            ),
            createLinkColumn<SurgeListItem, TableKey>(
                'emergency',
                strings.surgeAlertEmergency,
                (item) => item.event?.name,
                (item) => ({
                    to: 'emergenciesLayout',
                    urlParams: { emergencyId: item.event?.id },
                }),
            ),
            createLinkColumn<SurgeListItem, TableKey>(
                'country',
                strings.surgeAlertCountry,
                (item) => item.country?.name,
                (item) => ({
                    to: 'countriesLayout',
                    urlParams: {
                        countryId: item.country?.id,
                    },
                }),
            ),
            createStringColumn<SurgeListItem, TableKey>(
                'status',
                strings.surgeAlertStatus,
                (item) => getStatus(item),
            ),
        ]),
        [strings, getStatus],
    );

    const heading = resolveToComponent(
        strings.allSurgeAlertsHeading,
        { numSurgeAlerts: surgeResponse?.count ?? '--' },
    );

    return (
        <Page
            className={styles.allSurgeAlerts}
            title={strings.allSurgeAlertsTitle}
            heading={heading}
        >
            <Container
                footerActions={(
                    <Pager
                        activePage={page}
                        onActivePageChange={setPage}
                        itemsCount={surgeResponse?.count ?? 0}
                        maxItemsPerPage={limit}
                    />
                )}
            >
                <Table
                    pending={surgeResponsePending}
                    filtered={false}
                    data={surgeResponse?.results}
                    columns={columns}
                    keySelector={numericIdSelector}
                />
            </Container>
        </Page>
    );
}

Component.displayName = 'AllSurgeAlerts';
