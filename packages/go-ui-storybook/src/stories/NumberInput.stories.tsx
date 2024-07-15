import type {
    Meta,
    StoryObj,
} from '@storybook/react';
import { fn } from '@storybook/test';

import NumberInput from './NumberInput';

const meta: Meta<typeof NumberInput> = {
    title: 'Components/NumberInput',
    component: NumberInput,
    parameters: {
        layout: 'centered',
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/myeW85ibN5p2SlnXcEpxFD/IFRC-GO---UI-Current---1?type=design&node-id=0-4957&mode=design&t=KwxbuoUQxqcLyZbG-0',
        },
    },
    args: {
        onChange: fn(),
    },
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        label: 'Number of people affected',
        value: 1123,
    },
};

export const Disabled: Story = {
    args: {
        ...Default.args,
        disabled: true,
    },
};

export const ReadOnly: Story = {
    args: {
        ...Default.args,
        readOnly: true,
    },
};

export const WithAsterisk: Story = {
    args: {
        ...Default.args,
        withAsterisk: true,
    },
};

export const Hint: Story = {
    args: {
        ...Default.args,
        hint: 'Please enter a valid number.',
    },
};

export const WithPlaceholder: Story = {
    args: {
        label: 'Year',
        placeholder: 'Enter current year',
    },
};
