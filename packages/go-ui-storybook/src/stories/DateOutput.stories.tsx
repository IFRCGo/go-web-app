import type {
    Meta,
    StoryObj,
} from '@storybook/react';

import DateOutput from './DateOutput';

type Story =StoryObj<typeof DateOutput>;

const meta: Meta<typeof DateOutput> = {
    title: 'Components/DateOutput',
    component: DateOutput,
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
};

export default meta;

export const Default: Story = {
    args: {
        value: new Date(),
        format: 'dd-MM-yyyy',
        invalidText: 'Invalid date',
    },
};

export const DateWithtime: Story = {
    args: {
        value: new Date(),
        format: 'yyyy-MM-dd hh:mm aaa',
    },
};

export const NoValue: Story = {
    args: {
        value: undefined,
    },
};
