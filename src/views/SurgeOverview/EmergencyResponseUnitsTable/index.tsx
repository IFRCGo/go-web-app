import {
    useState,
    useMemo,
    useContext,
    useCallback,
} from 'react';
import { generatePath } from 'react-router-dom';

import Table from '#components/Table';
import SelectInput from '#components/SelectInput';
import Link from '#components/Link';
import Container from '#components/Container';
import useInputState from '#hooks/useInputState';
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

interface EmergencyResponseUnitType {
    key: number;
    label: string;
}
const PAGE_SIZE = 5;

const emergencyResponseUnitKeySelector = (item: EmergencyResponseUnitListItem) => item.id;

const emergencyResponseUnitTypeKeySelector = (item: EmergencyResponseUnitType) => item.key;
const emergencyResponseUnitTypeLabelSelector = (item: EmergencyResponseUnitType) => item.label;

function EmergencyResponseUnitsTable() {
    const [page, setPage] = useState(0);
    const [emergencyResponseUnitType, setEmergencyResponseType] = useInputState<EmergencyResponseUnitType['key'] | undefined>(undefined);

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
            type: emergencyResponseUnitType,
        },
    });

    const handleEmergencyResponseUnitTypeChange = useCallback((value: EmergencyResponseUnitType['key'] | undefined) => {
        setEmergencyResponseType(value);
        setPage(0);
    }, [setEmergencyResponseType]);

    const {
        pending: emergencyResponseUnitTypesPending,
        response: emergencyResponseUnitTypesResponse,
    } = useRequest<EmergencyResponseUnitType[]>({
        url: 'api/v2/erutype/',
        preserveResponse: true,
    });

    const columns = useMemo(() => ([
        createStringColumn<EmergencyResponseUnitListItem, number>(
            'eru_owner__national_society_country__society_name',
            strings.emergencyResponseUnitsTableOwner,
            (emergencyResponseUnit) => emergencyResponseUnit
                .eru_owner.national_society_country.society_name,
            {
                sortable: true,
            },
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
            'deployed_to__society_name',
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
            'event__name',
            strings.emergencyResponseUnitsTableEmergency,
            (emergencyResponseUnit) => emergencyResponseUnit.event?.name,
            (emergencyResponseUnit) => ({
                to: emergencyResponseUnit.event?.id ? generatePath(emergencyRoute.absolutePath, {
                    emergencyId: emergencyResponseUnit.event?.id,
                }) : undefined,
            }),
            {
                sortable: true,
            },
        ),
    ]), [strings, emergencyRoute, countryRoute]);

    return (
        <Container
            className={styles.emergencyResponseUnitsTable}
            heading={resolveToString(
                strings.emergencyResponseUnitsTableHeading,
                { count: emergencyResponseUnitsResponse?.count },
            )}
            headerDescriptionClassName={styles.filters}
            headerDescription={(
                <SelectInput
                    placeholder={strings.emergencyResponseUnitTypeFilterPlaceholder}
                    label={strings.emergencyResponseUnitTypeFilterLabel}
                    name={undefined}
                    value={emergencyResponseUnitType}
                    onChange={handleEmergencyResponseUnitTypeChange}
                    keySelector={emergencyResponseUnitTypeKeySelector}
                    labelSelector={emergencyResponseUnitTypeLabelSelector}
                    optionsPending={emergencyResponseUnitTypesPending}
                    options={emergencyResponseUnitTypesResponse}
                />
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
