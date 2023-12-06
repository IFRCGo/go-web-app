import { useMemo, useCallback, useState } from 'react';
import { _cs, isDefined } from '@togglecorp/fujs';

import Button from '#components/Button';
import Container from '#components/Container';
import DateInput from '#components/DateInput';
import DisasterTypeSelectInput from '#components/domain/DisasterTypeSelectInput';
import DistrictSearchMultiSelectInput, { type DistrictItem } from '#components/domain/DistrictSearchMultiSelectInput';
import Pager from '#components/Pager';
import SelectInput from '#components/SelectInput';
import Table from '#components/Table';
import useFilterState from '#hooks/useFilterState';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import useTranslation from '#hooks/useTranslation';
import {
    createStringColumn,
    createNumberColumn,
    createDateColumn,
    createLinkColumn,
    createProgressColumn,
} from '#components/Table/ColumnShortcuts';
import { SortContext } from '#components/Table/useSorting';
import { useRequest } from '#utils/restRequest';
import type { GoApiResponse, GoApiUrlQuery } from '#utils/restRequest';
import { hasSomeDefinedValue, getPercentage } from '#utils/common';

import i18n from './i18n.json';
import styles from './styles.module.css';

type AppealQueryParams = GoApiUrlQuery<'/api/v2/appeal/'>;
type AppealResponse = GoApiResponse<'/api/v2/appeal/'>;
type AppealListItem = NonNullable<AppealResponse['results']>[number];

type GlobalEnumsResponse = GoApiResponse<'/api/v2/global-enums/'>;
type AppealTypeOption = NonNullable<GlobalEnumsResponse['api_appeal_type']>[number];

const appealKeySelector = (option: AppealListItem) => option.id;
const appealTypeKeySelector = (option: AppealTypeOption) => option.key;
const appealTypeLabelSelector = (option: AppealTypeOption) => option.value;

const now = new Date().toISOString();
type BaseProps = {
    className?: string;
}
type CountryProps = {
    variant: 'country';
    countryId: number;
}

type RegionProps = {
    variant: 'region';
    regionId: number;
}

type GlobalProps = {
    variant: 'global';
}

type Props = BaseProps & (RegionProps | GlobalProps | CountryProps);

function AppealsTable(props: Props) {
    const {
        className,
        variant,
    } = props;

    const {
        filter,
        filtered,
        limit,
        offset,
        ordering,
        page,
        rawFilter,
        setFilter,
        setFilterField,
        setPage,
        sortState,
    } = useFilterState<{
        appeal?: AppealTypeOption['key'],
        district?: number[],
        displacement?: number,
        startDateAfter?: string,
        startDateBefore?: string,
    }>({
        filter: {},
        pageSize: 5,
    });

    const strings = useTranslation(i18n);
    const { api_appeal_type: appealTypeOptions } = useGlobalEnums();

    const handleClearFiltersButtonclick = useCallback(() => {
        setFilter({});
    }, [setFilter]);

    // eslint-disable-next-line react/destructuring-assignment
    const regionId = variant === 'region' ? props.regionId : undefined;
    // eslint-disable-next-line react/destructuring-assignment
    const countryId = variant === 'country' ? props.countryId : undefined;

    const [districtOptions, setDistrictOptions] = useState<DistrictItem[] | null | undefined>();

    const columns = useMemo(
        () => ([
            createDateColumn<AppealListItem, string>(
                'start_date',
                strings.appealsTableStartDate,
                (item) => item.start_date,
                {
                    sortable: true,
                    columnClassName: styles.startDate,
                },
            ),
            createStringColumn<AppealListItem, string>(
                'atype',
                strings.appealsTableType,
                (item) => item.atype_display,
                {
                    sortable: true,
                    columnClassName: styles.appealType,
                },
            ),
            createStringColumn<AppealListItem, string>(
                'code',
                strings.appealsTableCode,
                (item) => item.code,
                {
                    columnClassName: styles.code,
                },
            ),
            createLinkColumn<AppealListItem, string>(
                'operation',
                strings.appealsTableOperation,
                (item) => item.name,
                (item) => ({
                    to: 'emergenciesLayout',
                    urlParams: { emergencyId: item.event },
                }),
            ),
            createStringColumn<AppealListItem, string>(
                'dtype',
                strings.appealsTableDisastertype,
                (item) => item.dtype?.name,
                { sortable: true },
            ),
            createNumberColumn<AppealListItem, string>(
                'amount_requested',
                strings.appealsTableRequestedAmount,
                (item) => item.amount_requested,
                {
                    sortable: true,
                    suffix: ' CHF',
                },
            ),
            createProgressColumn<AppealListItem, string>(
                'amount_funded',
                strings.appealsTableFundedAmount,
                // FIXME: use progress function
                (item) => (
                    getPercentage(
                        item.amount_funded,
                        item.amount_requested,
                    )
                ),
                { sortable: true },
            ),
            variant !== 'country'
                ? createLinkColumn<AppealListItem, string>(
                    'country',
                    strings.appealsTableCountry,
                    (item) => item.country?.name,
                    (item) => ({
                        to: 'countriesLayout',
                        urlParams: { countryId: item.country.id },
                    }),
                ) : undefined,
        ].filter(isDefined)),
        [
            variant,
            strings.appealsTableStartDate,
            strings.appealsTableType,
            strings.appealsTableCode,
            strings.appealsTableOperation,
            strings.appealsTableDisastertype,
            strings.appealsTableRequestedAmount,
            strings.appealsTableFundedAmount,
            strings.appealsTableCountry,
        ],
    );

    const query = useMemo<AppealQueryParams>(
        () => {
            const baseQuery: AppealQueryParams = {
                limit,
                offset,
                ordering,
                atype: filter.appeal,
                dtype: filter.displacement,
                district: hasSomeDefinedValue(filter.district) ? filter.district : undefined,
                end_date__gt: now,
                start_date__gte: filter.startDateAfter,
                start_date__lte: filter.startDateBefore,
            };

            if (variant === 'global') {
                return baseQuery;
            }

            return {
                ...baseQuery,
                country: countryId ? [countryId] : undefined,
                region: regionId ? [regionId] : undefined,
            };
        },
        [
            variant,
            countryId,
            regionId,
            ordering,
            filter,
            limit,
            offset,
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

    return (
        <Container
            className={_cs(styles.appealsTable, className)}
            childrenContainerClassName={styles.content}
            withGridViewInFilter
            filters={(
                <>
                    <DateInput
                        name="startDateAfter"
                        label={strings.appealsTableStartDateAfter}
                        onChange={setFilterField}
                        value={rawFilter.startDateAfter}
                    />
                    <DateInput
                        name="startDateBefore"
                        label={strings.appealsTableStartDateBefore}
                        onChange={setFilterField}
                        value={rawFilter.startDateBefore}
                    />
                    {variant === 'country' && (
                        <DistrictSearchMultiSelectInput
                            name="district"
                            placeholder={strings.appealsTableFilterDistrictPlaceholder}
                            label={strings.appealsTableProvinces}
                            value={rawFilter.district}
                            options={districtOptions}
                            onOptionsChange={setDistrictOptions}
                            onChange={setFilterField}
                            countryId={countryId}
                        />
                    )}
                    <SelectInput
                        placeholder={strings.appealsTableFilterTypePlaceholder}
                        label={strings.appealsTableType}
                        name="appeal"
                        value={rawFilter.appeal}
                        onChange={setFilterField}
                        keySelector={appealTypeKeySelector}
                        labelSelector={appealTypeLabelSelector}
                        options={appealTypeOptions}
                    />
                    <DisasterTypeSelectInput
                        placeholder={strings.appealsTableFilterDisastersPlaceholder}
                        label={strings.appealsTableDisastertype}
                        name="displacement"
                        value={rawFilter.displacement}
                        onChange={setFilterField}
                    />
                    <div>
                        <Button
                            name={undefined}
                            onClick={handleClearFiltersButtonclick}
                            variant="secondary"
                            disabled={!filtered}
                        >
                            {strings.appealsTableClearFilters}
                        </Button>
                    </div>
                </>
            )}
            footerActions={(
                <Pager
                    activePage={page}
                    itemsCount={appealsResponse?.count ?? 0}
                    maxItemsPerPage={limit}
                    onActivePageChange={setPage}
                />
            )}
            contentViewType="vertical"
        >
            <SortContext.Provider value={sortState}>
                <Table
                    pending={appealsPending}
                    filtered={filtered}
                    className={styles.table}
                    columns={columns}
                    keySelector={appealKeySelector}
                    data={appealsResponse?.results}
                />
            </SortContext.Provider>
        </Container>
    );
}

export default AppealsTable;
