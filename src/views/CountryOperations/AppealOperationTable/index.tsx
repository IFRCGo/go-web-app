import { useMemo } from 'react';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

import Container from '#components/Container';
import { SortContext } from '#components/Table/useSorting';
import Pager from '#components/Pager';
import Link from '#components/Link';
import Table from '#components/Table';
import DateInput from '#components/DateInput';
import {
    createStringColumn,
    createNumberColumn,
    createDateColumn,
    createLinkColumn,
} from '#components/Table/ColumnShortcuts';
import DisasterTypeSelectInput from '#components/domain/DisasterTypeSelectInput';
import useTranslation from '#hooks/useTranslation';
import useFilterState from '#hooks/useFilterState';
import {
    type GoApiResponse,
    type ListResponseItem,
    useRequest,
} from '#utils/restRequest';
import { resolveToComponent, resolveToString } from '#utils/translation';
import { formatNumber } from '#utils/common';

import i18n from './i18n.json';

type AppealTableItem = ListResponseItem<GoApiResponse<'/api/v2/appeal/'>>;
function keySelector(appeal: AppealTableItem) {
    return appeal.id;
}

const now = new Date().toISOString();

interface Props {
    countryId: number;
    countryName?: string;
}

function AppealOperationTable(props: Props) {
    const {
        countryId,
        countryName,
    } = props;

    const {
        sortState,
        ordering,
        page,
        setPage,
        limit,
        offset,
        filter,
        setFilterField,
        filtered,
    } = useFilterState<{
        startDateAfter?: string,
        startDateBefore?: string,
        dType?: number,
    }>({
        filter: {},
        pageSize: 10,
    });

    const strings = useTranslation(i18n);

    const {
        pending: countryAppealPending,
        response: countryAppealResponse,
    } = useRequest({
        skip: isNotDefined(countryId),
        preserveResponse: true,
        url: '/api/v2/appeal/',
        query: {
            end_date__gt: now,
            limit,
            offset,
            ordering,
            country: countryId,
            dtype: filter.dType,
            start_date__gte: filter.startDateAfter,
            start_date__lte: filter.startDateBefore,
        },
    });

    const columns = useMemo(
        () => ([
            createDateColumn<AppealTableItem, string>(
                'start_date',
                strings.appealsTableStartDate,
                (item) => item.start_date,
                { sortable: true },
            ),
            createStringColumn<AppealTableItem, string>(
                'appeal__name',
                strings.appealsTableName,
                (item) => item.name,
                { sortable: true },
            ),
            createLinkColumn<AppealTableItem, string>(
                'event',
                strings.appealsTableEmergency,
                (item) => (isDefined(item.event) ? strings.appealsTableLink : undefined),
                (item) => ({
                    to: 'emergenciesLayout',
                    urlParams: {
                        emergencyId: item.event,
                    },
                }),
            ),
            createStringColumn<AppealTableItem, string>(
                'dtype',
                strings.appealsTableDisastertype,
                (item) => item.dtype.name,
                { sortable: true },
            ),
            createNumberColumn<AppealTableItem, string>(
                'amount_requested',
                strings.appealsTableRequestedAmount,
                (item) => item.amount_requested,
                {
                    sortable: true,
                    suffix: ' CHF',
                },
            ),
            createNumberColumn<AppealTableItem, string>(
                'amount_funded',
                strings.appealsTableFundedAmount,
                (item) => item.amount_funded,
                { sortable: true },
            ),
            createStringColumn<AppealTableItem, string>(
                'status',
                strings.appealsTableStatus,
                (item) => item.status_display,
                { sortable: true },
            ),
        ]),
        [strings],
    );

    const viewAllOperationsLinkLabel = resolveToComponent(
        strings.appealsTableAllOperationsLinkLabel,
        { name: countryName },
    );

    const heading = resolveToString(
        strings.appealsTableHeading,
        { numOperations: formatNumber(countryAppealResponse?.count) ?? '--' },
    );

    return (
        <Container
            heading={heading}
            withHeaderBorder
            withGridViewInFilter
            filters={(
                <>
                    <DateInput
                        name="startDateAfter"
                        label={strings.appealsTableFilterStartAfter}
                        onChange={setFilterField}
                        value={filter.startDateAfter}
                    />
                    <DateInput
                        name="startDateBefore"
                        label={strings.appealsTableFilterStartBefore}
                        onChange={setFilterField}
                        value={filter.startDateBefore}
                    />
                    <DisasterTypeSelectInput
                        placeholder={strings.appealsTableFilterDisastersPlaceholder}
                        label={strings.appealsTableDisastertype}
                        name="dType"
                        value={filter.dType}
                        onChange={setFilterField}
                    />
                </>
            )}
            actions={(
                <Link
                    to="allAppeals"
                    urlSearch={`country=${countryId}`}
                    withLinkIcon
                    withUnderline
                >
                    {viewAllOperationsLinkLabel}
                </Link>
            )}
            footerActions={(
                <Pager
                    activePage={page}
                    itemsCount={countryAppealResponse?.count ?? 0}
                    maxItemsPerPage={limit}
                    onActivePageChange={setPage}
                />
            )}
        >
            <SortContext.Provider value={sortState}>
                <Table
                    filtered={filtered}
                    pending={countryAppealPending}
                    data={countryAppealResponse?.results}
                    keySelector={keySelector}
                    columns={columns}
                />
            </SortContext.Provider>
        </Container>
    );
}

export default AppealOperationTable;
