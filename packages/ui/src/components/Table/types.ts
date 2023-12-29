export type SortDirection = 'asc' | 'dsc';

export interface BaseHeader {
    className?: string;
    titleClassName?: string;
    name: string;
    index: number;

    title?: React.ReactNode;
}

export interface BaseCell {
    className?: string;
    name: string;
}

export interface Column<DATA, KEY, COMPONENT_PROPS, HEADER_PROPS> {
    id: string;
    title: string;

    headerCellRenderer: React.ComponentType<HEADER_PROPS>;
    headerCellRendererParams: Omit<HEADER_PROPS, 'name' | 'title' | 'index' | 'className'>;
    headerCellRendererClassName?: string;

    headerContainerClassName?: string;

    columnClassName?: string;
    columnStyle?: React.CSSProperties;
    columnWidth?: number;
    columnStretch?: boolean;

    cellRenderer: React.ComponentType<COMPONENT_PROPS>;
    cellRendererParams: (key: KEY, datum: DATA, index: number, data: DATA[]) => Omit<COMPONENT_PROPS, 'className' | 'name'>;
    cellRendererClassName?: string;

    cellContainerClassName?: string;
}

export type VerifyColumn<T, D, K> = unknown extends (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    T extends Column<D, K, any, any>
        ? never
        : unknown
)
    ? never
    : unknown

export interface RowOptions<D, K> {
    rowKey: K,
    row: React.ReactElement;
    cells: React.ReactElement[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    columns: Column<D, K, any, any>[];
    datum: D;
}
