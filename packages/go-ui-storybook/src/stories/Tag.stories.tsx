import type {
    Meta,
    StoryObj,
} from '@storybook/react';

import Tag from './Tag';

type Story = StoryObj<typeof Tag>;

const meta: Meta<typeof Tag> = {
    title: 'Components/Tag',
    component: Tag,
    parameters: {
        layout: 'centered',
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/myeW85ibN5p2SlnXcEpxFD/IFRC-GO---UI-Current---1?type=design&node-id=0-4957&mode=design&t=KwxbuoUQxqcLyZbG-0',
        },
    },
    args: {
        label: 'Tag',
    },
    tags: ['autodocs'],
};

export default meta;

export const Primary: Story = {
    args: {
        colorVariant: 'primary',
    },
};

export const Secondary: Story = {
    args: {
        colorVariant: 'secondary',
    },
};

export const Tertiary: Story = {
    args: {
        colorVariant: 'tertiary',
    },
};
