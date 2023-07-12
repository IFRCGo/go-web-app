import { useState, useMemo, useContext } from 'react';
import { generatePath } from 'react-router-dom';
import { isDefined, _cs } from '@togglecorp/fujs';

import {
    useRequest,
    ListResponse,
} from '#utils/restRequest';
import Table from '#components/Table';
import SelectInput from '#components/SelectInput';
import Container from '#components/Container';
import useInputState from '#hooks/useInputState';
import {
    createStringColumn,
    createNumberColumn,
    createDateColumn,
    createLinkColumn,
    createProgressColumn,
} from '#components/Table/ColumnShortcuts';
import { useSortState, SortContext, getOrdering } from '#components/Table/useSorting';
import Pager from '#components/Pager';
import useTranslation from '#hooks/useTranslation';
import RouteContext from '#contexts/route';
import { paths } from '#generated/types';
import ServerEnumsContext from '#contexts/server-enums';

import i18n from './i18n.json';
import styles from './styles.module.css';

type GetAppeal = paths['/api/v2/appeal/']['get'];
type AppealQueryParams = GetAppeal['parameters']['query'];
type AppealResponse = GetAppeal['responses']['200']['content']['application/json'];
type AppealListItem = NonNullable<AppealResponse['results']>[number];

type GetDisasterType = paths['/api/v2/disaster_type/']['get'];
type DisasterTypeResponse = GetDisasterType['responses']['200']['content']['application/json'];
type DisasterListItem = NonNullable<DisasterTypeResponse['results']>[number];

type GetGlobalEnums = paths['/api/v2/global-enums/']['get'];
type GlobalEnumsResponse = GetGlobalEnums['responses']['200']['content']['application/json'];
type AppealTypeOption = NonNullable<GlobalEnumsResponse['api_appeal_type']>[number];

const appealKeySelector = (option: AppealListItem) => option.id;
const appealTypeKeySelector = (option: AppealTypeOption) => option.key;
const appealTypeLabelSelector = (option: AppealTypeOption) => option.value;
const disasterTypeKeySelector = (option: DisasterListItem) => option.id;
const disasterTypeLabelSelector = (option: DisasterListItem) => option.name ?? '';

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

    const sortState = useSortState();
    const { sorting } = sortState;
    const strings = useTranslation(i18n);
    const { api_appeal_type: appealTypeOptions } = useContext(ServerEnumsContext);
    const {
        country: countryRoute,
        emergency: emergencyRoute,
    } = useContext(RouteContext);
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
                    to: isDefined(item.event)
                        ? generatePath(emergencyRoute.absolutePath, { emergencyId: item.event })
                        : undefined,
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
                // FIXME: use progress bar here
                (item) => 100 * (Number(item.amount_funded) / Number(item.amount_requested)),
                { sortable: true },
            ),
            createLinkColumn<AppealListItem, string>(
                'country',
                strings.appealsTableCountry,
                (item) => item.country.name,
                (item) => ({
                    to: generatePath(
                        countryRoute.absolutePath,
                        { countryId: String(item.country.id) },
                    ),
                }),
            ),
        ]),
        [strings, countryRoute, emergencyRoute],
    );

    // FIXME: clear appealType and displacementType when filter is changed
    const [filterAppeal, setFilterAppeal] = useInputState<AppealTypeOption['key'] | undefined>(undefined);
    const [
        filterDisplacement,
        setFilterDisplacement,
    ] = useInputState<number | undefined>(undefined);
    const [page, setPage] = useState(1);

    const PAGE_SIZE = 5;
    const query = useMemo<AppealQueryParams>(
        () => {
            const baseQuery: AppealQueryParams = {
                limit: PAGE_SIZE,
                offset: PAGE_SIZE * (page - 1),
                ordering: getOrdering(sorting),
                atype: filterAppeal,
                dtype: filterDisplacement,
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
        [variant, regionId, page, sorting, filterAppeal, filterDisplacement],
    );

    const {
        pending: appealsPending,
        response: appealsResponse,
    } = useRequest<ListResponse<AppealListItem>>({
        url: 'api/v2/appeal/',
        preserveResponse: true,
        query,
    });

    const {
        pending: disasterTypePending,
        response: disasterTypeResponse,
    } = useRequest<ListResponse<DisasterListItem>>({
        url: 'api/v2/disaster_type/',
    });

    return (
        <Container
            className={_cs(styles.appealsTable, className)}
            headerDescriptionClassName={styles.filters}
            headerDescription={(
                <>
                    <SelectInput
                        placeholder={strings.appealsTableFilterTypePlaceholder}
                        label={strings.appealsTableType}
                        name={undefined}
                        value={filterAppeal}
                        onChange={setFilterAppeal}
                        keySelector={appealTypeKeySelector}
                        labelSelector={appealTypeLabelSelector}
                        options={appealTypeOptions}
                    />
                    <SelectInput
                        placeholder={strings.appealsTableFilterDisastersPlaceholder}
                        label={strings.appealsTableDisastertype}
                        name={undefined}
                        value={filterDisplacement}
                        onChange={setFilterDisplacement}
                        keySelector={disasterTypeKeySelector}
                        labelSelector={disasterTypeLabelSelector}
                        options={disasterTypeResponse?.results}
                        disabled={disasterTypePending}
                    />
                    <div />
                </>
            )}
            footerActions={(
                <Pager
                    activePage={page}
                    itemsCount={appealsResponse?.count ?? 0}
                    maxItemsPerPage={PAGE_SIZE}
                    onActivePageChange={setPage}
                />
            )}
        >
            <SortContext.Provider value={sortState}>
                <Table
                    pending={appealsPending}
                    filtered={!!(filterDisplacement && filterAppeal)}
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
