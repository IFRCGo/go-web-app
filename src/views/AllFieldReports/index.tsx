import { useState, useMemo } from 'react';
import { isDefined } from '@togglecorp/fujs';

import Page from '#components/Page';
import { useRequest, type GoApiResponse } from '#utils/restRequest';
import { useSortState, SortContext } from '#components/Table/useSorting';
import Table from '#components/Table';
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
import useUrlSearchState from '#hooks/useUrlSearchState';
import { resolveToComponent } from '#utils/translation';
import CountrySelectInput from '#components/domain/CountrySelectInput';
import DisasterTypeSelectInput from '#components/domain/DisasterTypeSelectInput';

import i18n from './i18n.json';
import styles from './styles.module.css';

type FieldReportResponse = GoApiResponse<'/api/v2/field-report/'>;
type FieldReportListItem = NonNullable<FieldReportResponse['results']>[number];

const fieldReportKeySelector = (item: FieldReportListItem) => item.id;

const PAGE_SIZE = 15;

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    const sortState = useSortState({ name: 'created_at', direction: 'dsc' });
    const { sorting } = sortState;
    const [filterDisasterType, setFilterDisasterType] = useUrlSearchState<number | undefined>(
        'dtype',
        (searchValue) => {
            const potentialValue = isDefined(searchValue) ? Number(searchValue) : undefined;
            return potentialValue;
        },
        (dtype) => dtype,
    );
    const [filterCountry, setFilterCountry] = useUrlSearchState<number | undefined>(
        'country',
        (searchValue) => {
            const potentialValue = isDefined(searchValue) ? Number(searchValue) : undefined;
            return potentialValue;
        },
        (country) => country,
    );

    const columns = useMemo(
        () => ([
            createDateColumn<FieldReportListItem, number>(
                'created_at',
                strings.allFieldReportsCreatedAt,
                (item) => item.start_date,
                {
                    sortable: true,
                    columnClassName: styles.createdAt,
                },
            ),
            createLinkColumn<FieldReportListItem, number>(
                'summary',
                strings.allFieldReportsName,
                (item) => item.summary,
                (item) => ({
                    sortable: true,
                    columnClassName: styles.summary,
                    to: 'fieldReportDetails',
                    urlParams: { fieldReportId: item.id },
                }),
            ),
            createLinkColumn<FieldReportListItem, number>(
                'event_name',
                strings.allFieldReportsEmergency,
                (item) => item.event_details?.name,
                (item) => ({
                    to: 'emergenciesLayout',
                    urlParams: { emergencyId: item.event },
                }),
            ),
            createStringColumn<FieldReportListItem, number>(
                'dtype',
                strings.allFieldReportsDisasterType,
                (item) => item.dtype_details?.name,
                { sortable: true },
            ),
            createCountryListColumn<FieldReportListItem, number>(
                'countries',
                strings.allFieldReportsCountries,
                (item) => item.countries_details,
            ),
        ]),
        [strings],
    );

    let ordering;
    if (sorting) {
        ordering = sorting.direction === 'dsc'
            ? `-${sorting.name}`
            : sorting.name;
    }

    const [page, setPage] = useState(1);
    const {
        pending: fieldReportPending,
        response: fieldReportResponse,
    } = useRequest({
        url: '/api/v2/field-report/',
        preserveResponse: true,
        query: {
            limit: PAGE_SIZE,
            offset: PAGE_SIZE * (page - 1),
            ordering,
            dtype: filterDisasterType,
            countries__in: filterCountry,
        },
    });

    const fieldReportFiltered = (
        isDefined(filterDisasterType) || isDefined(filterCountry)
    );

    const heading = useMemo(
        () => resolveToComponent(
            strings.allFieldReportsHeading,
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
        <Page
            className={styles.allFieldReports}
            title={strings.allFieldReportsTitle}
            heading={heading}
        >
            <Container
                className={styles.fieldReportsTable}
                headerDescriptionContainerClassName={styles.filters}
                headerDescription={(
                    <>
                        <DisasterTypeSelectInput
                            placeholder={strings.allFieldReportsFilterDisastersPlaceholder}
                            label={strings.allFieldReportsDisasterType}
                            name={undefined}
                            value={filterDisasterType}
                            onChange={setFilterDisasterType}
                        />
                        <CountrySelectInput
                            placeholder={strings.allFieldReportsFilterCountryPlaceholder}
                            label={strings.allFieldReportsCountry}
                            name={undefined}
                            value={filterCountry}
                            onChange={setFilterCountry}
                        />
                        <div />
                    </>
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
                        filtered={fieldReportFiltered}
                        className={styles.table}
                        columns={columns}
                        keySelector={fieldReportKeySelector}
                        data={fieldReportResponse?.results}
                    />
                </SortContext.Provider>
            </Container>
        </Page>
    );
}

Component.displayName = 'AllFieldReports';
