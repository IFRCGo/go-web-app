import type {
    Meta,
    StoryObj,
} from '@storybook/react';

import TopBanner from './TopBanner';

type Story = StoryObj<typeof TopBanner>;

const meta = {
    title: 'Components/TopBanner',
    component: TopBanner,
    parameters: {
        layout: 'fullscreen',
    },
    tags: ['autodocs'],
} satisfies Meta<typeof TopBanner>;

export default meta;

export const Brand = {
    args: {
        variant: 'brand',
        children: 'Scheduled maintenance on Sunday 02:00–04:00 UTC.',
    },
} satisfies Story;

export const Information = {
    args: {
        variant: 'information',
        children: 'A new version of IFRC GO is available.',
    },
} satisfies Story;

export const Warning = {
    args: {
        variant: 'warning',
        children: 'Some services are currently running in a degraded mode.',
    },
} satisfies Story;
