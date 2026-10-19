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
import { max } from '@togglecorp/fujs';
import { saveAs } from 'file-saver';
import Papa from 'papaparse';

import CountrySelectInput from '#components/domain/CountrySelectInput';
import DisasterTypeSelectInput from '#components/domain/DisasterTypeSelectInput';
import ExportButton from '#components/domain/ExportButton';
import RegionSelectInput from '#components/domain/RegionSelectInput';
import Page from '#components/Page';
import useAlert from '#hooks/useAlert';
import useFilterState, { type UrlParams } from '#hooks/useFilterState';
import useRecursiveCsvExport from '#hooks/useRecursiveCsvRequest';
import { regionKeyList } from '#utils/constants';
import {
    createCountryListColumn,
    createLinkColumn,
} from '#utils/domain/tableHelpers';
import {
    type GoApiResponse,
    type GoApiUrlQuery,
    useRequest,
} from '#utils/restRequest';
import urlParam from '#utils/urlParam';

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

interface EventFilter {
    startDateAfter?: string;
    startDateBefore?: string;
    disasterType?: number;
    region?: RegionListItem['name'];
    country?: number;
}

const eventUrlParams: UrlParams<EventFilter> = {
    disasterType: urlParam.number('dtype'),
    region: urlParam.oneOf('region', regionKeyList),
    country: urlParam.number('country'),
};

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
    } = useFilterState<EventFilter>({
        filter: {},
        urlParams: eventUrlParams,
        ordering: { name: 'disaster_start_date', direction: 'dsc' },
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
                'name',
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
                // FIXME(frozenhelium): go-api, ordering by num_affected uses
                // the raw event field which is empty for most ongoing
                // emergencies; expose a sortable value that falls back to the
                // latest field report figure like the one displayed here
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

    const query = useMemo<EventQueryParams>(
        () => ({
            limit,
            offset,
            ordering,
            dtype: filter.disasterType,
            // FIXME: The server should actually accept array of number instead
            // of just number
            regions__in: filter.region,
            countries__in: filter.country,
            disaster_start_date__gte: filter.startDateAfter,
            disaster_start_date__lte: filter.startDateBefore,
        }),
        [
            limit,
            offset,
            ordering,
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

    return (
        <Page
            className={styles.allEmergencies}
            title={strings.allEmergenciesTitle}
            heading={heading}
        >
            <Container
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
                            name="disasterType"
                            value={rawFilter.disasterType}
                            onChange={setFilterField}
                        />
                        <RegionSelectInput
                            placeholder={strings.allEmergenciesFilterRegionPlaceholder}
                            label={strings.allEmergenciesRegion}
                            name="region"
                            value={rawFilter.region}
                            onChange={setFilterField}
                        />
                        <CountrySelectInput
                            placeholder={strings.allEmergenciesFilterCountryPlaceholder}
                            label={strings.allEmergenciesCountry}
                            name="country"
                            value={rawFilter.country}
                            onChange={setFilterField}
                        />
                    </>
                )}
                headerActions={(
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
                        filtered={filtered}
                    />
                </SortContext.Provider>
            </Container>
        </Page>
    );
}

Component.displayName = 'AllEmergencies';
