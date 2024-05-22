import { useMemo } from 'react';
import {
    Container,
    DateInput,
    Pager,
    Table,
} from '@ifrc-go/ui';
import { SortContext } from '@ifrc-go/ui/contexts';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    createDateColumn,
    createNumberColumn,
    createStringColumn,
    formatNumber,
    resolveToComponent,
} from '@ifrc-go/ui/utils';
import {
    encodeDate,
    max,
} from '@togglecorp/fujs';

import DisasterTypeSelectInput from '#components/domain/DisasterTypeSelectInput';
import Link from '#components/Link';
import useFilterState from '#hooks/useFilterState';
import { createLinkColumn } from '#utils/domain/tableHelpers';
import {
    type GoApiResponse,
    useRequest,
} from '#utils/restRequest';

import i18n from './i18n.json';

type EmergenciesTableItem = NonNullable<GoApiResponse<'/api/v2/event/'>['results']>[number];
function keySelector(emergency: EmergenciesTableItem) {
    return emergency.id;
}

// FIXME: use a separate utility
const thirtyDaysAgo = new Date();
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
thirtyDaysAgo.setHours(0, 0, 0, 0);

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
        dType?: number,
    }>({
        filter: {
            startDateAfter: encodeDate(thirtyDaysAgo),
        },
        pageSize: 10,
    });

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
                (item) => item.appeals[0]?.amount_requested,
                {
                    suffix: ' CHF',
                },
            ),
            createNumberColumn<EmergenciesTableItem, number>(
                'num_affected',
                strings.emergenciesTableAffected,
                (item) => item.num_affected ?? getMostRecentAffectedValue(item.field_reports),
            ),
        ]),
        [
            strings.emergenciesTableStartDate,
            strings.emergenciesTableName,
            strings.emergenciesTableDisasterType,
            strings.emergenciesTableGlide,
            strings.emergenciesTableRequestedAmount,
            strings.emergenciesTableAffected,
        ],
    );

    const {
        pending: countryEmergenciesPending,
        response: countryEmergenciesResponse,
    } = useRequest({
        url: '/api/v2/event/',
        preserveResponse: true,
        query: {
            limit,
            offset,
            countries__in: countryId,
            ordering,
            disaster_start_date__gte: filter.startDateAfter,
            disaster_start_date__lte: filter.startDateBefore,
            dtype: filter.dType,
        },
    });

    const viewAllEmergenciesLinkLabel = resolveToComponent(
        strings.emergenciesTableAllEmergenciesLinkLabel,
        { name: countryName },
    );

    const emergenciesHeading = resolveToComponent(
        strings.emergenciesTableHeading,
        { count: formatNumber(countryEmergenciesResponse?.count) ?? '--' },
    );

    return (
        <Container
            heading={emergenciesHeading}
            withHeaderBorder
            withGridViewInFilter
            filters={(
                <>
                    <DateInput
                        name="startDateAfter"
                        label={strings.emergenciesTableFilterStartAfter}
                        onChange={setFilterField}
                        value={rawFilter.startDateAfter}
                    />
                    <DateInput
                        name="startDateBefore"
                        label={strings.emergenciesTableFilterStartBefore}
                        onChange={setFilterField}
                        value={rawFilter.startDateBefore}
                    />
                    <DisasterTypeSelectInput
                        placeholder={strings.emergenciesTableFilterDisastersPlaceholder}
                        label={strings.emergenciesTableDisasterType}
                        name="dType"
                        value={rawFilter.dType}
                        onChange={setFilterField}
                    />
                </>
            )}
            actions={(
                <Link
                    to="allEmergencies"
                    urlSearch={`country=${countryId}`}
                    withLinkIcon
                    withUnderline
                >
                    {viewAllEmergenciesLinkLabel}
                </Link>
            )}
            footerActions={(
                <Pager
                    activePage={page}
                    itemsCount={countryEmergenciesResponse?.count ?? 0}
                    maxItemsPerPage={limit}
                    onActivePageChange={setPage}
                />
            )}
        >
            <SortContext.Provider value={sortState}>
                <Table
                    filtered={filtered}
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