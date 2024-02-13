import { useMemo } from 'react';
import { isDefined, isNotDefined } from '@togglecorp/fujs';

import Table from '#components/Table';
import Link from '#components/Link';
import Container from '#components/Container';
import { getDuration, formatDate } from '#utils/common';
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
import { SURGE_ALERT_STATUS_CLOSED } from '#utils/constants';

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

            // FIXME: this should come from the useFilterState
            ordering: 'status,-opens',

            // NOTE: following filters are required
            is_active: true,
            end__gte: today.toISOString(),
        },
    });

    const columns = useMemo(() => ([
        createDateColumn<SurgeAlertListItem, number>(
            'opens',
            strings.surgeAlertsTableAlertDate,
            (surgeAlert) => surgeAlert.opens,
            { sortable: false },
        ),
        createStringColumn<SurgeAlertListItem, number>(
            'duration',
            strings.surgeAlertsTableDuration,
            (surgeAlert) => {
                if (isNotDefined(surgeAlert.start) || isNotDefined(surgeAlert.end)) {
                    return '-';
                }

                const startDate = new Date(surgeAlert.start);
                const endDate = new Date(surgeAlert.end);
                const duration = getDuration(startDate, endDate);

                return duration;
            },
        ),
        createStringColumn<SurgeAlertListItem, number>(
            'start',
            strings.surgeAlertsTableStartDate,
            (surgeAlert) => {
                const startDate = isDefined(surgeAlert.start)
                    ? new Date(surgeAlert.start) : undefined;

                if (isDefined(startDate)) {
                    if (surgeAlert.status === SURGE_ALERT_STATUS_CLOSED) {
                        return formatDate(startDate);
                    }

                    const dateStarted = startDate.getTime() < todayTimestamp
                        ? strings.surgeAlertImmediately
                        : formatDate(startDate);

                    return dateStarted;
                }
                return undefined;
            },
            { cellRendererClassName: styles.startColumn },
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
            (surgeAlert) => surgeAlert.status_display,
        ),
    ]), [
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
