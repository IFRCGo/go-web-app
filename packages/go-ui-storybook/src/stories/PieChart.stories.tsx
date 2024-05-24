import { PieChartProps } from '@ifrc-go/ui';
import type {
    Meta,
    StoryObj,
} from '@storybook/react';

import PieChart from './PieChart';

interface Option{
    key: string| number;
    label:string;
    value:number;
}

type PieChartSpecificProps = PieChartProps<Option>;

type Story = StoryObj<PieChartSpecificProps>;

const meta: Meta<typeof PieChart> = {
    title: 'Components/PieChart',
    component: PieChart,
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
const options: Option[] = [
    { value: 10, label: 'Item 1', key: '1' },
    { value: 15, label: 'Item 2', key: '2' },
    { value: 20, label: 'Item 3', key: '3' },
];

const valueSelector: (d: Option) => number = (d) => d.value;
const labelSelector: (d: Option) => string = (d) => d.label;
const keySelector: (d: Option) => string | number = (d) => d.key;

export const Default: Story = {
    args: {
        data: options,
        valueSelector,
        labelSelector,
        keySelector,
        pieRadius: 40,
        chartPadding: 10,
        colors: ['red', '#FFAFAF', '#FF9D9D'],
    },
};
