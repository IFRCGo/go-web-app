import {
    useMemo,
} from 'react';
import { SortContext } from '#components/Table/useSorting';
import Table from '#components/Table';
import Container from '#components/Container';
import Link from '#components/Link';
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
import NumberOutput from '#components/NumberOutput';
import { useRequest, type GoApiResponse } from '#utils/restRequest';
import { sumSafe } from '#utils/common';
import { resolveToComponent } from '#utils/translation';

import i18n from './i18n.json';
import styles from './styles.module.css';

type EventResponse = GoApiResponse<'/api/v2/event/'>;
type EventListItem = NonNullable<EventResponse['results']>[number];

// FIXME: use a separate utility
const thirtyDaysAgo = new Date();
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
thirtyDaysAgo.setHours(0, 0, 0, 0);

const keySelector = (item: EventListItem) => item.id;

interface Props {
    regionId: number;
}

function EventItemsTable(props: Props) {
    const { regionId } = props;
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

    const columns = useMemo(
        () => ([
            createDateColumn<EventListItem, number>(
                'created_at',
                strings.regionEmergenciesTableDate,
                (item) => item.created_at,
                {
                    sortable: true,
                    columnClassName: styles.createdAt,
                },
            ),
            createLinkColumn<EventListItem, number>(
                'name',
                strings.regionEmergenciesTableName,
                (item) => item.name,
                (item) => ({
                    to: 'emergenciesLayout',
                    urlParams: { emergencyId: item.id },
                }),
                { sortable: true },
            ),
            createStringColumn<EventListItem, number>(
                'dtype',
                strings.regionEmergenciesTableDisasterType,
                (item) => item.dtype?.name,
            ),
            createStringColumn<EventListItem, number>(
                'glide',
                strings.regionEmergenciesTableGlide,
                (item) => item.glide,
                { sortable: true },
            ),
            createNumberColumn<EventListItem, number>(
                'amount_requested',
                strings.regionEmergenciesTableRequestedAmt,
                (item) => sumSafe(
                    item.appeals.map((appeal) => appeal.amount_requested),
                ),
                {
                    suffix: ' CHF',
                },
            ),
            createNumberColumn<EventListItem, number>(
                'num_affected',
                strings.regionEmergenciesTableNumberAffected,
                (item) => item.num_affected,
                { sortable: true },
            ),
            createCountryListColumn<EventListItem, number>(
                'countries',
                strings.regionEmergenciesTableCountry,
                (item) => item.countries,
            ),
        ]),
        [
            strings.regionEmergenciesTableDate,
            strings.regionEmergenciesTableName,
            strings.regionEmergenciesTableDisasterType,
            strings.regionEmergenciesTableGlide,
            strings.regionEmergenciesTableRequestedAmt,
            strings.regionEmergenciesTableNumberAffected,
            strings.regionEmergenciesTableCountry,
        ],
    );

    const {
        pending: eventPending,
        response: eventResponse,
    } = useRequest({
        url: '/api/v2/event/',
        preserveResponse: true,
        query: {
            limit,
            offset,
            ordering,
            disaster_start_date__gt: thirtyDaysAgo.toISOString(),
            regions__in: regionId,
        },
    });

    const heading = useMemo(
        () => (
            resolveToComponent(
                strings.regionEmergenciesTableTitle,
                { numEmergencies: <NumberOutput value={eventResponse?.count} /> },
            )
        ),
        [strings.regionEmergenciesTableTitle, eventResponse],
    );

    return (
        <Container
            className={styles.recentEmergenciesTable}
            heading={heading}
            actions={(
                <Link
                    to="allEmergencies"
                    urlSearch={`region=${regionId}`}
                    withLinkIcon
                    withUnderline
                >
                    {strings.regionEmergenciesTableViewAll}
                </Link>
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
                    filtered={false}
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
