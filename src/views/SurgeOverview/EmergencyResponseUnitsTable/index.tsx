import { useState, useMemo, useContext } from 'react';
import { generatePath } from 'react-router-dom';

import Table from '#components/Table';
import Link from '#components/Link';
import Container from '#components/Container';
import { useSortState, SortContext } from '#components/Table/useSorting';
import Pager from '#components/Pager';
import useTranslation from '#hooks/useTranslation';
import RouteContext from '#contexts/route';
import {
    createLinkColumn,
    createNumberColumn,
    createStringColumn,
} from '#components/Table/ColumnShortcuts';
import { resolveToString } from '#utils/translation';
import { useRequest } from '#utils/restRequest';
import { paths } from '#generated/types';

import i18n from './i18n.json';
import styles from './styles.module.css';

type GetEmergencyResponseUnits = paths['/api/v2/eru/']['get'];
type GetEmergencyResponseUnitsResponse = GetEmergencyResponseUnits['responses']['200']['content']['application/json'];
type EmergencyResponseUnitListItem = NonNullable<GetEmergencyResponseUnitsResponse['results']>[number];

const PAGE_SIZE = 5;

const emergencyResponseUnitKeySelector = (item: EmergencyResponseUnitListItem) => item.id;

function EmergencyResponseUnitsTable() {
    const [page, setPage] = useState(0);

    const {
        country: countryRoute,
        emergency: emergencyRoute,
        allDeployedEmergencyResponseUnits: allDeployedEmergencyResponseUnitsRoute,
    } = useContext(RouteContext);

    const strings = useTranslation(i18n);

    const sortState = useSortState();
    const { sorting } = sortState;

    let ordering;
    if (sorting) {
        ordering = sorting.direction === 'dsc'
            ? `-${sorting.name}`
            : sorting.name;
    }
    const {
        pending: emergencyResponseUnitsPending,
        response: emergencyResponseUnitsResponse,
    } = useRequest<GetEmergencyResponseUnitsResponse>({
        url: 'api/v2/eru/',
        preserveResponse: true,
        query: {
            limit: PAGE_SIZE,
            offset: PAGE_SIZE * (page - 1),
            deployed_to__isnull: false,
            ordering,
        },
    });

    const columns = useMemo(() => ([
        createStringColumn<EmergencyResponseUnitListItem, number>(
            'eru_owner',
            strings.emergencyResponseUnitsTableOwner,
            (emergencyResponseUnit) => emergencyResponseUnit
                .eru_owner.national_society_country.society_name,
        ),
        createStringColumn<EmergencyResponseUnitListItem, number>(
            'type',
            strings.emergencyResponseUnitsTableType,
            (emergencyResponseUnit) => emergencyResponseUnit.type_display,
            {
                sortable: true,
            },
        ),
        createNumberColumn<EmergencyResponseUnitListItem, number>(
            'units',
            strings.emergencyResponseUnitsTableUnits,
            (emergencyResponseUnit) => emergencyResponseUnit.units,
            {
                sortable: true,
            },
        ),
        createNumberColumn<EmergencyResponseUnitListItem, number>(
            'equipment_units',
            strings.emergencyResponseUnitsTableEquipment,
            (emergencyResponseUnit) => emergencyResponseUnit.equipment_units,
            {
                sortable: true,
            },
        ),
        createLinkColumn<EmergencyResponseUnitListItem, number>(
            'deployed_to',
            strings.emergencyResponseUnitsTableDeployedTo,
            (emergencyResponseUnit) => emergencyResponseUnit.deployed_to.name,
            (emergencyResponseUnit) => ({
                to: generatePath(countryRoute.absolutePath, {
                    countryId: emergencyResponseUnit.deployed_to.id,
                }),
            }),
            {
                sortable: true,
            },
        ),
        createLinkColumn<EmergencyResponseUnitListItem, number>(
            'event',
            strings.emergencyResponseUnitsTableEmergency,
            // FIXME: the event field is a nullable field
            (emergencyResponseUnit) => emergencyResponseUnit.event?.name,
            (emergencyResponseUnit) => ({
                to: emergencyResponseUnit.event?.id ? generatePath(emergencyRoute.absolutePath, {
                    emergencyId: emergencyResponseUnit.event?.id,
                }) : undefined,
            }),
        ),
    ]), [strings, emergencyRoute, countryRoute]);

    return (
        <Container
            className={styles.emergencyResponseUnitsTable}
            heading={resolveToString(
                strings.emergencyResponseUnitsTableHeading,
                { count: emergencyResponseUnitsResponse?.count },
            )}
            footerActions={(
                <Pager
                    activePage={page}
                    itemsCount={emergencyResponseUnitsResponse?.count ?? 0}
                    maxItemsPerPage={PAGE_SIZE}
                    onActivePageChange={setPage}
                />
            )}
            actions={(
                <Link
                    to={allDeployedEmergencyResponseUnitsRoute.absolutePath}
                    withForwardIcon
                    withUnderline
                >
                    {strings.emergencyResponseUnitsViewAll}
                </Link>
            )}
        >
            <SortContext.Provider value={sortState}>
                <Table
                    pending={emergencyResponseUnitsPending}
                    className={styles.table}
                    columns={columns}
                    keySelector={emergencyResponseUnitKeySelector}
                    data={emergencyResponseUnitsResponse?.results}
                />
            </SortContext.Provider>
        </Container>
    );
}

export default EmergencyResponseUnitsTable;
