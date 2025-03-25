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
    createMultiTimelineColumn,
    createStringColumn,
    createTimelineColumn,
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
import { getEruEventDates } from '#utils/domain/eru';
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
        deployments_eru_type: eruTypes,
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

    const eruEventDates = useMemo(() => {
        if (isNotDefined(deployedERUResponse)) {
            return undefined;
        }
        return getEruEventDates(deployedERUResponse.results);
    }, [deployedERUResponse]);

    const timelineDateRange = useMemo(() => {
        if (isNotDefined(eruEventDates)) {
            return undefined;
        }
        if (isNotDefined(eruEventDates.timelineStartDate)
            || isNotDefined(eruEventDates.timelineEndDate)) {
            return undefined;
        }
        return {
            start: eruEventDates.timelineStartDate,
            end: eruEventDates.timelineEndDate,
        };
    }, [eruEventDates]);

    const handleExpandClick = useCallback(
        (row: ERUDeploymentListItem) => {
            setExpandedRow(
                (prevValue) => (prevValue?.id === row.id ? undefined : row),
            );
        },
        [],
    );

    const columns = useMemo(
        () => ([
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
                timelineDateRange,
                (item) => {
                    const itemDateRange = getEruEventDates([item]);
                    return {
                        startDate: itemDateRange?.appealStartDate,
                        endDate: itemDateRange?.appealEndDate,
                        highlightedStartDate: itemDateRange?.eruStartDate,
                        highlightedEndDate: itemDateRange?.eruEndDate,
                        startDateLabel: strings.deployedAppealStartDate,
                        endDateLabel: strings.deployedAppealEndDate,
                        highlightedStartDateLabel: strings.deployedERUStartDate,
                        highlightedEndDateLabel: strings.deployedERUEndDate,
                    };
                },
                { columnClassName: styles.timeline },
            ),
            createExpandColumn<ERUDeploymentListItem, number>(
                'expandRow',
                '',
                (row) => ({
                    onClick: handleExpandClick,
                    expanded: row.id === expandedRow?.id,
                }),
            ),
        ]),
        [
            handleExpandClick,
            expandedRow,
            timelineDateRange,
            strings.deployedERUEmergency,
            strings.deployedERUOrganisation,
            strings.deployedAppealStartDate,
            strings.deployedAppealEndDate,
            strings.deployedERUStartDate,
            strings.deployedERUEndDate,
        ],
    );

    const eruColumns = useMemo(
        () => ([
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
                timelineDateRange,
                (item) => ({
                    startDate: item.start_date,
                    endDate: item.end_date,
                }),
                { columnClassName: styles.timeline },
            ),
            createEmptyColumn<ActiveERUListItem, number>(),
        ]),
        [
            timelineDateRange,
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
                        columns={eruColumns}
                        cellClassName={styles.subCell}
                    />
                </>
            );
        },
        [
            expandedRow,
            eruColumns,
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
                    options={eruTypes}
                />
            )}
            footerContent={(
                <>
                    <LegendItem
                        label={strings.deploymentsERUEmergencyTimeline}
                        color={COLOR_LIGHT_GREY}
                    />
                    <LegendItem
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
