import type {
    Meta,
    StoryObj,
} from '@storybook/react';
import { fn } from '@storybook/test';

import Button from './Button';

const meta = {
    title: 'Action/Button',
    component: Button,
    parameters: {
        layout: 'centered',
        design: {
            type: 'figma',
            url: 'https://www.figma.com/proto/k9SOqgh5jk9PxzuBKdMKsA/IFRC-GO---UI-Library?type=design&node-id=11261-189642&t=T89pqHCZaIRUE5DW-1&scaling=contain&page-id=11126%3A176956&starting-point-node-id=11282%3A188000&mode=design',
            allowFullscreen: true,
        },
    },
    args: {
        onClick: fn(),
    },
    tags: ['autodocs'],
    argTypes: {},
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
    args: {
        name: 'button',
        styleVariant: 'filled',
        colorVariant: 'primary',
        children: 'Primary Button',
        textSize: 'md',
    },
    parameters: {
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/k9SOqgh5jk9PxzuBKdMKsA/IFRC-GO---UI-Library?type=design&node-id=11261-189962&mode=design&t=H77btqXhNDop8ZRl-4',
            allowFullscreen: false,
        },
    },
};

export const Secondary: Story = {
    args: {
        name: 'button',
        children: 'Secondary Button',
        colorVariant: 'primary',
        styleVariant: 'outline',
    },
    parameters: {
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/k9SOqgh5jk9PxzuBKdMKsA/IFRC-GO---UI-Library?type=design&node-id=11261-189950&mode=design&t=H77btqXhNDop8ZRl-4',
            allowFullscreen: false,
        },
    },
};

export const Action: Story = {
    args: {
        name: 'button',
        children: 'Action Button',
        colorVariant: 'primary',
        styleVariant: 'action',
        textSize: 'md',
    },
    parameters: {
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/k9SOqgh5jk9PxzuBKdMKsA/IFRC-GO---UI-Library?type=design&node-id=11261-189955&mode=design&t=H77btqXhNDop8ZRl-4',
            allowFullscreen: false,
        },
    },
};

export const Disabled: Story = {
    args: {
        name: 'button',
        children: 'Disabled Button',
        colorVariant: 'primary',
        styleVariant: 'filled',
        textSize: 'md',
        disabled: true,
    },
};

export const FullWidth: Story = {
    args: {
        name: 'button',
        children: 'Full Width Button',
        colorVariant: 'primary',
        styleVariant: 'filled',
        withFullWidth: true,
        textSize: 'md',
    },
};

export const WithoutPadding: Story = {
    args: {
        name: 'button',
        children: 'No Padding Button',
        colorVariant: 'primary',
        styleVariant: 'filled',
        withoutPadding: true,
        textSize: 'md',
    },
};
