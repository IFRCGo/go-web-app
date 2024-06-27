import { BooleanOutputProps } from '@ifrc-go/ui';
import type {
    Meta,
    StoryObj,
} from '@storybook/react';

import BooleanOutput from './BooleanOutput';

type Story = StoryObj<BooleanOutputProps>;

const meta: Meta<typeof BooleanOutput> = {
    title: 'Components/BooleanOutput',
    component: BooleanOutput,
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
        value: true,
    },
};

export const TrueValue : Story = {
    args: {
        ...Default.args,
        value: true,
    },
};

export const FalseValue :Story = {
    args: {
        ...Default.args,
        value: false,
    },

};

export const InvalidText: Story = {
    args: {
        ...Default.args,
        invalidText: 'Invalid value',
    },
};
