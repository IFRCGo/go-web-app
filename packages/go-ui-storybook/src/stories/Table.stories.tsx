import { ReactNode } from 'react';
import {
    Column,
    RowOptions,
    TableProps,
} from '@ifrc-go/ui';
import type {
    Meta,
    StoryObj,
} from '@storybook/react';

import Table from './Table';

interface Data {
    id: number;
    name: string;
    budget: number | undefined;
    date: string;
}

const data: Data[] = [
    {
        id: 1, name: 'Rice', budget: 100, date: '2022-01-01T00:00:00',
    },
    {
        id: 2, name: 'vegetables', budget: 200, date: '2022-01-01T00:00:00',
    },
    {
        id: 3, name: 'meat', budget: 300, date: '2022-01-01T00:00:00',
    },
];
const keySelector: (d: Data) => string = (d) => d.name;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const columns: Column<Data, string, any, any>[] = [
    {
        id: '1',
        title: 'Id',
        cellRenderer: (row: Data) => <div>{row.id}</div>,
        headerCellRenderer: () => 'Id',
        headerCellRendererParams: {},
        cellRendererParams: () => ({
            type: 'some type',
            props: 'some props',
        }),
    },
    {
        id: '2',
        title: 'Name',
        cellRenderer: (row: Data) => <div>{row.name}</div>,
        headerCellRenderer: () => 'Name',
        headerCellRendererParams: {},
        cellRendererParams: () => ({
            type: 'some type',
            props: 'some props',
        }),
    },
    {
        id: '3',
        title: 'Budget',
        cellRenderer: (row: Data) => <div>{row.budget}</div>,
        headerCellRenderer: () => 'Budget',
        headerCellRendererParams: {},
        cellRendererParams: () => ({
            type: 'some type',
            props: 'some props',
        }),
    },
    {
        id: '4',
        title: 'Date',
        cellRenderer: (row: Data) => <div>{row.date}</div>,
        headerCellRenderer: () => 'Date',
        headerCellRendererParams: {
            name: 'Date',
            index: 1,
        },
        cellRendererParams: () => ({
            type: 'some type',
            props: 'some props',
        }),
    },
];
const rowModifier = (rowOptions: RowOptions<Data, string>): ReactNode => {
    const row = rowOptions.datum;
    return (
        <div>
            {row.id}
        </div>
    );
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TableSpecificProps = TableProps<Data, string, Column<Data, string, any, any>>
type Story = StoryObj<TableSpecificProps>;

const meta: Meta<typeof Table> = {
    title: 'Components/Table',
    component: Table,
    parameters: {
        layout: 'centered',
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/myeW85ibN5p2SlnXcEpxFD/IFRC-GO---UI-Current---1?type=design&node-id=0-4957&mode=design&t=KwxbuoUQxqcLyZbG-0',
        },
    },
    tags: ['autodocs'],
    decorators: [
        function Component(_, ctx) {
            const componentArgs = ctx.args as unknown as TableSpecificProps;
            return (
                <Table
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...componentArgs}
                    keySelector={keySelector}
                    columns={columns}
                    data={data}

                />
            );
        },
    ],
};
export default meta;

export const Default: Story = {
    args: {
        rowModifier,
        columns,
        fixedColumnWidth: true,
        caption: 'Table for the households expenses',
    },
};

export const Pending: Story = {
    args: {
        keySelector,
        rowModifier,
        columns,
        pending: true,

    },
};

export const Filtered: Story = {
    args: {
        keySelector,
        rowModifier,
        columns,
        filtered: true,

    },
};

export const HeadersHidden: Story = {
    args: {
        keySelector,
        rowModifier,
        columns,
        headersHidden: true,
        fixedColumnWidth: true,
    },
};

export const ResizableColumn: Story = {
    args: {
        keySelector,
        rowModifier,
        columns,
        resizableColumn: true,
        fixedColumnWidth: true,

    },
};

export const FixedColumnWidth: Story = {
    args: {
        keySelector,
        rowModifier,
        columns,
        fixedColumnWidth: true,

    },
};
