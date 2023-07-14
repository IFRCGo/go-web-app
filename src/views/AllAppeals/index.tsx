import { useState, useMemo, useContext } from 'react';
import { generatePath } from 'react-router-dom';
import { isDefined, isNotDefined } from '@togglecorp/fujs';

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
import { useSortState, SortContext, getOrdering } from '#components/Table/useSorting';
import NumberOutput from '#components/NumberOutput';
import Pager from '#components/Pager';
import useTranslation from '#hooks/useTranslation';
import useUrlSearchState from '#hooks/useUrlSearchState';
import RouteContext from '#contexts/route';
import { resolveToComponent } from '#utils/translation';
import { useRequest } from '#utils/restRequest';
import { paths } from '#generated/types';
import ServerEnumsContext from '#contexts/server-enums';
import { isValidCountry } from '#utils/common';

import i18n from './i18n.json';
import styles from './styles.module.css';

type GetCountry = paths['/api/v2/country/']['get'];
type CountryResponse = GetCountry['responses']['200']['content']['application/json'];
type CountryListItem = NonNullable<CountryResponse['results']>[number];

type GetRegion = paths['/api/v2/region/']['get'];
type RegionResponse = GetRegion['responses']['200']['content']['application/json'];
type RegionListItem = NonNullable<RegionResponse['results']>[number];

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
const countryKeySelector = (item: CountryListItem) => item.id;
const countryLabelSelector = (item: CountryListItem) => item.name ?? '';
const regionKeySelector = (
    item: Omit<RegionListItem, 'name'> & { name: NonNullable<RegionListItem['name']> },
) => item.name;
const regionLabelSelector = (item: RegionListItem) => item.region_name ?? '';

const PAGE_SIZE = 10;

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    const sortState = useSortState();
    const { sorting } = sortState;
    const { api_appeal_type: appealTypeOptions } = useContext(ServerEnumsContext);
    const {
        country: countryRoute,
        emergency: emergencyRoute,
    } = useContext(RouteContext);
    const [page, setPage] = useState(1);

    const [filterAppealType, setFilterAppealType] = useUrlSearchState<AppealTypeOption['key'] | undefined>(
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

    const query = useMemo<AppealQueryParams>(
        () => ({
            limit: PAGE_SIZE,
            offset: PAGE_SIZE * (page - 1),
            ordering: getOrdering(sorting),
            atype: filterAppealType,
            dtype: filterDisasterType,
            country: filterCountry,
            region: filterRegion,
            /*
            // TODO:
            start_date__gte: undefined,
            start_date__gte: undefined,
            */
        }),
        [page, sorting, filterAppealType, filterDisasterType, filterCountry, filterRegion],
    );
    const {
        pending: appealsPending,
        response: appealsResponse,
    } = useRequest<AppealResponse>({
        url: '/api/v2/appeal/',
        preserveResponse: true,
        query,
    });

    const {
        pending: disasterTypePending,
        response: disasterTypeResponse,
    } = useRequest<DisasterTypeResponse>({
        url: '/api/v2/disaster_type/',
    });

    const {
        pending: countryPending,
        response: countryResponse,
    } = useRequest<CountryResponse>({
        url: '/api/v2/country/',
        query: { limit: 500 },
    });

    const {
        pending: regionPending,
        response: regionResponse,
    } = useRequest<RegionResponse>({
        url: '/api/v2/region/',
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
                            placeholder={strings.allAppealsFilterRegionPlaceholder}
                            label={strings.allAppealsRegion}
                            name={undefined}
                            value={filterRegion}
                            onChange={setFilterRegion}
                            keySelector={regionKeySelector}
                            labelSelector={regionLabelSelector}
                            options={regionOptions}
                            disabled={regionPending}
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
