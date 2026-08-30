import { ButtonLayoutProps } from '@ifrc-go/ui';
import type {
    Meta,
    StoryObj,
} from '@storybook/react';

import ButtonLayout from './ButtonLayout';

const meta: Meta<ButtonLayoutProps> = {
    title: 'Layouts/ButtonLayout',
    component: ButtonLayout,
    parameters: {
        layout: 'centered',
    },
    argTypes: {},
};

export default meta;
type Story = StoryObj<ButtonLayoutProps>;

export const PrimaryFilled: Story = {
    args: {
        colorVariant: 'primary',
        styleVariant: 'filled',
        children: 'Primary Button',
    },
};

export const Outline: Story = {
    args: {
        styleVariant: 'outline',
        children: 'Outline Button',
    },
};

export const Action: Story = {
    args: {
        styleVariant: 'action',
        children: 'Action Button',
    },
};

export const Success: Story = {
    args: {
        colorVariant: 'success',
        styleVariant: 'filled',
        children: 'Success',
    },
};

export const Danger: Story = {
    args: {
        colorVariant: 'danger',
        styleVariant: 'filled',
        children: 'Danger',
    },
};

export const Disabled: Story = {
    args: {
        disabled: true,
        children: 'Disabled',
    },
};

export const FullWidth: Story = {
    args: {
        withFullWidth: true,
        children: 'Full Width Button',
    },
};

export const WithoutPadding: Story = {
    args: {
        withoutPadding: true,
        children: 'No Padding',
    },
};

export const SmallText: Story = {
    args: {
        textSize: 'sm',
        children: 'Small Text',
    },
};

export const LargeText: Story = {
    args: {
        textSize: 'lg',
        children: 'Large Text',
    },
};
