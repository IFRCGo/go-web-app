import { useMemo } from 'react';

import { SortContext } from '#components/Table/useSorting';
import Table from '#components/Table';
import Link from '#components/Link';
import Container from '#components/Container';
import {
    createStringColumn,
    createDateColumn,
    createLinkColumn,
    createCountryListColumn,
} from '#components/Table/ColumnShortcuts';
import Pager from '#components/Pager';
import NumberOutput from '#components/NumberOutput';
import useTranslation from '#hooks/useTranslation';
import useFilterState from '#hooks/useFilterState';
import { useRequest } from '#utils/restRequest';
import { resolveToComponent } from '#utils/translation';
import type { GoApiResponse } from '#utils/restRequest';

import i18n from './i18n.json';
import styles from './styles.module.css';

type FieldReportResponse = GoApiResponse<'/api/v2/field-report/'>;
type FieldReportListItem = NonNullable<FieldReportResponse['results']>[number];

// FIXME: use a separate utility
const thirtyDaysAgo = new Date();
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
thirtyDaysAgo.setHours(0, 0, 0, 0);

const fieldReportKeySelector = (item: FieldReportListItem) => item.id;

function FieldReportsTable() {
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
        { name: 'created_at', direction: 'dsc' },
        1,
        5,
    );

    const columns = useMemo(
        () => ([
            createDateColumn<FieldReportListItem, number>(
                'created_at',
                strings.fieldReportsTableCreatedAt,
                (item) => item.start_date,
                {
                    sortable: true,
                    columnClassName: styles.createdAt,
                },
            ),
            createLinkColumn<FieldReportListItem, number>(
                'summary',
                strings.fieldReportsTableName,
                (item) => item.summary,
                (item) => ({
                    to: 'fieldReportDetails',
                    urlParams: { fieldReportId: item.id },
                }),
                {
                    sortable: true,
                    columnClassName: styles.summary,
                },
            ),
            createLinkColumn<FieldReportListItem, number>(
                'event_name',
                strings.fieldReportsTableEmergency,
                (item) => item.event_details?.name,
                (item) => ({
                    to: 'emergenciesLayout',
                    urlParams: { emergencyId: item.event },
                }),
            ),
            createStringColumn<FieldReportListItem, number>(
                'dtype',
                strings.fieldReportsTableDisasterType,
                (item) => item.dtype_details?.name,
                { sortable: true },
            ),
            createCountryListColumn<FieldReportListItem, number>(
                'countries',
                strings.fieldReportsTableCountry,
                (item) => item.countries_details,
            ),
        ]),
        [strings],
    );

    const {
        pending: fieldReportPending,
        response: fieldReportResponse,
    } = useRequest({
        url: '/api/v2/field-report/',
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
            strings.fieldReportsTableTitle,
            {
                numFieldReports: (
                    <NumberOutput
                        value={fieldReportResponse?.count}
                    />
                ),
            },
        ),
        [fieldReportResponse, strings],
    );

    return (
        <Container
            className={styles.fieldReportsTable}
            heading={heading}
            headerDescriptionContainerClassName={styles.filters}
            withHeaderBorder
            actions={(
                <Link
                    to="allFieldReports"
                    withForwardIcon
                    withUnderline
                >
                    {strings.fieldReportsTableViewAllReports}
                </Link>
            )}
            footerActions={(
                <Pager
                    activePage={page}
                    itemsCount={fieldReportResponse?.count ?? 0}
                    maxItemsPerPage={limit}
                    onActivePageChange={setPage}
                />
            )}
        >
            <SortContext.Provider value={sortState}>
                <Table
                    pending={fieldReportPending}
                    filtered={false}
                    className={styles.table}
                    columns={columns}
                    keySelector={fieldReportKeySelector}
                    data={fieldReportResponse?.results}
                />
            </SortContext.Provider>
        </Container>
    );
}

export default FieldReportsTable;
