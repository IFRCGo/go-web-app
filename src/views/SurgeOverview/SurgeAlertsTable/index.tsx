import { useMemo, useCallback } from 'react';
import { isDefined, isNotDefined } from '@togglecorp/fujs';

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

const today = new Date();
const todayTimestamp = today.getTime();

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

function SurgeAlertsTable() {
    const strings = useTranslation(i18n);
    const {
        sortState,
        ordering,
        page,
        setPage,
        limit,
        offset,
    } = useFilterState<object>({
        filter: {},
        pageSize: 5,
    });

    const {
        pending: surgeAlertsPending,
        response: surgeAlertsResponse,
    } = useRequest({
        url: '/api/v2/surge_alert/',
        preserveResponse: true,
        query: {
            limit,
            offset,
            ordering,

            // NOTE: following filters are required
            is_active: true,
            end__gte: today.toISOString(),
        },
    });

    const getStatus = useCallback((alert: SurgeAlertListItem) => {
        if (alert.is_stood_down) {
            return strings.surgeAlertStoodDown;
        }
        const closed = alert.end ? new Date(alert.end).getTime() < todayTimestamp : undefined;
        if (closed) {
            return strings.surgeAlertClosed;
        }
        return strings.surgeAlertOpen;
    }, [
        strings.surgeAlertClosed,
        strings.surgeAlertOpen,
        strings.surgeAlertStoodDown,
    ]);

    const columns = useMemo(() => ([
        createDateColumn<SurgeAlertListItem, number>(
            'created_at',
            strings.surgeAlertsTableAlertDate,
            (surgeAlert) => surgeAlert.created_at,
            { sortable: true },
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
        createDateColumn<SurgeAlertListItem, number>(
            'start',
            strings.surgeAlertsTableStartDate,
            (surgeAlert) => {
                const startDate = isDefined(surgeAlert.start)
                    ? new Date(surgeAlert.start) : undefined;
                const endDate = isDefined(surgeAlert.end) ? new Date(surgeAlert.end) : undefined;

                const closed = isDefined(surgeAlert.end)
                    ? new Date(surgeAlert.end).getTime() < todayTimestamp : undefined;

                if (isDefined(endDate) && closed) {
                    return endDate.toLocaleString();
                }

                if (isDefined(startDate)) {
                    const dateStarted = startDate.getTime() < todayTimestamp
                        ? strings.surgeAlertImmediately
                        : startDate.toLocaleString();

                    return dateStarted;
                }
                return undefined;
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
            (surgeAlert) => getStatus(surgeAlert),
        ),
    ]), [
        getStatus,
        strings.surgeAlertImmediately,
        strings.surgeAlertsTableAlertDate,
        strings.surgeAlertsTableDuration,
        strings.surgeAlertsTableStartDate,
        strings.surgeAlertsTablePosition,
        strings.surgeAlertsTableKeywords,
        strings.surgeAlertsTableEmergency,
        strings.surgeAlertsTableCountry,
        strings.surgeAlertsTableStatus,
    ]);

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
                <>
                    {/* {strings.wikiJsLink?.length > 0 && (
                        <WikiLink
                            href=''
                        />
                    )} */}
                    <Link
                        to="allSurgeAlerts"
                        withLinkIcon
                        withUnderline
                    >
                        {strings.surgeAlertsViewAll}
                    </Link>
                </>
            )}
        >
            <SortContext.Provider value={sortState}>
                <Table
                    pending={surgeAlertsPending}
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
