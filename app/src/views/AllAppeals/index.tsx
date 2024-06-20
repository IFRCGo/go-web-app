import {
    useCallback,
    useMemo,
} from 'react';
import {
    Container,
    DateInput,
    NumberOutput,
    Pager,
    SelectInput,
    Table,
} from '@ifrc-go/ui';
import { SortContext } from '@ifrc-go/ui/contexts';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    createDateColumn,
    createNumberColumn,
    createProgressColumn,
    createStringColumn,
    getPercentage,
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
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import useAlert from '#hooks/useAlert';
import useFilterState from '#hooks/useFilterState';
import useRecursiveCsvExport from '#hooks/useRecursiveCsvRequest';
import useUrlSearchState from '#hooks/useUrlSearchState';
import { createLinkColumn } from '#utils/domain/tableHelpers';
import {
    type GoApiResponse,
    type GoApiUrlQuery,
    useRequest,
} from '#utils/restRequest';

import i18n from './i18n.json';
import styles from './styles.module.css';

type RegionResponse = GoApiResponse<'/api/v2/region/'>;
type RegionListItem = NonNullable<RegionResponse['results']>[number];

type AppealResponse = GoApiResponse<'/api/v2/appeal/'>;
type AppealQueryParams = GoApiUrlQuery<'/api/v2/appeal/'>;
type AppealListItem = NonNullable<AppealResponse['results']>[number];

type GlobalEnumsResponse = GoApiResponse<'/api/v2/global-enums/'>;
type AppealTypeOption = NonNullable<GlobalEnumsResponse['api_appeal_type']>[number];

const appealKeySelector = (option: AppealListItem) => option.id;
const appealTypeKeySelector = (option: AppealTypeOption) => option.key;
const appealTypeLabelSelector = (option: AppealTypeOption) => option.value;

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
        startDateAfter?: string,
        startDateBefore?: string,
    }>({
        filter: {},
        pageSize: 10,
    });
    const alert = useAlert();

    const { api_appeal_type: appealTypeOptions } = useGlobalEnums();

    const [filterAppealType, setFilterAppealType] = useUrlSearchState<AppealTypeOption['key'] | undefined>(
        'atype',
        (searchValue) => {
            const potentialValue = isDefined(searchValue) ? Number(searchValue) : undefined;
            // FIXME: use enums
            if (potentialValue === 0
                || potentialValue === 1
                || potentialValue === 2
                || potentialValue === 3
            ) {
                return potentialValue;
            }

            return undefined;
        },
        (atype) => atype,
    );
    const [filterDisasterType, setFilterDisasterType] = useUrlSearchState<number | undefined>(
        'dtype',
        (searchValue) => {
            const potentialValue = isDefined(searchValue) ? Number(searchValue) : undefined;
            return potentialValue;
        },
        (dtype) => dtype,
    );

    const [filterRegion, setFilterRegion] = useUrlSearchState<RegionListItem['name'] | undefined>(
        'region',
        (searchValue) => {
            const potentialValue = isDefined(searchValue) ? Number(searchValue) : undefined;
            // FIXME: use enums
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
        (regionId) => regionId,
    );
    const [filterCountry, setFilterCountry] = useUrlSearchState<number | undefined>(
        'country',
        (searchValue) => {
            const potentialValue = isDefined(searchValue) ? Number(searchValue) : undefined;
            return potentialValue;
        },
        (country) => country,
    );

    const query = useMemo<AppealQueryParams>(
        () => ({
            limit,
            offset,
            ordering,
            atype: filterAppealType,
            dtype: filterDisasterType,
            country: isDefined(filterCountry) ? filterCountry : undefined,
            region: isDefined(filterRegion) ? filterRegion : undefined,
            start_date__gte: filter.startDateAfter,
            start_date__lte: filter.startDateBefore,
        }),
        [
            limit,
            offset,
            ordering,
            filterAppealType,
            filterDisasterType,
            filterCountry,
            filterRegion,
            filter,
        ],
    );
    const {
        pending: appealsPending,
        response: appealsResponse,
    } = useRequest({
        url: '/api/v2/appeal/',
        preserveResponse: true,
        query,
    });

    const columns = useMemo(
        () => ([
            createDateColumn<AppealListItem, number>(
                'start_date',
                strings.allAppealsStartDate,
                (item) => item.start_date,
                {
                    sortable: true,
                    columnClassName: styles.startDate,
                },
            ),
            createStringColumn<AppealListItem, number>(
                'atype',
                strings.allAppealsType,
                (item) => item.atype_display,
                {
                    sortable: true,
                    columnClassName: styles.appealType,
                },
            ),
            createStringColumn<AppealListItem, number>(
                'code',
                strings.allAppealsCode,
                (item) => item.code,
                {
                    columnClassName: styles.code,
                },
            ),
            createLinkColumn<AppealListItem, number>(
                'operation',
                strings.allAppealsOperation,
                (item) => item.name,
                (item) => ({
                    to: 'emergenciesLayout',
                    urlParams: { emergencyId: item?.event },
                }),
                { sortable: true },
            ),
            createStringColumn<AppealListItem, number>(
                'dtype',
                strings.allAppealsDisasterType,
                (item) => item.dtype?.name,
            ),
            createNumberColumn<AppealListItem, number>(
                'amount_requested',
                strings.allAppealsRequestedAmount,
                (item) => item.amount_requested,
                {
                    sortable: true,
                    suffix: ' CHF',
                },
            ),
            createProgressColumn<AppealListItem, number>(
                'amount_funded',
                strings.allAppealsFundedAmount,
                // FIXME: use progress function
                (item) => (
                    getPercentage(
                        item.amount_funded,
                        item.amount_requested,
                    )
                ),
                {
                    sortable: true,
                    columnClassName: styles.funding,
                },
            ),
            createLinkColumn<AppealListItem, number>(
                'country',
                strings.allAppealsCountry,
                (item) => item.country?.name,
                (item) => ({
                    to: 'countriesLayout',
                    urlParams: { countryId: item.country?.id },
                }),
            ),
        ]),
        [
            strings.allAppealsStartDate,
            strings.allAppealsType,
            strings.allAppealsCode,
            strings.allAppealsOperation,
            strings.allAppealsDisasterType,
            strings.allAppealsRequestedAmount,
            strings.allAppealsFundedAmount,
            strings.allAppealsCountry,
        ],
    );

    const heading = useMemo(
        () => resolveToComponent(
            strings.allAppealsHeading,
            {
                numAppeals: (
                    <NumberOutput
                        value={appealsResponse?.count}
                    />
                ),
            },
        ),
        [appealsResponse, strings.allAppealsHeading],
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
            saveAs(blob, 'all-appeals.csv');
        },
    });

    const handleExportClick = useCallback(() => {
        if (!appealsResponse?.count) {
            return;
        }
        triggerExportStart(
            '/api/v2/appeal/',
            appealsResponse.count,
            query,
        );
    }, [
        query,
        triggerExportStart,
        appealsResponse?.count,
    ]);

    const isFilterApplied = isDefined(filterDisasterType)
        || isDefined(filterAppealType)
        || isDefined(filterCountry)
        || filtered;

    return (
        <Page
            className={styles.allAppeals}
            title={strings.allAppealsTitle}
            heading={heading}
        >
            <Container
                contentViewType="vertical"
                withGridViewInFilter
                filters={(
                    <>
                        <DateInput
                            name="startDateAfter"
                            label={strings.allAppealsFilterStartDateAfter}
                            onChange={setFilterField}
                            value={rawFilter.startDateAfter}
                        />
                        <DateInput
                            name="startDateBefore"
                            label={strings.allAppealsFilterStartDateBefore}
                            onChange={setFilterField}
                            value={rawFilter.startDateBefore}
                        />
                        <SelectInput
                            placeholder={strings.allAppealsFilterAppealsPlaceholder}
                            label={strings.allAppealsType}
                            name={undefined}
                            value={filterAppealType}
                            onChange={setFilterAppealType}
                            keySelector={appealTypeKeySelector}
                            labelSelector={appealTypeLabelSelector}
                            options={appealTypeOptions}
                        />
                        <DisasterTypeSelectInput
                            placeholder={strings.allAppealsFilterDisastersPlaceholder}
                            label={strings.allAppealsDisasterType}
                            name={undefined}
                            value={filterDisasterType}
                            onChange={setFilterDisasterType}
                        />
                        <RegionSelectInput
                            placeholder={strings.allAppealsFilterRegionPlaceholder}
                            label={strings.allAppealsRegion}
                            name={undefined}
                            value={filterRegion}
                            onChange={setFilterRegion}
                        />
                        <CountrySelectInput
                            placeholder={strings.allAppealsFilterCountryPlaceholder}
                            label={strings.allAppealsCountry}
                            name={undefined}
                            value={filterCountry}
                            onChange={setFilterCountry}
                        />
                    </>
                )}
                actions={(
                    <ExportButton
                        onClick={handleExportClick}
                        progress={progress}
                        pendingExport={pendingExport}
                        totalCount={appealsResponse?.count}
                    />
                )}
                footerActions={(
                    <Pager
                        activePage={page}
                        itemsCount={appealsResponse?.count ?? 0}
                        maxItemsPerPage={limit}
                        onActivePageChange={setPage}
                    />
                )}
            >
                <SortContext.Provider value={sortState}>
                    <Table
                        pending={appealsPending}
                        filtered={isFilterApplied}
                        className={styles.table}
                        columns={columns}
                        keySelector={appealKeySelector}
                        data={appealsResponse?.results?.filter(isDefined)}
                    />
                </SortContext.Provider>
            </Container>
        </Page>
    );
}

Component.displayName = 'AllAppeals';
