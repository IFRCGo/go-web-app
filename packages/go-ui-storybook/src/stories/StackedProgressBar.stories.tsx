import { StackedProgressBarProps } from '@ifrc-go/ui';
import type {
    Meta,
    StoryObj,
} from '@storybook/react';

import StackedProgressBar from './StackedProgressBar';

interface Category {
    value: number;
    color: string;
    label: string;
}

const data:Category[] = [
    {
        label: 'Category A',
        value: 15,
        color: '#ff3333',
    },
    {
        label: 'Category B',
        value: 20,
        color: '#ff6666',
    },
    {
        label: 'Category C',
        value: 25,
        color: '#ff9999',
    },
    {
        label: 'Category D',
        value: 30,
        color: '#ffcccc',
    },
];

type StackedProgressBarSpecificProps = StackedProgressBarProps<Category>;

type Story = StoryObj<StackedProgressBarSpecificProps>;

const meta: Meta<typeof StackedProgressBar> = {
    title: 'Components/StackedProgressBar',
    component: StackedProgressBar,
    parameters: {
        layout: 'centered',
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/k9SOqgh5jk9PxzuBKdMKsA/IFRC-GO---UI-Library?node-id=14450-215139&t=qmirLf8EtsAXR5l4-4',
        },
    },
    tags: ['autodocs'],
};

export default meta;

const valueSelector = (datum: Category) => datum.value;
const labelSelector = (datum: Category) => datum.label;
const colorSelector = (datum: Category) => datum.color;

export const Default: Story = {
    args: {
        data,
        valueSelector,
        labelSelector,
        colorSelector,
    },
};
