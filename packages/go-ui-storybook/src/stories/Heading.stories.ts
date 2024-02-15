import type {
    Meta,
    StoryObj,
} from '@storybook/react';

import Heading from './Heading';

const meta = {
    title: 'Components/Heading',
    component: Heading,
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
} satisfies Meta<typeof Heading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Level1: Story = {
    args: {
        level: 1,
        children: 'Heading Level 1',
    },
};

export const Level2: Story = {
    args: {
        level: 2,
        children: 'Heading Level 2',
    },
};

export const Level3: Story = {
    args: {
        level: 3,
        children: 'Heading Level 3',
    },
};

export const Level4: Story = {
    args: {
        level: 4,
        children: 'Heading Level 4',
    },
};

export const Level5: Story = {
    args: {
        level: 5,
        children: 'Heading Level 5',
    },
};

export const Level6: Story = {
    args: {
        level: 6,
        children: 'Heading Level 6',
    },
};
