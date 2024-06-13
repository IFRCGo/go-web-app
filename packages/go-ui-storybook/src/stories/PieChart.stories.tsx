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
            url: 'https://www.figma.com/file/k9SOqgh5jk9PxzuBKdMKsA/IFRC-GO---UI-Library?node-id=11699-192004&t=qmirLf8EtsAXR5l4-4',
        },
    },
    tags: ['autodocs'],
};

export default meta;
const options: Option[] = [
    { value: 50, label: 'Rice', key: '1' },
    { value: 15, label: 'Vegetables', key: '2' },
    { value: 20, label: 'Fruits', key: '3' },
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
