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
            url: 'https://www.figma.com/file/myeW85ibN5p2SlnXcEpxFD/IFRC-GO---UI-Current---1?type=design&node-id=0-4957&mode=design&t=KwxbuoUQxqcLyZbG-0',
            allowFullscreen: true,
        },
    },
    tags: ['autodocs'],
    argTypes: {},
} satisfies Meta<typeof ProgressBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        value: 50,
        totalValue: 100,
        showPercentageInTitle: true,
    },
};

export const WithTitle : Story = {
    args: {
        ...Default.args,
        title: 'Progress',
    },
};

export const WithDescription: Story = {
    args: {
        ...Default.args,
        description: 'This is a progress bar',
    },
};
