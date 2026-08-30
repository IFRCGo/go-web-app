import { HealthadviceIcon } from '@ifrc-go/icons';
import type {
    Meta,
    StoryObj,
} from '@storybook/react';

import KeyFigureView from './KeyFigureView';

type Story = StoryObj<typeof KeyFigureView>

const meta = {
    title: 'Views/KeyFigureView',
    component: KeyFigureView,
    parameters: {
        layout: 'centered',
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/k9SOqgh5jk9PxzuBKdMKsA/IFRC-GO---UI-Library?node-id=11176-183007&t=1f3grs60CuPRyWAq-4',
            allowFullscreen: true,
        },
    },
    tags: ['autodocs'],
} satisfies Meta<typeof KeyFigureView>;

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
        children: 'Last updated: 2023-10-06',
    },
} satisfies Story;
