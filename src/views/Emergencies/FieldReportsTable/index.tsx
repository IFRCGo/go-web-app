import { useState, useMemo, useContext } from 'react';
import { isDefined } from '@togglecorp/fujs';
import { generatePath } from 'react-router-dom';
import {
    useRequest,
    ListResponse,
} from '#utils/restRequest';
import { useSortState, SortContext } from '#components/Table/useSorting';
import Table from '#components/Table';
import Link from '#components/Link';
import Container from '#components/Container';
import {
    createStringColumn,
    createDateColumn,
    createLinkColumn,
    createListDisplayColumn,
} from '#components/Table/ColumnShortcuts';
import Pager from '#components/Pager';
import useTranslation from '#hooks/useTranslation';
import RouteContext from '#contexts/route';
import { resolveToComponent } from '#utils/translation';

import type { FieldReport } from '../types';
import i18n from './i18n.json';
import styles from './styles.module.css';

const thirtyDaysAgo = new Date();
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
thirtyDaysAgo.setHours(0, 0, 0, 0);

const keySelector = (item: FieldReport) => item.id;

type TableKey = number;

function FieldReportsTable() {
    const sortState = useSortState({ name: 'created_at', direction: 'dsc' });
    const { sorting } = sortState;

    const strings = useTranslation(i18n);
    const {
        country: countryRoute,
        emergency: emergencyRoute,
    } = useContext(RouteContext);

    const columns = useMemo(
        () => ([
            createDateColumn<FieldReport, TableKey>(
                'created_at',
                strings.fieldReportsTableCreatedAt,
                (item) => item.start_date,
                {
                    sortable: true,
                    columnClassName: styles.createdAt,
                },
            ),
            createStringColumn<FieldReport, TableKey>(
                'summary',
                strings.fieldReportsTableName,
                (item) => item.summary,
                {
                    sortable: true,
                    columnClassName: styles.summary,
                },
            ),
            createLinkColumn<FieldReport, TableKey>(
                'event_name',
                strings.fieldReportsTableEmergency,
                (item) => item.event?.name,
                (item) => ({
                    to: isDefined(item.event)
                        ? generatePath(emergencyRoute.absolutePath, { emergencyId: item.event.id })
                        : undefined,
                }),
            ),
            createStringColumn<FieldReport, TableKey>(
                'dtype',
                strings.fieldReportsTableDisasterType,
                (item) => item.dtype?.name,
                { sortable: true },
            ),
            createListDisplayColumn<FieldReport, TableKey, FieldReport['countries'][number]>(
                'countries',
                strings.fieldReportsTableCountry,
                (item) => ({
                    list: item.countries,
                    keySelector: (country) => country.id,
                    renderer: (country) => (
                        <Link
                            to={generatePath(
                                countryRoute.absolutePath,
                                { countryId: String(country.id) },
                            )}
                        >
                            {country.name}
                        </Link>
                    ),
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
        pending: fieldReportPending,
        response: fieldReportResponse,
    } = useRequest<ListResponse<FieldReport>>({
        url: 'api/v2/field_report/',
        preserveResponse: true,
        query: {
            limit: PAGE_SIZE,
            offset: PAGE_SIZE * (page - 1),
            ordering,
            created_at__gte: thirtyDaysAgo.toISOString(),
        },
    });

    const heading = resolveToComponent(
        strings.fieldReportsTableTitle,
        { numFieldReports: fieldReportResponse?.count ?? '--' },
    );

    return (
        <Container
            className={styles.fieldReportsTable}
            heading={heading}
            headerDescriptionClassName={styles.filters}
            withHeaderBorder
            footerActions={(
                <Pager
                    activePage={page}
                    itemsCount={fieldReportResponse?.count ?? 0}
                    maxItemsPerPage={PAGE_SIZE}
                    onActivePageChange={setPage}
                />
            )}
            actions={(
                <Link
                    // FIXME: use listing page URL
                    to="/"
                    withForwardIcon
                    withUnderline
                >
                    {strings.fieldReportsTableViewAllReports}
                </Link>
            )}
        >
            <SortContext.Provider value={sortState}>
                <Table
                    pending={fieldReportPending}
                    className={styles.table}
                    columns={columns}
                    keySelector={keySelector}
                    data={fieldReportResponse?.results}
                />
            </SortContext.Provider>
        </Container>
    );
}

export default FieldReportsTable;
