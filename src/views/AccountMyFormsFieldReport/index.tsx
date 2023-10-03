import { useMemo } from 'react';
import { isNotDefined } from '@togglecorp/fujs';

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
import { GoApiResponse, useRequest } from '#utils/restRequest';
import { resolveToComponent } from '#utils/translation';
import useUserMe from '#hooks/domain/useUserMe';
import { numericIdSelector } from '#utils/selectors';

import i18n from './i18n.json';
import styles from './styles.module.css';

type FieldReportResponse = GoApiResponse<'/api/v2/field-report/'>;
type FieldReportListItem = NonNullable<FieldReportResponse['results']>[number];

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const userMe = useUserMe();
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
        pageSize: 10,
    });

    const {
        response: fieldReportResponse,
        pending: fieldReportResponsePending,
    } = useRequest({
        skip: isNotDefined(userMe?.id),
        url: '/api/v2/field-report/',
        query: {
            user: userMe?.id,
            limit,
            ordering,
            offset,
        },
        preserveResponse: true,
    });

    const columns = useMemo(
        () => ([
            createDateColumn<FieldReportListItem, number>(
                'created_at',
                strings.createdAtHeading,
                (item) => item.start_date,
                {
                    sortable: true,
                    columnClassName: styles.createdAt,
                },
            ),
            createLinkColumn<FieldReportListItem, number>(
                'summary',
                strings.nameHeading,
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
                strings.emergencyHeading,
                (item) => item.event_details?.name,
                (item) => ({
                    to: 'emergenciesLayout',
                    urlParams: { emergencyId: item.event },
                }),
            ),
            createStringColumn<FieldReportListItem, number>(
                'dtype',
                strings.disasterTypeHeading,
                (item) => item.dtype_details?.name,
                { sortable: true },
            ),
            createCountryListColumn<FieldReportListItem, number>(
                'countries',
                strings.countryHeading,
                (item) => item.countries_details,
            ),
        ]),
        [
            strings.createdAtHeading,
            strings.nameHeading,
            strings.emergencyHeading,
            strings.disasterTypeHeading,
            strings.countryHeading,
        ],
    );

    const heading = useMemo(
        () => resolveToComponent(
            strings.pageHeading,
            {
                numFieldReports: (
                    <NumberOutput
                        value={fieldReportResponse?.count}
                    />
                ),
            },
        ),
        [fieldReportResponse, strings.pageHeading],
    );

    return (
        <Container
            className={styles.accountMyFormsFieldReport}
            heading={heading}
            headerDescriptionContainerClassName={styles.filters}
            withHeaderBorder
            actions={(
                <Link
                    to="allFieldReports"
                    withLinkIcon
                    withUnderline
                >
                    {strings.viewAllReportsButtonLabel}
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
                    pending={fieldReportResponsePending}
                    filtered={false}
                    className={styles.table}
                    columns={columns}
                    keySelector={numericIdSelector}
                    data={fieldReportResponse?.results}
                />
            </SortContext.Provider>
        </Container>
    );
}

Component.displayName = 'AccountMyFormsFieldReport';
