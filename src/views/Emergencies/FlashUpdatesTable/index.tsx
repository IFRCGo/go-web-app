import {
    useMemo,
} from 'react';

import { SortContext } from '#components/Table/useSorting';
import Table from '#components/Table';
import NumberOutput from '#components/NumberOutput';
import Link from '#components/Link';
import Container from '#components/Container';
import {
    createStringColumn,
    createDateColumn,
    createCountryListColumn,
    createElementColumn,
    createLinkColumn,
} from '#components/Table/ColumnShortcuts';
import Pager from '#components/Pager';
import useTranslation from '#hooks/useTranslation';
import useFilterState from '#hooks/useFilterState';
import { useRequest } from '#utils/restRequest';
import type { GoApiResponse } from '#utils/restRequest';
import { resolveToComponent } from '#utils/translation';

import FlashUpdatesTableAction, {
    Props as FlashUpdatesTableActions,
} from './FlashUpdatesTableActions';
import i18n from './i18n.json';
import styles from './styles.module.css';

type FlashUpdateResponse = GoApiResponse<'/api/v2/flash-update/'>;
type FlashUpdateListItem = NonNullable<FlashUpdateResponse['results']>[number];

// FIXME: use a separate utility
const thirtyDaysAgo = new Date();
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
thirtyDaysAgo.setHours(0, 0, 0, 0);

const keySelector = (item: FlashUpdateListItem) => item.id;

type TableKey = number;

function FlashUpdateTable() {
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
            createDateColumn<FlashUpdateListItem, TableKey>(
                'created_at',
                strings.flashUpdateTableLastUpdate,
                (item) => item.created_at,
                {
                    sortable: true,
                    columnClassName: styles.createdAt,
                },
            ),
            createLinkColumn<FlashUpdateListItem, TableKey>(
                'title',
                strings.flashUpdateTableReport,
                (item) => item.title,
                (item) => ({
                    to: 'flashUpdateFormDetails',
                    urlParams: { flashUpdateId: item.id },
                }),
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
            createElementColumn<
                FlashUpdateListItem,
                number,
                FlashUpdatesTableActions
            >(
                'actions',
                '',
                FlashUpdatesTableAction,
                (flashUpdateId) => ({
                    type: 'activity',
                    flashUpdateId,
                }),
            ),
        ]),
        [strings],
    );

    const {
        pending: flashUpdatePending,
        response: flashUpdateResponse,
    } = useRequest({
        url: '/api/v2/flash-update/',
        preserveResponse: true,
        query: {
            limit,
            offset,
            ordering,
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
                    maxItemsPerPage={limit}
                    onActivePageChange={setPage}
                />
            )}
            actions={(
                <Link
                    to="allFlashUpdates"
                    withUnderline
                    withLinkIcon
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
