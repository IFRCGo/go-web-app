import {
    useMemo,
    useContext,
    useState,
} from 'react';
import {
    generatePath,
} from 'react-router-dom';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
import RouteContext from '#contexts/route';
import useTranslation from '#hooks/useTranslation';
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
    createProgressColumn,
} from '#components/Table/ColumnShortcuts';
import {
    type GoApiResponse,
    useRequest,
} from '#utils/restRequest';

import i18n from './i18n.json';

type AppealTableItem = NonNullable<GoApiResponse<'/api/v2/appeal/'>['results']>[number];
const keySelector = (appeal: AppealTableItem) => appeal.id;

const now = new Date().toISOString();
const PAGE_SIZE = 5;

interface Props {
    countryId?: string;
}

function AppealOperationTable(props: Props) {
    const { countryId } = props;
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
            country: Number(countryId),
        },
    });
    const {
        emergency: emergencyRoute,
        allAppeals: allAppealsRoute,
    } = useContext(RouteContext);

    const columns = useMemo(
        () => ([
            createDateColumn<AppealTableItem, string>(
                'start_date',
                strings.appealsTableStartDate,
                (item) => item.start_date,
                {
                    sortable: true,
                },
            ),
            createLinkColumn<AppealTableItem, string>(
                'operation',
                strings.appealsTableName,
                (item) => item.name,
                (item) => ({
                    to: isDefined(item.event)
                        ? generatePath(emergencyRoute.absolutePath, { emergencyId: item.event })
                        : undefined,
                }),
                {
                    sortable: true,
                },
            ),
            createNumberColumn<AppealTableItem, string>(
                'event',
                strings.appealsTableEmergency,
                (item) => item.event,
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
                (item) => Number(item.amount_requested),
                { sortable: true },
            ),
            createProgressColumn<AppealTableItem, string>(
                'amount_funded',
                strings.appealsTableFundedAmount,
                (item) => 100 * (Number(item.amount_funded) / Number(item.amount_requested)),
                { sortable: true },
            ),
            createStringColumn<AppealTableItem, string>(
                'active',
                strings.appealsTableStatus,
                (item) => item.status_display,
                { sortable: true },
            ),
        ]),
        [emergencyRoute, strings],
    );

    return (
        <>
            <Container
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
            <Link
                to={{
                    pathname: allAppealsRoute.absolutePath,
                    search: `country=${countryId}`,
                }}
                withForwardIcon
                withUnderline
            >
                {strings.allOperations}
            </Link>
        </>
    );
}

export default AppealOperationTable;
