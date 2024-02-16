import type {
    Meta,
    StoryObj,
} from '@storybook/react';

import InputLabel from './InputLabel';

const meta = {
    title: 'Components/InputLabel',
    component: InputLabel,
    parameters: {
        layout: 'centered',
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/myeW85ibN5p2SlnXcEpxFD/IFRC-GO---UI-Current---1?type=design&node-id=0-4957&mode=design&t=KwxbuoUQxqcLyZbG-0',
        },
    },
    tags: ['autodocs'],
    argTypes: {},
} satisfies Meta<typeof InputLabel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        children: 'This is a   Default Input-label',
    },
};

export const Disabled :Story = {
    args: {
        children: 'This is a disabled label',
        disabled: true,
    },
};

export const Required : Story = {
    args: {
        children: 'This is a required label',
        required: true,
    },
};
