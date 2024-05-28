/* eslint-disable max-len */
import {
    Column,
    Table as PureTable,
    TableProps as PureTableProps,
} from '@ifrc-go/ui';

// eslint-disable-next-line max-len
type TableProps<D, K extends string | number, C extends Column<D, K, string, string>> = PureTableProps<D, K, C>;

function WrappedTable<D, K extends string | number, C extends Column<D, K, string, string>>(props: TableProps<D, K, C>) {
    return (
        <PureTable {...props} />// eslint-disable-line react/jsx-props-no-spreading
    );
}

export default WrappedTable;
