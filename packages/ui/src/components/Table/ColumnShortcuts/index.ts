import {
    _cs,
    compareBoolean,
    compareDate,
    compareNumber,
    compareString,
    randomString,
} from '@togglecorp/fujs';

import BooleanDisplay, { type Props as BooleanDisplayProps } from '#components/BooleanDisplay';
import DateDisplay, { type Props as DateDisplayProps } from '#components/DateDisplay';
import DateRangeDisplay, { type Props as DateRangeDisplayProps } from '#components/DateRangeDisplay';
import NumberDisplay, { type Props as NumberDisplayProps } from '#components/NumberDisplay';
import ProgressBar, { type Props as ProgressBarProps } from '#components/ProgressBar';
import TruncatedList, { Props as TruncatedListProps } from '#components/TruncatedList';

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
    options?: Options<D, K, BooleanDisplayProps, HeaderCellProps>,
) {
    const item: Column<D, K, BooleanDisplayProps, HeaderCellProps> & {
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
        cellRenderer: BooleanDisplay,
        cellRendererParams: (_: K, datum: D): BooleanDisplayProps => ({
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
        columnClassName: _cs(styles.progressColumn, options?.columnClassName),
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
            variant: 'primary',
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
    options?: Options<D, K, CellProps<string>, HeaderCellProps> & {
        withLightText?: (datum: D) => boolean;
    },
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
            withLightText: options?.withLightText?.(datum),
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
    options?: Options<D, K, NumberDisplayProps, HeaderCellProps> & {
        suffix?: NumberDisplayProps['suffix'];
        maximumFractionDigits?: NumberDisplayProps['maximumFractionDigits'];
    },
) {
    const item: Column<D, K, NumberDisplayProps, HeaderCellProps> & {
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
        cellRenderer: NumberDisplay,
        cellRendererParams: (_: K, datum: D): NumberDisplayProps => ({
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
    options?: Options<D, K, DateDisplayProps, HeaderCellProps>,
) {
    const item: Column<D, K, DateDisplayProps, HeaderCellProps> & {
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
        cellRenderer: DateDisplay,
        cellRendererParams: (_: K, datum: D): DateDisplayProps => ({
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
    options?: Options<D, K, DateRangeDisplayProps, HeaderCellProps>,
) {
    const item: Column<D, K, DateRangeDisplayProps, HeaderCellProps> & {
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
        cellRenderer: DateRangeDisplay,
        cellContainerClassName: options?.cellContainerClassName,
        cellRendererParams: (_: K, datum: D): DateRangeDisplayProps => ({
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
        columnClassName: _cs(options?.columnClassName, styles.expandColumn),
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
    getDisabled?: (datum: DATUM) => boolean,
) {
    const item: Column<DATUM, KEY, ExpansionIndicatorProps, HeaderCellProps> = {
        id: randomString(),
        title: '',
        headerCellRenderer: HeaderCell,
        headerCellRendererParams: {
            sortable: false,
        },
        cellRenderer: ExpansionIndicator,
        cellRendererParams: (_, datum, i, data) => {
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
                disabled: getDisabled?.(datum),
            };
        },
        // cellRendererClassName: styles.expansionIndicatorCell,
        cellContainerRendererParams: () => ({
            withoutBorder: true,
        }),
        cellContainerClassName: styles.expansionIndicatorCellContainer,
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
            infoTitle: options?.headerInfoTitle,
            infoDescription: options?.headerInfoDescription,
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
        columnClassName: _cs(styles.timelineColumn, options?.columnClassName),
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
        cellContainerClassName: _cs(styles.actionsCell, options?.cellContainerClassName),
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
    rendererParams: (datum: DATUM) => TruncatedListProps<LIST_ITEM, RENDERER_PROPS>,
    options?: Options<DATUM, KEY, TableActionsProps, HeaderCellProps>,
) {
    const item: Column<
        DATUM,
        KEY,
        TruncatedListProps<LIST_ITEM, RENDERER_PROPS>,
        HeaderCellProps
    > = {
        id,
        title,
        headerCellRenderer: HeaderCell,
        headerCellRendererParams: {
            sortable: false,
        },
        headerContainerClassName: options?.headerContainerClassName,
        cellRenderer: TruncatedList,
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
