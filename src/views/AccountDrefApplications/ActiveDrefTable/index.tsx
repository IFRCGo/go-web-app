import { useCallback, useMemo, useState } from 'react';
import { _cs, listToMap } from '@togglecorp/fujs';

import Container from '#components/Container';
import {
    createStringColumn,
    createExpandColumn,
    createEmptyColumn,
    createExpansionIndicatorColumn,
    createDateColumn,
    createElementColumn,
} from '#components/Table/ColumnShortcuts';
import { type RowOptions } from '#components/Table/types';
import Table from '#components/Table';
import Pager from '#components/Pager';
import TableBodyContent from '#components/Table/TableBodyContent';
import useTranslation from '#hooks/useTranslation';
import useFilterState from '#hooks/useFilterState';
import { numericIdSelector } from '#utils/selectors';
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
        filter,
        filtered,
        setFilterField,
        limit,
        offset,
    } = useFilterState<FilterValue>(
        {},
        undefined,
        1,
        6,
    );

    const {
        response: activeDrefResponse,
        pending: activeDrefResponsePending,
    } = useRequest({
        url: '/api/v2/active-dref/',
        preserveResponse: true,
        query: {
            offset,
            limit,
            // FIXME server should accept country
            country: filter.country,
            type_of_dref: filter.type_of_dref,
            disaster_type: filter.disaster_type,
            appeal_code: filter.appeal_code,
        },
    });

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
                const finalReportList = final_report_details;
                return finalReportList[0];
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
            ),
            createStringColumn<LatestDref, Key>(
                'type_of_dref',
                strings.activeDrefTableTypeOfDrefHeading,
                (item) => item.type_of_dref_display,
            ),
            createStringColumn<LatestDref, Key>(
                'status',
                strings.activeDrefTableStatusHeading,
                (item) => item.status_display,
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
                    if (!originalDref) {
                        return {
                            id,
                            drefId: id,
                            status: item.status,
                            applicationType,
                            canAddOpsUpdate: false,
                            canCreateFinalReport: false,
                        };
                    }

                    const {
                        // unpublished_final_report_count,
                        unpublished_op_update_count,
                        is_published,
                        has_ops_update,
                        has_final_report,
                    } = originalDref;

                    const canAddOpsUpdate = (is_published ?? false)
                        && (applicationType === 'DREF' || applicationType === 'OPS_UPDATE')
                        && !has_final_report
                        && unpublished_op_update_count === 0;

                    const canCreateFinalReport = !has_final_report
                        && (applicationType === 'DREF' || applicationType === 'OPS_UPDATE')
                        && (is_published ?? false)
                        && (
                            !has_ops_update
                                || (has_ops_update && unpublished_op_update_count === 0)
                        );

                    return {
                        id,
                        drefId: originalDref.id,
                        status: item.status,
                        applicationType,
                        canAddOpsUpdate,
                        canCreateFinalReport,
                    };
                },
            ),
        ]),
        [strings, latestDrefToOriginalMap],
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

            const finalReportList = final_report_details;
            const opsUpdateList = operational_update_details;

            const subRows: LatestDref[] = [
                ...finalReportList,
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
            filtersContainerClassName={styles.filters}
            filters={(
                <Filters
                    value={filter}
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
