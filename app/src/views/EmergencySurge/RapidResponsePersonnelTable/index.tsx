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
    createStringColumn,
    createTimelineColumn,
    isValidDate,
    maxSafe,
    minSafe,
    numericIdSelector,
} from '@ifrc-go/ui/utils';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

import Link from '#components/Link';
import useFilterState from '#hooks/useFilterState';
import { COUNTRY_RECORD_TYPE_REGION } from '#utils/constants';
import { countryIdToRegionIdMap } from '#utils/domain/country';
import { createLinkColumn } from '#utils/domain/tableHelpers';
import {
    type GoApiResponse,
    useRequest,
} from '#utils/restRequest';

import i18n from './i18n.json';
import styles from './styles.module.css';

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

    const dateRange = useMemo(
        () => {
            if (
                isNotDefined(personnelResponse)
                    || isNotDefined(personnelResponse.results)
                    || personnelResponse.results.length === 0
            ) {
                return undefined;
            }

            const startDateList = personnelResponse.results.map(
                ({ start_date }) => (
                    isValidDate(start_date)
                        ? new Date(start_date).getTime()
                        : undefined
                ),
            ).filter(isDefined);

            const endDateList = personnelResponse.results.map(
                ({ end_date }) => (
                    isValidDate(end_date)
                        ? new Date(end_date).getTime()
                        : undefined
                ),
            ).filter(isDefined);

            const start = minSafe([...startDateList, ...endDateList]);
            const end = maxSafe([...startDateList, ...endDateList]);

            if (isNotDefined(start) || isNotDefined(end)) {
                return undefined;
            }

            return {
                start: new Date(start),
                end: new Date(end),
            };
        },
        [personnelResponse],
    );

    const columns = useMemo(
        () => ([
            createStringColumn<PersonnelTableItem, number>(
                'role',
                strings.personnelTablePosition,
                (item) => item.role,
                {
                    sortable: true,
                    columnClassName: styles.role,
                },
            ),
            createStringColumn<PersonnelTableItem, number>(
                'type',
                strings.personnelTableType,
                (item) => getTypeName(item.type),
                { sortable: true },
            ),
            // NOTE:We don't have proper mapping for region
            createLinkColumn<PersonnelTableItem, number>(
                'country_from',
                strings.personnelTableDeployedParty,
                (item) => item.country_from?.society_name,
                (item) => {
                    if (isNotDefined(item.country_from)) {
                        return { to: undefined };
                    }

                    const countryId = item.country_from.id;

                    if (item.country_from.record_type === COUNTRY_RECORD_TYPE_REGION) {
                        const regionId = isDefined(countryId)
                            ? countryIdToRegionIdMap[countryId]
                            : undefined;

                        return {
                            to: 'regionsLayout',
                            urlParams: { regionId },
                        };
                    }

                    return {
                        to: 'countriesLayout',
                        urlParams: { countryId },
                    };
                },
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
            createTimelineColumn<PersonnelTableItem, number>(
                'timeline',
                dateRange,
                (item) => ({
                    startDate: item.start_date,
                    endDate: item.end_date,
                }),
                { columnClassName: styles.timeline },
            ),
        ]),
        [
            strings.personnelTablePosition,
            strings.personnelTableType,
            strings.personnelTableDeployedParty,
            strings.personnelTableDeployedTo,
            strings.personnelTableName,
            getTypeName,
            dateRange,
        ],
    );

    return (
        <Container
            className={styles.rapidResponsePersonnelTable}
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
