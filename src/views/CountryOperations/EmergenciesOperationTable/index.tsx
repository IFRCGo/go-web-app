import {
    useMemo,
    useContext,
} from 'react';
import {
    generatePath,
} from 'react-router-dom';
import { isDefined, max } from '@togglecorp/fujs';
import useTranslation from '#hooks/useTranslation';
import RouteContext from '#contexts/route';
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

import i18n from './i18n.json';

type EmergenciesTableItem = NonNullable<GoApiResponse<'/api/v2/event/'>['results']>[number];
const keySelector = (emergency: EmergenciesTableItem) => emergency.id;

const PAGE_SIZE = 5;
const now = new Date();
now.setDate(now.getDate() - 30);
now.setHours(0, 0, 0, 0);

const startDate = now.toISOString();

const getMostRecentAffectedValue = (fieldReport: EmergenciesTableItem['field_reports']) => {
    const latestReport = max(fieldReport, (item) => new Date(item.updated_at).getTime());
    return latestReport?.num_affected;
};

interface Props {
    countryId?: string;
    countryName?: string;
}

function EmergenciesOperationTable(props: Props) {
    const {
        countryId,
        countryName,
    } = props;
    const strings = useTranslation(i18n);

    const sortState = useSortState();
    const { sorting } = sortState;
    const viewAllEmergencies = resolveToComponent(
        strings.allEmergencies,
        {
            name: countryName,
        },
    );

    const {
        emergency: emergencyRoute,
        allEmergencies: allEmergenciesRoute,
    } = useContext(RouteContext);

    const columns = useMemo(
        () => ([
            createDateColumn<EmergenciesTableItem, number>(
                'start_date',
                strings.emergenciesStartDate,
                (item) => item.disaster_start_date,
                {
                    sortable: true,
                },
            ),
            createLinkColumn<EmergenciesTableItem, number>(
                'name',
                strings.emergenciesName,
                (item) => item.name,
                (item) => ({
                    to: isDefined(item.id)
                        ? generatePath(emergencyRoute.absolutePath, {
                            emergencyId: item.id,
                        })
                        : undefined,
                }),
                {
                    sortable: true,
                },
            ),
            createStringColumn<EmergenciesTableItem, number>(
                'dtype',
                strings.emergenciesDisasterType,
                (item) => item.dtype.name,
                { sortable: true },
            ),
            createStringColumn<EmergenciesTableItem, number>(
                'glide',
                strings.emergenciesGlide,
                (item) => item.glide,
                { sortable: true },
            ),
            createStringColumn<EmergenciesTableItem, number>(
                'requested_amount',
                strings.emergenciesRequestedAmount,
                (item) => item.appeals[0]?.amount_requested,
                { sortable: true },
            ),
            createNumberColumn<EmergenciesTableItem, number>(
                'affected',
                strings.emergenciesAffected,
                (item) => item.num_affected ?? getMostRecentAffectedValue(item.field_reports),
                { sortable: true },
            ),
        ]),
        [emergencyRoute, strings],
    );

    const {
        pending: countryEmergenciesPending,
        response: countryEmergenciesResponse,
    } = useRequest({
        url: '/api/v2/event/',
        preserveResponse: true,
        query: {
            limit: PAGE_SIZE,
            countries__in: Number(countryId),
            ordering: getOrdering(sorting),
            disaster_start_date__gte: startDate,
        },
    });

    return (
        <Container
            heading={strings.emergenciesHeading}
            withHeaderBorder
            actions={(
                <Link
                    to={{
                        pathname: allEmergenciesRoute.absolutePath,
                        search: `country=${countryId}`,
                    }}
                    withForwardIcon
                    withUnderline
                >
                    {viewAllEmergencies}
                </Link>
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
