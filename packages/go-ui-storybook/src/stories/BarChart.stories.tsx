import { BarChartProps } from '@ifrc-go/ui';
import type {
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
    { id: 1, label: 'Apples', value: 50 },
    { id: 2, label: 'Oranges', value: 30 },
    { id: 3, label: 'Bananas', value: 20 },
    { id: 4, label: 'Grapes', value: 40 },
];

const keySelector = (d: Option) => d.id;
const valueSelector = (d: Option) => d.value;
const labelSelector = (d: Option) => d.label;
const maxValue = Math.max(...data.map(valueSelector));

type BarChartSpecificProps = BarChartProps<Option>;
type Story = StoryObj<BarChartSpecificProps>;
const meta: Meta<BarChartSpecificProps> = {
    title: 'Components/BarChart',
    component: BarChart,
    parameters: {
        layout: 'centered',
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/k9SOqgh5jk9PxzuBKdMKsA/IFRC-GO---UI-Library?node-id=14425-221303&t=qmirLf8EtsAXR5l4-4',
        },
    },
    tags: ['autodocs'],
};

export default meta;

export const Default: Story = {
    args: {
        data,
        keySelector,
        labelSelector,
        valueSelector,
        maxValue,
        className: 'bar-chart',
    },
};

export const WithMaxRows: Story = {
    args: {
        ...Default.args,
        maxRows: 3,
    },
};

export const WithCompactValue: Story = {
    args: {
        ...Default.args,
        compactValue: true,
    },
};
