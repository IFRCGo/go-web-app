import { useState, useMemo, useContext } from 'react';
import { generatePath } from 'react-router-dom';
import { isDefined } from '@togglecorp/fujs';

import Page from '#components/Page';
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
import { useSortState, SortContext } from '#components/Table/useSorting';
import Pager from '#components/Pager';
import useInputState from '#hooks/useInputState';
import useTranslation from '#hooks/useTranslation';
import RouteContext from '#contexts/route';
import { resolveToComponent } from '#utils/translation';
import {
    useRequest,
    ListResponse,
} from '#utils/restRequest';

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
    summary?: string;
    name: string;
}

interface AppealType {
    value: string;
    label: string;
}

const appealKeySelector = (item: Appeal) => item.id;
const appealTypeKeySelector = (item: AppealType) => item.value;
const appealTypeLabelSelector = (item: AppealType) => item.label;
const disasterTypeKeySelector = (item: DisasterType) => item.id;
const disasterTypeLabelSelector = (item: DisasterType) => item.name;

const endDate = (new Date()).toISOString();

// FIXME: pull this from server
const appealTypeOptions: AppealType[] = [
    { value: 'all', label: 'All' },
    { value: '0', label: 'DREF' },
    { value: '1', label: 'Emergency Appeals' },
    { value: '2', label: 'Movement' },
    { value: '3', label: 'Early Action Protocol (EAP) Activation' },
];

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    const sortState = useSortState();
    const { sorting } = sortState;
    const {
        country: countryRoute,
        emergency: emergencyRoute,
    } = useContext(RouteContext);
    let ordering;
    if (sorting) {
        ordering = sorting.direction === 'dsc'
            ? `-${sorting.name}`
            : sorting.name;
    }

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

    const columns = useMemo(
        () => ([
            createDateColumn<Appeal, string>(
                'start_date',
                strings.allAppealsStartDate,
                (item) => item.start_date,
                {
                    sortable: true,
                    columnClassName: styles.startDate,
                },
            ),
            createStringColumn<Appeal, string>(
                'atype',
                strings.allAppealsType,
                (item) => item.atype_display,
                {
                    sortable: true,
                    columnClassName: styles.appealType,
                },
            ),
            createStringColumn<Appeal, string>(
                'code',
                strings.allAppealsCode,
                (item) => item.code,
                {
                    columnClassName: styles.code,
                },
            ),
            createLinkColumn<Appeal, string>(
                'operation',
                strings.allAppealsOperation,
                (item) => item.name,
                (item) => ({
                    to: isDefined(item.event)
                        ? generatePath(emergencyRoute.absolutePath, { emergencyId: item.event })
                        : undefined,
                }),
            ),
            createStringColumn<Appeal, string>(
                'dtype',
                strings.allAppealsDisastertype,
                (item) => item.dtype.name,
                { sortable: true },
            ),
            createNumberColumn<Appeal, string>(
                'amount_requested',
                strings.allAppealsRequestedAmount,
                (item) => Number(item.amount_requested),
                { sortable: true },
            ),
            createProgressColumn<Appeal, string>(
                'amount_funded',
                strings.allAppealsFundedAmount,
                // FIXME: use progress bar here
                (item) => 100 * (Number(item.amount_funded) / Number(item.amount_requested)),
                {
                    sortable: true,
                    columnClassName: styles.funding,
                },
            ),
            createLinkColumn<Appeal, string>(
                'country',
                strings.allAppealsCountry,
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

    const heading = resolveToComponent(
        strings.allAppealsHeading,
        { numAppeals: appealsResponse?.count ?? '--' },
    );

    return (
        <Page
            className={styles.allAppeals}
            title={strings.allAppealsTitle}
            heading={heading}
        >
            <Container
                className={styles.appealsTable}
                headerDescriptionClassName={styles.filters}
                headerDescription={(
                    <>
                        <SelectInput
                            label={strings.allAppealsType}
                            name={undefined}
                            value={appealType}
                            onChange={setAppealType}
                            keySelector={appealTypeKeySelector}
                            labelSelector={appealTypeLabelSelector}
                            options={appealTypeOptions}
                        />
                        <SelectInput
                            label={strings.allAppealsDisastertype}
                            name={undefined}
                            value={displacementType}
                            onChange={setDisplacementType}
                            keySelector={disasterTypeKeySelector}
                            labelSelector={disasterTypeLabelSelector}
                            options={displacementTypeWithAll}
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
        </Page>
    );
}

Component.displayName = 'AllAppeals';
