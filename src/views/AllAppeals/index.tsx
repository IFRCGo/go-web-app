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
import NumberOutput from '#components/NumberOutput';
import Pager from '#components/Pager';
import useTranslation from '#hooks/useTranslation';
import useUrlSearchState from '#hooks/useUrlSearchState';
import RouteContext from '#contexts/route';
import { resolveToComponent } from '#utils/translation';
import { useRequest } from '#utils/restRequest';
import { paths, components } from '#generated/types';
import { isValidCountry } from '#utils/common';

import i18n from './i18n.json';
import styles from './styles.module.css';

type GetCountry = paths['/api/v2/country/']['get'];
type CountryResponse = GetCountry['responses']['200']['content']['application/json'];
type CountryListItem = NonNullable<CountryResponse['results']>[number];

type GetAppeal = paths['/api/v2/appeal/']['get'];
type AppealResponse = GetAppeal['responses']['200']['content']['application/json'];
type AppealListItem = NonNullable<AppealResponse['results']>[number];

type GetDisasterType = paths['/api/v2/disaster_type/']['get'];
type DisasterTypeResponse = GetDisasterType['responses']['200']['content']['application/json'];
type DisasterListItem = NonNullable<DisasterTypeResponse['results']>[number];

const appealKeySelector = (item: AppealListItem) => item.id;
const appealTypeKeySelector = (item: AppealType) => item.value;
const appealTypeLabelSelector = (item: AppealType) => item.label;
const disasterTypeKeySelector = (item: DisasterListItem) => item.id;
const disasterTypeLabelSelector = (item: DisasterListItem) => item.name ?? '';
const countryKeySelector = (item: CountryListItem) => item.id;
const countryLabelSelector = (item: CountryListItem) => item.name ?? '';

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

const PAGE_SIZE = 10;

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
    const [page, setPage] = useState(0);

    const [filterAppealType, setFilterAppealType] = useUrlSearchState<AppealType['value'] | undefined>(
        'atype',
        (searchValue) => {
            const potentialValue = isDefined(searchValue) ? Number(searchValue) : undefined;
            if (potentialValue === 0
                || potentialValue === 1
                || potentialValue === 2
                || potentialValue === 3
            ) {
                return potentialValue;
            }

            return undefined;
        },
        (atype) => atype,
    );
    const [filterDisasterType, setFilterDisasterType] = useUrlSearchState<DisasterListItem['id'] | undefined>(
        'dtype',
        (searchValue) => {
            const potentialValue = isDefined(searchValue) ? Number(searchValue) : undefined;
            return potentialValue;
        },
        (dtype) => dtype,
    );
    const [filterCountry, setFilterCountry] = useUrlSearchState<DisasterListItem['id'] | undefined>(
        'country',
        (searchValue) => {
            const potentialValue = isDefined(searchValue) ? Number(searchValue) : undefined;
            return potentialValue;
        },
        (country) => country,
    );

    const {
        pending: appealsPending,
        response: appealsResponse,
    } = useRequest<AppealResponse>({
        url: 'api/v2/appeal/',
        preserveResponse: true,
        query: {
            limit: PAGE_SIZE,
            offset: PAGE_SIZE * (page - 1),
            ordering,
            atype: filterAppealType,
            dtype: filterDisasterType,
            country: filterCountry,
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
    } = useRequest<DisasterTypeResponse>({
        url: 'api/v2/disaster_type/',
    });

    const {
        pending: countryPending,
        response: countryResponse,
    } = useRequest<CountryResponse>({
        url: 'api/v2/country/',
        query: { limit: 500 },
    });

    const countryOptions = useMemo(
        () => countryResponse?.results?.filter(isValidCountry),
        [countryResponse],
    );

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
                    to: isDefined(item.event)
                        ? generatePath(emergencyRoute.absolutePath, { emergencyId: item.event })
                        : undefined,
                }),
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
                (item) => Number(item.amount_requested),
                { sortable: true },
            ),
            createProgressColumn<AppealListItem, string>(
                'amount_funded',
                strings.allAppealsFundedAmount,
                // FIXME: use progress bar here
                (item) => 100 * (Number(item.amount_funded) / Number(item.amount_requested)),
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
                    to: generatePath(
                        countryRoute.absolutePath,
                        { countryId: String(item.country?.id) },
                    ),
                }),
            ),
        ]),
        [strings, countryRoute, emergencyRoute],
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
        [appealsResponse, strings],
    );

    const isFilterApplied = isDefined(filterDisasterType)
        || isDefined(filterAppealType)
        || isDefined(filterCountry);

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
                            placeholder={strings.allAppealsFilterAppealsPlaceholder}
                            label={strings.allAppealsType}
                            name={undefined}
                            value={filterAppealType}
                            onChange={setFilterAppealType}
                            keySelector={appealTypeKeySelector}
                            labelSelector={appealTypeLabelSelector}
                            options={appealTypeOptions}
                        />
                        <SelectInput
                            placeholder={strings.allAppealsFilterDisastersPlaceholder}
                            label={strings.allAppealsDisasterType}
                            name={undefined}
                            value={filterDisasterType}
                            onChange={setFilterDisasterType}
                            keySelector={disasterTypeKeySelector}
                            labelSelector={disasterTypeLabelSelector}
                            options={disasterTypeResponse?.results}
                            disabled={disasterTypePending}
                        />
                        <SelectInput
                            placeholder={strings.allAppealsFilterCountryPlaceholder}
                            label={strings.allAppealsCountry}
                            name={undefined}
                            value={filterCountry}
                            onChange={setFilterCountry}
                            keySelector={countryKeySelector}
                            labelSelector={countryLabelSelector}
                            options={countryOptions}
                            disabled={countryPending}
                        />
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
                        filtered={isFilterApplied}
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
