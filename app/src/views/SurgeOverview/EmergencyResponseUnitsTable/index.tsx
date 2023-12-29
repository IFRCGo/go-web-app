import { useMemo } from 'react';
import {
    Container,
    Pager,
    SelectInput,
    Table,
} from '@ifrc-go/ui';
import { SortContext } from '@ifrc-go/ui/contexts';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    createNumberColumn,
    createStringColumn,
    resolveToString,
} from '@ifrc-go/ui/utils';
import { isDefined } from '@togglecorp/fujs';

import Link from '#components/Link';
import { type components } from '#generated/types';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import useFilterState from '#hooks/useFilterState';
import { createLinkColumn } from '#utils/domain/tableHelpers';
import {
    type GoApiResponse,
    useRequest,
} from '#utils/restRequest';

import i18n from './i18n.json';
import styles from './styles.module.css';

type DeploymentsEruTypeEnum = components<'read'>['schemas']['DeploymentsEruTypeEnum'];

type GetEmergencyResponseUnitsResponse = GoApiResponse<'/api/v2/eru/'>;
type EmergencyResponseUnitListItem = NonNullable<GetEmergencyResponseUnitsResponse['results']>[number];

const emergencyResponseUnitKeySelector = (item: EmergencyResponseUnitListItem) => item.id;

const emergencyResponseUnitTypeKeySelector = (item: DeploymentsEruTypeEnum) => item.key;
const emergencyResponseUnitTypeLabelSelector = (item: DeploymentsEruTypeEnum) => item.value ?? '?';

function EmergencyResponseUnitsTable() {
    const strings = useTranslation(i18n);
    const {
        sortState,
        ordering,
        page,
        setPage,
        rawFilter,
        filter,
        filtered,
        setFilterField,
        limit,
        offset,
    } = useFilterState<{ type?: DeploymentsEruTypeEnum['key'] }>({
        filter: {},
        pageSize: 5,
    });

    const {
        pending: emergencyResponseUnitsPending,
        response: emergencyResponseUnitsResponse,
    } = useRequest({
        url: '/api/v2/eru/',
        preserveResponse: true,
        query: {
            limit,
            offset,
            deployed_to__isnull: false,
            ordering,
            type: isDefined(filter.type) ? filter.type : undefined,
        },
    });

    const {
        deployments_eru_type,
    } = useGlobalEnums();

    const columns = useMemo(() => ([
        createStringColumn<EmergencyResponseUnitListItem, number>(
            'eru_owner__national_society_country__society_name',
            strings.emergencyResponseUnitsTableOwner,
            (emergencyResponseUnit) => emergencyResponseUnit
                .eru_owner.national_society_country.society_name,
            { sortable: true },
        ),
        createStringColumn<EmergencyResponseUnitListItem, number>(
            'type',
            strings.emergencyResponseUnitsTableType,
            (emergencyResponseUnit) => emergencyResponseUnit.type_display,
            { sortable: true },
        ),
        createNumberColumn<EmergencyResponseUnitListItem, number>(
            'units',
            strings.emergencyResponseUnitsTableUnits,
            (emergencyResponseUnit) => emergencyResponseUnit.units,
            { sortable: true },
        ),
        createNumberColumn<EmergencyResponseUnitListItem, number>(
            'equipment_units',
            strings.emergencyResponseUnitsTableEquipment,
            (emergencyResponseUnit) => emergencyResponseUnit.equipment_units,
            { sortable: true },
        ),
        createLinkColumn<EmergencyResponseUnitListItem, number>(
            'deployed_to__society_name',
            strings.emergencyResponseUnitsTableDeployedTo,
            (emergencyResponseUnit) => emergencyResponseUnit.deployed_to.name,
            (emergencyResponseUnit) => ({
                to: 'countriesLayout',
                urlParams: {
                    countryId: emergencyResponseUnit.deployed_to.id,
                },
            }),
            { sortable: true },
        ),
        createLinkColumn<EmergencyResponseUnitListItem, number>(
            'event__name',
            strings.emergencyResponseUnitsTableEmergency,
            (emergencyResponseUnit) => emergencyResponseUnit.event?.name,
            (emergencyResponseUnit) => ({
                to: 'emergenciesLayout',
                urlParams: { emergencyId: emergencyResponseUnit.event?.id },
            }),
            { sortable: true },
        ),
    ]), [
        strings.emergencyResponseUnitsTableOwner,
        strings.emergencyResponseUnitsTableType,
        strings.emergencyResponseUnitsTableUnits,
        strings.emergencyResponseUnitsTableEquipment,
        strings.emergencyResponseUnitsTableDeployedTo,
        strings.emergencyResponseUnitsTableEmergency,
    ]);

    return (
        <Container
            className={styles.emergencyResponseUnitsTable}
            heading={resolveToString(
                strings.emergencyResponseUnitsTableHeading,
                { count: emergencyResponseUnitsResponse?.count ?? '--' },
            )}
            withHeaderBorder
            filtersContainerClassName={styles.filters}
            filters={(
                <SelectInput
                    placeholder={strings.emergencyResponseUnitTypeFilterPlaceholder}
                    name="type"
                    value={rawFilter.type}
                    onChange={setFilterField}
                    keySelector={emergencyResponseUnitTypeKeySelector}
                    labelSelector={emergencyResponseUnitTypeLabelSelector}
                    options={deployments_eru_type}
                />
            )}
            footerActions={(
                <Pager
                    activePage={page}
                    itemsCount={emergencyResponseUnitsResponse?.count ?? 0}
                    maxItemsPerPage={limit}
                    onActivePageChange={setPage}
                />
            )}
            actions={(
                <Link
                    to="allDeployedEmergencyResponseUnits"
                    withLinkIcon
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
                    filtered={filtered}
                />
            </SortContext.Provider>
        </Container>
    );
}

export default EmergencyResponseUnitsTable;
