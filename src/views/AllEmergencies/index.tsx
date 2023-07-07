import {
    useState,
    useMemo,
    useContext,
} from 'react';
import { generatePath } from 'react-router-dom';
import { isDefined } from '@togglecorp/fujs';

import Page from '#components/Page';
import { useSortState, SortContext } from '#components/Table/useSorting';
import Table from '#components/Table';
import Container from '#components/Container';
import {
    createStringColumn,
    createDateColumn,
    createNumberColumn,
    createLinkColumn,
    createCountryListColumn,
} from '#components/Table/ColumnShortcuts';
import NumberOutput from '#components/NumberOutput';
import SelectInput from '#components/SelectInput';
import Pager from '#components/Pager';
import useTranslation from '#hooks/useTranslation';
import useUrlSearchState from '#hooks/useUrlSearchState';
import RouteContext from '#contexts/route';
import { resolveToComponent } from '#utils/translation';
import { useRequest } from '#utils/restRequest';
import { isValidCountry, sumSafe } from '#utils/common';
import { paths } from '#generated/types';

import i18n from './i18n.json';
import styles from './styles.module.css';

const PAGE_SIZE = 15;

type GetCountry = paths['/api/v2/country/']['get'];
type CountryResponse = GetCountry['responses']['200']['content']['application/json'];
type CountryListItem = NonNullable<CountryResponse['results']>[number];

type GetDisasterType = paths['/api/v2/disaster_type/']['get'];
type DisasterTypeResponse = GetDisasterType['responses']['200']['content']['application/json'];
type DisasterListItem = NonNullable<DisasterTypeResponse['results']>[number];

type GetEvent = paths['/api/v2/event/']['get'];
type EventResponse = GetEvent['responses']['200']['content']['application/json'];
type EventListItem = NonNullable<EventResponse['results']>[number];

const eventKeySelector = (item: EventListItem) => item.id;
const disasterTypeKeySelector = (item: DisasterListItem) => item.id;
const disasterTypeLabelSelector = (item: DisasterListItem) => item.name ?? '';
const countryKeySelector = (item: CountryListItem) => item.id;
const countryLabelSelector = (item: CountryListItem) => item.name ?? '';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    const sortState = useSortState({ name: 'created_at', direction: 'dsc' });
    const { sorting } = sortState;

    const {
        country: countryRoute,
        emergency: emergencyRoute,
    } = useContext(RouteContext);

    const columns = useMemo(
        () => ([
            createDateColumn<EventListItem, number>(
                'created_at',
                strings.allEmergenciesDate,
                (item) => item.created_at,
                {
                    sortable: true,
                    columnClassName: styles.createdAt,
                },
            ),
            createLinkColumn<EventListItem, number>(
                'event_name',
                strings.allEmergenciesName,
                (item) => item.name,
                (item) => ({
                    to: generatePath(emergencyRoute.absolutePath, { emergencyId: item.id }),
                }),
            ),
            createStringColumn<EventListItem, number>(
                'dtype',
                strings.allEmergenciesDisasterType,
                (item) => item.dtype.name,
            ),
            createStringColumn<EventListItem, number>(
                'glide',
                strings.allEmergenciesGlide,
                // FIXME: empty string from server
                (item) => item.glide || '-',
            ),
            createNumberColumn<EventListItem, number>(
                'amount_requested',
                strings.allEmergenciesRequestedAmt,
                (item) => sumSafe(
                    item.appeals.map((appeal) => Number(appeal.amount_requested)),
                ),
            ),
            createCountryListColumn<EventListItem, number>(
                'countries',
                strings.allEmergenciesCountry,
                (item) => item.countries,
                countryRoute.absolutePath,
            ),
        ]),
        [strings, emergencyRoute, countryRoute],
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

    let ordering;
    if (sorting) {
        ordering = sorting.direction === 'dsc'
            ? `-${sorting.name}`
            : sorting.name;
    }

    const [page, setPage] = useState(0);
    const {
        pending: eventPending,
        response: eventResponse,
    } = useRequest<EventResponse>({
        url: 'api/v2/event/',
        preserveResponse: true,
        query: {
            limit: PAGE_SIZE,
            offset: PAGE_SIZE * (page - 1),
            ordering,
            dtype: filterDisasterType,
            countries__in: filterCountry,
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

    const heading = useMemo(
        () => resolveToComponent(
            strings.allEmergenciesHeading,
            {
                numEmergencies: (
                    <NumberOutput
                        value={eventResponse?.count}
                    />
                ),
            },
        ),
        [eventResponse, strings],
    );

    return (
        <Page
            className={styles.allEmergencies}
            title={strings.allEmergenciesTitle}
            heading={heading}
        >
            <Container
                className={styles.emergenciesTable}
                headerDescriptionClassName={styles.filters}
                headerDescription={(
                    <>
                        <SelectInput
                            placeholder={strings.allEmergenciesFilterDisastersPlaceholder}
                            label={strings.allEmergenciesDisasterType}
                            name={undefined}
                            value={filterDisasterType}
                            onChange={setFilterDisasterType}
                            keySelector={disasterTypeKeySelector}
                            labelSelector={disasterTypeLabelSelector}
                            options={disasterTypeResponse?.results}
                            disabled={disasterTypePending}
                        />
                        <SelectInput
                            placeholder={strings.allEmergenciesFilterCountryPlaceholder}
                            label={strings.allEmergenciesCountry}
                            name={undefined}
                            value={filterCountry}
                            onChange={setFilterCountry}
                            keySelector={countryKeySelector}
                            labelSelector={countryLabelSelector}
                            options={countryOptions}
                            disabled={countryPending}
                        />
                        <div />
                    </>
                )}
                footerActions={(
                    <Pager
                        activePage={page}
                        itemsCount={eventResponse?.count ?? 0}
                        maxItemsPerPage={PAGE_SIZE}
                        onActivePageChange={setPage}
                    />
                )}
            >
                <SortContext.Provider value={sortState}>
                    <Table
                        pending={eventPending}
                        className={styles.table}
                        columns={columns}
                        keySelector={eventKeySelector}
                        data={eventResponse?.results}
                    />
                </SortContext.Provider>
            </Container>
        </Page>
    );
}

Component.displayName = 'AllEmergencies';
