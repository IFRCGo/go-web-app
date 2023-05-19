import React from 'react';
import { _cs } from '@togglecorp/fujs';

import { RowOptions } from './index';
import TableRow from './TableRow';
import TableData from './TableData';

export type ExpansionRowChildrenProps<D, K> = (rowOptions: RowOptions<D, K>) => React.ReactNode;
export interface ExpansionOptions {
    expandedRowClassName?: string;
    expandedCellClassName?: string;
    expansionRowClassName?: string;
    expansionCellClassName?: string;
}

function useRowExpansionOnClick<D, K>(
    expansionRowChildren: ExpansionRowChildrenProps<D, K>,
    options: ExpansionOptions = {},
) : [
    (rowOptions: RowOptions<D, K>) => React.ReactNode,
    boolean,
] {
    const {
        expandedRowClassName,
        expandedCellClassName,
        expansionCellClassName,
        expansionRowClassName,
    } = options;

    const [expandedRow, setExpandedRow] = React.useState<K | undefined>();
    const rowModifier: (
        o: RowOptions<D, K>
    ) => React.ReactNode = React.useCallback((rowOptions) => {
        const {
            rowKey,
            row,
            columns,
        } = rowOptions;

        const isActive = rowKey === expandedRow;

        return (
            <>
                {React.cloneElement(row, {
                    onClick: () => {
                        setExpandedRow((oldValue) => (
                            oldValue === rowKey ? undefined : rowKey
                        ));
                    },
                    className: _cs(
                        row.props.className,
                        isActive && expandedRowClassName,
                    ),
                    children: row.props.children.map((cell: React.ReactElement) => (
                        React.cloneElement(cell, {
                            className: _cs(
                                cell.props.className,
                                isActive && expandedCellClassName,
                            ),
                        })
                    )),
                })}
                {isActive && (
                    <TableRow
                        key={`${rowKey}-expanded`}
                        className={expansionRowClassName}
                    >
                        <TableData
                            colSpan={columns.length}
                            className={expansionCellClassName}
                        >
                            { expansionRowChildren(rowOptions) }
                        </TableData>
                    </TableRow>
                )}
            </>
        );
    }, [
        expandedRow,
        setExpandedRow,
        expansionRowChildren,
        expandedRowClassName,
        expandedCellClassName,
        expansionRowClassName,
        expansionCellClassName,
    ]);

    return [rowModifier, !!expandedRow];
}

export default useRowExpansionOnClick;
