import {
    useMemo,
    useCallback,
} from 'react';
import useTranslation from '#hooks/useTranslation';
import {
    type GoApiResponse,
    useRequest,
} from '#utils/restRequest';
import Container from '#components/Container';
import Pager from '#components/Pager';
import {
    SortContext,
} from '#components/Table/useSorting';
import {
    createStringColumn,
    createDateColumn,
    createLinkColumn,
} from '#components/Table/ColumnShortcuts';
import Table from '#components/Table';
import Link from '#components/Link';
import { numericIdSelector } from '#utils/selectors';
import useFilterState from '#hooks/useFilterState';

import i18n from './i18n.json';

type PersonnelTableItem = NonNullable<GoApiResponse<'/api/v2/personnel/'>['results']>[number];
const now = new Date().toISOString();

interface Props {
    emergencyId?: string;
}

export default function RapidResponsePersonnelTable(props: Props) {
    const { emergencyId } = props;

    const {
        page,
        setPage,
        sortState,
        ordering,
        offset,
        limit,
    } = useFilterState<object>({
        filter: {},
        pageSize: 10,
    });

    const strings = useTranslation(i18n);

    const getTypeName = useCallback((type: PersonnelTableItem['type']) => {
        if (type === 'rr') {
            return strings.rapidResponse;
        }
        return type.toUpperCase();
    }, [strings.rapidResponse]);

    const {
        response: personnelResponse,
        pending: personnelPending,
    } = useRequest({
        url: '/api/v2/personnel/',
        preserveResponse: true,
        query: {
            limit,
            offset,
            ordering,
            event_deployed_to: Number(emergencyId),
            end_date__gt: now,
        },
    });

    const columns = useMemo(
        () => ([
            createStringColumn<PersonnelTableItem, number>(
                'role',
                strings.personnelTablePosition,
                (item) => item.role,
                { sortable: true },
            ),
            createStringColumn<PersonnelTableItem, number>(
                'type',
                strings.personnelTableType,
                (item) => getTypeName(item.type),
                { sortable: true },
            ),
            createLinkColumn<PersonnelTableItem, number>(
                'country_from',
                strings.personnelTableDeployedParty,
                (item) => item.country_from?.society_name,
                (item) => ({
                    to: 'countriesLayout',
                    urlParams: { countryId: item.country_from?.id },
                }),
                { sortable: true },
            ),
            createLinkColumn<PersonnelTableItem, number>(
                'deployment',
                strings.personnelTableDeployedTo,
                (item) => item.country_to?.name,
                (item) => ({
                    to: 'countriesLayout',
                    urlParams: { countryId: item.country_to?.id },
                }),
                { sortable: true },
            ),
            createStringColumn<PersonnelTableItem, number>(
                'name',
                strings.personnelTableName,
                (item) => item.name,
                { sortable: true },
            ),
            createDateColumn<PersonnelTableItem, number>(
                'start_date',
                strings.personnelTableStartDate,
                (item) => item.start_date,
                { sortable: true },
            ),
            createDateColumn<PersonnelTableItem, number>(
                'end_date',
                strings.personnelTableEndDate,
                (item) => item.end_date,
                { sortable: true },
            ),
        ]),
        [
            strings.personnelTablePosition,
            strings.personnelTableType,
            strings.personnelTableDeployedParty,
            strings.personnelTableDeployedTo,
            strings.personnelTableName,
            strings.personnelTableStartDate,
            strings.personnelTableEndDate,
            getTypeName,
        ],
    );

    return (
        <Container
            heading={strings.rapidResponseTitle}
            withHeaderBorder
            actions={(
                <Link
                    to="allDeployedPersonnel"
                    withLinkIcon
                    withUnderline
                >
                    {strings.deployedPersonnelViewAll}
                </Link>
            )}
            footerActions={(
                <Pager
                    activePage={page}
                    itemsCount={personnelResponse?.count ?? 0}
                    maxItemsPerPage={limit}
                    onActivePageChange={setPage}
                />
            )}
        >
            <SortContext.Provider value={sortState}>
                <Table
                    filtered={false}
                    pending={personnelPending}
                    data={personnelResponse?.results}
                    keySelector={numericIdSelector}
                    columns={columns}
                />
            </SortContext.Provider>
        </Container>
    );
}
