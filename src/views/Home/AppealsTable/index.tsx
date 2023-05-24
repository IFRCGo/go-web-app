import { useState, useMemo } from 'react';
import {
    useRequest,
    ListResponse,
} from '#utils/restRequest';
import BlockLoading from '#components/BlockLoading';
import { useSortState, SortContext } from '#components/Table/useSorting';
import Table from '#components/Table';
import SelectInput from '#components/SelectInput';
import useInputState from '#hooks/useInputState';
import {
    createStringColumn,
    createNumberColumn,
    createDateColumn,
} from '#components/Table/columnShortcuts';
import Pager from '#components/Pager';
import useTranslation from '#hooks/useTranslation';

import i18n from './i18n.json';
import styles from './styles.module.css';

// This is already defined in #types/emergency
interface Appeal {
    aid: string;
    name: string;
    dtype: {
        id: number;
        summary: string;
        name: string;
    };
    atype: number;
    atype_display: string;
    status: number;
    status_display: string;
    code: string;
    sector: string;
    num_beneficiaries: number;
    amount_requested: string;
    amount_funded: string;
    start_date: string;
    end_date: string;
    real_data_update: string;
    created_at: string;
    modified_at: string;
    event: unknown | null;
    needs_confirmation: boolean;
    country: {
        iso: string;
        iso3: string;
        id: number;
        record_type: number;
        record_type_display: string;
        region: number;
        independent: boolean;
        is_deprecated: boolean;
        fdrs: string;
        average_household_size: unknown | null;
        society_name: string;
        name: string;
    };
    region: {
        name: number;
        id: number;
        region_name: string;
        label: string;
    }
    id: string;
}

interface DisasterType {
    id: number;
    summary: string;
    name: string;
}

interface AppealType {
    value: string;
    label: string;
}

// FIXME: translate this
const appealTypeOptions: AppealType[] = [
    { value: 'all', label: 'All' },
    { value: '0', label: 'DREF' },
    { value: '1', label: 'Emergency Appeals' },
    { value: '2', label: 'Movement' },
    { value: '3', label: 'Early Action Protocol (EAP) Activation' },
];

const keySelector = (item: Appeal) => item.id;

const endDate = (new Date()).toISOString();

function AppealsTable() {
    const sortState = useSortState();
    const { sorting } = sortState;

    const strings = useTranslation(i18n);

    const columns = useMemo(
        () => ([
            createDateColumn<Appeal, string>(
                'start_date',
                strings.appealsTableStartDate,
                (item) => item.start_date,
                {
                    sortable: true,
                    columnClassName: styles.startDate,
                },
            ),
            createStringColumn<Appeal, string>(
                'atype',
                strings.appealsTableType,
                (item) => item.atype_display,
                {
                    sortable: true,
                    columnClassName: styles.appealType,
                },
            ),
            createStringColumn<Appeal, string>(
                'code',
                strings.appealsTableCode,
                (item) => item.code,
                {
                    columnClassName: styles.code,
                },
            ),
            createStringColumn<Appeal, string>(
                'operation',
                strings.appealsTableOperation,
                (item) => item.name,
            ),
            createStringColumn<Appeal, string>(
                'dtype',
                strings.appealsTableDisastertype,
                (item) => item.dtype.name,
                { sortable: true },
            ),
            createNumberColumn<Appeal, string>(
                'amount_requested',
                strings.appealsTableRequestedAmount,
                (item) => Number(item.amount_requested),
                { sortable: true },
            ),
            createNumberColumn<Appeal, string>(
                'amount_funded',
                strings.appealsTableFundedAmount,
                // FIXME: use progress bar here
                (item) => Number(item.amount_funded),
                { sortable: true },
            ),
            createStringColumn<Appeal, string>(
                'country',
                strings.appealsTableCountry,
                (item) => item.country.name,
            ),
        ]),
        [strings],
    );

    let ordering;
    if (sorting) {
        ordering = sorting.direction === 'dsc'
            ? `-${sorting.name}`
            : sorting.name;
    }

    // FIXME: clear appealType and displacementType when filter is changed
    const [appealType, setAppealType] = useInputState<string | undefined>('all');
    const [displacementType, setDisplacementType] = useInputState<number | undefined>(-1);
    const [page, setPage] = useState(0);

    const PAGE_SIZE = 10;
    const {
        pending: appealsPending,
        response: appealsResponse,
    } = useRequest<ListResponse<Appeal>>({
        url: 'api/v2/appeal/',
        preserveResponse: true,
        query: {
            limit: PAGE_SIZE,
            offset: PAGE_SIZE * (page - 1),
            ordering,
            atype: appealType === 'all' ? undefined : appealType,
            dtype: displacementType === -1 ? undefined : displacementType,
            end_date__gt: endDate,
            /*
            // TODO:
            start_date__gte: undefined,
            start_date__gte: undefined,
            */
        },
    });

    const {
        pending: disasterTypePending,
        response: disasterTypeResponse,
    } = useRequest<ListResponse<DisasterType>>({
        url: 'api/v2/disaster_type/',
    });

    const displacementTypeWithAll = useMemo(
        () => ([
            {
                // FIXME: translate this
                id: -1,
                name: 'All',
            },
            ...disasterTypeResponse?.results ?? [],
        ]),
        [disasterTypeResponse],
    );

    return (
        <div className={styles.appealsTable}>
            <div className={styles.filters}>
                <SelectInput
                    label={strings.appealsTableType}
                    name={undefined}
                    value={appealType}
                    onChange={setAppealType}
                    // FIXME: do no inline functions on render
                    keySelector={(item) => item.value}
                    labelSelector={(item) => item.label}
                    options={appealTypeOptions}
                />
                <SelectInput
                    label={strings.appealsTableDisastertype}
                    name={undefined}
                    value={displacementType}
                    onChange={setDisplacementType}
                    // FIXME: do no inline functions on render
                    keySelector={(item) => item.id}
                    labelSelector={(item) => item.name}
                    options={displacementTypeWithAll}
                    disabled={disasterTypePending}
                />
            </div>
            {appealsPending && (
                // FIXME: use a loading animation inside the Table
                <BlockLoading />
            )}
            <SortContext.Provider value={sortState}>
                <Table
                    className={styles.table}
                    columns={columns}
                    keySelector={keySelector}
                    data={appealsResponse?.results}
                />
            </SortContext.Provider>
            <Pager
                activePage={page}
                itemsCount={appealsResponse?.count ?? 0}
                maxItemsPerPage={10}
                onActivePageChange={setPage}
            />
        </div>
    );
}

export default AppealsTable;
