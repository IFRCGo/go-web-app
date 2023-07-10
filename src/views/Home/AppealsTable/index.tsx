import { useState, useMemo, useContext } from 'react';
import { generatePath } from 'react-router-dom';
import { isDefined } from '@togglecorp/fujs';
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
import { useSortState, SortContext } from '#components/Table/useSorting';
import Pager from '#components/Pager';
import useTranslation from '#hooks/useTranslation';
import RouteContext from '#contexts/route';
import { paths, components } from '#generated/types';

import i18n from './i18n.json';
import styles from './styles.module.css';

type GetAppeal = paths['/api/v2/appeal/']['get'];
type AppealResponse = GetAppeal['responses']['200']['content']['application/json'];
type AppealListItem = NonNullable<AppealResponse['results']>[number];

type GetDisasterType = paths['/api/v2/disaster_type/']['get'];
type DisasterTypeResponse = GetDisasterType['responses']['200']['content']['application/json'];
type DisasterListItem = NonNullable<DisasterTypeResponse['results']>[number];

type AppealTypeKeys = components['schemas']['TypeOfDrefEnum'];
interface AppealType {
    value: AppealTypeKeys;
    label: string;
}

// FIXME: pull this from server
const appealTypeOptions: AppealType[] = [
    { value: 0, label: 'DREF' },
    { value: 1, label: 'Emergency Appeals' },
    { value: 2, label: 'Movement' },
    { value: 3, label: 'Early Action Protocol (EAP) Activation' },
];

const appealKeySelector = (item: AppealListItem) => item.id;
const appealTypeKeySelector = (item: AppealType) => item.value;
const appealTypeLabelSelector = (item: AppealType) => item.label;
const disasterTypeKeySelector = (item: DisasterListItem) => item.id;
const disasterTypeLabelSelector = (item: DisasterListItem) => item.name ?? '';

const endDate = (new Date()).toISOString();

function AppealsTable() {
    const sortState = useSortState();
    const { sorting } = sortState;

    const strings = useTranslation(i18n);
    const {
        country: countryRoute,
        emergency: emergencyRoute,
    } = useContext(RouteContext);

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

    let ordering;
    if (sorting) {
        ordering = sorting.direction === 'dsc'
            ? `-${sorting.name}`
            : sorting.name;
    }

    // FIXME: clear appealType and displacementType when filter is changed
    const [appealType, setAppealType] = useInputState<AppealType['value'] | undefined>(undefined);
    const [displacementType, setDisplacementType] = useInputState<number | undefined>(undefined);
    const [page, setPage] = useState(0);

    const PAGE_SIZE = 5;
    const {
        pending: appealsPending,
        response: appealsResponse,
    } = useRequest<ListResponse<AppealListItem>>({
        url: 'api/v2/appeal/',
        preserveResponse: true,
        query: {
            limit: PAGE_SIZE,
            offset: PAGE_SIZE * (page - 1),
            ordering,
            atype: appealType,
            dtype: displacementType,
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
    } = useRequest<ListResponse<DisasterListItem>>({
        url: 'api/v2/disaster_type/',
    });

    return (
        <Container
            className={styles.appealsTable}
            headerDescriptionClassName={styles.filters}
            headerDescription={(
                <>
                    <SelectInput
                        placeholder={strings.appealsTableFilterTypePlaceholder}
                        label={strings.appealsTableType}
                        name={undefined}
                        value={appealType}
                        onChange={setAppealType}
                        keySelector={appealTypeKeySelector}
                        labelSelector={appealTypeLabelSelector}
                        options={appealTypeOptions}
                    />
                    <SelectInput
                        placeholder={strings.appealsTableFilterDisastersPlaceholder}
                        label={strings.appealsTableDisastertype}
                        name={undefined}
                        value={displacementType}
                        onChange={setDisplacementType}
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
                    filtered={!!(displacementType && appealType)}
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
