/* eslint-disable max-len */
import {
    Column,
    Table as PureTable,
    TableProps as PureTableProps,
} from '@ifrc-go/ui';

type TableProps<
    D,
    K extends string | number,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    C extends Column<D, K, any, any>
> = PureTableProps<D, K, C>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function Table<D, K extends string | number, C extends Column<D, K, any, any>>(props: TableProps<D, K, C>) {
    return (
        <PureTable {...props} />// eslint-disable-line react/jsx-props-no-spreading
    );
}

export default Table;
