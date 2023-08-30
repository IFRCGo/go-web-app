import {
    useState,
    useMemo,
    useContext,
} from 'react';
import { generatePath } from 'react-router-dom';
import {
    isNotDefined,
    isDefined,
} from '@togglecorp/fujs';
import useTranslation from '#hooks/useTranslation';
import {
    type GoApiResponse,
    useRequest,
} from '#utils/restRequest';
import { resolveToComponent } from '#utils/translation';
import RouteContext from '#contexts/route';
import Container from '#components/Container';
import Pager from '#components/Pager';
import Page from '#components/Page';
import Button from '#components/Button';
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

import i18n from './i18n.json';

const eruTypes = {
    0: 'Basecamp',
    1: 'IT & Telecom',
    2: 'Logistics',
    3: 'RCRC Emergency Hospital',
    4: 'RCRC Emergency Clinic',
    5: 'Relief',
    6: 'WASH M15',
    7: 'WASH MSM20',
    8: 'WASH M40',
    9: 'Water Supply and rehabilitation',
    10: 'Household Water Treatment and safe storage',
    11: 'Cholera Case management at Community level',
    12: 'Safe and Dignified Burials',
    13: 'Community Based Surveillance',
    14: 'Base Camp – S',
    15: 'Base Camp – M',
    16: 'Base Camp – L',
};
type EruTableItem = NonNullable<GoApiResponse<'/api/v2/eru/'>['results']>[number];

function getEruType(id: EruTableItem['type']) {
    if (isNotDefined(id)) {
        return undefined;
    }
    return eruTypes[id];
}

function keySelector(personnel: EruTableItem) {
    return personnel.id;
}
const PAGE_SIZE = 10;

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const [page, setPage] = useState(1);
    const strings = useTranslation(i18n);
    const sortState = useSortState();
    const { sorting } = sortState;
    const {
        country: countryRoute,
        emergency: emergencyRoute,
    } = useContext(RouteContext);

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
        },
    });

    const columns = useMemo(
        () => ([
            createStringColumn<EruTableItem, number>(
                'eru_owner__national_society_country__society_name',
                strings.eruTableName,
                (item) => item.eru_owner.national_society_country.society_name
                        ?? item.eru_owner.national_society_country.name,
                {
                    sortable: true,
                },
            ),
            createStringColumn<EruTableItem, number>(
                'type',
                strings.eruTableType,
                (item) => getEruType(item.type),
                {
                    sortable: true,
                },
            ),
            createNumberColumn<EruTableItem, number>(
                'units',
                strings.eruTablePersonnel,
                (item) => item.units,
                {
                    sortable: true,
                },
            ),
            createNumberColumn<EruTableItem, number>(
                'equipment_units',
                strings.eruTableEquipment,
                (item) => item.equipment_units,
                {
                    sortable: true,
                },
            ),
            createLinkColumn<EruTableItem, number>(
                'deployed_to__society_name',
                strings.eruTableCountry,
                (item) => item.deployed_to.name,
                (item) => ({
                    to: isDefined(item.deployed_to?.id)
                        ? generatePath(countryRoute.absolutePath, {
                            countryId: item.deployed_to?.id,
                        })
                        : undefined,
                }),
                {
                    sortable: true,
                },
            ),
            createLinkColumn<EruTableItem, number>(
                'event__name',
                strings.eruTableEmergency,
                (item) => item.event?.name,
                (item) => ({
                    to: isDefined(item.event?.id)
                        ? generatePath(emergencyRoute.absolutePath, {
                            emergencyId: item.event?.id,
                        })
                        : undefined,
                }),
            ),
        ]),
        [
            countryRoute,
            emergencyRoute,
            strings,
        ],
    );
    const containerHeading = resolveToComponent(
        strings.containerHeading,
        {
            count: eruResponse?.count ?? 0,
        },
    );

    return (
        <Page>
            <Container
                heading={containerHeading}
                withHeaderBorder
                actions={(
                    // FIXME complete export table
                    <Button
                        name={undefined}
                        variant="secondary"
                    >
                        {strings.exportTable}
                    </Button>
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
                        keySelector={keySelector}
                        columns={columns}
                    />
                </SortContext.Provider>
            </Container>
        </Page>
    );
}

Component.displayName = 'AllDeployedEmergencyResponseUnits';
