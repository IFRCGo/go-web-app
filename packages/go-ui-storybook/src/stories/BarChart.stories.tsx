import { BarChartProps } from '@ifrc-go/ui';
import type {
    Meta,
    StoryObj,
} from '@storybook/react';

import BarChart from './BarChart';

type BarChartSpecificProps = BarChartProps<Option>;

type Story = StoryObj<BarChartSpecificProps>;

const meta: Meta<typeof BarChart> = {
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

interface Option {
    key: string;
    label: string;
    value: number;
}

const data: Option[] = [
    { key: '1', label: '2022', value: 8 },
    { key: '2', label: '2023', value: 28 },
    { key: '3', label: '2024', value: 50 },
    { key: '4', label: '2020', value: 59 },
];

const keySelector = (d: Option) => d.key;
const valueSelector = (d: Option) => d.value;
const labelSelector = (d: Option) => d.label;

export const Default: Story = {
    args: {
        data,
        maxValue: 3,
        keySelector,
        labelSelector,
        valueSelector,
    },
};
