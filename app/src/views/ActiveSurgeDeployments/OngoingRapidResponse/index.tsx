import {
    useCallback,
    useMemo,
    useState,
} from 'react';
import {
    Container,
    LegendItem,
    Pager,
    Table,
    TableBodyContent,
} from '@ifrc-go/ui';
import { type RowOptions } from '@ifrc-go/ui';
import { SortContext } from '@ifrc-go/ui/contexts';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    createEmptyColumn,
    createExpandColumn,
    createExpansionIndicatorColumn,
    createMultiTimelineColumn,
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
import {
    COLOR_LIGHT_GREY,
    COLOR_PRIMARY_RED,
} from '#utils/constants';
import { createLinkColumn } from '#utils/domain/tableHelpers';
import {
    type GoApiResponse,
    useRequest,
} from '#utils/restRequest';

import i18n from './i18n.json';
import styles from './styles.module.css';

type GetRapidResponse = GoApiResponse<'/api/v2/personnel_by_event/'>;
type RapidResponseListItem = NonNullable<GetRapidResponse['results']>[number];
type DeployedListItem = NonNullable<RapidResponseListItem['deployments']>[number];
type PersonnelListItem = NonNullable<DeployedListItem['personnel']>[number];

const rapidResponsesKeySelector = (item: RapidResponseListItem) => item.id;

const PAGE_SIZE = 5;

function getDateRange(
    data: GetRapidResponse,
    key: 'appeals' | 'deployments',
): { start: Date; end: Date } | undefined {
    if (
        isNotDefined(data)
        || isNotDefined(data.results)
        || data.results.length === 0
    ) {
        return undefined;
    }

    const startDateList = data.results
        .flatMap((item) => {
            if (key === 'appeals') {
                return item[key]?.map((appeal) => {
                    if (isValidDate(appeal.start_date)) {
                        return new Date(appeal.start_date).getTime();
                    }
                    return undefined;
                }) ?? [];
            }
            if (key === 'deployments') {
                return item[key]?.flatMap((deployment) => deployment.personnel?.map((person) => {
                    if (isValidDate(person.start_date)) {
                        return new Date(person.start_date).getTime();
                    }
                    return undefined;
                }) ?? []);
            }
            return [];
        })
        .filter(isDefined);

    const endDateList = data.results
        .flatMap((item) => {
            if (key === 'appeals') {
                return item[key]?.map((appeal) => {
                    if (isValidDate(appeal.end_date)) {
                        return new Date(appeal.end_date).getTime();
                    }
                    return undefined;
                }) ?? [];
            }
            if (key === 'deployments') {
                return item[key]?.flatMap((deployment) => deployment.personnel?.map((person) => {
                    if (isValidDate(person.end_date)) {
                        return new Date(person.end_date).getTime();
                    }
                    return undefined;
                }) ?? []);
            }
            return [];
        })
        .filter(isDefined);

    const start = minSafe(startDateList);
    const end = maxSafe(endDateList);

    if (isNotDefined(start) || isNotDefined(end)) {
        return undefined;
    }

    return {
        start: new Date(start),
        end: new Date(end),
    };
}

function OngoingRapidResponse() {
    const strings = useTranslation(i18n);

    const {
        sortState,
        page,
        setPage,
        limit,
        offset,
    } = useFilterState<object>({
        filter: {},
        pageSize: PAGE_SIZE,
    });

    const [expandedRow, setExpandedRow] = useState<RapidResponseListItem | undefined>();

    const {
        pending: rapidResponsePending,
        response: rapidResponse,
    } = useRequest({
        url: '/api/v2/personnel_by_event/',
        preserveResponse: true,
        query: {
            limit,
            offset,
        },
    });

    const dateRange = useMemo(() => {
        if (isNotDefined(rapidResponse)) {
            return undefined;
        }
        return getDateRange(rapidResponse, 'deployments');
    }, [rapidResponse]);

    const appealDateRange = useMemo(() => {
        if (isNotDefined(rapidResponse)) {
            return undefined;
        }
        return getDateRange(rapidResponse, 'appeals');
    }, [rapidResponse]);

    const handleExpandClick = useCallback(
        (row: RapidResponseListItem) => {
            setExpandedRow(
                (prevValue) => (prevValue?.id === row.id ? undefined : row),
            );
        },
        [],
    );

    const baseColumns = useMemo(() => ([
        createLinkColumn<RapidResponseListItem, number>(
            'emergency',
            strings.ongoingRapidEmergency,
            (item) => item.name,
            (item) => ({
                to: 'emergenciesLayout',
                urlParams: {
                    emergencyId: String(item.id),
                },
            }),
        ),
        createStringColumn<RapidResponseListItem, number>(
            'role',
            strings.ongoingRapidPosition,
            () => '',
            { columnClassName: styles.position },
        ),
        createStringColumn<RapidResponseListItem, number>(
            'organisation',
            strings.ongoingRapidDeployingOrganisation,
            () => '',
            { columnClassName: styles.organisation },
        ),
        createMultiTimelineColumn<RapidResponseListItem, number>(
            'timeline',
            appealDateRange,
            dateRange,
            (item) => {
                const appealRange = getDateRange(
                    {
                        count: undefined,
                        next: null,
                        previous: null,
                        results: [item],
                    },
                    'appeals',
                );

                const deploymentRange = getDateRange(
                    {
                        count: undefined,
                        next: null,
                        previous: null,
                        results: [item],
                    },
                    'deployments',
                );

                return {
                    startDate: appealRange?.start,
                    endDate: appealRange?.end,
                    highlightedStartDate: deploymentRange?.start,
                    highlightedEndDate: deploymentRange?.end,
                    startDateLabel: strings.ongoingEmergencyStartDate,
                    endDateLabel: strings.ongoingEmergencyEndDate,
                    highlightedStartDateLabel: strings.ongoingDeploymentsStartDate,
                    highlightedEndDateLabel: strings.ongoingDeploymentsEndDate,
                };
            },
            { columnClassName: styles.timeline },
        ),
    ]), [
        appealDateRange,
        dateRange,
        strings.ongoingRapidEmergency,
        strings.ongoingRapidPosition,
        strings.ongoingRapidDeployingOrganisation,
        strings.ongoingEmergencyEndDate,
        strings.ongoingEmergencyStartDate,
        strings.ongoingDeploymentsStartDate,
        strings.ongoingDeploymentsEndDate,
    ]);

    const columns = useMemo(
        () => ([
            createExpansionIndicatorColumn<RapidResponseListItem, number>(
                false,
            ),
            ...baseColumns,
            createExpandColumn<RapidResponseListItem, number>(
                'expandRow',
                '',
                (row) => ({
                    onClick: handleExpandClick,
                    expanded: row.id === expandedRow?.id,
                }),
            ),
        ]),
        [handleExpandClick, baseColumns, expandedRow],
    );

    const detailColumns = useMemo(
        () => ([
            createEmptyColumn<PersonnelListItem, number>(),
            createStringColumn<PersonnelListItem, number>(
                'name',
                strings.ongoingRapidName,
                (item) => item?.name,
            ),
            createStringColumn<PersonnelListItem, number>(
                'role',
                strings.ongoingRapidRole,
                (item) => item?.role,
            ),
            createStringColumn<PersonnelListItem, number>(
                'country_from',
                strings.ongoingRapidOrganisation,
                (item) => item?.country_from?.society_name,
            ),
            createTimelineColumn<PersonnelListItem, number>(
                'timeline',
                dateRange,
                (item) => ({
                    startDate: item.start_date,
                    endDate: item.end_date,
                }),
                { columnClassName: styles.timeline },
            ),
            createEmptyColumn<PersonnelListItem, number>(),
        ]),
        [
            dateRange,
            strings.ongoingRapidRole,
            strings.ongoingRapidName,
            strings.ongoingRapidOrganisation,
        ],
    );

    const rowModifier = useCallback(
        ({ row, datum }: RowOptions<RapidResponseListItem, number>) => {
            if (datum.id !== expandedRow?.id) {
                return row;
            }

            const subRows = datum.deployments?.flatMap((deployment) => deployment.personnel);

            return (
                <>
                    {row}
                    <TableBodyContent
                        keySelector={numericIdSelector}
                        data={subRows}
                        columns={detailColumns}
                        cellClassName={styles.subCell}
                    />
                </>
            );
        },
        [
            expandedRow,
            detailColumns,
        ],
    );

    return (
        <Container
            className={styles.ongoingRapidResponse}
            heading={strings.ongoingRapidDeploymentHeading}
            withHeaderBorder
            footerActions={(
                <Pager
                    activePage={page}
                    itemsCount={rapidResponse?.count ?? 0}
                    maxItemsPerPage={limit}
                    onActivePageChange={setPage}
                />
            )}
            actions={(
                <Link
                    to="allDeployedPersonnel"
                    withLinkIcon
                    withUnderline
                >
                    {strings.ongoingRapidViewAll}
                </Link>
            )}
            footerContentClassName={styles.legend}
            footerContent={(
                <>
                    <LegendItem
                        className={styles.legendItem}
                        colorClassName={styles.color}
                        label={strings.ongoingEmergencyTimeline}
                        color={COLOR_LIGHT_GREY}
                    />
                    <LegendItem
                        className={styles.legendItem}
                        colorClassName={styles.color}
                        label={strings.ongoingDeploymentsDate}
                        color={COLOR_PRIMARY_RED}
                    />
                </>
            )}
        >
            <SortContext.Provider value={sortState}>
                <Table
                    className={styles.table}
                    pending={rapidResponsePending}
                    columns={columns}
                    rowModifier={rowModifier}
                    keySelector={rapidResponsesKeySelector}
                    data={rapidResponse?.results}
                    filtered={false}
                />
            </SortContext.Provider>
        </Container>
    );
}

export default OngoingRapidResponse;
