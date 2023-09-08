import {
    useMemo,
    useState,
} from 'react';
import {
    isDefined,
    isNotDefined,
    isTruthyString,
} from '@togglecorp/fujs';
import useTranslation from '#hooks/useTranslation';
import { resolveToComponent, resolveToString } from '#utils/translation';
import Container from '#components/Container';
import {
    useSortState,
    SortContext,
    getOrdering,
} from '#components/Table/useSorting';
import Pager from '#components/Pager';
import Link from '#components/Link';
import Table from '#components/Table';
import {
    createStringColumn,
    createNumberColumn,
    createDateColumn,
    createLinkColumn,
} from '#components/Table/ColumnShortcuts';
import {
    type GoApiResponse,
    type ListResponseItem,
    useRequest,
} from '#utils/restRequest';

import i18n from './i18n.json';

type AppealTableItem = ListResponseItem<GoApiResponse<'/api/v2/appeal/'>>;
function keySelector(appeal: AppealTableItem) {
    return appeal.id;
}

const now = new Date().toISOString();
const PAGE_SIZE = 10;

interface Props {
    countryId: number;
    countryName?: string;
}

function AppealOperationTable(props: Props) {
    const {
        countryId,
        countryName,
    } = props;

    const strings = useTranslation(i18n);

    const sortState = useSortState();
    const { sorting } = sortState;

    const [page, setPage] = useState(1);
    const {
        pending: countryAppealPending,
        response: countryAppealResponse,
    } = useRequest({
        skip: isNotDefined(countryId),
        preserveResponse: true,
        url: '/api/v2/appeal/',
        query: {
            end_date__gt: now,
            limit: PAGE_SIZE,
            offset: PAGE_SIZE * (page - 1),
            ordering: getOrdering(sorting),
            country: countryId,
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
                // FIXME: use translations
                (item) => (isDefined(item.event) ? 'Link' : undefined),
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
                // FIXME: fix typing in server (medium priority)
                (item) => (
                    isTruthyString(item.amount_requested)
                        ? Number(item.amount_requested)
                        : undefined
                ),
                { sortable: true },
            ),
            createNumberColumn<AppealTableItem, string>(
                'amount_funded',
                strings.appealsTableFundedAmount,
                (item) => (
                    isTruthyString(item.amount_funded)
                        ? Number(item.amount_funded)
                        : undefined
                ),
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
        { numOperations: countryAppealResponse?.count },
    );

    return (
        <Container
            heading={heading}
            withHeaderBorder
            actions={(
                <Link
                    to="allAppeals"
                    urlSearch={`country=${countryId}`}
                    withForwardIcon
                    withUnderline
                >
                    {viewAllOperationsLinkLabel}
                </Link>
            )}
            footerActions={(
                <Pager
                    activePage={page}
                    itemsCount={countryAppealResponse?.count ?? 0}
                    maxItemsPerPage={PAGE_SIZE}
                    onActivePageChange={setPage}
                />
            )}
        >
            <SortContext.Provider value={sortState}>
                <Table
                    filtered={false}
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
