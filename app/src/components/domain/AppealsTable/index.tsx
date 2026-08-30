import {
    useCallback,
    useMemo,
    useState,
} from 'react';
import {
    Button,
    Container,
    DateInput,
    Pager,
    SelectInput,
    Table,
} from '@ifrc-go/ui';
import { SortContext } from '@ifrc-go/ui/contexts';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    createDateColumn,
    createProgressColumn,
    createStringColumn,
    getPercentage,
    hasSomeDefinedValue,
} from '@ifrc-go/ui/utils';
import {
    _cs,
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

import DisasterTypeSelectInput from '#components/domain/DisasterTypeSelectInput';
import DistrictSearchMultiSelectInput, { type DistrictItem } from '#components/domain/DistrictSearchMultiSelectInput';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import useFilterState from '#hooks/useFilterState';
import {
    createAppealCodeColumn,
    createBudgetColumn,
    createCountryColumn,
    createDisasterTypeColumn,
    createEventColumn,
} from '#utils/domain/tableHelpers';
import type {
    GoApiResponse,
    GoApiUrlQuery,
} from '#utils/restRequest';
import { useRequest } from '#utils/restRequest';

import {
    APPEAL_TYPE_DREF,
    APPEAL_TYPE_EMERGENCY,
} from '../ActiveOperationMap/utils';

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
    heading?: React.ReactNode;
    withPastOperations?: boolean;
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
        heading,
        variant,
        withPastOperations,
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
    const { api_appeal_type: appealTypeOptionsRaw } = useGlobalEnums();

    const handleClearFiltersButtonClick = useCallback(() => {
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
            createAppealCodeColumn<AppealListItem, string>(
                'code',
                strings.appealsTableCode,
                (item) => item.code,
            ),
            createEventColumn<AppealListItem, string>(
                'operation',
                strings.appealsTableOperation,
                (item) => item.name,
                (item) => ({
                    to: 'emergenciesLayout',
                    urlParams: { emergencyId: item.event },
                }),
            ),
            createDisasterTypeColumn<AppealListItem, string>(
                'dtype',
                strings.appealsTableDisasterType,
                (item) => item.dtype?.name,
                { sortable: true },
            ),
            createBudgetColumn<AppealListItem, string>(
                'amount_requested',
                strings.appealsTableRequestedAmount,
                (item) => item.amount_requested,
                { sortable: true },
            ),
            createProgressColumn<AppealListItem, string>(
                'amount_funded',
                strings.appealsTableFundedAmount,
                (item) => (
                    getPercentage(
                        item.amount_funded,
                        item.amount_requested,
                    )
                ),
                { sortable: true },
            ),
            variant !== 'country'
                ? createCountryColumn<AppealListItem, string>(
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
            strings.appealsTableDisasterType,
            strings.appealsTableRequestedAmount,
            strings.appealsTableFundedAmount,
            strings.appealsTableCountry,
        ],
    );

    const defaultOrdering = '-start_date';
    const orderingWithFallback = useMemo(() => {
        if (isNotDefined(ordering)) {
            return defaultOrdering;
        }

        if (ordering === '-id') {
            return '-start_date,-id';
        }

        if (ordering === 'start_date' || ordering === '-start_date') {
            return ordering;
        }

        // Add default ordering as second ordering
        return [ordering, defaultOrdering].join(',');
    }, [ordering]);

    const query = useMemo<AppealQueryParams>(
        () => {
            const baseQuery: AppealQueryParams = {
                limit,
                offset,
                ordering: orderingWithFallback,
                atype: filter.appeal,
                dtype: filter.displacement,
                district: hasSomeDefinedValue(filter.district) ? filter.district : undefined,
                end_date__gt: withPastOperations ? undefined : now,
                start_date__gte: filter.startDateAfter,
                start_date__lte: filter.startDateBefore,
            };

            if (variant === 'global') {
                return baseQuery;
            }

            return {
                ...baseQuery,
                country: isDefined(countryId) ? [countryId] : undefined,
                region: isDefined(regionId) ? [regionId] : undefined,
            };
        },
        [
            withPastOperations,
            variant,
            countryId,
            regionId,
            orderingWithFallback,
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

    const appealTypeOptions = useMemo(() => (
        appealTypeOptionsRaw?.filter(
            (appealTypeOption) => appealTypeOption.key === APPEAL_TYPE_DREF
                || appealTypeOption.key === APPEAL_TYPE_EMERGENCY,
        )
    ), [appealTypeOptionsRaw]);

    return (
        <Container
            className={_cs(styles.appealsTable, className)}
            heading={heading}
            withHeaderBorder={isDefined(heading)}
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
                        label={strings.appealsTableDisasterType}
                        name="displacement"
                        value={rawFilter.displacement}
                        onChange={setFilterField}
                    />
                    <Button
                        name={undefined}
                        onClick={handleClearFiltersButtonClick}
                        disabled={!filtered}
                    >
                        {strings.appealsTableClearFilters}
                    </Button>
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
