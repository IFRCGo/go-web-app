import { useCallback, useMemo, useState } from 'react';
import { _cs } from '@togglecorp/fujs';

import {
    createStringColumn,
    createExpandColumn,
    createEmptyColumn,
    createExpansionIndicatorColumn,
    createDateColumn,
    createElementColumn,
} from '#components/Table/ColumnShortcuts';
import { type RowOptions } from '#components/Table/types';
import Container from '#components/Container';
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

interface Props {
    className?: string;
    actions?: React.ReactNode;
}

function CompletedDrefTable(props: Props) {
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
        response: completedDrefResponse,
        pending: completedDrefResponsePending,
    } = useRequest({
        url: '/api/v2/completed-dref/',
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

    type DrefResultItem = NonNullable<NonNullable<typeof completedDrefResponse>['results']>[number];
    type Key = DrefResultItem['id'];

    const [expandedRow, setExpandedRow] = useState<DrefResultItem | undefined>();
    const handleExpandClick = useCallback(
        (row: DrefResultItem) => {
            setExpandedRow(
                (prevValue) => (prevValue?.id === row.id ? undefined : row),
            );
        },
        [],
    );

    const baseColumns = useMemo(
        () => ([
            createDateColumn<DrefResultItem, Key>(
                'created_at',
                strings.completedDrefTableCreatedHeading,
                (item) => item.created_at,
                { columnClassName: styles.date },
            ),
            createStringColumn<DrefResultItem, Key>(
                'appeal_code',
                strings.completedDrefTableAppealCodeHeading,
                (item) => item.appeal_code,
                { columnClassName: styles.appealCode },
            ),
            createStringColumn<DrefResultItem, Key>(
                'title',
                strings.completedDrefTableTitleHeading,
                (item) => item.title,
                { columnClassName: styles.title },
            ),
            createStringColumn<DrefResultItem, Key>(
                'type',
                strings.completedDrefTableStageHeading,
                (item) => item.application_type_display,
                { columnClassName: styles.stage },
            ),
            createStringColumn<DrefResultItem, Key>(
                'country',
                strings.completedDrefTableCountryHeading,
                (item) => item.country_details?.name,
            ),
            createStringColumn<DrefResultItem, Key>(
                'status',
                strings.completedDrefTableStatusHeading,
                (item) => item.status_display,
            ),
            createElementColumn<DrefResultItem, Key, DrefTableActionsProps>(
                'actions',
                '',
                DrefTableActions,
                (id, item) => ({
                    id,
                    drefId: item.dref.id,
                    status: item.status,
                    // FIXME: fix typing in server (medium priority)
                    // the application_type should be an enum
                    applicationType: item.application_type as 'DREF' | 'OPS_UPDATE' | 'FINAL_REPORT',
                    canAddOpsUpdate: false,
                    canCreateFinalReport: false,
                }),
            ),
        ]),
        [strings],
    );

    const columns = useMemo(
        () => ([
            createExpansionIndicatorColumn<DrefResultItem, Key>(false),
            ...baseColumns,
            createExpandColumn<DrefResultItem, Key>(
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
            createExpansionIndicatorColumn<DrefResultItem, Key>(true),
            ...baseColumns,
            createEmptyColumn(),
        ]),
        [baseColumns],
    );

    const rowModifier = useCallback(
        ({ row, datum }: RowOptions<DrefResultItem, Key>) => {
            if (expandedRow?.id !== datum.id) {
                return row;
            }

            const {
                operational_update_details,
            } = datum.dref;

            const opsUpdateList = operational_update_details ?? [];

            const subRows: DrefResultItem[] = [
                ...opsUpdateList.map(
                    (opsUpdate) => ({
                        ...opsUpdate,
                        dref: datum.dref,
                        glide_code: datum.glide_code,
                        date_of_publication: datum.date_of_publication,
                    }),
                ),
                {
                    ...datum.dref,
                    dref: datum.dref,
                    glide_code: datum.glide_code,
                    date_of_publication: datum.date_of_publication,
                },
            ];

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
        [expandedRow, detailColumns],
    );

    return (
        <Container
            className={_cs(styles.completedDrefTable, className)}
            heading={strings.completedDrefTitle}
            actions={actions}
            footerActions={(
                <Pager
                    activePage={page}
                    itemsCount={completedDrefResponse?.count ?? 0}
                    maxItemsPerPage={limit}
                    onActivePageChange={setPage}
                />
            )}
            withHeaderBorder
            filtersContainerClassName={styles.filters}
            filters={(
                <Filters
                    value={rawFilter}
                    onChange={setFilterField}
                />
            )}
        >
            <Table
                className={styles.table}
                data={completedDrefResponse?.results}
                columns={columns}
                keySelector={numericIdSelector}
                pending={completedDrefResponsePending}
                rowModifier={rowModifier}
                filtered={filtered}
            />
        </Container>
    );
}

export default CompletedDrefTable;
