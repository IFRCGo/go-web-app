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
import { saveAs } from 'file-saver';
import Papa from 'papaparse';

import CountrySelectInput from '#components/domain/CountrySelectInput';
import DisasterTypeSelectInput from '#components/domain/DisasterTypeSelectInput';
import ExportButton from '#components/domain/ExportButton';
import RegionSelectInput from '#components/domain/RegionSelectInput';
import Page from '#components/Page';
import { type components } from '#generated/types';
import useAlert from '#hooks/useAlert';
import useFilterState, { type UrlParams } from '#hooks/useFilterState';
import useRecursiveCsvExport from '#hooks/useRecursiveCsvRequest';
import { regionKeyList } from '#utils/constants';
import {
    createCountryListColumn,
    createLinkColumn,
} from '#utils/domain/tableHelpers';
import {
    type GoApiResponse,
    useRequest,
} from '#utils/restRequest';
import urlParam from '#utils/urlParam';

import i18n from './i18n.json';
import styles from './styles.module.css';

type FieldReportResponse = GoApiResponse<'/api/v2/field-report/'>;
type FieldReportListItem = NonNullable<FieldReportResponse['results']>[number];

type RegionOption = components<'read'>['schemas']['ApiRegionNameEnum'];

const fieldReportKeySelector = (item: FieldReportListItem) => item.id;

interface FieldReportFilter {
    createdDateAfter?: string;
    createdDateBefore?: string;
    disasterType?: number;
    country?: number;
    region?: RegionOption['key'];
}

const fieldReportUrlParams: UrlParams<FieldReportFilter> = {
    disasterType: urlParam.number('dtype'),
    country: urlParam.number('country'),
    region: urlParam.oneOf('region', regionKeyList),
};

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
    } = useFilterState<FieldReportFilter>({
        filter: {},
        urlParams: fieldReportUrlParams,
        pageSize: 15,
    });
    const alert = useAlert();

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
        dtype: filter.disasterType,
        countries__in: filter.country,
        regions__in: filter.region,
        created_at__gte: filter.createdDateAfter,
        created_at__lte: filter.createdDateBefore,
    }), [
        limit,
        offset,
        ordering,
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
                            name="disasterType"
                            value={rawFilter.disasterType}
                            onChange={setFilterField}
                        />
                        <CountrySelectInput
                            placeholder={strings.allFieldReportsFilterCountryPlaceholder}
                            label={strings.allFieldReportsCountry}
                            name="country"
                            value={rawFilter.country}
                            onChange={setFilterField}
                        />
                        <RegionSelectInput
                            placeholder={strings.allFieldReportsFilterRegionPlaceholder}
                            label={strings.allFieldReportsRegions}
                            name="region"
                            value={rawFilter.region}
                            onChange={setFilterField}
                        />
                    </>
                )}
                headerActions={(
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
                        filtered={filtered}
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
