import React, {
    useEffect,
    useRef,
} from 'react';
import {
    _cs,
    isDefined,
    isNotDefined,
    listToMap,
    randomString,
    sum,
} from '@togglecorp/fujs';

import DefaultMessage from '#components/DefaultMessage';
import { WIDTH_DEFAULT_TABLE_COLUMN } from '#utils/constants';

import TableBodyContent from './TableBodyContent';
import TableHeader from './TableHeader';
import TableRow from './TableRow';
import type {
    Column,
    RowOptions,
    VerifyColumn,
} from './types';

import styles from './styles.module.css';

function getColumnWidth<D, K, C, H>(column: Column<D, K, C, H>, width: number) {
    return width ?? column.columnWidth ?? WIDTH_DEFAULT_TABLE_COLUMN;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface TableProps<D, K extends string | number, C extends Column<D, K, any, any>> {
    className?: string;
    caption?: React.ReactNode;
    keySelector: (data: D, index: number) => K;
    columns: C[] & VerifyColumn<C, D, K>;
    data: D[] | undefined | null;
    captionClassName?: string;
    headerRowClassName?: string;
    headerCellClassName?: string | ((columnKey: string) => (string | undefined));
    rowClassName?: string | ((key: K, datum: D) => (string | undefined));
    cellClassName?: string | ((key: K, datum: D, columnKey: string) => (string | undefined));
    rowModifier?: (rowOptions: RowOptions<D, K>) => React.ReactNode;

    fixedColumnWidth?: boolean;
    resizableColumn?: boolean;

    headersHidden?: boolean;

    filtered: boolean;
    pending: boolean;
    errored?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function Table<D, K extends string | number, C extends Column<D, K, any, any>>(
    props: TableProps<D, K, C>,
) {
    const {
        data,
        keySelector,
        columns,
        caption,
        className,
        captionClassName,
        headerRowClassName,
        headerCellClassName,
        rowClassName,
        cellClassName,
        rowModifier,
        fixedColumnWidth,
        resizableColumn,
        headersHidden,
        pending,
        filtered,
        errored = false,
    } = props;

    const containerRef = useRef<HTMLDivElement>(null);
    const [tableName] = React.useState(() => randomString());
    const [columnWidths, setColumnWidths] = React.useState<Record<string, number>>({});

    useEffect(() => {
        setColumnWidths((cols) => {
            if (isNotDefined(containerRef.current)) {
                return cols;
            }

            const size = containerRef.current.getBoundingClientRect();
            const { width: parentWidth } = size;

            let newColumnWidths: { id: string, width: number, stretch: boolean }[] = columns.map(
                (col) => ({
                    id: col.id,
                    stretch: !!col.columnStretch,
                    width: getColumnWidth(col, cols[col.id]),
                }),
            );

            const totalStretchableWidth = sum(
                newColumnWidths
                    .filter((item) => item.stretch)
                    .map((item) => item.width),
            );
            const totalNonStretchableWidth = sum(
                newColumnWidths
                    .filter((item) => !item.stretch)
                    .map((item) => item.width),
            );

            const stretchFactor = (parentWidth - totalNonStretchableWidth) / totalStretchableWidth;

            if (stretchFactor > 1) {
                newColumnWidths = newColumnWidths.map((item) => ({
                    ...item,
                    width: item.stretch
                        // NOTE: may need to use floor
                        ? item.width * stretchFactor
                        : item.width,
                }));
            }
            return listToMap(
                newColumnWidths,
                (item) => item.id,
                (item) => item.width,
            );
        });
    }, [columns]);

    const handleColumnResize = React.useCallback(
        (widthFromArgs: number, name: string | undefined) => {
            const column = document.getElementById(`${tableName}-${name}`);
            // NOTE: setting a minimum size for column
            const width = Math.max(widthFromArgs, 80);
            if (isNotDefined(column)) {
                return;
            }

            column.style.width = `${width}px`;

            if (!fixedColumnWidth) {
                return;
            }
            const table = document.getElementById(tableName);
            if (isNotDefined(table)) {
                return;
            }

            const totalWidth = sum(columns.map((c) => (
                c.id === name ? width : columnWidths[c.id]
            )));
            table.style.width = `${totalWidth}px`;
        },
        [tableName, columnWidths, columns, fixedColumnWidth],
    );

    const handleColumnResizeComplete = React.useCallback(
        (width: number, name: string | undefined) => {
            if (isDefined(name)) {
                setColumnWidths((prevColumnWidths) => ({
                    ...prevColumnWidths,
                    [name]: Math.max(width, 80),
                }));
            }
        },
        [setColumnWidths],
    );

    const width = React.useMemo(() => (
        sum(columns.map((c) => columnWidths[c.id]))
    ), [columnWidths, columns]);

    const isEmpty = isNotDefined(data)
        || data.length === 0
        || Object.keys(columnWidths).length === 0;

    return (
        <div
            ref={containerRef}
            className={_cs(styles.table, className)}
        >
            {!isEmpty && (
                <div className={styles.tableOverflowWrapper}>
                    <table
                        className={styles.tableElement}
                        style={fixedColumnWidth ? { width: `${width}px` } : undefined}
                        id={tableName}
                    >
                        {caption && (
                            <caption className={captionClassName}>
                                {caption}
                            </caption>
                        )}
                        <colgroup>
                            {columns.map((column) => {
                                const {
                                    id,
                                    columnClassName,
                                } = column;

                                const columnWidth = columnWidths[id];
                                const style = fixedColumnWidth ? { width: `${columnWidth}px` } : undefined;

                                return (
                                    <col
                                        id={`${tableName}-${id}`}
                                        style={style}
                                        key={id}
                                        className={_cs(styles.column, columnClassName)}
                                    />
                                );
                            })}
                        </colgroup>
                        {!headersHidden && (
                            <thead>
                                <TableRow
                                    className={_cs(styles.headerRow, headerRowClassName)}
                                >
                                    {columns.map((column, index) => {
                                        const {
                                            id,
                                            title,
                                            headerCellRenderer: Renderer,
                                            headerCellRendererClassName,
                                            headerCellRendererParams,
                                            headerContainerClassName,
                                        } = column;

                                        const children = (
                                            <Renderer
                                                // eslint-disable-next-line max-len
                                                // eslint-disable-next-line react/jsx-props-no-spreading
                                                {...headerCellRendererParams}
                                                name={id}
                                                title={title}
                                                index={index}
                                                className={_cs(
                                                    headerCellRendererClassName,
                                                    styles.headerComponent,
                                                )}
                                            />
                                        );
                                        return (
                                            <TableHeader
                                                key={id}
                                                scope="col"
                                                name={id}
                                                onResize={resizableColumn
                                                    ? handleColumnResize
                                                    : undefined}
                                                onResizeComplete={resizableColumn
                                                    ? handleColumnResizeComplete
                                                    : undefined}
                                                className={_cs(
                                                    styles.headerElement,
                                                    typeof headerCellClassName === 'function'
                                                        ? headerCellClassName(id)
                                                        : headerCellClassName,
                                                    headerContainerClassName,
                                                )}
                                            >
                                                {children}
                                            </TableHeader>
                                        );
                                    })}
                                </TableRow>
                            </thead>
                        )}
                        <tbody>
                            <TableBodyContent
                                data={data}
                                keySelector={keySelector}
                                columns={columns}
                                rowClassName={rowClassName}
                                cellClassName={cellClassName}
                                rowModifier={rowModifier}
                            />
                        </tbody>
                    </table>
                </div>
            )}
            <DefaultMessage
                filtered={filtered}
                empty={isEmpty}
                errored={errored}
                pending={pending}
                overlayPending
            />
        </div>
    );
}

export default Table;
