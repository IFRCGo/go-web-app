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

const PAGE_SIZE = 25;

function PersonnelByEventTable() {
    const {
        sortState,
        ordering,
        page,
        setPage,
    } = useFilterState<object>(
        {},
        undefined,
    );

    const strings = useTranslation(i18n);

    const {
        pending: personnelByEventPending,
        response: personnelByEventResponse,
    } = useRequest({
        url: '/api/v2/personnel_by_event/',
        preserveResponse: true,
        query: {
            limit: PAGE_SIZE,
            offset: PAGE_SIZE * (page - 1),
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
                    maxItemsPerPage={PAGE_SIZE}
                    onActivePageChange={setPage}
                />
            )}
            actions={(
                <Link
                    to="allDeployedPersonnel"
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
                    filtered={false}
                />
            </SortContext.Provider>
        </Container>
    );
}

export default PersonnelByEventTable;
