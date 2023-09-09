import {
    useState,
    useMemo,
    useCallback,
} from 'react';
import {
    isNotDefined,
    listToMap,
} from '@togglecorp/fujs';
import useTranslation from '#hooks/useTranslation';
import {
    type GoApiResponse,
    useRequest,
} from '#utils/restRequest';
import { resolveToComponent } from '#utils/translation';
import Container from '#components/Container';
import Pager from '#components/Pager';
import {
    useSortState,
    SortContext,
    getOrdering,
} from '#components/Table/useSorting';
import {
    createStringColumn,
    createLinkColumn,
    createNumberColumn,
} from '#components/Table/ColumnShortcuts';
import Table from '#components/Table';
import Link from '#components/Link';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import { numericIdSelector } from '#utils/selectors';

import i18n from './i18n.json';

type EruTableItem = NonNullable<GoApiResponse<'/api/v2/eru/'>['results']>[number];

const PAGE_SIZE = 10;

interface Props {
    emergencyId?: string;
}

export default function DeployedErusTable(props: Props) {
    const { emergencyId } = props;
    const [page, setPage] = useState(1);
    const strings = useTranslation(i18n);
    const sortState = useSortState();
    const { sorting } = sortState;

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
            limit: PAGE_SIZE,
            offset: PAGE_SIZE * (page - 1),
            ordering: getOrdering(sorting),
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
        [strings, getEruType],
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
                    withForwardIcon
                    withUnderline
                >
                    {strings.deployedErusViewAll}
                </Link>
            )}
            footerActions={(
                <Pager
                    activePage={page}
                    itemsCount={eruResponse?.count ?? 0}
                    maxItemsPerPage={PAGE_SIZE}
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
