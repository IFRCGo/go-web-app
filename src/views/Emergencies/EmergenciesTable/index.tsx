import {
    useState,
    useMemo,
} from 'react';
import { useSortState, SortContext, getOrdering } from '#components/Table/useSorting';
import Table from '#components/Table';
import Container from '#components/Container';
import {
    createStringColumn,
    createDateColumn,
    createNumberColumn,
    createLinkColumn,
    createCountryListColumn,
} from '#components/Table/ColumnShortcuts';
import Pager from '#components/Pager';
import useTranslation from '#hooks/useTranslation';
import { useRequest } from '#utils/restRequest';
import type { GoApiResponse, GoApiUrlQuery } from '#utils/restRequest';
import { sumSafe } from '#utils/common';

import i18n from './i18n.json';
import styles from './styles.module.css';

type EventResponse = GoApiResponse<'/api/v2/event/'>;
type EventQueryParams = GoApiUrlQuery<'/api/v2/event/'>;
type EventListItem = NonNullable<EventResponse['results']>[number];

// FIXME: use a separate utility
const thirtyDaysAgo = new Date();
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
thirtyDaysAgo.setHours(0, 0, 0, 0);

const PAGE_SIZE = 5;
const keySelector = (item: EventListItem) => item.id;

function EventItemsTable() {
    const strings = useTranslation(i18n);
    const sortState = useSortState({ name: 'created_at', direction: 'dsc' });
    const { sorting } = sortState;
    const [page, setPage] = useState(1);

    const columns = useMemo(
        () => ([
            createDateColumn<EventListItem, number>(
                'created_at',
                strings.emergenciesTableDate,
                (item) => item.created_at,
                {
                    sortable: true,
                    columnClassName: styles.createdAt,
                },
            ),
            createLinkColumn<EventListItem, number>(
                'event_name',
                strings.emergenciesTableName,
                (item) => item.name,
                (item) => ({
                    to: 'emergenciesLayout',
                    urlParams: { emergencyId: item.id },
                }),
            ),
            createStringColumn<EventListItem, number>(
                'dtype',
                strings.emergenciesTableDisasterType,
                (item) => item.dtype.name,
            ),
            createStringColumn<EventListItem, number>(
                'glide',
                strings.emergenciesTableGlide,
                // FIXME: empty string from server
                (item) => item.glide || '-',
            ),
            createNumberColumn<EventListItem, number>(
                'amount_requested',
                strings.emergenciesTableRequestedAmt,
                (item) => sumSafe(
                    item.appeals.map((appeal) => Number(appeal.amount_requested)),
                ),
            ),
            createCountryListColumn<EventListItem, number>(
                'countries',
                strings.emergenciesTableCountry,
                (item) => item.countries,
            ),
        ]),
        [strings],
    );

    const query = useMemo<EventQueryParams>(
        () => ({
            limit: PAGE_SIZE,
            offset: PAGE_SIZE * (page - 1),
            ordering: getOrdering(sorting),
            disaster_start_date__gt: thirtyDaysAgo.toISOString(),
        }),
        [page, sorting],
    );
    const {
        pending: eventPending,
        response: eventResponse,
    } = useRequest({
        url: '/api/v2/event/',
        preserveResponse: true,
        query,
    });

    return (
        <Container
            className={styles.emergenciesTable}
            footerActions={(
                <Pager
                    activePage={page}
                    itemsCount={eventResponse?.count ?? 0}
                    maxItemsPerPage={PAGE_SIZE}
                    onActivePageChange={setPage}
                />
            )}
        >
            <SortContext.Provider value={sortState}>
                <Table
                    pending={eventPending}
                    filtered={false}
                    className={styles.table}
                    columns={columns}
                    keySelector={keySelector}
                    data={eventResponse?.results}
                />
            </SortContext.Provider>
        </Container>
    );
}

export default EventItemsTable;
