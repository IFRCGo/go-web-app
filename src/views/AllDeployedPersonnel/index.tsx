import {
    useState,
    useMemo,
    useContext,
    useCallback,
} from 'react';
import { generatePath } from 'react-router-dom';
import { isDefined } from '@togglecorp/fujs';
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
    createDateColumn,
    createLinkColumn,
} from '#components/Table/ColumnShortcuts';
import Table from '#components/Table';

import i18n from './i18n.json';

type PersonnelTableItem = NonNullable<GoApiResponse<'/api/v2/personnel/'>['results']>[number];
function keySelector(personnel: PersonnelTableItem) {
    return personnel.id;
}
const PAGE_SIZE = 10;
const now = new Date().toISOString();

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

    const getTypeName = useCallback((type: PersonnelTableItem['type']) => {
        if (type === 'rr') {
            return strings.rapidResponse;
        }
        return type.toUpperCase();
    }, [strings]);

    const {
        response: personnelResponse,
        pending: personnelPending,
    } = useRequest({
        url: '/api/v2/personnel/',
        preserveResponse: true,
        query: {
            limit: PAGE_SIZE,
            offset: PAGE_SIZE * (page - 1),
            ordering: getOrdering(sorting),
            end_date__gt: now,
        },
    });

    const columns = useMemo(
        () => ([
            createDateColumn<PersonnelTableItem, number>(
                'start_date',
                strings.personnelTableStartDate,
                (item) => item.start_date,
                {
                    sortable: true,
                },
            ),
            createDateColumn<PersonnelTableItem, number>(
                'end_date',
                strings.personnelTableEndDate,
                (item) => item.end_date,
                {
                    sortable: true,
                },
            ),
            createStringColumn<PersonnelTableItem, number>(
                'name',
                strings.personnelTableName,
                (item) => item.name,
                {
                    sortable: true,
                },
            ),
            createStringColumn<PersonnelTableItem, number>(
                'role',
                strings.personnelTablePosition,
                (item) => item.role,
                {
                    sortable: true,
                },
            ),
            createStringColumn<PersonnelTableItem, number>(
                'type',
                strings.personnelTableType,
                (item) => getTypeName(item.type),
                {
                    sortable: true,
                },
            ),
            createLinkColumn<PersonnelTableItem, number>(
                'country_from',
                strings.personnelTableDeployingParty,
                (item) => (
                    item.country_from?.society_name
                    || item.country_from?.name
                ),
                (item) => ({
                    to: isDefined(item.country_from?.id)
                        ? generatePath(countryRoute.absolutePath, {
                            countryId: item.country_from?.id,
                        })
                        : undefined,
                }),
                {
                    sortable: true,
                },
            ),
            createLinkColumn<PersonnelTableItem, number>(
                'deployed_to',
                strings.personnelTableDeployedTo,
                (item) => item.country_to?.name,
                (item) => ({
                    to: isDefined(item.country_to?.id)
                        ? generatePath(countryRoute.absolutePath, {
                            countryId: item.country_to?.id,
                        })
                        : undefined,
                }),
            ),
            createLinkColumn<PersonnelTableItem, number>(
                'deployment',
                strings.personnelTableEmergency,
                (item) => item.deployment?.event_deployed_to?.name,
                (item) => ({
                    to: isDefined(item.deployment?.event_deployed_to?.id)
                        ? generatePath(emergencyRoute.absolutePath, {
                            emergencyId: item.deployment?.event_deployed_to?.id,
                        })
                        : undefined,
                }),
                {
                    sortable: true,
                },
            ),
        ]),
        [
            countryRoute,
            emergencyRoute,
            strings,
            getTypeName,
        ],
    );
    const containerHeading = resolveToComponent(
        strings.containerHeading,
        {
            count: personnelResponse?.count ?? 0,
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
                        itemsCount={personnelResponse?.count ?? 0}
                        maxItemsPerPage={PAGE_SIZE}
                        onActivePageChange={setPage}
                    />
                )}
            >
                <SortContext.Provider value={sortState}>
                    <Table
                        filtered={false}
                        pending={personnelPending}
                        data={personnelResponse?.results}
                        keySelector={keySelector}
                        columns={columns}
                    />
                </SortContext.Provider>
            </Container>
        </Page>
    );
}

Component.displayName = 'AllDeployedPersonnel';
