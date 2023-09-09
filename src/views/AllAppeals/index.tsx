import { useMemo } from 'react';
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
import { SortContext } from '#components/Table/useSorting';
import NumberOutput from '#components/NumberOutput';
import Pager from '#components/Pager';
import useTranslation from '#hooks/useTranslation';
import useUrlSearchState from '#hooks/useUrlSearchState';
import { resolveToComponent } from '#utils/translation';
import {
    useRequest,
    type GoApiResponse,
    type GoApiUrlQuery,
} from '#utils/restRequest';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import useFilterState from '#hooks/useFilterState';
import CountrySelectInput from '#components/domain/CountrySelectInput';
import RegionSelectInput from '#components/domain/RegionSelectInput';
import DisasterTypeSelectInput from '#components/domain/DisasterTypeSelectInput';

import i18n from './i18n.json';
import styles from './styles.module.css';

type RegionResponse = GoApiResponse<'/api/v2/region/'>;
type RegionListItem = NonNullable<RegionResponse['results']>[number];

type AppealResponse = GoApiResponse<'/api/v2/appeal/'>;
type AppealQueryParams = GoApiUrlQuery<'/api/v2/appeal/'>;
type AppealListItem = NonNullable<AppealResponse['results']>[number];

type GlobalEnumsResponse = GoApiResponse<'/api/v2/global-enums/'>;
type AppealTypeOption = NonNullable<GlobalEnumsResponse['api_appeal_type']>[number];

const appealKeySelector = (option: AppealListItem) => option.id;
const appealTypeKeySelector = (option: AppealTypeOption) => option.key;
const appealTypeLabelSelector = (option: AppealTypeOption) => option.value;

const PAGE_SIZE = 10;

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    const {
        sortState,
        ordering,
        page,
        setPage,
    } = useFilterState<object>(
        {},
        undefined,
    );

    const { api_appeal_type: appealTypeOptions } = useGlobalEnums();

    const [filterAppealType, setFilterAppealType] = useUrlSearchState<AppealTypeOption['key'] | undefined>(
        'atype',
        (searchValue) => {
            const potentialValue = isDefined(searchValue) ? Number(searchValue) : undefined;
            // FIXME: use enums
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
            // FIXME: use enums
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

    const query = useMemo<AppealQueryParams>(
        () => ({
            limit: PAGE_SIZE,
            offset: PAGE_SIZE * (page - 1),
            ordering,
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
        [page, ordering, filterAppealType, filterDisasterType, filterCountry, filterRegion],
    );
    const {
        pending: appealsPending,
        response: appealsResponse,
    } = useRequest({
        url: '/api/v2/appeal/',
        preserveResponse: true,
        query,
    });

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
                    to: 'emergenciesLayout',
                    urlParams: { emergencyId: item?.event },
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
                    to: 'countriesLayout',
                    urlParams: { countryId: item.country?.id },
                }),
            ),
        ]),
        [strings],
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
                headerDescriptionContainerClassName={styles.filters}
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
                        <DisasterTypeSelectInput
                            placeholder={strings.allAppealsFilterDisastersPlaceholder}
                            label={strings.allAppealsDisasterType}
                            name={undefined}
                            value={filterDisasterType}
                            onChange={setFilterDisasterType}
                        />
                        <RegionSelectInput
                            placeholder={strings.allAppealsFilterRegionPlaceholder}
                            label={strings.allAppealsRegion}
                            name={undefined}
                            value={filterRegion}
                            onChange={setFilterRegion}
                        />
                        <CountrySelectInput
                            placeholder={strings.allAppealsFilterCountryPlaceholder}
                            label={strings.allAppealsCountry}
                            name={undefined}
                            value={filterCountry}
                            onChange={setFilterCountry}
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
