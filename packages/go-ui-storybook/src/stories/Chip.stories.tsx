import type {
    Meta,
    StoryObj,
} from '@storybook/react';

import Chip from './Chip';

type Story = StoryObj<typeof Chip>;

const meta: Meta<typeof Chip> = {
    title: 'Components/Chip',
    component: Chip,
    parameters: {
        layout: 'centered',
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/myeW85ibN5p2SlnXcEpxFD/IFRC-GO---UI-Current---1?type=design&node-id=0-4957&mode=design&t=KwxbuoUQxqcLyZbG-0',
        },
    },
    args: {
        label: 'Chip',
    },
    tags: ['autodocs'],
    argTypes: {
        onDelete: { action: 'deleted' },
    },
};

export default meta;

export const Primary: Story = {
    args: {
        variant: 'primary',
    },
};

export const Secondary: Story = {
    args: {
        variant: 'secondary',
    },
};

export const Tertiary: Story = {
    args: {
        variant: 'tertiary',
    },
};
