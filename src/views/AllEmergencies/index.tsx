import {
    useState,
    useMemo,
    useContext,
} from 'react';
import { generatePath } from 'react-router-dom';
import { isDefined, isNotDefined } from '@togglecorp/fujs';

import Page from '#components/Page';
import { useSortState, SortContext, getOrdering } from '#components/Table/useSorting';
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
import type { GoApiResponse, GoApiUrlQuery } from '#utils/restRequest';
import { sumSafe } from '#utils/common';
import { isValidCountry } from '#utils/domain/country';

import i18n from './i18n.json';
import styles from './styles.module.css';

const PAGE_SIZE = 15;

type CountryResponse = GoApiResponse<'/api/v2/country/'>;
type CountryListItem = NonNullable<CountryResponse['results']>[number];

type RegionResponse = GoApiResponse<'/api/v2/region/'>;
type RegionListItem = NonNullable<RegionResponse['results']>[number];

type DisasterTypeResponse = GoApiResponse<'/api/v2/disaster_type/'>;
type DisasterListItem = NonNullable<DisasterTypeResponse['results']>[number];

type EventResponse = GoApiResponse<'/api/v2/event/'>;
type EventQueryParams = GoApiUrlQuery<'/api/v2/event/'>;
type EventListItem = NonNullable<EventResponse['results']>[number];

const eventKeySelector = (item: EventListItem) => item.id;
const disasterTypeKeySelector = (item: DisasterListItem) => item.id;
const disasterTypeLabelSelector = (item: DisasterListItem) => item.name ?? '';
const countryKeySelector = (item: CountryListItem) => item.id;
const countryLabelSelector = (item: CountryListItem) => item.name ?? '';
const regionKeySelector = (
    item: Omit<RegionListItem, 'name'> & { name: NonNullable<RegionListItem['name']> },
) => item.name;
const regionLabelSelector = (item: RegionListItem) => item.region_name ?? '';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    const sortState = useSortState({ name: 'created_at', direction: 'dsc' });
    const { sorting } = sortState;

    const { emergency: emergencyRoute } = useContext(RouteContext);

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
                (item) => item.dtype?.name,
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
            ),
        ]),
        [strings, emergencyRoute],
    );

    const [filterDisasterType, setFilterDisasterType] = useUrlSearchState<DisasterListItem['id'] | undefined>(
        'dtype',
        (searchValue) => {
            const potentialValue = isDefined(searchValue) ? Number(searchValue) : undefined;
            return potentialValue;
        },
        (dtype) => dtype,
    );
    const [filterRegion, setFilterRegion] = useUrlSearchState<RegionListItem['name'] | undefined>(
        'region',
        (searchValue) => {
            const potentialValue = isDefined(searchValue) ? Number(searchValue) : undefined;
            if (potentialValue === 0
                || potentialValue === 1
                || potentialValue === 2
                || potentialValue === 3
                || potentialValue === 4
            ) {
                return potentialValue;
            }

            return undefined;
        },
        (regionId) => regionId,
    );
    const [filterCountry, setFilterCountry] = useUrlSearchState<DisasterListItem['id'] | undefined>(
        'country',
        (searchValue) => {
            const potentialValue = isDefined(searchValue) ? Number(searchValue) : undefined;
            return potentialValue;
        },
        (country) => country,
    );

    const [page, setPage] = useState(1);

    const query = useMemo<EventQueryParams>(
        () => ({
            limit: PAGE_SIZE,
            offset: PAGE_SIZE * (page - 1),
            ordering: getOrdering(sorting),
            dtype: filterDisasterType,
            region: filterRegion,
            countries__in: filterCountry,
        }),
        [page, filterDisasterType, filterRegion, filterCountry, sorting],
    );

    const {
        pending: eventPending,
        response: eventResponse,
    } = useRequest({
        url: '/api/v2/event/',
        preserveResponse: true,
        query,
    });

    const {
        pending: disasterTypePending,
        response: disasterTypeResponse,
    } = useRequest({
        url: '/api/v2/disaster_type/',
    });

    const {
        pending: regionPending,
        response: regionResponse,
    } = useRequest({
        url: '/api/v2/region/',
    });

    const {
        pending: countryPending,
        response: countryResponse,
    } = useRequest({
        url: '/api/v2/country/',
        query: { limit: 500 },
    });

    const countryOptions = useMemo(
        () => countryResponse?.results?.filter(isValidCountry),
        [countryResponse],
    );

    const regionOptions = useMemo(
        () => (
            regionResponse?.results?.map(
                (region) => {
                    if (isNotDefined(region.name)) {
                        return undefined;
                    }

                    return {
                        ...region,
                        name: region.name,
                    };
                },
            ).filter(isDefined)
        ),
        [regionResponse],
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
                headerDescriptionContainerClassName={styles.filters}
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
                            placeholder={strings.allEmergenciesFilterRegionPlaceholder}
                            label={strings.allEmergenciesRegion}
                            name={undefined}
                            value={filterRegion}
                            onChange={setFilterRegion}
                            keySelector={regionKeySelector}
                            labelSelector={regionLabelSelector}
                            options={regionOptions}
                            disabled={regionPending}
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
                        filtered={false}
                    />
                </SortContext.Provider>
            </Container>
        </Page>
    );
}

Component.displayName = 'AllEmergencies';
