import {
    useMemo,
    useState,
} from 'react';
import { isTruthyString, max } from '@togglecorp/fujs';
import useTranslation from '#hooks/useTranslation';
import Link from '#components/Link';
import { useRequest, type GoApiResponse } from '#utils/restRequest';
import { resolveToComponent } from '#utils/translation';
import {
    useSortState,
    SortContext,
    getOrdering,
} from '#components/Table/useSorting';
import {
    createStringColumn,
    createNumberColumn,
    createDateColumn,
    createLinkColumn,
} from '#components/Table/ColumnShortcuts';
import Table from '#components/Table';
import Container from '#components/Container';
import Pager from '#components/Pager';

import i18n from './i18n.json';

type EmergenciesTableItem = NonNullable<GoApiResponse<'/api/v2/event/'>['results']>[number];
function keySelector(emergency: EmergenciesTableItem) {
    return emergency.id;
}

const PAGE_SIZE = 10;

// FIXME: use a separate utility
const thirtyDaysAgo = new Date();
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
thirtyDaysAgo.setHours(0, 0, 0, 0);

const disasterStartDate = thirtyDaysAgo.toISOString();

function getMostRecentAffectedValue(fieldReport: EmergenciesTableItem['field_reports']) {
    const latestReport = max(fieldReport, (item) => new Date(item.updated_at).getTime());
    return latestReport?.num_affected;
}

interface Props {
    countryId: number;
    countryName?: string;
}

function EmergenciesOperationTable(props: Props) {
    const {
        countryId,
        countryName,
    } = props;

    const [page, setPage] = useState(1);

    const strings = useTranslation(i18n);

    const sortState = useSortState();
    const { sorting } = sortState;

    const columns = useMemo(
        () => ([
            createDateColumn<EmergenciesTableItem, number>(
                'disaster_start_date',
                strings.emergenciesTableStartDate,
                (item) => item.disaster_start_date,
                { sortable: true },
            ),
            createLinkColumn<EmergenciesTableItem, number>(
                'name',
                strings.emergenciesTableName,
                (item) => item.name,
                (item) => ({
                    to: 'emergenciesLayout',
                    urlParams: { emergencyId: item.id },
                }),
                { sortable: true },
            ),
            createStringColumn<EmergenciesTableItem, number>(
                'dtype',
                strings.emergenciesTableDisasterType,
                // FIXME: the typing for server should be fixed
                (item) => item.dtype?.name,
            ),
            createStringColumn<EmergenciesTableItem, number>(
                'glide',
                strings.emergenciesTableGlide,
                (item) => item.glide,
                { sortable: true },
            ),
            createNumberColumn<EmergenciesTableItem, number>(
                'amount_requested',
                strings.emergenciesTableRequestedAmount,
                (item) => {
                    const value = item.appeals[0]?.amount_requested;
                    return isTruthyString(value) ? Number(value) : undefined;
                },
            ),
            createNumberColumn<EmergenciesTableItem, number>(
                'num_affected',
                strings.emergenciesTableAffected,
                (item) => item.num_affected ?? getMostRecentAffectedValue(item.field_reports),
            ),
        ]),
        [strings],
    );

    const {
        pending: countryEmergenciesPending,
        response: countryEmergenciesResponse,
    } = useRequest({
        url: '/api/v2/event/',
        preserveResponse: true,
        query: {
            limit: PAGE_SIZE,
            offset: PAGE_SIZE * (page - 1),
            countries__in: countryId,
            ordering: getOrdering(sorting),
            disaster_start_date__gte: disasterStartDate,
        },
    });

    const viewAllEmergenciesLinkLabel = resolveToComponent(
        strings.emergenciesTableAllEmergenciesLinkLabel,
        { name: countryName },
    );

    const emergenciesHeading = resolveToComponent(
        strings.emergenciesTableHeading,
        { count: countryEmergenciesResponse?.count },
    );

    return (
        <Container
            heading={emergenciesHeading}
            withHeaderBorder
            actions={(
                <Link
                    to="allEmergencies"
                    urlSearch={`country=${countryId}`}
                    withForwardIcon
                    withUnderline
                >
                    {viewAllEmergenciesLinkLabel}
                </Link>
            )}
            footerActions={(
                <Pager
                    activePage={page}
                    itemsCount={countryEmergenciesResponse?.count ?? 0}
                    maxItemsPerPage={PAGE_SIZE}
                    onActivePageChange={setPage}
                />
            )}
        >
            <SortContext.Provider value={sortState}>
                <Table
                    filtered={false}
                    pending={countryEmergenciesPending}
                    data={countryEmergenciesResponse?.results}
                    keySelector={keySelector}
                    columns={columns}
                />
            </SortContext.Provider>
        </Container>
    );
}

export default EmergenciesOperationTable;
