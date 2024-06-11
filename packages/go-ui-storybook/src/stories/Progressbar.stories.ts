import { ProgressBarProps } from '@ifrc-go/ui';
import type {
    Meta,
    StoryObj,
} from '@storybook/react';

import ProgressBar from './ProgressBar';

const meta = {
    title: 'Components/ProgressBar',
    component: ProgressBar,
    parameters: {
        layout: 'centered',
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/k9SOqgh5jk9PxzuBKdMKsA/IFRC-GO---UI-Library?node-id=14425-221303&t=tvoCZGUCjrbFSV16-4',
            allowFullscreen: true,
        },
    },
    tags: ['autodocs'],
    argTypes: {},
} satisfies Meta<typeof ProgressBar>;

export default meta;

type Story = StoryObj<ProgressBarProps>;

export const Default: Story = {
    args: {
        className: 'progress-bar',
        value: 75,
        title: 'Total Projects Completed',
        totalValue: 150,
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
