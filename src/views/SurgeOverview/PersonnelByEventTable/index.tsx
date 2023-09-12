import { useMemo } from 'react';

import Table from '#components/Table';
import Link from '#components/Link';
import Container from '#components/Container';
import {
    createLinkColumn,
    createNumberColumn,
    createStringColumn,
} from '#components/Table/ColumnShortcuts';
import { SortContext } from '#components/Table/useSorting';
import Pager from '#components/Pager';
import useTranslation from '#hooks/useTranslation';
import useFilterState from '#hooks/useFilterState';
import { useRequest, type GoApiResponse } from '#utils/restRequest';

import i18n from './i18n.json';
import styles from './styles.module.css';

type GetPersonnelByEventResponse = GoApiResponse<'/api/v2/personnel_by_event/'>;
type PersonnelByEventListItem = NonNullable<GetPersonnelByEventResponse['results']>[number];

const personnelByEventKeySelector = (item: PersonnelByEventListItem) => item.id;

function PersonnelByEventTable() {
    const {
        sortState,
        ordering,
        page,
        setPage,
        limit,
        offset,
    } = useFilterState<object>(
        {},
        undefined,
        1,
        25,
    );

    const strings = useTranslation(i18n);

    const {
        pending: personnelByEventPending,
        response: personnelByEventResponse,
    } = useRequest({
        url: '/api/v2/personnel_by_event/',
        preserveResponse: true,
        query: {
            limit,
            offset,
            ordering,
        },
    });

    const columns = useMemo(() => ([
        createLinkColumn<PersonnelByEventListItem, number>(
            'name',
            strings.personnelByEventTableEmergency,
            (personnelByEvent) => personnelByEvent.name,
            (personnelByEvent) => ({
                to: 'emergenciesLayout',
                urlParams: {
                    emergencyId: personnelByEvent.id,
                },
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
    ]), [strings]);

    return (
        <Container
            className={styles.personnelByEventTable}
            heading={strings.personnelByEventTableHeading}
            withHeaderBorder
            footerActions={(
                <Pager
                    activePage={page}
                    itemsCount={personnelByEventResponse?.count ?? 0}
                    maxItemsPerPage={limit}
                    onActivePageChange={setPage}
                />
            )}
            actions={(
                <Link
                    to="allDeployedPersonnel"
                    withLinkIcon
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
                    data={personnelByEventResponse?.results}
                    filtered={false}
                />
            </SortContext.Provider>
        </Container>
    );
}

export default PersonnelByEventTable;
