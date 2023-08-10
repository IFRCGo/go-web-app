import { useState, useMemo, useContext } from 'react';
import { isDefined } from '@togglecorp/fujs';
import { generatePath } from 'react-router-dom';

import Page from '#components/Page';
import { useRequest } from '#utils/restRequest';
import type { GoApiResponse } from '#utils/restRequest';
import { useSortState, SortContext } from '#components/Table/useSorting';
import Table from '#components/Table';
import Container from '#components/Container';
import SelectInput from '#components/SelectInput';
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
import RouteContext from '#contexts/route';
import { resolveToComponent } from '#utils/translation';
import { isValidCountry } from '#utils/domain/country';

import i18n from './i18n.json';
import styles from './styles.module.css';

type CountryResponse = GoApiResponse<'/api/v2/country/'>;
type CountryListItem = NonNullable<CountryResponse['results']>[number];

type FieldReportResponse = GoApiResponse<'/api/v2/field_report/'>;
type FieldReportListItem = NonNullable<FieldReportResponse['results']>[number];

type DisasterTypeResponse = GoApiResponse<'/api/v2/disaster_type/'>;
type DisasterListItem = NonNullable<DisasterTypeResponse['results']>[number];

const fieldReportKeySelector = (item: FieldReportListItem) => item.id;
const disasterTypeKeySelector = (item: DisasterListItem) => item.id;
const disasterTypeLabelSelector = (item: DisasterListItem) => item.name ?? '';
const countryKeySelector = (item: CountryListItem) => item.id;
const countryLabelSelector = (item: CountryListItem) => item.name ?? '';

const PAGE_SIZE = 15;

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    const sortState = useSortState({ name: 'created_at', direction: 'dsc' });
    const { sorting } = sortState;
    const [filterDisasterType, setFilterDisasterType] = useUrlSearchState<DisasterListItem['id'] | undefined>(
        'dtype',
        (searchValue) => {
            const potentialValue = isDefined(searchValue) ? Number(searchValue) : undefined;
            return potentialValue;
        },
        (dtype) => dtype,
    );
    const [filterCountry, setFilterCountry] = useUrlSearchState<DisasterListItem['id'] | undefined>(
        'country',
        (searchValue) => {
            const potentialValue = isDefined(searchValue) ? Number(searchValue) : undefined;
            return potentialValue;
        },
        (country) => country,
    );

    const { emergency: emergencyRoute } = useContext(RouteContext);

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
            createStringColumn<FieldReportListItem, number>(
                'summary',
                strings.allFieldReportsName,
                (item) => item.summary,
                {
                    sortable: true,
                    columnClassName: styles.summary,
                },
            ),
            createLinkColumn<FieldReportListItem, number>(
                'event_name',
                strings.allFieldReportsEmergency,
                (item) => item.event?.name,
                (item) => ({
                    to: isDefined(item.event)
                        ? generatePath(emergencyRoute.absolutePath, { emergencyId: item.event.id })
                        : undefined,
                }),
            ),
            createStringColumn<FieldReportListItem, number>(
                'dtype',
                strings.allFieldReportsDisasterType,
                (item) => item.dtype?.name,
                { sortable: true },
            ),
            createCountryListColumn<FieldReportListItem, number>(
                'countries',
                strings.allFieldReportsCountries,
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

    const [page, setPage] = useState(1);
    const {
        pending: fieldReportPending,
        response: fieldReportResponse,
    } = useRequest({
        url: '/api/v2/field_report/',
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

    const {
        pending: disasterTypePending,
        response: disasterTypeResponse,
    } = useRequest({
        url: '/api/v2/disaster_type/',
    });

    const {
        pending: countryPending,
        response: countryResponse,
    } = useRequest({
        url: '/api/v2/country/',
        query: { limit: 500 },
    });

    const countryOptions = useMemo(
        () => countryResponse?.results?.filter(isValidCountry),
        [countryResponse],
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
                        <SelectInput
                            placeholder={strings.allFieldReportsFilterDisastersPlaceholder}
                            label={strings.allFieldReportsDisasterType}
                            name={undefined}
                            value={filterDisasterType}
                            onChange={setFilterDisasterType}
                            keySelector={disasterTypeKeySelector}
                            labelSelector={disasterTypeLabelSelector}
                            options={disasterTypeResponse?.results}
                            disabled={disasterTypePending}
                        />
                        <SelectInput
                            placeholder={strings.allFieldReportsFilterCountryPlaceholder}
                            label={strings.allFieldReportsCountry}
                            name={undefined}
                            value={filterCountry}
                            onChange={setFilterCountry}
                            keySelector={countryKeySelector}
                            labelSelector={countryLabelSelector}
                            options={countryOptions}
                            disabled={countryPending}
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
