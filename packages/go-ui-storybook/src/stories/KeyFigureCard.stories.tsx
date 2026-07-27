import { HealthadviceIcon } from '@ifrc-go/icons';
import type {
    Meta,
    StoryObj,
} from '@storybook/react';

import KeyFigureCard from './KeyFigureCard';

type Story = StoryObj<typeof KeyFigureCard>

const meta = {
    title: 'Components/KeyFigureCard',
    component: KeyFigureCard,
    parameters: {
        layout: 'centered',
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/k9SOqgh5jk9PxzuBKdMKsA/IFRC-GO---UI-Library?node-id=11176-183007&t=1f3grs60CuPRyWAq-4',
            allowFullscreen: true,
        },
    },
    tags: ['autodocs'],
} satisfies Meta<typeof KeyFigureCard>;

export default meta;

export const Default = {
    args: {
        value: 500,
        label: 'Targeted population',
    },
} satisfies Story;

export const WithProgress = {
    args: {
        ...Default.args,
        progress: 50,
        progressDescription: '50% received',
    },
} satisfies Story;

export const WithIconAndInfo = {
    args: {
        value: 800000,
        label: 'Targeted Population',
        progress: 22,
        progressDescription: '22% received',
        icon: <HealthadviceIcon />,
        info: 'Africa - Hunger Crisis',
    },
} satisfies Story;
