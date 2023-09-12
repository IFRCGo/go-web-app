import { useMemo } from 'react';
import { isNotDefined } from '@togglecorp/fujs';

import Table from '#components/Table';
import Link from '#components/Link';
import Container from '#components/Container';
import { getDuration } from '#utils/common';
import {
    createDateColumn,
    createLinkColumn,
    createStringColumn,
} from '#components/Table/ColumnShortcuts';
import { SortContext } from '#components/Table/useSorting';
import Pager from '#components/Pager';
import useTranslation from '#hooks/useTranslation';
import useFilterState from '#hooks/useFilterState';
import { useRequest, type GoApiResponse } from '#utils/restRequest';

import i18n from './i18n.json';
import styles from './styles.module.css';

type GetSurgeAlertResponse = GoApiResponse<'/api/v2/surge_alert/'>;
type SurgeAlertListItem = NonNullable<GetSurgeAlertResponse['results']>[number];

const surgeAlertKeySelector = (item: SurgeAlertListItem) => item.id;

// FIXME: use a separate utility
const aMonthAgo = new Date();
aMonthAgo.setMonth(aMonthAgo.getMonth() - 1);
aMonthAgo.setHours(0, 0, 0, 0);

const today = new Date().getTime();

// If alert comes from Molnix, only show first part of message as position.
function getPositionString(alert: SurgeAlertListItem) {
    if (isNotDefined(alert.molnix_id)) {
        return alert.message;
    }
    return alert.message?.split(',')[0];
}

function getMolnixKeywords(molnixTags: SurgeAlertListItem['molnix_tags']) {
    const filtered = molnixTags.filter((tag) => {
        if (tag.name.startsWith('OP-')) {
            return false;
        }
        return true;
    });
    return filtered.map((tag) => tag.name).join(', ');
}

function getStatus(alert: SurgeAlertListItem, strings: Record<string, string>) {
    if (alert.is_stood_down) {
        return strings.surgeAlertStoodDown;
    }
    const closed = alert.end ? new Date(alert.end).getTime() < today : undefined;
    if (closed) {
        return strings.surgeAlertClosed;
    }
    return strings.surgeAlertOpen;
}

function SurgeAlertsTable() {
    const strings = useTranslation(i18n);
    const {
        sortState,
        ordering,
        page,
        setPage,
        limit,
        offset,
    } = useFilterState<object>(
        {},
        undefined,
        1,
        5,
    );

    const {
        pending: surgeAlertsPending,
        response: surgeAlertsResponse,
    } = useRequest({
        url: '/api/v2/surge_alert/',
        preserveResponse: true,
        query: {
            limit,
            offset,
            is_active: true,
            created_at__gte: aMonthAgo.toISOString(),
            ordering,
        },
    });

    const columns = useMemo(() => ([
        createDateColumn<SurgeAlertListItem, number>(
            'created_at',
            strings.surgeAlertsTableAlertDate,
            (surgeAlert) => surgeAlert.created_at,
            {
                sortable: true,
                columnClassName: styles.createdAtDate,
            },
        ),
        createStringColumn<SurgeAlertListItem, number>(
            'duration',
            strings.surgeAlertsTableDuration,
            (surgeAlert) => {
                if (isNotDefined(surgeAlert.created_at) || isNotDefined(surgeAlert.end)) {
                    return '-';
                }

                const alertDate = new Date(surgeAlert.created_at);
                const deadline = new Date(surgeAlert.end);
                const duration = getDuration(alertDate, deadline);

                return duration;
            },
        ),
        createStringColumn<SurgeAlertListItem, number>(
            'name',
            strings.surgeAlertsTablePosition,
            (surgeAlert) => getPositionString(surgeAlert),
        ),
        createStringColumn<SurgeAlertListItem, number>(
            'keywords',
            strings.surgeAlertsTableKeywords,
            (surgeAlert) => getMolnixKeywords(surgeAlert.molnix_tags),
        ),
        createLinkColumn<SurgeAlertListItem, number>(
            'emergency',
            strings.surgeAlertsTableEmergency,
            (surgeAlert) => surgeAlert.event.name,
            (surgeAlert) => ({
                to: 'emergenciesLayout',
                urlParams: {
                    emergencyId: surgeAlert.event.id,
                },
            }),
        ),
        createLinkColumn<SurgeAlertListItem, number>(
            'country',
            strings.surgeAlertsTableCountry,
            (surgeAlert) => surgeAlert.country.name,
            (surgeAlert) => ({
                to: 'countriesLayout',
                urlParams: {
                    countryId: surgeAlert.country.id,
                },
            }),
        ),
        createStringColumn<SurgeAlertListItem, number>(
            'status',
            strings.surgeAlertsTableStatus,
            (surgeAlert) => getStatus(surgeAlert, strings),
        ),
    ]), [strings]);

    return (
        <Container
            className={styles.surgeAlertsTable}
            heading={strings.surgeAlertsTableHeading}
            withHeaderBorder
            footerActions={(
                <Pager
                    activePage={page}
                    itemsCount={surgeAlertsResponse?.count ?? 0}
                    maxItemsPerPage={limit}
                    onActivePageChange={setPage}
                />
            )}
            actions={(
                <Link
                    to="allSurgeAlerts"
                    withForwardIcon
                    withUnderline
                >
                    {strings.surgeAlertsViewAll}
                </Link>
            )}
        >
            <SortContext.Provider value={sortState}>
                <Table
                    pending={surgeAlertsPending}
                    className={styles.table}
                    columns={columns}
                    keySelector={surgeAlertKeySelector}
                    data={surgeAlertsResponse?.results}
                    filtered={false}
                />
            </SortContext.Provider>
        </Container>
    );
}

export default SurgeAlertsTable;
