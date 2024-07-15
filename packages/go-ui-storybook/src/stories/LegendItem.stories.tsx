import { LegendItemProps } from '@ifrc-go/ui';
import type {
    Meta,
    StoryObj,
} from '@storybook/react';

import LegendItem from './LegendItem';

type Story = StoryObj<LegendItemProps>;

const meta: Meta<typeof LegendItem> = {
    title: 'Components/LegendItem',
    component: LegendItem,
    parameters: {
        layout: 'centered',
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/k9SOqgh5jk9PxzuBKdMKsA/IFRC-GO---UI-Library?node-id=13837-219047&t=rxFDpy4yPC2JaFiF-4',
        },
    },
    tags: ['autodocs'],
};

export default meta;

export const Default: Story = {
    args: {
        label: 'Early Action Protocol Activation',
        color: 'red',
    },
};

export const WithDifferentColor: Story = {
    args: {
        label: 'Multiple types',
        color: 'orange',
    },
};
