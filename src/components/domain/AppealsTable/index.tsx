import { useMemo } from 'react';
import { _cs } from '@togglecorp/fujs';

import { useRequest } from '#utils/restRequest';
import type { GoApiResponse, GoApiUrlQuery } from '#utils/restRequest';
import Table from '#components/Table';
import SelectInput from '#components/SelectInput';
import Container from '#components/Container';
import {
    createStringColumn,
    createNumberColumn,
    createDateColumn,
    createLinkColumn,
    createProgressColumn,
} from '#components/Table/ColumnShortcuts';
import { SortContext } from '#components/Table/useSorting';
import Pager from '#components/Pager';
import useTranslation from '#hooks/useTranslation';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import DisasterTypeSelectInput from '#components/domain/DisasterTypeSelectInput';
import useFilterState from '#hooks/useFilterState';

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

const endDate = (new Date()).toISOString();
type BaseProps = {
    className?: string;
}

type RegionProps = {
    variant: 'region';
    regionId: number;
}

type GlobalProps = {
    variant: 'global';
}

type Props = BaseProps & (RegionProps | GlobalProps);

function AppealsTable(props: Props) {
    const {
        className,
        variant,
    } = props;

    const {
        sortState,
        ordering,
        page,
        setPage,
        filter,
        filtered,
        setFilterField,
        limit,
        offset,
    } = useFilterState<{
        appeal?: AppealTypeOption['key'],
        displacement?: number,
    }>(
        {},
        undefined,
        1,
        5,
    );

    const strings = useTranslation(i18n);
    const { api_appeal_type: appealTypeOptions } = useGlobalEnums();
    //
    // eslint-disable-next-line react/destructuring-assignment
    const regionId = variant === 'region' ? props.regionId : undefined;

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
                (item) => item.dtype.name,
                { sortable: true },
            ),
            createNumberColumn<AppealListItem, string>(
                'amount_requested',
                strings.appealsTableRequestedAmount,
                (item) => Number(item.amount_requested),
                { sortable: true },
            ),
            createProgressColumn<AppealListItem, string>(
                'amount_funded',
                strings.appealsTableFundedAmount,
                (item) => 100 * (Number(item.amount_funded) / Number(item.amount_requested)),
                { sortable: true },
            ),
            createLinkColumn<AppealListItem, string>(
                'country',
                strings.appealsTableCountry,
                (item) => item.country.name,
                (item) => ({
                    to: 'countriesLayout',
                    urlParams: { countryId: item.country.id },
                }),
            ),
        ]),
        [strings],
    );

    const query = useMemo<AppealQueryParams>(
        () => {
            const baseQuery: AppealQueryParams = {
                limit,
                offset,
                ordering,
                atype: filter.appeal,
                dtype: filter.displacement,
                end_date__gt: endDate,
            };

            if (variant === 'global') {
                return baseQuery;
            }

            return {
                ...baseQuery,
                region: regionId,
            };
        },
        [variant, regionId, ordering, filter, limit, offset],
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
            headerDescriptionContainerClassName={styles.filters}
            headerDescription={(
                <>
                    <SelectInput
                        placeholder={strings.appealsTableFilterTypePlaceholder}
                        label={strings.appealsTableType}
                        name="appeal"
                        value={filter.appeal}
                        onChange={setFilterField}
                        keySelector={appealTypeKeySelector}
                        labelSelector={appealTypeLabelSelector}
                        options={appealTypeOptions}
                    />
                    <DisasterTypeSelectInput
                        placeholder={strings.appealsTableFilterDisastersPlaceholder}
                        label={strings.appealsTableDisastertype}
                        name="displacement"
                        value={filter.displacement}
                        onChange={setFilterField}
                    />
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
