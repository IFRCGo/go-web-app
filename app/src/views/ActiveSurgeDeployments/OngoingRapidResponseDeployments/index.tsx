import {
    useCallback,
    useMemo,
    useState,
} from 'react';
import {
    Container,
    LegendItem,
    ListView,
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
    createMultiTimelineColumn,
    createStringColumn,
    createTimelineColumn,
    numericIdSelector,
} from '@ifrc-go/ui/utils';
import { isNotDefined } from '@togglecorp/fujs';

import Link from '#components/Link';
import useFilterState from '#hooks/useFilterState';
import {
    COLOR_LIGHT_GREY,
    COLOR_PRIMARY_RED,
} from '#utils/constants';
import { getRapidResponseEventDates } from '#utils/domain/eru';
import { createLinkColumn } from '#utils/domain/tableHelpers';
import {
    type GoApiResponse,
    useRequest,
} from '#utils/restRequest';

import i18n from './i18n.json';
import styles from './styles.module.css';

type GetRapidResponseByEvent = GoApiResponse<'/api/v2/personnel_by_event/'>;
type RapidResponseByEventItem = NonNullable<GetRapidResponseByEvent['results']>[number];
type Personnel = NonNullable<NonNullable<RapidResponseByEventItem['deployments']>[number]['personnel']>[number] & {
    country_deployed_to?: NonNullable<RapidResponseByEventItem['deployments']>[number]['country_deployed_to'];
};

const rapidResponsesKeySelector = (item: RapidResponseByEventItem) => item.id;

const PAGE_SIZE = 5;

function OngoingRapidResponseDeployments() {
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

    const [expandedRow, setExpandedRow] = useState<RapidResponseByEventItem | undefined>();

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

    const rapidResponseEventDates = useMemo(() => {
        if (isNotDefined(rapidResponse)) {
            return undefined;
        }
        return getRapidResponseEventDates(rapidResponse.results);
    }, [rapidResponse]);

    const timelineDateRange = useMemo(() => {
        if (isNotDefined(rapidResponseEventDates)) {
            return undefined;
        }
        if (isNotDefined(rapidResponseEventDates.timelineStartDate)
            || isNotDefined(rapidResponseEventDates.timelineEndDate)) {
            return undefined;
        }
        return {
            start: rapidResponseEventDates.timelineStartDate,
            end: rapidResponseEventDates.timelineEndDate,
        };
    }, [rapidResponseEventDates]);

    const handleExpandClick = useCallback(
        (row: RapidResponseByEventItem) => {
            setExpandedRow(
                (prevValue) => (prevValue?.id === row.id ? undefined : row),
            );
        },
        [],
    );

    const columns = useMemo(
        () => ([
            createLinkColumn<RapidResponseByEventItem, number>(
                'emergency',
                strings.rapidResponseEmergency,
                (item) => item.name,
                (item) => ({
                    to: 'emergenciesLayout',
                    urlParams: {
                        emergencyId: String(item.id),
                    },
                }),
                {
                    columnClassName: styles.name,
                },
            ),
            createStringColumn<RapidResponseByEventItem, number>(
                'role',
                strings.rapidResponsePosition,
                () => '',
                {
                    defaultEmptyValue: '',
                    columnClassName: styles.role,
                },
            ),
            createStringColumn<RapidResponseByEventItem, number>(
                'organisation',
                strings.rapidResponseDeployingOrganisation,
                () => '',
                {
                    columnClassName: styles.organisation,
                    defaultEmptyValue: '',
                },
            ),
            createStringColumn<RapidResponseByEventItem, number>(
                'country',
                strings.rapidResponseDeploymentCountry,
                () => '',
                {
                    defaultEmptyValue: '',
                    columnClassName: styles.country,
                },
            ),
            createMultiTimelineColumn<RapidResponseByEventItem, number>(
                'timeline',
                timelineDateRange,
                (item) => {
                    const itemDateRange = getRapidResponseEventDates([item]);
                    return {
                        startDate: itemDateRange?.appealStartDate,
                        endDate: itemDateRange?.appealEndDate,
                        highlightedStartDate: itemDateRange?.personnelStartDate,
                        highlightedEndDate: itemDateRange?.personnelEndDate,
                        startDateLabel: strings.emergencyStartDate,
                        endDateLabel: strings.emergencyEndDate,
                        highlightedStartDateLabel: strings.deploymentStartDate,
                        highlightedEndDateLabel: strings.deploymentEndDate,
                    };
                },
                { columnClassName: styles.timeline },
            ),
            createExpandColumn<RapidResponseByEventItem, number>(
                'expandRow',
                '',
                (row) => ({
                    onClick: handleExpandClick,
                    expanded: row.id === expandedRow?.id,
                }),
                { columnClassName: styles.actions },
            ),
        ]),
        [
            handleExpandClick,
            expandedRow,
            timelineDateRange,
            strings.rapidResponseEmergency,
            strings.rapidResponsePosition,
            strings.rapidResponseDeployingOrganisation,
            strings.rapidResponseDeploymentCountry,
            strings.emergencyEndDate,
            strings.emergencyStartDate,
            strings.deploymentStartDate,
            strings.deploymentEndDate,
        ],
    );

    const personnelColumns = useMemo(
        () => ([
            createStringColumn<Personnel, number>(
                'name',
                strings.rapidResponseName,
                (item) => item?.name,
                {
                    columnClassName: styles.name,
                },
            ),
            createStringColumn<Personnel, number>(
                'role',
                strings.rapidResponseRole,
                (item) => item?.role,
                {
                    columnClassName: styles.role,
                },
            ),
            createStringColumn<Personnel, number>(
                'country_from',
                strings.rapidResponseOrganisation,
                (item) => item?.country_from?.society_name,
            ),
            createLinkColumn<Personnel, number>(
                'country',
                strings.rapidResponseDeploymentCountry,
                (item) => item?.country_deployed_to?.name,
                (item) => ({
                    to: 'countriesLayout',
                    urlParams: {
                        countryId: item?.country_deployed_to?.id,
                    },
                }),
            ),
            createTimelineColumn<Personnel, number>(
                'timeline',
                timelineDateRange,
                (item) => ({
                    startDate: item.start_date,
                    endDate: item.end_date,
                }),
            ),
            createEmptyColumn<Personnel, number>(),
        ]),
        [
            timelineDateRange,
            strings.rapidResponseRole,
            strings.rapidResponseName,
            strings.rapidResponseOrganisation,
            strings.rapidResponseDeploymentCountry,
        ],
    );

    const rowModifier = useCallback(
        ({ row, datum }: RowOptions<RapidResponseByEventItem, number>) => {
            if (datum.id !== expandedRow?.id) {
                return row;
            }

            const subRows = datum.deployments?.flatMap((deployment) => (
                deployment.personnel.map((personnel) => ({
                    ...personnel,
                    country_deployed_to: deployment.country_deployed_to,
                }))
            ));

            return (
                <>
                    {row}
                    <TableBodyContent
                        keySelector={numericIdSelector}
                        data={subRows}
                        columns={personnelColumns}
                        cellClassName={styles.subCell}
                    />
                </>
            );
        },
        [
            expandedRow,
            personnelColumns,
        ],
    );

    return (
        <Container
            className={styles.rapidResponseDeployments}
            heading={strings.rapidResponseDeploymentHeading}
            withHeaderBorder
            footerActions={(
                <Pager
                    activePage={page}
                    itemsCount={rapidResponse?.count ?? 0}
                    maxItemsPerPage={limit}
                    onActivePageChange={setPage}
                />
            )}
            headerActions={(
                <Link
                    to="allDeployedPersonnel"
                    withLinkIcon
                    withUnderline
                >
                    {strings.rapidResponseViewAll}
                </Link>
            )}
            footer={(
                <ListView withWrap>
                    <LegendItem
                        label={strings.emergencyTimeline}
                        color={COLOR_LIGHT_GREY}
                    />
                    <LegendItem
                        label={strings.deploymentDate}
                        color={COLOR_PRIMARY_RED}
                    />
                </ListView>
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

export default OngoingRapidResponseDeployments;
