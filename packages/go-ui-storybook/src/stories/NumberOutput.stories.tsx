import { NumberOutputProps } from '@ifrc-go/ui';
import type {
    Meta,
    StoryObj,
} from '@storybook/react';

import NumberOutput from './NumberOutput';

type NumberOutputSpecificProps = NumberOutputProps;

type Story = StoryObj< NumberOutputSpecificProps>;

const meta: Meta<typeof NumberOutput> = {
    title: 'Components/ NumberOutput',
    component: NumberOutput,
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

export const Default: Story = {
    args: {
        value: 12333,

    },
};

export const WithToolTip: Story = {
    args: {
        value: 186282,
        tooltip: 'The speed of light',
    },
};

export const WithSuffix: Story = {
    args: {
        value: 123456,
        suffix: ' USD',
    },
};

export const WithPrefix: Story = {
    args: {
        value: 123456,
        prefix: '$ ',
    },
};

export const Compact: Story = {
    args: {
        value: 1234567890,
        compact: true,
    },
};
