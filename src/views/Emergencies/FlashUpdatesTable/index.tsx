import {
    useState,
    useMemo,
    useContext,
} from 'react';

import { useSortState, SortContext, getOrdering } from '#components/Table/useSorting';
import Table from '#components/Table';
import NumberOutput from '#components/NumberOutput';
import Link from '#components/Link';
import Container from '#components/Container';
import {
    createStringColumn,
    createDateColumn,
    createCountryListColumn,
} from '#components/Table/ColumnShortcuts';
import Pager from '#components/Pager';
import useTranslation from '#hooks/useTranslation';
import RouteContext from '#contexts/route';
import { useRequest } from '#utils/restRequest';
import type { GoApiResponse } from '#utils/restRequest';
import { resolveToComponent } from '#utils/translation';

import i18n from './i18n.json';
import styles from './styles.module.css';

type FlashUpdateResponse = GoApiResponse<'/api/v2/flash-update/'>;
type FlashUpdateListItem = NonNullable<FlashUpdateResponse['results']>[number];

const thirtyDaysAgo = new Date();
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
thirtyDaysAgo.setHours(0, 0, 0, 0);

const keySelector = (item: FlashUpdateListItem) => item.id;

type TableKey = number;

function FlashUpdateTable() {
    const strings = useTranslation(i18n);
    const sortState = useSortState({ name: 'created_at', direction: 'dsc' });
    const { sorting } = sortState;

    const { allFlashUpdates: allFlashUpdatesRoute } = useContext(RouteContext);

    const columns = useMemo(
        () => ([
            createDateColumn<FlashUpdateListItem, TableKey>(
                'created_at',
                strings.flashUpdateTableLastUpdate,
                (item) => item.created_at,
                {
                    sortable: true,
                    columnClassName: styles.createdAt,
                },
            ),
            createStringColumn<FlashUpdateListItem, TableKey>(
                'title',
                strings.flashUpdateTableReport,
                (item) => item.title,
                {
                    sortable: true,
                    columnClassName: styles.title,
                },
            ),
            createStringColumn<FlashUpdateListItem, TableKey>(
                'hazard_type',
                strings.flashUpdateTableDisasterType,
                (item) => item.hazard_type_details.name,
            ),
            createCountryListColumn<FlashUpdateListItem, TableKey>(
                'country_district',
                strings.flashUpdateTableCountry,
                (item) => item.country_district?.map(
                    (country_district) => country_district.country_details,
                ) ?? [],
            ),
        ]),
        [strings],
    );

    const [page, setPage] = useState(1);

    const PAGE_SIZE = 5;
    const {
        pending: flashUpdatePending,
        response: flashUpdateResponse,
    } = useRequest({
        url: '/api/v2/flash-update/',
        preserveResponse: true,
        query: {
            limit: PAGE_SIZE,
            offset: PAGE_SIZE * (page - 1),
            ordering: getOrdering(sorting),
            created_at__gte: thirtyDaysAgo.toISOString(),
        },
    });

    const heading = useMemo(
        () => resolveToComponent(
            strings.flashUpdateTableTitle,
            {
                numFlashUpdates: (
                    <NumberOutput
                        value={flashUpdateResponse?.count}
                    />
                ),
            },
        ),
        [strings, flashUpdateResponse],
    );

    return (
        <Container
            className={styles.flashUpdatesTable}
            heading={heading}
            headerDescriptionContainerClassName={styles.filters}
            withHeaderBorder
            footerActions={(
                <Pager
                    activePage={page}
                    itemsCount={flashUpdateResponse?.count ?? 0}
                    maxItemsPerPage={PAGE_SIZE}
                    onActivePageChange={setPage}
                />
            )}
            actions={(
                <Link
                    to={allFlashUpdatesRoute.absolutePath}
                    withUnderline
                    withForwardIcon
                >
                    {strings.flashUpdateTableViewAllReports}
                </Link>
            )}
        >
            <SortContext.Provider value={sortState}>
                <Table
                    filtered={false}
                    pending={flashUpdatePending}
                    className={styles.table}
                    columns={columns}
                    keySelector={keySelector}
                    data={flashUpdateResponse?.results}
                />
            </SortContext.Provider>
        </Container>
    );
}

export default FlashUpdateTable;
