import { useState, useMemo, useContext } from 'react';
import { generatePath } from 'react-router-dom';
import { useSortState, SortContext } from '#components/Table/useSorting';
import Table from '#components/Table';
import Link from '#components/Link';
import Container from '#components/Container';
import {
    createStringColumn,
    createDateColumn,
    createNumberColumn,
    createLinkColumn,
    createListDisplayColumn,
} from '#components/Table/ColumnShortcuts';
import Pager from '#components/Pager';
import useTranslation from '#hooks/useTranslation';
import RouteContext from '#contexts/route';
import {
    useRequest,
    ListResponse,
} from '#utils/restRequest';
import { sumSafe } from '#utils/common';

import type { EventItem } from '../types';
import i18n from './i18n.json';
import styles from './styles.module.css';

const thirtyDaysAgo = new Date();
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
thirtyDaysAgo.setHours(0, 0, 0, 0);

const keySelector = (item: EventItem) => item.id;

type TableKey = number;

function EventItemsTable() {
    const sortState = useSortState({ name: 'created_at', direction: 'dsc' });
    const { sorting } = sortState;

    const strings = useTranslation(i18n);
    const {
        country: countryRoute,
        emergency: emergencyRoute,
    } = useContext(RouteContext);

    const columns = useMemo(
        () => ([
            createDateColumn<EventItem, TableKey>(
                'created_at',
                strings.emergenciesTableDate,
                (item) => item.created_at,
                {
                    sortable: true,
                    columnClassName: styles.createdAt,
                },
            ),
            createLinkColumn<EventItem, TableKey>(
                'event_name',
                strings.emergenciesTableName,
                (item) => item.name,
                (item) => ({
                    to: generatePath(emergencyRoute.absolutePath, { emergencyId: item.id }),
                }),
            ),
            createStringColumn<EventItem, TableKey>(
                'dtype',
                strings.emergenciesTableDisasterType,
                (item) => item.dtype.name,
            ),
            createStringColumn<EventItem, TableKey>(
                'dtype',
                strings.emergenciesTableGlide,
                // FIXME: empty string from server
                (item) => item.glide || '-',
            ),
            createNumberColumn<EventItem, TableKey>(
                'amount_requested',
                strings.emergenciesTableRequestedAmt,
                (item) => sumSafe(
                    item.appeals.map((appeal) => Number(appeal.amount_requested)),
                ),
            ),
            createListDisplayColumn<EventItem, TableKey>(
                'countries',
                strings.emergenciesTableCountry,
                (item) => ({
                    value: item.countries.map((country) => (
                        <Link
                            to={generatePath(
                                countryRoute.absolutePath,
                                { countryId: String(country.id) },
                            )}
                        >
                            {country.name}
                        </Link>
                    )),
                }),
            ),
        ]),
        [strings, countryRoute, emergencyRoute],
    );

    let ordering;
    if (sorting) {
        ordering = sorting.direction === 'dsc'
            ? `-${sorting.name}`
            : sorting.name;
    }

    const [page, setPage] = useState(0);

    const PAGE_SIZE = 5;
    const {
        pending: eventPending,
        response: eventResponse,
    } = useRequest<ListResponse<EventItem>>({
        url: 'api/v2/event/',
        preserveResponse: true,
        query: {
            limit: PAGE_SIZE,
            offset: PAGE_SIZE * (page - 1),
            ordering,
            disaster_start_date__gt: thirtyDaysAgo.toISOString(),
        },
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
