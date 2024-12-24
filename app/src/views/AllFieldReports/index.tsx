import {
    useCallback,
    useMemo,
} from 'react';
import {
    Container,
    DateInput,
    NumberOutput,
    Pager,
    Table,
} from '@ifrc-go/ui';
import { SortContext } from '@ifrc-go/ui/contexts';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    createDateColumn,
    createStringColumn,
    resolveToComponent,
} from '@ifrc-go/ui/utils';
import { isDefined } from '@togglecorp/fujs';
import { saveAs } from 'file-saver';
import Papa from 'papaparse';

import CountrySelectInput from '#components/domain/CountrySelectInput';
import DisasterTypeSelectInput from '#components/domain/DisasterTypeSelectInput';
import ExportButton from '#components/domain/ExportButton';
import RegionSelectInput from '#components/domain/RegionSelectInput';
import Page from '#components/Page';
import { type components } from '#generated/types';
import useAlert from '#hooks/useAlert';
import useFilterState from '#hooks/useFilterState';
import useRecursiveCsvExport from '#hooks/useRecursiveCsvRequest';
import useUrlSearchState from '#hooks/useUrlSearchState';
import {
    createCountryListColumn,
    createLinkColumn,
} from '#utils/domain/tableHelpers';
import {
    type GoApiResponse,
    useRequest,
} from '#utils/restRequest';

import i18n from './i18n.json';
import styles from './styles.module.css';

type FieldReportResponse = GoApiResponse<'/api/v2/field-report/'>;
type FieldReportListItem = NonNullable<FieldReportResponse['results']>[number];

type RegionOption = components<'read'>['schemas']['ApiRegionNameEnum'];

const fieldReportKeySelector = (item: FieldReportListItem) => item.id;

/** @knipignore */
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    const {
        sortState,
        ordering,
        page,
        setPage,
        limit,
        offset,
        rawFilter,
        filter,
        setFilterField,
        filtered,
    } = useFilterState<{
        createdDateAfter?: string,
        createdDateBefore?: string,
    }>({
        filter: {},
        pageSize: 15,
    });
    const alert = useAlert();
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
    const [filterRegion, setFilterRegion] = useUrlSearchState<RegionOption['key'] | undefined>(
        'region',
        (searchValue) => {
            const potentialValue = isDefined(searchValue) ? Number(searchValue) : undefined;
            if (potentialValue === 0
                || potentialValue === 1
                || potentialValue === 2
                || potentialValue === 3
                || potentialValue === 4
            ) {
                return potentialValue;
            }
            return undefined;
        },
        (region) => region,
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
        [
            strings.allFieldReportsCreatedAt,
            strings.allFieldReportsName,
            strings.allFieldReportsEmergency,
            strings.allFieldReportsDisasterType,
            strings.allFieldReportsCountries,
        ],
    );

    const query = useMemo(() => ({
        limit,
        offset,
        ordering,
        dtype: filterDisasterType,
        countries__in: filterCountry,
        regions__in: filterRegion,
        created_at__gte: filter.createdDateAfter,
        created_at__lte: filter.createdDateBefore,
    }), [
        limit,
        offset,
        ordering,
        filterDisasterType,
        filterCountry,
        filterRegion,
        filter,
    ]);

    const {
        pending: fieldReportPending,
        response: fieldReportResponse,
    } = useRequest({
        url: '/api/v2/field-report/',
        preserveResponse: true,
        query,
    });

    const fieldReportFiltered = (
        isDefined(filterDisasterType)
        || isDefined(filterCountry)
        || filtered
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
        [fieldReportResponse, strings.allFieldReportsHeading],
    );

    const [
        pendingExport,
        progress,
        triggerExportStart,
    ] = useRecursiveCsvExport({
        onFailure: () => {
            alert.show(
                strings.failedToCreateExport,
                { variant: 'danger' },
            );
        },
        onSuccess: (data) => {
            const unparseData = Papa.unparse(data);
            const blob = new Blob(
                [unparseData],
                { type: 'text/csv' },
            );
            saveAs(blob, 'field-reports.csv');
        },
    });

    const handleExportClick = useCallback(() => {
        if (!fieldReportResponse?.count) {
            return;
        }
        triggerExportStart(
            '/api/v2/field-report/',
            fieldReportResponse?.count,
            query,
        );
    }, [
        query,
        triggerExportStart,
        fieldReportResponse?.count,
    ]);

    return (
        <Page
            className={styles.allFieldReports}
            title={strings.allFieldReportsTitle}
            heading={heading}
        >
            <Container
                contentViewType="vertical"
                filters={(
                    <>
                        <DateInput
                            name="createdDateAfter"
                            label={strings.allFieldReportsFilterCreatedDateAfter}
                            onChange={setFilterField}
                            value={rawFilter.createdDateAfter}
                        />
                        <DateInput
                            name="createdDateBefore"
                            label={strings.allFieldReportsFilterCreatedDateBefore}
                            onChange={setFilterField}
                            value={rawFilter.createdDateBefore}
                        />
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
                        <RegionSelectInput
                            placeholder={strings.allFieldReportsFilterRegionPlaceholder}
                            label={strings.allFieldReportsRegions}
                            name={undefined}
                            value={filterRegion}
                            onChange={setFilterRegion}
                        />
                    </>
                )}
                actions={(
                    <ExportButton
                        onClick={handleExportClick}
                        progress={progress}
                        pendingExport={pendingExport}
                        totalCount={fieldReportResponse?.count}
                    />
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
