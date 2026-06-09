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
    argTypes: {
        colorVariant: {
            control: 'select',
            options: ['text', 'text-on-dark', 'primary', 'secondary', 'success', 'danger'],
        },
    },
} satisfies Meta<typeof Heading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Level1: Story = {
    args: {
        level: 1,
        children: 'A world of dew, And within every dewdrop, A world of struggle.',
    },
};

export const WithColorVariant: Story = {
    args: {
        level: 2,
        colorVariant: 'primary',
        children: 'A world of dew, And within every dewdrop, A world of struggle.',
    },
};
