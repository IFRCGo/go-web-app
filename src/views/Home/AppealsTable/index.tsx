import {
    useRequest,
    ListResponse,
} from '#utils/restRequest';
import BlockLoading from '#components/BlockLoading';
import { useSortState, SortContext } from '#components/Table/useSorting';
import Table from '#components/Table';
// import type { TableProps, Column } from '#components/Table';
import {
    createStringColumn,
    createNumberColumn,
    createDateColumn,
} from '#components/Table/columnShortcuts';

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

const AppealTypeOptions: AppealType[] = [
    { value: 'all', label: 'All Appeal Types' },
    { value: '0', label: 'DREF' },
    { value: '1', label: 'Emergency Appeals' },
    { value: '2', label: 'Movement' },
    { value: '3', label: 'Early Action Protocol (EAP) Activation' },
];

const columns = [
    createDateColumn<Appeal, string>(
        'start_date',
        'Start Date',
        (item) => item.start_date,
        {
            sortable: true,
            columnClassName: styles.startDate,
        },
    ),
    createStringColumn<Appeal, string>(
        'atype',
        'Type',
        (item) => item.atype_display,
        {
            sortable: true,
            columnClassName: styles.appealType,
        },
    ),
    createStringColumn<Appeal, string>(
        'code',
        'Code',
        (item) => item.code,
        {
            columnClassName: styles.code,
        },
    ),
    createStringColumn<Appeal, string>(
        'operation',
        'Operation',
        (item) => item.name,
    ),
    createStringColumn<Appeal, string>(
        'dtype',
        'Disaster Type',
        (item) => item.dtype.name,
        { sortable: true },
    ),
    createNumberColumn<Appeal, string>(
        'amount_requested',
        'Requested Amount',
        (item) => Number(item.amount_requested),
        { sortable: true },
    ),
    createNumberColumn<Appeal, string>(
        'amount_funded',
        'Funding',
        // FIXME: use progress bar here
        (item) => Number(item.amount_funded),
        { sortable: true },
    ),
    createStringColumn<Appeal, string>(
        'country',
        'Country',
        (item) => item.country.name,
    ),
];

const keySelector = (item: Appeal) => item.id;

function AppealsTable() {
    const sortState = useSortState('start_date');
    const { sorting } = sortState;

    const {
        pending: appealsPending,
        response: appealsResponse,
    } = useRequest<ListResponse<Appeal>>({
        url: 'api/v2/appeal/',
        query: {
            limit: 10,
            offset: 0,
            // ordering: sorting,
            /*
            a_type: 0,
            d_type: 0,
            start_date__gte: undefined,
            start_date__gte: undefined,
            end_date__gt: now(),
            */
        },
    });

    /*
    const {
        pending: disasterTypePending,
        response: disasterTypeResponse,
    } = useRequest<ListResponse<DisasterType>>({
        url: 'api/v2/disaster_type/',
    });
    */

    return (
        <div>
            {appealsPending && (
                <BlockLoading />
            )}
            <SortContext.Provider value={sortState}>
                <Table
                    className={styles.appealsTable}
                    columns={columns}
                    keySelector={keySelector}
                    data={appealsResponse?.results}
                />
            </SortContext.Provider>
        </div>
    );
}

export default AppealsTable;
