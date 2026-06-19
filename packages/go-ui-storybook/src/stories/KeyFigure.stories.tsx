import type {
    Meta,
    StoryObj,
} from '@storybook/react';

import KeyFigure from './KeyFigure';

type Story = StoryObj<typeof KeyFigure>;

const meta = {
    title: 'Components/KeyFigure',
    component: KeyFigure,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
} satisfies Meta<typeof KeyFigure>;

export default meta;

export const Default = {
    args: {
        value: 500,
        label: 'Targeted population',
    },
} satisfies Story;

export const WithSupplement = {
    args: {
        value: 3.5,
        supplement: '/ 4',
        label: 'Average PER score',
    },
} satisfies Story;
