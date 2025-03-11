import {
    useCallback,
    useMemo,
    useState,
} from 'react';
import {
    Container,
    LegendItem,
    Pager,
    SelectInput,
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
import { type components } from '#generated/types';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
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

type DeploymentsEruTypeEnum = components<'read'>['schemas']['DeploymentsEruTypeEnum'];

type GetERUDeploymentsResponse = GoApiResponse<'/api/v2/deployed_eru_by_event/'>;
type ERUDeploymentListItem = NonNullable<GetERUDeploymentsResponse['results']>[number];
type ActiveERUListItem = NonNullable<ERUDeploymentListItem['active_erus']>[number];

const eruResponsesKeySelector = (item: ERUDeploymentListItem) => item.id;

const emergencyResponseUnitTypeKeySelector = (item: DeploymentsEruTypeEnum) => item.key;
const emergencyResponseUnitTypeLabelSelector = (item: DeploymentsEruTypeEnum) => item.value ?? '?';

const PAGE_SIZE = 5;

function getDateRange(data: GetERUDeploymentsResponse, key: 'appeals' | 'active_erus') {
    if (
        isNotDefined(data)
        || isNotDefined(data.results)
        || data.results.length === 0
    ) {
        return undefined;
    }

    const startDateList = data.results
        .flatMap((item) => item[key]?.map(
            (entry) => (isValidDate(entry.start_date)
                ? new Date(entry.start_date).getTime() : undefined),
        ) ?? [])
        .filter(isDefined);

    const endDateList = data.results
        .flatMap((item) => item[key]?.map(
            (entry) => (isValidDate(entry.end_date)
                ? new Date(entry.end_date).getTime() : undefined),
        ) ?? [])
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

function OngoingERUDeployments() {
    const strings = useTranslation(i18n);

    const {
        sortState,
        page,
        setPage,
        limit,
        offset,
        filter,
        rawFilter,
        filtered,
        setFilterField,
    } = useFilterState<{type? : DeploymentsEruTypeEnum['key']}>({
        filter: {},
        pageSize: PAGE_SIZE,
    });

    const {
        deployments_eru_type,
    } = useGlobalEnums();

    const [expandedRow, setExpandedRow] = useState<ERUDeploymentListItem | undefined>();

    const {
        pending: deployedERUResponsePending,
        response: deployedERUResponse,
    } = useRequest({
        url: '/api/v2/deployed_eru_by_event/',
        preserveResponse: true,
        query: {
            limit,
            offset,
            eru_type: isDefined(filter.type) ? filter.type : undefined,
        },
    });

    const appealDateRange = useMemo(() => {
        if (isNotDefined(deployedERUResponse)) {
            return undefined;
        }
        return getDateRange(deployedERUResponse, 'appeals');
    }, [deployedERUResponse]);

    const dateRange = useMemo(() => {
        if (isNotDefined(deployedERUResponse)) {
            return undefined;
        }
        return getDateRange(deployedERUResponse, 'active_erus');
    }, [deployedERUResponse]);

    const handleExpandClick = useCallback(
        (row: ERUDeploymentListItem) => {
            setExpandedRow(
                (prevValue) => (prevValue?.id === row.id ? undefined : row),
            );
        },
        [],
    );

    const baseColumns = useMemo(() => ([
        createLinkColumn<ERUDeploymentListItem, number>(
            'name',
            strings.deployedERUEmergency,
            (item) => item.name,
            (item) => ({
                to: 'emergenciesLayout',
                urlParams: {
                    emergencyId: String(item.id),
                },
            }),
        ),
        createStringColumn<ERUDeploymentListItem, number>(
            'organisation',
            strings.deployedERUOrganisation,
            () => '',
            { columnClassName: styles.organisation },
        ),
        createMultiTimelineColumn<ERUDeploymentListItem, number>(
            'timeline',
            appealDateRange,
            dateRange,
            (item) => {
                const appealRange = getDateRange({
                    count: undefined,
                    next: null,
                    previous: null,
                    results: [item],
                }, 'appeals');

                const eruRange = getDateRange({
                    count: undefined,
                    next: null,
                    previous: null,
                    results: [item],
                }, 'active_erus');

                return {
                    startDate: appealRange?.start,
                    endDate: appealRange?.end,
                    highlightedStartDate: eruRange?.start,
                    highlightedEndDate: eruRange?.end,
                    startDateLabel: strings.deployedAppealStartDate,
                    endDateLabel: strings.deployedAppealEndDate,
                    highlightedStartDateLabel: strings.deployedERUStartDate,
                    highlightedEndDateLabel: strings.deployedERUEndDate,
                };
            },
            { columnClassName: styles.timeline },
        ),
    ]), [
        appealDateRange,
        dateRange,
        strings.deployedERUEmergency,
        strings.deployedERUOrganisation,
        strings.deployedAppealStartDate,
        strings.deployedAppealEndDate,
        strings.deployedERUStartDate,
        strings.deployedERUEndDate,
    ]);

    const columns = useMemo(
        () => ([
            createExpansionIndicatorColumn<ERUDeploymentListItem, number>(
                false,
            ),
            ...baseColumns,
            createExpandColumn<ERUDeploymentListItem, number>(
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
            createEmptyColumn<ActiveERUListItem, number>(),
            createStringColumn<ActiveERUListItem, number>(
                'name',
                strings.deployedERUName,
                (item) => item?.type_display,
            ),
            createStringColumn<ActiveERUListItem, number>(
                'society_name',
                strings.deployedERUOrganisation,
                (item) => item?.eru_owner_details?.national_society_country_details.society_name,
            ),
            createTimelineColumn<ActiveERUListItem, number>(
                'timeline',
                dateRange,
                (item) => ({
                    startDate: item.start_date,
                    endDate: item.end_date,
                }),
                { columnClassName: styles.timeline },
            ),
            createEmptyColumn<ActiveERUListItem, number>(),
        ]),
        [
            dateRange,
            strings.deployedERUOrganisation,
            strings.deployedERUName,
        ],
    );

    const rowModifier = useCallback(
        ({ row, datum }: RowOptions<ERUDeploymentListItem, number>) => {
            if (datum.id !== expandedRow?.id) {
                return row;
            }

            const subRows = datum.active_erus;

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
            className={styles.ongoingEruDeployments}
            heading={strings.deployedERUHeading}
            withHeaderBorder
            footerActions={(
                <Pager
                    activePage={page}
                    itemsCount={deployedERUResponse?.count ?? 0}
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
                    {strings.deployedERUViewAll}
                </Link>
            )}
            filters={(
                <SelectInput
                    placeholder={strings.deployedERUTypes}
                    name="type"
                    value={rawFilter.type}
                    onChange={setFilterField}
                    keySelector={emergencyResponseUnitTypeKeySelector}
                    labelSelector={emergencyResponseUnitTypeLabelSelector}
                    options={deployments_eru_type}
                />
            )}
            footerContentClassName={styles.legend}
            footerContent={(
                <>
                    <LegendItem
                        className={styles.legendItem}
                        label={strings.deploymentsERUEmergencyTimeline}
                        color={COLOR_LIGHT_GREY}
                    />
                    <LegendItem
                        className={styles.legendItem}
                        label={strings.deploymentsERUDates}
                        color={COLOR_PRIMARY_RED}
                    />
                </>
            )}
        >
            <SortContext.Provider value={sortState}>
                <Table
                    className={styles.table}
                    pending={deployedERUResponsePending}
                    columns={columns}
                    rowModifier={rowModifier}
                    keySelector={eruResponsesKeySelector}
                    data={deployedERUResponse?.results}
                    filtered={filtered}
                />
            </SortContext.Provider>
        </Container>
    );
}

export default OngoingERUDeployments;
