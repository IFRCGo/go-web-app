import { useState, useMemo, useContext } from 'react';
import { generatePath } from 'react-router-dom';

import {
    useRequest,
} from '#utils/restRequest';
import Table from '#components/Table';
import Link from '#components/Link';
import Container from '#components/Container';
import {
    createLinkColumn,
    createNumberColumn,
    createStringColumn,
} from '#components/Table/ColumnShortcuts';
import { useSortState, SortContext } from '#components/Table/useSorting';
import Pager from '#components/Pager';
import useTranslation from '#hooks/useTranslation';
import RouteContext from '#contexts/route';
import { paths } from '#generated/types';

import i18n from './i18n.json';
import styles from './styles.module.css';

type GetPersonnelByEvent = paths['/api/v2/personnel_by_event/']['get'];
type GetPersonnelByEventResponse = GetPersonnelByEvent['responses']['200']['content']['application/json'];
type PersonnelByEventListItem = NonNullable<GetPersonnelByEventResponse['results']>[number] & {
    organizations_from: string[]; // FIXME: the organizations_from is wrongly typed in the server
};

const personnelByEventKeySelector = (item: PersonnelByEventListItem) => item.id;

const PAGE_SIZE = 25;

function PersonnelByEventTable() {
    const [page, setPage] = useState(0);

    const {
        allDeployedPersonnel: allDeployedPersonnelRoute,
        emergency: emergencyRoute,
    } = useContext(RouteContext);

    const sortState = useSortState();
    const { sorting } = sortState;

    const strings = useTranslation(i18n);

    const columns = useMemo(() => ([
        createLinkColumn<PersonnelByEventListItem, number>(
            'name',
            strings.personnelByEventTableEmergency,
            (personnelByEvent) => personnelByEvent.name,
            (personnelByEvent) => ({
                to: generatePath(emergencyRoute.absolutePath, {
                    emergencyId: personnelByEvent.id,
                }),
            }),
        ),
        createStringColumn<PersonnelByEventListItem, number>(
            'organizations_from',
            strings.personnelByEventTableOrganization,
            (personnelByEvent) => personnelByEvent.organizations_from.join(', '),
        ),
        createStringColumn<PersonnelByEventListItem, number>(
            'surge_type',
            strings.personnelByEventTableSurgeType,
            () => strings.rapidResponseSurgeType,
        ),
        createNumberColumn<PersonnelByEventListItem, number>(
            'personnel_count',
            strings.personnelByEventTablePersonnelCount,
            (personnelByEvent) => personnelByEvent.personnel_count,
            {
                sortable: true,
            },
        ),
    ]), [strings, emergencyRoute]);

    let ordering;
    if (sorting) {
        ordering = sorting.direction === 'dsc'
            ? `-${sorting.name}`
            : sorting.name;
    }

    const {
        pending: personnelByEventPending,
        response: personnelByEventResponse,
    } = useRequest<GetPersonnelByEventResponse>({
        url: 'api/v2/personnel_by_event/',
        preserveResponse: true,
        query: {
            limit: PAGE_SIZE,
            offset: PAGE_SIZE * (page - 1),
            ordering,
        },
    });

    return (
        <Container
            className={styles.personnelByEventTable}
            heading={strings.personnelByEventTableHeading}
            footerActions={(
                <Pager
                    activePage={page}
                    itemsCount={personnelByEventResponse?.count ?? 0}
                    maxItemsPerPage={PAGE_SIZE}
                    onActivePageChange={setPage}
                />
            )}
            actions={(
                <Link
                    to={allDeployedPersonnelRoute.absolutePath}
                    withForwardIcon
                    withUnderline
                >
                    {strings.personnelViewAll}
                </Link>
            )}
        >
            <SortContext.Provider value={sortState}>
                <Table
                    pending={personnelByEventPending}
                    columns={columns}
                    keySelector={personnelByEventKeySelector}
                    data={personnelByEventResponse?.results as PersonnelByEventListItem[]}
                />
            </SortContext.Provider>
        </Container>
    );
}

export default PersonnelByEventTable;
