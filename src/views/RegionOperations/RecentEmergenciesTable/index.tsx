import {
    useState,
    useMemo,
} from 'react';
import { useSortState, SortContext, getOrdering } from '#components/Table/useSorting';
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

const PAGE_SIZE = 5;
const keySelector = (item: EventListItem) => item.id;

interface Props {
    regionId: number;
}

function EventItemsTable(props: Props) {
    const { regionId } = props;
    const strings = useTranslation(i18n);
    const sortState = useSortState({ name: 'created_at', direction: 'dsc' });
    const { sorting } = sortState;
    const [page, setPage] = useState(1);

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
                'event_name',
                strings.regionEmergenciesTableName,
                (item) => item.name,
                (item) => ({
                    to: 'emergenciesLayout',
                    urlParams: { emergencyId: item.id },
                }),
            ),
            createStringColumn<EventListItem, number>(
                'dtype',
                strings.regionEmergenciesTableDisasterType,
                (item) => item.dtype.name,
            ),
            createStringColumn<EventListItem, number>(
                'glide',
                strings.regionEmergenciesTableGlide,
                // FIXME: empty string from server
                (item) => item.glide || '-',
            ),
            createNumberColumn<EventListItem, number>(
                'amount_requested',
                strings.regionEmergenciesTableRequestedAmt,
                (item) => sumSafe(
                    // FIXME: server should send number value
                    item.appeals.map((appeal) => Number(appeal.amount_requested)),
                ),
            ),
            createCountryListColumn<EventListItem, number>(
                'countries',
                strings.regionEmergenciesTableCountry,
                (item) => item.countries,
            ),
        ]),
        [strings],
    );

    const {
        pending: eventPending,
        response: eventResponse,
    } = useRequest({
        url: '/api/v2/event/',
        preserveResponse: true,
        query: {
            limit: PAGE_SIZE,
            offset: PAGE_SIZE * (page - 1),
            ordering: getOrdering(sorting),
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
        [strings, eventResponse],
    );

    return (
        <Container
            className={styles.recentEmergenciesTable}
            heading={heading}
            actions={(
                <Link
                    to="allEmergencies"
                    urlSearch={`region=${regionId}`}
                    withForwardIcon
                    withUnderline
                >
                    {strings.regionEmergenciesTableViewAll}
                </Link>
            )}
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
