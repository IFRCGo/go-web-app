import {
    useState,
    useMemo,
    useContext,
    useCallback,
} from 'react';
import { generatePath } from 'react-router-dom';
import { isDefined, _cs } from '@togglecorp/fujs';

import { useRequest } from '#utils/restRequest';
import type { GoApiResponse, GoApiUrlQuery } from '#utils/restRequest';
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
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import DisasterTypeSelectInput from '#components/domain/DisasterTypeSelectInput';

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

    const sortState = useSortState();
    const { sorting } = sortState;
    const strings = useTranslation(i18n);
    const { api_appeal_type: appealTypeOptions } = useGlobalEnums();
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
    } = useRequest({
        url: '/api/v2/appeal/',
        preserveResponse: true,
        query,
    });

    const handleAppealTypeChange = useCallback((value: AppealTypeOption['key'] | undefined) => {
        setFilterAppeal(value);
        setPage(1);
    }, [setFilterAppeal]);

    const handleDisplacementTypeChange = useCallback((value: number | undefined) => {
        setFilterDisplacement(value);
        setPage(1);
    }, [setFilterDisplacement]);

    return (
        <Container
            className={_cs(styles.appealsTable, className)}
            headerDescriptionContainerClassName={styles.filters}
            headerDescription={(
                <>
                    <SelectInput
                        placeholder={strings.appealsTableFilterTypePlaceholder}
                        label={strings.appealsTableType}
                        name={undefined}
                        value={filterAppeal}
                        onChange={handleAppealTypeChange}
                        keySelector={appealTypeKeySelector}
                        labelSelector={appealTypeLabelSelector}
                        options={appealTypeOptions}
                    />
                    <DisasterTypeSelectInput
                        placeholder={strings.appealsTableFilterDisastersPlaceholder}
                        label={strings.appealsTableDisastertype}
                        name={undefined}
                        value={filterDisplacement}
                        onChange={handleDisplacementTypeChange}
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
                    filtered={isDefined(filterDisplacement) || isDefined(filterAppeal)}
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
