import {
    _cs,
    compareBoolean,
    compareDate,
    compareNumber,
    compareString,
    randomString,
} from '@togglecorp/fujs';

import BooleanOutput, { type Props as BooleanOutputProps } from '#components/BooleanOutput';
import DateOutput, { type Props as DateOutputProps } from '#components/DateOutput';
import DateRangeOutput, { type Props as DateRangeOutputProps } from '#components/DateRangeOutput';
import NumberOutput, { type Props as NumberOutputProps } from '#components/NumberOutput';
import ProgressBar, { type Props as ProgressBarProps } from '#components/ProgressBar';
import ReducedListDisplay, { Props as ReducedListDisplayProps } from '#components/ReducedListDisplay';

import Cell, { type CellProps } from '../Cell';
import HeaderCell, { type HeaderCellProps } from '../HeaderCell';
import TableActions, { Props as TableActionsProps } from '../TableActions';
import {
    Column,
    type SortDirection,
} from '../types';
import ExpandButton, { type ExpandButtonProps } from './ExpandButton';
import ExpansionIndicator, { type Props as ExpansionIndicatorProps } from './ExpansionIndicator';
import MultiTimelineHeader, { type Props as MultiTimelineHeaderProps } from './MultiTimelineHeader';
import MultiTimelineItem, { type Props as MultiTimelineItemProps } from './MultiTimelineItem';
import TimelineHeader, { type Props as TimelineHeaderProps } from './TimelineHeader';
import TimelineItem, { type Props as TimelineItemProps } from './TimelineItem';

import styles from './styles.module.css';

type Options<D, K, CompProps, HeaderProps> = {
    sortable?: boolean,
    defaultSortDirection?: SortDirection,

    columnClassName?: string;
    headerCellRendererClassName?: string;
    headerContainerClassName?: string;
    cellRendererClassName?: string;
    cellContainerClassName?: string;
    columnWidth?: Column<D, K, CompProps, HeaderProps>['columnWidth'];
    columnStretch?: Column<D, K, CompProps, HeaderProps>['columnStretch'];
    columnStyle?: Column<D, K, CompProps, HeaderProps>['columnStyle'];

    headerInfoTitle?: HeaderCellProps['infoTitle'];
    headerInfoDescription?: HeaderCellProps['infoDescription'];
    defaultEmptyValue?: string;
}

export function createBooleanColumn<D, K>(
    id: string,
    title: string,
    accessor: (item: D) => boolean | undefined | null,
    options?: Options<D, K, BooleanOutputProps, HeaderCellProps>,
) {
    const item: Column<D, K, BooleanOutputProps, HeaderCellProps> & {
        valueSelector: (item: D) => boolean | undefined | null,
        valueComparator: (foo: D, bar: D) => number,
    } = {
        id,
        title,
        columnClassName: options?.columnClassName,
        headerCellRenderer: HeaderCell,
        headerCellRendererClassName: options?.headerCellRendererClassName,
        headerContainerClassName: options?.headerContainerClassName,
        headerCellRendererParams: {
            sortable: options?.sortable,
            infoTitle: options?.headerInfoTitle,
            infoDescription: options?.headerInfoDescription,
        },
        cellRendererClassName: options?.cellRendererClassName,
        cellContainerClassName: options?.cellContainerClassName,
        cellRenderer: BooleanOutput,
        cellRendererParams: (_: K, datum: D): BooleanOutputProps => ({
            value: accessor(datum),
        }),
        valueSelector: accessor,
        valueComparator: (foo: D, bar: D) => compareBoolean(accessor(foo), accessor(bar)),
        columnWidth: options?.columnWidth,
        columnStretch: options?.columnStretch,
        columnStyle: options?.columnStyle,
    };
    return item;
}

export function createProgressColumn<D, K>(
    id: string,
    title: string,
    accessor: (item: D) => number | undefined,
    options?: Options<D, K, ProgressBarProps, HeaderCellProps>,
) {
    const item: Column<D, K, ProgressBarProps, HeaderCellProps> & {
        valueSelector: (item: D) => number | undefined | null,
        valueComparator: (foo: D, bar: D) => number,
    } = {
        id,
        title,
        columnClassName: options?.columnClassName,
        headerCellRenderer: HeaderCell,
        headerCellRendererClassName: options?.headerCellRendererClassName,
        headerContainerClassName: options?.headerContainerClassName,
        headerCellRendererParams: {
            sortable: options?.sortable,
            infoTitle: options?.headerInfoTitle,
            infoDescription: options?.headerInfoDescription,
        },
        cellRendererClassName: options?.cellRendererClassName,
        cellContainerClassName: options?.cellContainerClassName,
        cellRenderer: ProgressBar,
        cellRendererParams: (_: K, datum: D): ProgressBarProps => ({
            value: accessor(datum),
            totalValue: 100,
            showPercentageInTitle: true,
        }),
        valueSelector: accessor,
        valueComparator: (foo: D, bar: D) => compareNumber(accessor(foo), accessor(bar)),
        columnWidth: options?.columnWidth,
        columnStretch: options?.columnStretch,
        columnStyle: options?.columnStyle,
    };
    return item;
}

export function createEmptyColumn<D, K>() {
    const item: Column<D, K, CellProps<undefined>, HeaderCellProps> = {
        id: randomString(),
        title: '',
        headerCellRenderer: HeaderCell,
        headerCellRendererParams: {
            sortable: false,
        },
        cellRenderer: Cell,
        cellRendererParams: (): CellProps<undefined> => ({
            value: undefined,
        }),
    };

    return item;
}

export function createStringColumn<D, K extends string | number>(
    id: string,
    title: string,
    accessor: (item: D) => string | undefined | null,
    options?: Options<D, K, CellProps<string>, HeaderCellProps>,
) {
    const item: Column<D, K, CellProps<string>, HeaderCellProps> & {
        valueSelector: (item: D) => string | undefined | null,
        valueComparator: (foo: D, bar: D) => number,
    } = {
        id,
        title,
        columnClassName: options?.columnClassName,
        headerCellRenderer: HeaderCell,
        headerCellRendererClassName: options?.headerCellRendererClassName,
        headerContainerClassName: options?.headerContainerClassName,
        headerCellRendererParams: {
            sortable: options?.sortable,
            infoTitle: options?.headerInfoTitle,
            infoDescription: options?.headerInfoDescription,
        },
        cellRendererClassName: options?.cellRendererClassName,
        cellContainerClassName: options?.cellContainerClassName,
        cellRenderer: Cell,
        cellRendererParams: (_: K, datum: D): CellProps<string> => ({
            value: accessor(datum) || (options?.defaultEmptyValue ?? '--'),
        }),
        valueSelector: accessor,
        valueComparator: (foo: D, bar: D) => compareString(accessor(foo), accessor(bar)),
        columnWidth: options?.columnWidth,
        columnStretch: options?.columnStretch,
        columnStyle: options?.columnStyle,
    };
    return item;
}

export function createNumberColumn<D, K extends string | number>(
    id: string,
    title: string,
    accessor: (item: D) => number | undefined | null,
    options?: Options<D, K, NumberOutputProps, HeaderCellProps> & {
        suffix?: NumberOutputProps['suffix'];
        maximumFractionDigits?: NumberOutputProps['maximumFractionDigits'];
    },
) {
    const item: Column<D, K, NumberOutputProps, HeaderCellProps> & {
        valueSelector: (item: D) => number | undefined | null,
        valueComparator: (foo: D, bar: D) => number,
    } = {
        id,
        title,
        columnClassName: options?.columnClassName,
        headerCellRenderer: HeaderCell,
        headerCellRendererClassName: _cs(
            styles.numberCellHeader,
            options?.headerCellRendererClassName,
        ),
        headerContainerClassName: options?.headerContainerClassName,
        headerCellRendererParams: {
            sortable: options?.sortable,
            infoTitle: options?.headerInfoTitle,
            infoDescription: options?.headerInfoDescription,
        },
        cellRendererClassName: _cs(
            styles.numberCell,
            options?.cellRendererClassName,
        ),
        cellContainerClassName: options?.cellContainerClassName,
        cellRenderer: NumberOutput,
        cellRendererParams: (_: K, datum: D): NumberOutputProps => ({
            value: accessor(datum),
            suffix: options?.suffix,
            // compact: true,
            maximumFractionDigits: options?.maximumFractionDigits,
            invalidText: '--',
        }),
        valueSelector: accessor,
        valueComparator: (foo: D, bar: D) => compareNumber(accessor(foo), accessor(bar)),
        columnWidth: options?.columnWidth,
        columnStretch: options?.columnStretch,
        columnStyle: options?.columnStyle,
    };
    return item;
}

export function createDateColumn<D, K>(
    id: string,
    title: string,
    accessor: (item: D) => string | undefined | null,
    options?: Options<D, K, DateOutputProps, HeaderCellProps>,
) {
    const item: Column<D, K, DateOutputProps, HeaderCellProps> & {
        valueSelector: (item: D) => string | undefined | null,
        valueComparator: (foo: D, bar: D) => number,
    } = {
        id,
        title,
        columnClassName: _cs(options?.columnClassName, styles.dateColumn),
        headerCellRenderer: HeaderCell,
        headerCellRendererClassName: options?.headerCellRendererClassName,
        headerContainerClassName: options?.headerContainerClassName,
        headerCellRendererParams: {
            sortable: options?.sortable,
            infoTitle: options?.headerInfoTitle,
            infoDescription: options?.headerInfoDescription,
        },
        cellRendererClassName: options?.cellRendererClassName,
        cellContainerClassName: options?.cellContainerClassName,
        cellRenderer: DateOutput,
        cellRendererParams: (_: K, datum: D): DateOutputProps => ({
            value: accessor(datum),
            invalidText: '--',
        }),
        valueSelector: accessor,
        valueComparator: (foo: D, bar: D) => compareDate(accessor(foo), accessor(bar)),
        columnWidth: options?.columnWidth,
        columnStretch: options?.columnStretch,
        columnStyle: options?.columnStyle,
    };
    return item;
}

export function createDateRangeColumn<D, K>(
    id: string,
    title: string,
    accessor: (item: D) => { startDate: string, endDate: string },
    options?: Options<D, K, DateRangeOutputProps, HeaderCellProps>,
) {
    const item: Column<D, K, DateRangeOutputProps, HeaderCellProps> & {
        valueSelector: (item: D) => string | undefined | null,
        valueComparator: (foo: D, bar: D) => number,
    } = {
        id,
        title,
        columnClassName: options?.columnClassName,
        headerCellRenderer: HeaderCell,
        headerCellRendererClassName: options?.headerCellRendererClassName,
        headerContainerClassName: options?.headerContainerClassName,
        headerCellRendererParams: {
            sortable: options?.sortable,
            infoTitle: options?.headerInfoTitle,
            infoDescription: options?.headerInfoDescription,
        },
        cellRendererClassName: options?.cellRendererClassName,
        cellRenderer: DateRangeOutput,
        cellContainerClassName: options?.cellContainerClassName,
        cellRendererParams: (_: K, datum: D): DateRangeOutputProps => ({
            ...accessor(datum),
        }),
        valueSelector: (datum) => accessor(datum).startDate,
        valueComparator: (foo: D, bar: D) => {
            const { startDate: fooStartDate } = accessor(foo);
            const { startDate: barStartDate } = accessor(bar);
            return compareDate(fooStartDate, barStartDate);
        },
        columnWidth: options?.columnWidth,
        columnStretch: options?.columnStretch,
        columnStyle: options?.columnStyle,
    };
    return item;
}

export function createExpandColumn<D, K>(
    id: string,
    title: string,
    rendererParams: (row: D) => Omit<ExpandButtonProps<D>, 'row'>,
    options?: Options<D, K, ExpandButtonProps<D>, HeaderCellProps>,
) {
    const item: Column<D, K, ExpandButtonProps<D>, HeaderCellProps> = {
        id,
        title,
        columnClassName: options?.columnClassName,
        headerCellRenderer: HeaderCell,
        headerCellRendererClassName: options?.headerCellRendererClassName,
        headerContainerClassName: options?.headerContainerClassName,
        headerCellRendererParams: {
            sortable: false,
        },
        cellRendererClassName: options?.cellRendererClassName,
        cellContainerClassName: options?.cellContainerClassName,
        cellRenderer: ExpandButton,
        cellRendererParams: (_, row) => ({
            ...rendererParams(row),
            row,
        }),
        columnWidth: options?.columnWidth,
        columnStretch: options?.columnStretch,
        columnStyle: options?.columnStyle,
    };
    return item;
}

export function createExpansionIndicatorColumn<DATUM, KEY>(
    isExpanded?: boolean,
) {
    const item: Column<DATUM, KEY, ExpansionIndicatorProps, HeaderCellProps> = {
        id: randomString(),
        title: '',
        headerCellRenderer: HeaderCell,
        headerCellRendererParams: {
            sortable: false,
        },
        cellRenderer: ExpansionIndicator,
        cellRendererParams: (_, __, i, data) => {
            let variant: ExpansionIndicatorProps['variant'] = 'mid';

            if (data.length === 1) {
                variant = 'single';
            } else if (i === 0) {
                variant = 'start';
            } else if (i === data.length - 1) {
                variant = 'end';
            }

            return {
                isExpanded,
                variant,
            };
        },
        cellContainerClassName: styles.expansionIndicatorCellContainer,
        cellRendererClassName: styles.expansionIndicatorCell,
    };

    return item;
}

export function createElementColumn<DATUM, KEY, ELEMENT_PROPS>(
    id: string,
    title: string,
    renderer: React.ComponentType<ELEMENT_PROPS>,
    rendererParams: (key: KEY, datum: DATUM) => ELEMENT_PROPS,
    options?: Options<DATUM, KEY, ELEMENT_PROPS, HeaderCellProps>,
) {
    const item: Column<DATUM, KEY, ELEMENT_PROPS, HeaderCellProps> = {
        id,
        title,
        headerCellRenderer: HeaderCell,
        headerCellRendererParams: {
            sortable: options?.sortable,
        },
        cellRenderer: renderer,
        cellRendererParams: rendererParams,
        headerContainerClassName: options?.headerContainerClassName,
        cellRendererClassName: options?.cellRendererClassName,
        columnClassName: options?.columnClassName,
        headerCellRendererClassName: options?.headerCellRendererClassName,
        cellContainerClassName: options?.cellContainerClassName,
        columnWidth: options?.columnWidth,
        columnStretch: options?.columnStretch,
        columnStyle: options?.columnStyle,
    };

    return item;
}

export function createTimelineColumn<DATUM, KEY>(
    id: string,
    dateRange: {
        start: Date,
        end: Date,
    } | undefined,
    rendererParams: (datum: DATUM) => Omit<TimelineItemProps, 'dateRange'>,
    options?: Options<DATUM, KEY, TableActionsProps, HeaderCellProps>,
) {
    const item: Column<DATUM, KEY, TimelineItemProps, TimelineHeaderProps> = {
        id,
        title: '',
        headerCellRenderer: TimelineHeader,
        headerCellRendererParams: {
            dateRange,
            sortable: options?.sortable,
        },
        cellRenderer: TimelineItem,
        cellRendererParams: (_, datum) => ({
            dateRange,
            ...rendererParams(datum),
        }),
        headerContainerClassName: options?.headerContainerClassName,
        cellRendererClassName: options?.cellRendererClassName,
        columnClassName: options?.columnClassName,
        headerCellRendererClassName: options?.headerCellRendererClassName,
        cellContainerClassName: _cs(
            options?.cellContainerClassName,
            styles.timelineCellContainer,
        ),
        columnWidth: options?.columnWidth,
        columnStretch: options?.columnStretch,
        columnStyle: options?.columnStyle,
    };

    return item;
}

export function createActionColumn<DATUM, KEY>(
    id: string,
    rendererParams: (datum: DATUM) => TableActionsProps,
    options?: Options<DATUM, KEY, TableActionsProps, HeaderCellProps>,
) {
    const item: Column<DATUM, KEY, TableActionsProps, HeaderCellProps> = {
        id,
        title: '',
        headerCellRenderer: HeaderCell,
        headerCellRendererParams: {
            sortable: false,
        },
        headerContainerClassName: options?.headerContainerClassName,
        cellRenderer: TableActions,
        cellRendererParams: (_, datum) => ({
            ...rendererParams(datum),
        }),
        cellRendererClassName: options?.cellRendererClassName,
        columnClassName: options?.columnClassName,
        headerCellRendererClassName: options?.headerCellRendererClassName,
        cellContainerClassName: options?.cellContainerClassName,
        columnWidth: options?.columnWidth,
        columnStretch: options?.columnStretch,
        columnStyle: options?.columnStyle,
    };

    return item;
}

export function createMultiTimelineColumn<DATUM, KEY>(
    id: string,
    dateRange: { start: Date; end: Date } | undefined,
    rendererParams: (datum: DATUM) => Omit<
        MultiTimelineItemProps,
        'dateRange'
    >,
    options?: Options<DATUM, KEY, TableActionsProps, MultiTimelineHeaderProps>,
) {
    const item: Column<DATUM, KEY, MultiTimelineItemProps, MultiTimelineHeaderProps> = {
        id,
        title: '',
        headerCellRenderer: MultiTimelineHeader,
        headerCellRendererParams: {
            dateRange,
            sortable: options?.sortable,
        },
        cellRenderer: MultiTimelineItem,
        cellRendererParams: (_, datum) => ({
            dateRange,
            ...rendererParams(datum),
        }),
        headerContainerClassName: options?.headerContainerClassName,
        cellRendererClassName: options?.cellRendererClassName,
        columnClassName: options?.columnClassName,
        headerCellRendererClassName: options?.headerCellRendererClassName,
        cellContainerClassName: _cs(
            options?.cellContainerClassName,
            styles.timelineCellContainer,
        ),
        columnWidth: options?.columnWidth,
        columnStretch: options?.columnStretch,
        columnStyle: options?.columnStyle,
    };

    return item;
}

export function createListDisplayColumn<DATUM, KEY, LIST_ITEM, RENDERER_PROPS>(
    id: string,
    title: string,
    rendererParams: (datum: DATUM) => ReducedListDisplayProps<LIST_ITEM, RENDERER_PROPS>,
    options?: Options<DATUM, KEY, TableActionsProps, HeaderCellProps>,
) {
    const item: Column<
        DATUM,
        KEY,
        ReducedListDisplayProps<LIST_ITEM, RENDERER_PROPS>,
        HeaderCellProps
    > = {
        id,
        title,
        headerCellRenderer: HeaderCell,
        headerCellRendererParams: {
            sortable: false,
        },
        headerContainerClassName: options?.headerContainerClassName,
        cellRenderer: ReducedListDisplay,
        cellRendererParams: (_, datum) => ({
            ...rendererParams(datum),
        }),
        cellRendererClassName: options?.cellRendererClassName,
        columnClassName: options?.columnClassName,
        headerCellRendererClassName: options?.headerCellRendererClassName,
        cellContainerClassName: options?.cellContainerClassName,
        columnWidth: options?.columnWidth,
        columnStretch: options?.columnStretch,
        columnStyle: options?.columnStyle,
    };

    return item;
}
