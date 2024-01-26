import type {
    Meta,
    StoryObj,
} from '@storybook/react';

import Button from './Button';

const meta = {
    title: 'Example/Button',
    component: Button,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    argTypes: {},
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
    args: {
        name: 'button',
        variant: 'primary',
        children: 'Primary Button',
    },
};

export const Secondary: Story = {
    args: {
        name: 'button',
        variant: 'secondary',
        children: 'Secondary Button',
    },
};

export const Tertiary: Story = {
    args: {
        name: 'button',
        variant: 'tertiary',
        children: 'Tertiary Button',
    },
};

export const TertiaryOnDark: Story = {
    args: {
        name: 'button',
        variant: 'tertiary-on-dark',
        children: 'Tertiary on Dark Button',
    },
    parameters: {
        backgrounds: {
            default: 'dark',
        },
    },
};

export const DropdownItem: Story = {
    args: {
        name: 'button',
        variant: 'dropdown-item',
        children: 'Dropdown Item',
    },
};
