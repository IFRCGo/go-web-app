import {
    useCallback,
    useMemo,
} from 'react';
import {
    Container,
    DateInput,
    NumberOutput,
    Pager,
    Table,
} from '@ifrc-go/ui';
import { SortContext } from '@ifrc-go/ui/contexts';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    createDateColumn,
    createNumberColumn,
    createStringColumn,
    resolveToComponent,
    sumSafe,
} from '@ifrc-go/ui/utils';
import {
    isDefined,
    max,
} from '@togglecorp/fujs';
import { saveAs } from 'file-saver';
import Papa from 'papaparse';

import CountrySelectInput from '#components/domain/CountrySelectInput';
import DisasterTypeSelectInput from '#components/domain/DisasterTypeSelectInput';
import ExportButton from '#components/domain/ExportButton';
import RegionSelectInput from '#components/domain/RegionSelectInput';
import Page from '#components/Page';
import useAlert from '#hooks/useAlert';
import useFilterState from '#hooks/useFilterState';
import useRecursiveCsvExport from '#hooks/useRecursiveCsvRequest';
import useUrlSearchState from '#hooks/useUrlSearchState';
import {
    createCountryListColumn,
    createLinkColumn,
} from '#utils/domain/tableHelpers';
import {
    type GoApiResponse,
    type GoApiUrlQuery,
    useRequest,
} from '#utils/restRequest';

import i18n from './i18n.json';
import styles from './styles.module.css';

type RegionResponse = GoApiResponse<'/api/v2/region/'>;
type RegionListItem = NonNullable<RegionResponse['results']>[number];

type EventResponse = GoApiResponse<'/api/v2/event/'>;
type EventQueryParams = GoApiUrlQuery<'/api/v2/event/'>;
type EventListItem = NonNullable<EventResponse['results']>[number];

function getMostRecentAffectedValue(fieldReport: EventListItem['field_reports']) {
    const latestReport = max(fieldReport, (item) => new Date(item.updated_at).getTime());
    return latestReport?.num_affected;
}

const eventKeySelector = (item: EventListItem) => item.id;

/** @knipignore */
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
        rawFilter,
        filter,
        setFilterField,
        filtered,
    } = useFilterState<{
        startDateAfter?: string,
        startDateBefore?: string,
    }>({
        filter: {},
        pageSize: 15,
    });
    const alert = useAlert();

    const columns = useMemo(
        () => ([
            createDateColumn<EventListItem, number>(
                'disaster_start_date',
                strings.allEmergenciesDate,
                (item) => item.disaster_start_date,
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
                {
                    suffix: ' CHF',
                },
            ),
            createNumberColumn<EventListItem, number>(
                'num_affected',
                strings.allEmergenciesAffected,
                (item) => item.num_affected ?? getMostRecentAffectedValue(item.field_reports),
                { sortable: true },
            ),
            createCountryListColumn<EventListItem, number>(
                'countries',
                strings.allEmergenciesCountry,
                (item) => item.countries,
            ),
        ]),
        [
            strings.allEmergenciesDate,
            strings.allEmergenciesName,
            strings.allEmergenciesDisasterType,
            strings.allEmergenciesGlide,
            strings.allEmergenciesRequestedAmt,
            strings.allEmergenciesAffected,
            strings.allEmergenciesCountry,
        ],
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
            // FIXME: The server should actually accept array of number instead
            // of just number
            regions__in: isDefined(filterRegion) ? filterRegion : undefined,
            countries__in: filterCountry,
            disaster_start_date__gte: filter.startDateAfter,
            disaster_start_date__lte: filter.startDateBefore,
        }),
        [
            limit,
            offset,
            ordering,
            filterDisasterType,
            filterRegion,
            filterCountry,
            filter,
        ],
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
        [eventResponse, strings.allEmergenciesHeading],
    );

    const [
        pendingExport,
        progress,
        triggerExportStart,
    ] = useRecursiveCsvExport({
        onFailure: () => {
            alert.show(
                strings.failedToCreateExport,
                { variant: 'danger' },
            );
        },
        onSuccess: (data) => {
            const unparseData = Papa.unparse(data);
            const blob = new Blob(
                [unparseData],
                { type: 'text/csv' },
            );
            saveAs(blob, 'all-emergencies.csv');
        },
    });

    const handleExportClick = useCallback(() => {
        if (!eventResponse?.count) {
            return;
        }
        triggerExportStart(
            '/api/v2/event/',
            eventResponse?.count,
            query,
        );
    }, [
        query,
        triggerExportStart,
        eventResponse?.count,
    ]);

    const isFiltered = isDefined(filterDisasterType)
        || isDefined(filterRegion)
        || isDefined(filterCountry)
        || filtered;

    return (
        <Page
            className={styles.allEmergencies}
            title={strings.allEmergenciesTitle}
            heading={heading}
        >
            <Container
                contentViewType="vertical"
                filters={(
                    <>
                        <DateInput
                            name="startDateAfter"
                            label={strings.allEmergenciesTableFilterStartAfter}
                            onChange={setFilterField}
                            value={rawFilter.startDateAfter}
                        />
                        <DateInput
                            name="startDateBefore"
                            label={strings.allEmergenciesTableFilterStartBefore}
                            onChange={setFilterField}
                            value={rawFilter.startDateBefore}
                        />
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
                    </>
                )}
                actions={(
                    <ExportButton
                        onClick={handleExportClick}
                        progress={progress}
                        pendingExport={pendingExport}
                        totalCount={eventResponse?.count}
                    />
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
