import { Fragment } from 'react';
import { _cs } from '@togglecorp/fujs';

import TableData from '../TableData';
import TableRow from '../TableRow';
import type {
    Column,
    RowOptions,
    VerifyColumn,
} from '../types';

import styles from './styles.module.css';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface Props<DATUM, KEY extends string | number, COLUMN extends Column<DATUM, KEY, any, any>> {
    data: DATUM[] | undefined | null;
    keySelector: (datum: DATUM, index: number) => KEY;
    columns: COLUMN[] & VerifyColumn<COLUMN, DATUM, KEY>;
    rowClassName?: string | ((key: KEY, datum: DATUM) => (string | undefined));
    cellClassName?: string | ((key: KEY, datum: DATUM, columnKey: string) => (string | undefined));
    rowModifier?: (rowOptions: RowOptions<DATUM, KEY>) => React.ReactNode;
}

function TableBodyContent<
    DATUM,
    KEY extends string | number,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    C extends Column<DATUM, KEY, any, any>
>(props: Props<DATUM, KEY, C>) {
    const {
        data,
        keySelector,
        columns,
        rowClassName,
        cellClassName,
        rowModifier,
    } = props;

    return (
        // eslint-disable-next-line react/jsx-no-useless-fragment
        <>
            {data?.map((datum, index) => {
                const key = keySelector(datum, index);
                const cells = columns.map((column) => {
                    const {
                        id,
                        cellRenderer: Renderer,
                        cellRendererClassName,
                        cellRendererParams,
                        cellContainerClassName,
                    } = column;

                    const otherProps = cellRendererParams(key, datum, index, data);
                    const children = (
                        <Renderer
                            className={cellRendererClassName}
                            // eslint-disable-next-line react/jsx-props-no-spreading
                            {...otherProps}
                            name={id}
                        />
                    );
                    return (
                        <TableData
                            key={id}
                            className={_cs(
                                styles.cell,
                                cellContainerClassName,
                                typeof cellClassName === 'function'
                                    ? cellClassName(key, datum, id)
                                    : cellClassName,
                            )}
                        >
                            {children}
                        </TableData>
                    );
                });

                const row = (
                    <TableRow
                        className={_cs(
                            styles.row,
                            typeof rowClassName === 'function'
                                ? rowClassName(key, datum)
                                : rowClassName,
                        )}
                    >
                        { cells }
                    </TableRow>
                );

                let modifiedRow: React.ReactNode = row;

                if (rowModifier) {
                    modifiedRow = rowModifier({
                        rowKey: key,
                        row,
                        cells,
                        columns,
                        datum,
                    });
                }

                return (
                    <Fragment
                        key={key}
                    >
                        {modifiedRow}
                    </Fragment>
                );
            })}
        </>
    );
}

export default TableBodyContent;
