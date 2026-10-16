import { useMemo } from 'react';
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
import useFilterState, { type UrlParams } from '#hooks/useFilterState';
import useRecursiveCsvExport from '#hooks/useRecursiveCsvRequest';
import { getOrderingWithFallback } from '#utils/common';
import {
    appealTypeKeyList,
    type Region,
    regionKeyList,
} from '#utils/constants';
import { createLinkColumn } from '#utils/domain/tableHelpers';
import {
    type GoApiResponse,
    type GoApiUrlQuery,
    useRequest,
} from '#utils/restRequest';
import urlParam from '#utils/urlParam';

import i18n from './i18n.json';
import styles from './styles.module.css';

type AppealResponse = GoApiResponse<'/api/v2/appeal/'>;
type AppealQueryParams = GoApiUrlQuery<'/api/v2/appeal/'>;
type AppealListItem = NonNullable<AppealResponse['results']>[number];

type GlobalEnumsResponse = GoApiResponse<'/api/v2/global-enums/'>;
type AppealTypeOption = NonNullable<GlobalEnumsResponse['api_appeal_type']>[number];

const appealKeySelector = (option: AppealListItem) => option.id;
const appealTypeKeySelector = (option: AppealTypeOption) => option.key;
const appealTypeLabelSelector = (option: AppealTypeOption) => option.value;

interface AppealFilter {
    startDateAfter?: string;
    startDateBefore?: string;
    appealType?: AppealTypeOption['key'];
    disasterType?: number;
    region?: Region;
    country?: number;
    hasEvent?: boolean;
}

const appealUrlParams: UrlParams<AppealFilter> = {
    appealType: urlParam.oneOf('atype', appealTypeKeyList),
    disasterType: urlParam.number('dtype'),
    region: urlParam.oneOf('region', regionKeyList),
    country: urlParam.number('country'),
    hasEvent: urlParam.flag('has_event'),
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
    } = useFilterState<AppealFilter>({
        filter: {},
        urlParams: appealUrlParams,
        ordering: { name: 'start_date', direction: 'dsc' },
        pageSize: 10,
    });
    const alert = useAlert();

    const { api_appeal_type: appealTypeOptions } = useGlobalEnums();

    const query = useMemo<AppealQueryParams>(
        () => ({
            limit,
            offset,
            ordering: getOrderingWithFallback(ordering, ['-start_date', '-id']),
            atype: filter.appealType,
            dtype: filter.disasterType,
            country: isDefined(filter.country) ? [filter.country] : undefined,
            region: isDefined(filter.region) ? [filter.region] : undefined,
            start_date__gte: filter.startDateAfter,
            start_date__lte: filter.startDateBefore,
            has_event: filter.hasEvent,
            needs_confirmation: filter.hasEvent ? false : undefined,
        }),
        [
            limit,
            offset,
            ordering,
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
            createDateColumn<AppealListItem, string>(
                'start_date',
                strings.allAppealsStartDate,
                (item) => item.start_date,
                {
                    sortable: true,
                    columnClassName: styles.startDate,
                },
            ),
            createStringColumn<AppealListItem, string>(
                'atype',
                strings.allAppealsType,
                (item) => item.atype_display,
                {
                    sortable: true,
                    columnClassName: styles.appealType,
                },
            ),
            createStringColumn<AppealListItem, string>(
                'code',
                strings.allAppealsCode,
                (item) => item.code,
                {
                    columnClassName: styles.code,
                },
            ),
            createLinkColumn<AppealListItem, string>(
                'operation',
                strings.allAppealsOperation,
                (item) => item.name,
                (item) => ({
                    to: 'emergenciesLayout',
                    urlParams: { emergencyId: item?.event },
                }),
                { sortable: true },
            ),
            createStringColumn<AppealListItem, string>(
                'dtype',
                strings.allAppealsDisasterType,
                (item) => item.dtype?.name,
                { sortable: true },
            ),
            createNumberColumn<AppealListItem, string>(
                'amount_requested',
                strings.allAppealsRequestedAmount,
                (item) => item.amount_requested,
                {
                    sortable: true,
                    suffix: ' CHF',
                },
            ),
            createProgressColumn<AppealListItem, string>(
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
            createLinkColumn<AppealListItem, string>(
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

    // FIXME(frozenhelium): useCallback removed for React Compiler compatibility
    const handleExportClick = () => {
        if (!appealsResponse?.count) {
            return;
        }
        triggerExportStart(
            '/api/v2/appeal/',
            appealsResponse.count,
            query,
        );
    };

    return (
        <Page
            className={styles.allAppeals}
            title={strings.allAppealsTitle}
            heading={heading}
        >
            <Container
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
                            name="appealType"
                            value={rawFilter.appealType}
                            onChange={setFilterField}
                            keySelector={appealTypeKeySelector}
                            labelSelector={appealTypeLabelSelector}
                            options={appealTypeOptions}
                        />
                        <DisasterTypeSelectInput
                            placeholder={strings.allAppealsFilterDisastersPlaceholder}
                            label={strings.allAppealsDisasterType}
                            name="disasterType"
                            value={rawFilter.disasterType}
                            onChange={setFilterField}
                        />
                        <RegionSelectInput
                            placeholder={strings.allAppealsFilterRegionPlaceholder}
                            label={strings.allAppealsRegion}
                            name="region"
                            value={rawFilter.region}
                            onChange={setFilterField}
                        />
                        <CountrySelectInput
                            placeholder={strings.allAppealsFilterCountryPlaceholder}
                            label={strings.allAppealsCountry}
                            name="country"
                            value={rawFilter.country}
                            onChange={setFilterField}
                        />
                    </>
                )}
                headerActions={(
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
                        filtered={filtered}
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
