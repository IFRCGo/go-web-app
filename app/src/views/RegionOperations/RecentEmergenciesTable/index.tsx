import { useMemo } from 'react';
import {
    Container,
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
    isNotDefined,
    max,
} from '@togglecorp/fujs';

import Link from '#components/Link';
import useFilterState from '#hooks/useFilterState';
import {
    createBudgetColumn,
    createCountryListColumn,
    createDisasterTypeColumn,
    createEventColumn,
} from '#utils/domain/tableHelpers';
import {
    type GoApiResponse,
    useRequest,
} from '#utils/restRequest';

import i18n from './i18n.json';

type EventResponse = GoApiResponse<'/api/v2/event/'>;
type EventListItem = NonNullable<EventResponse['results']>[number];

// FIXME: use a separate utility
const thirtyDaysAgo = new Date();
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
thirtyDaysAgo.setHours(0, 0, 0, 0);

function getMostRecentAffectedValue(fieldReport: EventListItem['field_reports']) {
    const latestReport = max(fieldReport, (item) => new Date(item.updated_at).getTime());
    return latestReport?.num_affected;
}

const keySelector = (item: EventListItem) => item.id;

interface Props {
    regionId: number;
}

function EventItemsTable(props: Props) {
    const { regionId } = props;
    const strings = useTranslation(i18n);
    const {
        sortState,
        ordering,
        page,
        setPage,
        limit,
        offset,
    } = useFilterState<object>({
        filter: {},
        pageSize: 5,
    });

    const columns = useMemo(
        () => ([
            createDateColumn<EventListItem, number>(
                'created_at',
                strings.regionEmergenciesTableDate,
                (item) => item.created_at,
                { sortable: true },
            ),
            createEventColumn<EventListItem, number>(
                'name',
                strings.regionEmergenciesTableName,
                (item) => item.name,
                (item) => ({
                    to: 'emergenciesLayout',
                    urlParams: { emergencyId: item.id },
                }),
                { sortable: true },
            ),
            createDisasterTypeColumn<EventListItem, number>(
                'dtype',
                strings.regionEmergenciesTableDisasterType,
                (item) => item.dtype?.name,
            ),
            createStringColumn<EventListItem, number>(
                'glide',
                strings.regionEmergenciesTableGlide,
                (item) => item.glide,
                { sortable: true },
            ),
            createBudgetColumn<EventListItem, number>(
                'amount_requested',
                strings.regionEmergenciesTableRequestedAmt,
                (item) => sumSafe(
                    item.appeals.map((appeal) => appeal.amount_requested),
                ),
            ),
            createNumberColumn<EventListItem, number>(
                'num_affected',
                strings.regionEmergenciesTableNumberAffected,
                (item) => item.num_affected ?? getMostRecentAffectedValue(item.field_reports),
                { sortable: true },
            ),
            createCountryListColumn<EventListItem, number>(
                'countries',
                strings.regionEmergenciesTableCountry,
                (item) => item.countries,
            ),
        ]),
        [
            strings.regionEmergenciesTableDate,
            strings.regionEmergenciesTableName,
            strings.regionEmergenciesTableDisasterType,
            strings.regionEmergenciesTableGlide,
            strings.regionEmergenciesTableRequestedAmt,
            strings.regionEmergenciesTableNumberAffected,
            strings.regionEmergenciesTableCountry,
        ],
    );

    const defaultOrdering = '-created_at';
    const orderingWithFallback = useMemo(() => {
        if (isNotDefined(ordering)) {
            return defaultOrdering;
        }

        if (ordering === '-id') {
            return '-created_at,-id';
        }

        if (ordering === 'created_at' || ordering === '-created_at') {
            return ordering;
        }

        // Add default ordering as second ordering
        return [ordering, defaultOrdering].join(',');
    }, [ordering]);

    const {
        pending: eventPending,
        response: eventResponse,
    } = useRequest({
        url: '/api/v2/event/',
        preserveResponse: true,
        query: {
            limit,
            offset,
            ordering: orderingWithFallback,
            disaster_start_date__gt: thirtyDaysAgo.toISOString(),
            regions__in: regionId,
        },
    });

    const heading = useMemo(
        () => (
            resolveToComponent(
                strings.regionEmergenciesTableTitle,
                { numEmergencies: <NumberOutput value={eventResponse?.count} /> },
            )
        ),
        [strings.regionEmergenciesTableTitle, eventResponse],
    );

    return (
        <Container
            heading={heading}
            withHeaderBorder
            headerActions={(
                <Link
                    to="allEmergencies"
                    urlSearch={`region=${regionId}`}
                    withLinkIcon
                    withUnderline
                >
                    {strings.regionEmergenciesTableViewAll}
                </Link>
            )}
            footerActions={(
                <Pager
                    activePage={page}
                    itemsCount={eventResponse?.count ?? 0}
                    maxItemsPerPage={limit}
                    onActivePageChange={setPage}
                />
            )}
            withLargeBreakpointInHeader
        >
            <SortContext.Provider value={sortState}>
                <Table
                    filtered={false}
                    pending={eventPending}
                    columns={columns}
                    keySelector={keySelector}
                    data={eventResponse?.results}
                />
            </SortContext.Provider>
        </Container>
    );
}

export default EventItemsTable;
