import type {
    Meta,
    StoryObj,
} from '@storybook/react';

import Breadcrumbs from './Breadcrumbs';

type Story = StoryObj<typeof Breadcrumbs>;

const meta: Meta<typeof Breadcrumbs> = {
    title: 'Components/Breadcrumbs',
    component: Breadcrumbs,
    parameters: {
        layout: 'centered',
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/k9SOqgh5jk9PxzuBKdMKsA/IFRC-GO---UI-Library?node-id=11368-192658&t=JxlW0bNF2vjvkZ01-4',
            allowFullscreen: true,
        },
    },
    tags: ['autodocs'],
};

export default meta;

export const Default: Story = {
    args: {
        children: ['Home', 'Africa', 'Angola'],
    },
};

export const WithSlashSeparator: Story = {
    args: {
        ...Default.args,
        separator: '/',
    },
};
