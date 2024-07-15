import type {
    Args,
    Meta,
    StoryObj,
} from '@storybook/react';

import TimeSeriesChart from './TimeSeriesChart';

type Story = StoryObj<typeof TimeSeriesChart>;

interface Data {
    year: number;
    sales: number;
    expenses: number;
    profit: number;
}
type DataKey = 'sales' | 'expenses' | 'profit';

const data: Data[] = [
    {
        year: 2018, sales: 35, expenses: 84, profit: 23,
    },
    {
        year: 2019, sales: 96, expenses: 23, profit: 78,
    },
    {
        year: 2020, sales: 8, expenses: 56, profit: 45,
    },
    {
        year: 2021, sales: 89, expenses: 12, profit: 67,
    },
    {
        year: 2022, sales: 71, expenses: 47, profit: 89,
    },
    {
        year: 2023, sales: 70, expenses: 98, profit: 34,
    },
    {
        year: 2024, sales: 56, expenses: 34, profit: 90,
    },
];
const dataKeys = ['sales' as const, 'expenses' as const, 'profit' as const];
const xAxisFormatter = (date: Date) => date.toLocaleString(
    navigator.language,
    { year: 'numeric' },
);
const valueSelector = (key: DataKey, date: Date) => (
    data.find((d) => d.year === date.getFullYear())?.[key]
);
const timePoints = data.map((value) => new Date(value.year, 1, 0));
const dataKeyToStyleMap: Record<
    'sales' | 'expenses' | 'profit',
     string
> = {
    sales: 'sales',
    expenses: 'expenses',
    profit: 'profit',
};
const classNameSelector = (dataKey: DataKey) => dataKeyToStyleMap[dataKey];

const meta: Meta<typeof TimeSeriesChart> = {
    title: 'Components/TimeSeriesChart',
    component: TimeSeriesChart,
    parameters: {
        layout: 'centered',
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/k9SOqgh5jk9PxzuBKdMKsA/IFRC-GO---UI-Library?node-id=14425-221269&t=qmirLf8EtsAXR5l4-4',
        },
    },
    tags: ['autodocs'],
};
export default meta;

function Template(args:Args) {
    return (
        <TimeSeriesChart
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...args}
            className="timeline-chart"
            classNameSelector={classNameSelector}
            dataKeys={dataKeys}
            timePoints={timePoints}
            valueSelector={valueSelector}
            xAxisFormatter={xAxisFormatter}
        />
    );
}
export const Default: Story = {
    render: Template,
};
export const WithActivePoint:Story = {
    render: Template,
    args: {
        activePointKey: 'sales',
    },
};
