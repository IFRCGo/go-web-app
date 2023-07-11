import { useState, useMemo, useContext } from 'react';
import { isDefined } from '@togglecorp/fujs';
import { generatePath } from 'react-router-dom';
import { useRequest } from '#utils/restRequest';
import { useSortState, SortContext } from '#components/Table/useSorting';
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
import RouteContext from '#contexts/route';
import { resolveToComponent } from '#utils/translation';
import { paths } from '#generated/types';

import i18n from './i18n.json';
import styles from './styles.module.css';

type GetFieldReport = paths['/api/v2/field_report/']['get'];
type FieldReportResponse = GetFieldReport['responses']['200']['content']['application/json'];
type FieldReportListItem = NonNullable<FieldReportResponse['results']>[number];

const thirtyDaysAgo = new Date();
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
thirtyDaysAgo.setHours(0, 0, 0, 0);

const fieldReportKeySelector = (item: FieldReportListItem) => item.id;

function FieldReportsTable() {
    const strings = useTranslation(i18n);
    const sortState = useSortState({ name: 'created_at', direction: 'dsc' });
    const { sorting } = sortState;

    const {
        emergency: emergencyRoute,
        allFieldReports: allFieldReportsRoute,
    } = useContext(RouteContext);

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
            createStringColumn<FieldReportListItem, number>(
                'summary',
                strings.fieldReportsTableName,
                (item) => item.summary,
                {
                    sortable: true,
                    columnClassName: styles.summary,
                },
            ),
            createLinkColumn<FieldReportListItem, number>(
                'event_name',
                strings.fieldReportsTableEmergency,
                (item) => item.event?.name,
                (item) => ({
                    to: isDefined(item.event)
                        ? generatePath(emergencyRoute.absolutePath, { emergencyId: item.event.id })
                        : undefined,
                }),
            ),
            createStringColumn<FieldReportListItem, number>(
                'dtype',
                strings.fieldReportsTableDisasterType,
                (item) => item.dtype?.name,
                { sortable: true },
            ),
            createCountryListColumn<FieldReportListItem, number>(
                'countries',
                strings.fieldReportsTableCountry,
                (item) => item.countries,
            ),
        ]),
        [strings, emergencyRoute],
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
        pending: fieldReportPending,
        response: fieldReportResponse,
    } = useRequest<FieldReportResponse>({
        url: 'api/v2/field_report/',
        preserveResponse: true,
        query: {
            limit: PAGE_SIZE,
            offset: PAGE_SIZE * (page - 1),
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
            headerDescriptionClassName={styles.filters}
            withHeaderBorder
            actions={(
                <Link
                    to={allFieldReportsRoute.absolutePath}
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
                    maxItemsPerPage={PAGE_SIZE}
                    onActivePageChange={setPage}
                />
            )}
        >
            <SortContext.Provider value={sortState}>
                <Table
                    pending={fieldReportPending}
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
