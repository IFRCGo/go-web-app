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
import useDebouncedValue from '#hooks/useDebouncedValue';
import { numericIdSelector } from '#utils/selectors';
import { useRequest } from '#utils/restRequest';
import { hasSomeDefinedValue } from '#utils/common';

import DrefTableActions, { type Props as DrefTableActionsProps } from '../DrefTableActions';
import Filters, { type FilterValue } from '../Filters';
import i18n from './i18n.json';
import styles from './styles.module.css';

const NUM_ITEMS_PER_PAGE = 6;

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
    const [page, setPage] = useState(1);
    const [filterValue, setFilterValue] = useState<FilterValue>({
        country: undefined,
        type_of_dref: undefined,
        disaster_type: undefined,
        appeal_code: undefined,
    });

    const debouncedFilterValue = useDebouncedValue(filterValue);

    const {
        response: completedDrefResponse,
        pending: completedDrefResponsePending,
    } = useRequest({
        url: '/api/v2/completed-dref/',
        query: {
            offset: NUM_ITEMS_PER_PAGE * (page - 1),
            limit: NUM_ITEMS_PER_PAGE,
            ...debouncedFilterValue,
        },
    });

    type DrefResultItem = NonNullable<NonNullable<typeof completedDrefResponse>['results']>[number];
    type DrefItem = Omit<DrefResultItem, 'dref'>;
    type Key = DrefItem['id'];

    const [expandedRow, setExpandedRow] = useState<DrefItem | undefined>();
    const handleExpandClick = useCallback(
        (row: DrefItem) => {
            setExpandedRow(
                (prevValue) => (prevValue?.id === row.id ? undefined : row),
            );
        },
        [],
    );

    const baseColumns = useMemo(
        () => ([
            createDateColumn<DrefItem, Key>(
                'created_at',
                strings.completedDrefTableCreatedHeading,
                (item) => item.created_at,
                { columnClassName: styles.date },
            ),
            createStringColumn<DrefItem, Key>(
                'appeal_code',
                strings.completedDrefTableAppealCodeHeading,
                (item) => item.appeal_code,
                { columnClassName: styles.appealCode },
            ),
            createStringColumn<DrefItem, Key>(
                'title',
                strings.completedDrefTableTitleHeading,
                (item) => item.title,
                { columnClassName: styles.title },
            ),
            createStringColumn<DrefItem, Key>(
                'type',
                strings.completedDrefTableStageHeading,
                (item) => item.application_type_display,
                { columnClassName: styles.stage },
            ),
            createStringColumn<DrefItem, Key>(
                'country',
                strings.completedDrefTableCountryHeading,
                (item) => item.country_details?.name,
            ),
            createStringColumn<DrefItem, Key>(
                'status',
                strings.completedDrefTableStatusHeading,
                (item) => item.status_display,
            ),
            createElementColumn<DrefItem, Key, DrefTableActionsProps>(
                'actions',
                '',
                DrefTableActions,
                (id, item) => ({
                    id,
                    status: item.status,
                    applicationType: item.application_type,
                    canAddOpsUpdate: false,
                    canCreateFinalReport: false,
                }),
            ),
        ]),
        [strings],
    );

    const columns = useMemo(
        () => ([
            createExpansionIndicatorColumn<DrefItem, Key>(false),
            ...baseColumns,
            createExpandColumn<DrefItem, Key>(
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
            createExpansionIndicatorColumn<DrefItem, Key>(true),
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

            const { operational_update_details } = datum.dref;
            type OperationalUpdateType = typeof operational_update_details;

            // eslint-disable-next-line max-len
            const opsUpdateList = (operational_update_details ?? []) as unknown as OperationalUpdateType[];

            const subRows: DrefItem[] = [
                ...opsUpdateList,
                datum.dref,
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
                    maxItemsPerPage={NUM_ITEMS_PER_PAGE}
                    onActivePageChange={setPage}
                />
            )}
            withHeaderBorder
            filtersContainerClassName={styles.filters}
            filters={(
                <Filters
                    value={filterValue}
                    onChange={setFilterValue}
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
                filtered={hasSomeDefinedValue(filterValue)}
            />
        </Container>
    );
}

export default CompletedDrefTable;
