import { ProgressBarProps } from '@ifrc-go/ui';
import type {
    Meta,
    StoryObj,
} from '@storybook/react';

import ProgressBar from './ProgressBar';

const meta = {
    title: 'Visualization/ProgressBar',
    component: ProgressBar,
    parameters: {
        layout: 'centered',
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/k9SOqgh5jk9PxzuBKdMKsA/IFRC-GO---UI-Library?node-id=11261-184719&t=JxlW0bNF2vjvkZ01-4',
            allowFullscreen: true,
        },
    },
    tags: ['autodocs'],
} satisfies Meta<typeof ProgressBar>;

export default meta;

type Story = StoryObj<ProgressBarProps>;

export const Default: Story = {
    args: {
        className: 'progress-bar',
        value: 75,
        title: 'Total Projects Completed',
        totalValue: 150,
        colorVariant: 'primary',
    },
};

export const WithPercentageInTitle: Story = {
    args: {
        ...Default.args,
        showPercentageInTitle: true,
    },
};

export const WithDescription: Story = {
    args: {
        ...Default.args,
        description: 'Number of projects completed successfully this year.',
    },
};

export const Success: Story = {
    args: {
        value: 40,
        totalValue: 100,
        title: 'Successful Projects',
        colorVariant: 'success',
    },
};

export const Danger: Story = {
    args: {
        value: 20,
        totalValue: 100,
        title: 'Failed Projects',
        colorVariant: 'danger',
    },
};

export const CustomColor: Story = {
    args: {
        value: 50,
        totalValue: 100,
        title: 'Custom Color Progress',
        colorVariant: 'custom',
        color: '#FF5733',
        showPercentageInTitle: true,
    },
};
