import {
    useCallback,
    useMemo,
} from 'react';
import {
    Container,
    Pager,
    Table,
} from '@ifrc-go/ui';
import { SortContext } from '@ifrc-go/ui/contexts';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    createNumberColumn,
    createStringColumn,
    numericIdSelector,
    resolveToComponent,
} from '@ifrc-go/ui/utils';
import {
    isNotDefined,
    listToMap,
} from '@togglecorp/fujs';

import Link from '#components/Link';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import useFilterState from '#hooks/useFilterState';
import { createLinkColumn } from '#utils/domain/tableHelpers';
import {
    type GoApiResponse,
    useRequest,
} from '#utils/restRequest';

import i18n from './i18n.json';

type EruTableItem = NonNullable<GoApiResponse<'/api/v2/eru/'>['results']>[number];

interface Props {
    emergencyId?: string;
}

export default function DeployedErusTable(props: Props) {
    const { emergencyId } = props;
    const strings = useTranslation(i18n);
    const {
        page,
        setPage,
        sortState,
        ordering,
        limit,
        offset,
    } = useFilterState<object>({
        filter: {},
        pageSize: 10,
    });

    const {
        deployments_eru_type,
    } = useGlobalEnums();

    const eruTypes = useMemo(
        () => (
            listToMap(
                deployments_eru_type,
                (item) => item.key,
                (item) => item.value,
            )
        ),
        [deployments_eru_type],
    );

    const getEruType = useCallback(
        (id: EruTableItem['type']) => {
            if (isNotDefined(id) || isNotDefined(eruTypes)) {
                return undefined;
            }
            return eruTypes[id];
        },
        [eruTypes],
    );

    const {
        response: eruResponse,
        pending: eruPending,
    } = useRequest({
        url: '/api/v2/eru/',
        preserveResponse: true,
        query: {
            limit,
            offset,
            ordering,
            deployed_to__isnull: false,
            event: Number(emergencyId),
        },
    });

    const columns = useMemo(
        () => ([
            createStringColumn<EruTableItem, number>(
                'eru_owner__national_society_country__society_name',
                strings.eruTableName,
                (item) => item.eru_owner.national_society_country.society_name
                    ?? item.eru_owner.national_society_country.name,
                { sortable: true },
            ),
            createStringColumn<EruTableItem, number>(
                'type',
                strings.eruTableType,
                (item) => getEruType(item.type),
                { sortable: true },
            ),
            createNumberColumn<EruTableItem, number>(
                'units',
                strings.eruTablePersonnel,
                (item) => item.units,
                { sortable: true },
            ),
            createNumberColumn<EruTableItem, number>(
                'equipment_units',
                strings.eruTableEquipment,
                (item) => item.equipment_units,
                { sortable: true },
            ),
            createLinkColumn<EruTableItem, number>(
                'deployed_to__society_name',
                strings.eruTableCountry,
                (item) => item.deployed_to.name,
                (item) => ({
                    to: 'countriesLayout',
                    urlParams: {
                        countryId: item.deployed_to?.id,
                    },
                }),
                { sortable: true },
            ),
            createLinkColumn<EruTableItem, number>(
                'event__name',
                strings.eruTableEmergency,
                (item) => item.event?.name,
                (item) => ({
                    to: 'emergenciesLayout',
                    urlParams: {
                        emergencyId: item.event?.id,
                    },
                }),
                { sortable: true },
            ),
        ]),
        [
            strings.eruTableName,
            strings.eruTableType,
            strings.eruTablePersonnel,
            strings.eruTableEquipment,
            strings.eruTableCountry,
            strings.eruTableEmergency,
            getEruType,
        ],
    );

    const containerHeading = resolveToComponent(
        strings.containerHeading,
        {
            count: eruResponse?.count ?? 0,
        },
    );

    return (
        <Container
            heading={containerHeading}
            withHeaderBorder
            actions={(
                <Link
                    to="allDeployedEmergencyResponseUnits"
                    withLinkIcon
                    withUnderline
                >
                    {strings.deployedErusViewAll}
                </Link>
            )}
            footerActions={(
                <Pager
                    activePage={page}
                    itemsCount={eruResponse?.count ?? 0}
                    maxItemsPerPage={limit}
                    onActivePageChange={setPage}
                />
            )}
        >
            <SortContext.Provider value={sortState}>
                <Table
                    filtered={false}
                    pending={eruPending}
                    data={eruResponse?.results}
                    keySelector={numericIdSelector}
                    columns={columns}
                />
            </SortContext.Provider>
        </Container>
    );
}
