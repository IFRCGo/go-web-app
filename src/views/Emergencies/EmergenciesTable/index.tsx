import { useMemo } from 'react';
import { SortContext } from '#components/Table/useSorting';
import { encodeDate, max } from '@togglecorp/fujs';
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
import useFilterState from '#hooks/useFilterState';
import DateInput from '#components/DateInput';
import DisasterTypeSelectInput from '#components/domain/DisasterTypeSelectInput';
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

const keySelector = (item: EventListItem) => item.id;

function getMostRecentAffectedValue(fieldReport: EventListItem['field_reports']) {
    const latestReport = max(fieldReport, (item) => new Date(item.updated_at).getTime());
    return latestReport?.num_affected;
}

function EventItemsTable() {
    const strings = useTranslation(i18n);
    const {
        sortState,
        ordering,
        page,
        setPage,
        limit,
        offset,
        rawFilter,
        filter,
        setFilterField,
        filtered,
    } = useFilterState<{
        startDateAfter?: string,
        startDateBefore?: string,
        dType?: number,
    }>({
        filter: {
            startDateAfter: encodeDate(thirtyDaysAgo),
        },
        pageSize: 5,
    });

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
                'name',
                strings.emergenciesTableName,
                (item) => item.name,
                (item) => ({
                    to: 'emergenciesLayout',
                    urlParams: { emergencyId: item.id },
                }),
                { sortable: true },
            ),
            createStringColumn<EventListItem, number>(
                'dtype',
                strings.emergenciesTableDisasterType,
                (item) => item.dtype?.name,
            ),
            createStringColumn<EventListItem, number>(
                'glide',
                strings.emergenciesTableGlide,
                (item) => item.glide,
                { sortable: true },
            ),
            createNumberColumn<EventListItem, number>(
                'amount_requested',
                strings.emergenciesTableRequestedAmt,
                (item) => sumSafe(
                    item.appeals.map((appeal) => appeal.amount_requested),
                ),
                {
                    suffix: ' CHF',
                },
            ),
            createNumberColumn<EventListItem, number>(
                'num_affected',
                strings.emergenciesTableAffected,
                (item) => item.num_affected ?? getMostRecentAffectedValue(item.field_reports),
                { sortable: true },
            ),
            createCountryListColumn<EventListItem, number>(
                'countries',
                strings.emergenciesTableCountry,
                (item) => item.countries,
            ),
        ]),
        [
            strings.emergenciesTableDate,
            strings.emergenciesTableName,
            strings.emergenciesTableDisasterType,
            strings.emergenciesTableGlide,
            strings.emergenciesTableRequestedAmt,
            strings.emergenciesTableAffected,
            strings.emergenciesTableCountry,
        ],
    );

    const query = useMemo<EventQueryParams>(
        () => ({
            limit,
            offset,
            ordering,
            disaster_start_date__gte: filter.startDateAfter,
            disaster_start_date__lte: filter.startDateBefore,
            dtype: filter.dType,
        }),
        [limit, offset, ordering, filter],
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
            withGridViewInFilter
            filters={(
                <>
                    <DateInput
                        name="startDateAfter"
                        label={strings.emergenciesTableFilterStartAfter}
                        onChange={setFilterField}
                        value={rawFilter.startDateAfter}
                    />
                    <DateInput
                        name="startDateBefore"
                        label={strings.emergenciesTableFilterStartBefore}
                        onChange={setFilterField}
                        value={rawFilter.startDateBefore}
                    />
                    <DisasterTypeSelectInput
                        placeholder={strings.emergenciesTableFilterDisastersPlaceholder}
                        label={strings.emergenciesTableDisasterType}
                        name="dType"
                        value={rawFilter.dType}
                        onChange={setFilterField}
                    />
                </>
            )}
            footerActions={(
                <Pager
                    activePage={page}
                    itemsCount={eventResponse?.count ?? 0}
                    maxItemsPerPage={limit}
                    onActivePageChange={setPage}
                />
            )}
        >
            <SortContext.Provider value={sortState}>
                <Table
                    pending={eventPending}
                    filtered={filtered}
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
