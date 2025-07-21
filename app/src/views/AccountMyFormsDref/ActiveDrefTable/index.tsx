import {
    useCallback,
    useMemo,
    useState,
} from 'react';
import {
    Container,
    Pager,
    Table,
    TableBodyContent,
} from '@ifrc-go/ui';
import { type RowOptions } from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    createDateColumn,
    createElementColumn,
    createEmptyColumn,
    createExpandColumn,
    createExpansionIndicatorColumn,
    createStringColumn,
    numericIdSelector,
} from '@ifrc-go/ui/utils';
import {
    _cs,
    isDefined,
    isNotDefined,
    listToMap,
} from '@togglecorp/fujs';

import useUserMe from '#hooks/domain/useUserMe';
import useFilterState from '#hooks/useFilterState';
import {
    DREF_TYPE_LOAN,
    type TypeOfDrefEnum,
} from '#utils/constants';
import { useRequest } from '#utils/restRequest';

import DrefTableActions, { type Props as DrefTableActionsProps } from '../DrefTableActions';
import Filters, { type FilterValue } from '../Filters';

import i18n from './i18n.json';
import styles from './styles.module.css';

const NUM_ITEMS_PER_PAGE = 6;

interface Props {
    className?: string;
    actions?: React.ReactNode;
}

function ActiveDrefTable(props: Props) {
    const {
        className,
        actions,
    } = props;

    const strings = useTranslation(i18n);
    const {
        page,
        setPage,
        rawFilter,
        filter,
        filtered,
        setFilterField,
        limit,
        offset,
    } = useFilterState<FilterValue>({
        filter: {},
        pageSize: 6,
    });

    const {
        response: activeDrefResponse,
        pending: activeDrefResponsePending,
        retrigger: refetchActiveDref,
    } = useRequest({
        url: '/api/v2/active-dref/',
        preserveResponse: true,
        query: {
            offset,
            limit,
            // FIXME server should accept country
            country: isDefined(filter.country) ? [filter.country] : undefined,
            type_of_dref: isDefined(filter.type_of_dref) ? [filter.type_of_dref] : undefined,
            disaster_type: filter.disaster_type,
            appeal_code: filter.appeal_code,
        },
    });

    const userMe = useUserMe();
    const userRegionCoordinatorMap = useMemo(
        () => {
            if (
                isNotDefined(userMe)
                || isNotDefined(userMe.is_dref_coordinator_for_regions)
                || userMe.is_dref_coordinator_for_regions.length === 0
            ) {
                return undefined;
            }

            return listToMap(
                userMe.is_dref_coordinator_for_regions,
                (region) => region,
                () => true,
            );
        },
        [userMe],
    );

    type DrefItem = NonNullable<NonNullable<typeof activeDrefResponse>['results']>[number];
    type Key = DrefItem['id'];

    const getLatestStageOfDref = useCallback(
        (dref: DrefItem) => {
            const {
                final_report_details,
                operational_update_details,
                has_ops_update,
                has_final_report,
            } = dref;

            if (has_final_report) {
                return final_report_details;
            }

            if (has_ops_update) {
                const opsUpdateList = operational_update_details;
                return opsUpdateList[0];
            }

            return dref;
        },
        [],
    );

    const latestDrefs = useMemo(
        () => activeDrefResponse?.results?.map(getLatestStageOfDref),
        [activeDrefResponse, getLatestStageOfDref],
    );

    type LatestDref = NonNullable<typeof latestDrefs>[number];

    const latestDrefToOriginalMap = useMemo(
        () => listToMap(
            activeDrefResponse?.results ?? [],
            (dref) => {
                const val = getLatestStageOfDref(dref);
                return val.id;
            },
        ),
        [activeDrefResponse, getLatestStageOfDref],
    );

    const [expandedRow, setExpandedRow] = useState<LatestDref | undefined>();
    const handleExpandClick = useCallback(
        (row: LatestDref) => {
            setExpandedRow(
                (prevValue) => (prevValue?.id === row.id ? undefined : row),
            );
        },
        [],
    );

    const baseColumns = useMemo(
        () => ([
            createDateColumn<LatestDref, Key>(
                'created_at',
                strings.activeDrefTableCreatedHeading,
                (item) => item.created_at,
                { columnClassName: styles.date },
            ),
            createStringColumn<LatestDref, Key>(
                'appeal_code',
                strings.activeDrefTableAppealCodeHeading,
                (item) => item.appeal_code,
                { columnClassName: styles.appealCode },
            ),
            createStringColumn<LatestDref, Key>(
                'title',
                strings.activeDrefTableTitleHeading,
                (item) => item.title,
                { columnClassName: styles.title },
            ),
            createStringColumn<LatestDref, Key>(
                'type',
                strings.activeDrefTableStageHeading,
                (item) => item.application_type_display,
                { columnClassName: styles.stage },
            ),
            createStringColumn<LatestDref, Key>(
                'country',
                strings.activeDrefTableCountryHeading,
                (item) => item.country_details?.name,
                { columnClassName: styles.country },
            ),
            createStringColumn<LatestDref, Key>(
                'type_of_dref',
                strings.activeDrefTableTypeOfDrefHeading,
                (item) => item.type_of_dref_display,
                { columnClassName: styles.type },
            ),
            createStringColumn<LatestDref, Key>(
                'status',
                strings.activeDrefTableStatusHeading,
                (item) => item.status_display,
                { columnClassName: styles.status },
            ),
            createElementColumn<LatestDref, Key, DrefTableActionsProps>(
                'actions',
                '',
                DrefTableActions,
                (id, item) => {
                    const originalDref = latestDrefToOriginalMap[id];
                    // FIXME: fix typing in server (medium priority)
                    // the application_type should be an enum
                    const applicationType = item.application_type as 'DREF' | 'OPS_UPDATE' | 'FINAL_REPORT';
                    const drefType = item.type_of_dref as TypeOfDrefEnum;
                    if (!originalDref) {
                        return {
                            id,
                            drefId: id,
                            drefType,
                            status: item.status,
                            applicationType,
                            canAddOpsUpdate: false,
                            canCreateFinalReport: false,
                            hasPermissionToApprove: false,
                        };
                    }

                    const {
                        unpublished_op_update_count,
                        is_published,
                        has_ops_update,
                        has_final_report,
                        country_details,
                        is_dref_imminent_v2,
                    } = originalDref;

                    const canAddOpsUpdate = (is_published ?? false)
                        && (applicationType === 'DREF' || applicationType === 'OPS_UPDATE')
                        && !has_final_report
                        && unpublished_op_update_count === 0;

                    const canCreateFinalReport = !has_final_report
                        && (applicationType === 'DREF' || applicationType === 'OPS_UPDATE')
                        && (is_published ?? false)
                        && (item.type_of_dref !== DREF_TYPE_LOAN)
                        && (
                            !has_ops_update
                            || (has_ops_update && unpublished_op_update_count === 0)
                        );

                    const drefRegion = country_details?.region;
                    const isRegionCoordinator = isDefined(drefRegion)
                        ? userRegionCoordinatorMap?.[drefRegion] ?? false
                        : false;

                    return {
                        id,
                        drefId: originalDref.id,
                        drefType,
                        status: item.status,
                        isDrefImminentV2: is_dref_imminent_v2,
                        applicationType,
                        canAddOpsUpdate,
                        canCreateFinalReport,
                        hasPermissionToApprove: isRegionCoordinator || userMe?.is_superuser,
                        onPublishSuccess: refetchActiveDref,
                    };
                },
                { columnClassName: styles.actions },
            ),
        ]),
        [
            strings.activeDrefTableCreatedHeading,
            strings.activeDrefTableAppealCodeHeading,
            strings.activeDrefTableTitleHeading,
            strings.activeDrefTableStageHeading,
            strings.activeDrefTableCountryHeading,
            strings.activeDrefTableTypeOfDrefHeading,
            strings.activeDrefTableStatusHeading,
            latestDrefToOriginalMap,
            userMe,
            userRegionCoordinatorMap,
            refetchActiveDref,
        ],
    );

    const columns = useMemo(
        () => ([
            createExpansionIndicatorColumn<LatestDref, Key>(false),
            ...baseColumns,
            createExpandColumn<LatestDref, Key>(
                'expandRow',
                '',
                (row) => ({
                    onClick: handleExpandClick,
                    expanded: row.id === expandedRow?.id,
                    disabled: row.application_type === 'DREF',
                }),
            ),
        ]),
        [baseColumns, handleExpandClick, expandedRow],
    );

    const detailColumns = useMemo(
        () => ([
            createExpansionIndicatorColumn<LatestDref, Key>(true),
            ...baseColumns,
            createEmptyColumn(),
        ]),
        [baseColumns],
    );

    const rowModifier = useCallback(
        ({ row, datum }: RowOptions<LatestDref, Key>) => {
            if (expandedRow?.id !== datum.id) {
                return row;
            }

            const originalDref = latestDrefToOriginalMap[datum.id];

            if (!originalDref || (!originalDref.has_final_report && !originalDref.has_ops_update)) {
                return row;
            }

            const {
                final_report_details,
                operational_update_details,
            } = originalDref;

            const opsUpdateList = operational_update_details;

            const subRows: LatestDref[] = [
                final_report_details,
                ...opsUpdateList,
                originalDref,
            ].slice(1);
            // We don't need first element since, it will be
            // rendered by row

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
        [expandedRow, detailColumns, latestDrefToOriginalMap],
    );

    return (
        <Container
            className={_cs(styles.activeDrefTable, className)}
            heading={strings.activeDrefTitle}
            actions={actions}
            footerActions={(
                <Pager
                    activePage={page}
                    itemsCount={activeDrefResponse?.count ?? 0}
                    maxItemsPerPage={NUM_ITEMS_PER_PAGE}
                    onActivePageChange={setPage}
                />
            )}
            withHeaderBorder
            filters={(
                <Filters
                    value={rawFilter}
                    onChange={setFilterField}
                />
            )}
        >
            <Table
                className={styles.table}
                data={latestDrefs}
                columns={columns}
                keySelector={numericIdSelector}
                pending={activeDrefResponsePending}
                rowModifier={rowModifier}
                filtered={filtered}
            />
        </Container>
    );
}

export default ActiveDrefTable;
