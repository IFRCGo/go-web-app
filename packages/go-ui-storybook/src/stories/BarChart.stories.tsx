import { BarChartProps } from '@ifrc-go/ui';
import type {
    Args,
    Meta,
    StoryObj,
} from '@storybook/react';

import BarChart from './BarChart';

interface Option {
    id: number;
    label: string;
    value: number;
}

const data: Option[] = [
    { id: 1, label: '2022', value: 10 },
    { id: 2, label: '2023', value: 9 },
    { id: 3, label: '2024', value: 5 },
    { id: 4, label: '2020', value: 2 },
];

const keySelector = (d: Option) => d.id;
const valueSelector = (d: Option) => d.value;
const labelSelector = (d: Option) => d.label;

const maxValue = Math.max(...data.map(valueSelector));
type BarChartSpecificProps = BarChartProps<Option>;

type Story = StoryObj<typeof BarChart>;

const meta: Meta<BarChartSpecificProps> = {
    title: 'Components/BarChart',
    component: BarChart,
    parameters: {
        layout: 'centered',
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/myeW85ibN5p2SlnXcEpxFD/IFRC-GO---UI-Current---1?type=design&node-id=0-4957&mode=design&t=KwxbuoUQxqcLyZbG-0',
        },
    },
    tags: ['autodocs'],
};

export default meta;

function Template(args:Args) {
    return (
        <BarChart
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...args}
            data={data}
            keySelector={keySelector}
            labelSelector={labelSelector}
            valueSelector={valueSelector}
            maxValue={maxValue}
        />
    );
}

export const Default: Story = {
    render: Template,
};

export const MaxRows: Story = {
    render: Template,
    args: {
        maxRows: 5,
    },
};

export const CompactValue: Story = {
    render: Template,
    args: {
        compactValue: true,
    },
};
