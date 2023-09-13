import {
    useMemo,
} from 'react';
import { isDefined } from '@togglecorp/fujs';

import Page from '#components/Page';
import { SortContext } from '#components/Table/useSorting';
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
import Pager from '#components/Pager';
import useTranslation from '#hooks/useTranslation';
import useUrlSearchState from '#hooks/useUrlSearchState';
import useFilterState from '#hooks/useFilterState';
import { resolveToComponent } from '#utils/translation';
import {
    useRequest,
    type GoApiResponse,
    type GoApiUrlQuery,
} from '#utils/restRequest';
import { sumSafe } from '#utils/common';
import CountrySelectInput from '#components/domain/CountrySelectInput';
import RegionSelectInput from '#components/domain/RegionSelectInput';
import DisasterTypeSelectInput from '#components/domain/DisasterTypeSelectInput';

import i18n from './i18n.json';
import styles from './styles.module.css';

type RegionResponse = GoApiResponse<'/api/v2/region/'>;
type RegionListItem = NonNullable<RegionResponse['results']>[number];

type EventResponse = GoApiResponse<'/api/v2/event/'>;
type EventQueryParams = GoApiUrlQuery<'/api/v2/event/'>;
type EventListItem = NonNullable<EventResponse['results']>[number];

const eventKeySelector = (item: EventListItem) => item.id;

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    const {
        sortState,
        ordering,
        page,
        setPage,
        limit,
        offset,
    } = useFilterState<object>(
        {},
        { name: 'created_at', direction: 'dsc' },
        1,
        15,
    );

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
                    to: 'emergenciesLayout',
                    urlParams: { emergencyId: item.id },
                }),
                { sortable: true },
            ),
            createStringColumn<EventListItem, number>(
                'dtype',
                strings.allEmergenciesDisasterType,
                (item) => item.dtype?.name,
            ),
            createStringColumn<EventListItem, number>(
                'glide',
                strings.allEmergenciesGlide,
                (item) => item.glide,
                { sortable: true },
            ),
            createNumberColumn<EventListItem, number>(
                'amount_requested',
                strings.allEmergenciesRequestedAmt,
                (item) => sumSafe(
                    item.appeals.map((appeal) => appeal.amount_requested),
                ),
                { sortable: true },
            ),
            createNumberColumn<EventListItem, number>(
                'num_affected',
                strings.allEmergenciesAffected,
                (item) => item.num_affected,
                { sortable: true },
            ),
            createCountryListColumn<EventListItem, number>(
                'countries',
                strings.allEmergenciesCountry,
                (item) => item.countries,
            ),
        ]),
        [strings],
    );

    const [filterDisasterType, setFilterDisasterType] = useUrlSearchState<number | undefined>(
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
            // FIXME: use region enum
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
    const [filterCountry, setFilterCountry] = useUrlSearchState<number | undefined>(
        'country',
        (searchValue) => {
            const potentialValue = isDefined(searchValue) ? Number(searchValue) : undefined;
            return potentialValue;
        },
        (country) => country,
    );

    const query = useMemo<EventQueryParams>(
        () => ({
            limit,
            offset,
            ordering,
            dtype: filterDisasterType,
            region: filterRegion,
            countries__in: filterCountry,
        }),
        [limit, offset, ordering, filterDisasterType, filterRegion, filterCountry],
    );

    const {
        pending: eventPending,
        response: eventResponse,
    } = useRequest({
        url: '/api/v2/event/',
        preserveResponse: true,
        query,
    });

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

    const isFiltered = isDefined(filterDisasterType)
        || isDefined(filterRegion)
        || isDefined(filterCountry);

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
                        <DisasterTypeSelectInput
                            placeholder={strings.allEmergenciesFilterDisastersPlaceholder}
                            label={strings.allEmergenciesDisasterType}
                            name={undefined}
                            value={filterDisasterType}
                            onChange={setFilterDisasterType}
                        />
                        <RegionSelectInput
                            placeholder={strings.allEmergenciesFilterRegionPlaceholder}
                            label={strings.allEmergenciesRegion}
                            name={undefined}
                            value={filterRegion}
                            onChange={setFilterRegion}
                        />
                        <CountrySelectInput
                            placeholder={strings.allEmergenciesFilterCountryPlaceholder}
                            label={strings.allEmergenciesCountry}
                            name={undefined}
                            value={filterCountry}
                            onChange={setFilterCountry}
                        />
                        <div />
                    </>
                )}
                footerActions={(
                    <Pager
                        activePage={page}
                        itemsCount={eventResponse?.count ?? 0}
                        maxItemsPerPage={limit}
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
                        filtered={isFiltered}
                    />
                </SortContext.Provider>
            </Container>
        </Page>
    );
}

Component.displayName = 'AllEmergencies';
