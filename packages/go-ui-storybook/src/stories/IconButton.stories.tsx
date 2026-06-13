import { AddFillIcon } from '@ifrc-go/icons';
import { IconButtonProps } from '@ifrc-go/ui';
import type {
    Meta,
    StoryObj,
} from '@storybook/react';
import { fn } from '@storybook/test';

import IconButton from './IconButton';

type IconButtonSpecificProps = IconButtonProps<string>;
type Story = StoryObj<IconButtonSpecificProps>;

const meta: Meta<typeof IconButton> = {
    title: 'Action/IconButton',
    component: IconButton,
    parameters: {
        layout: 'centered',
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/k9SOqgh5jk9PxzuBKdMKsA/IFRC-GO---UI-Library?node-id=11493-192920&t=JxlW0bNF2vjvkZ01-4',
        },
    },
    args: {
        onClick: fn(),
    },
    tags: ['autodocs'],
};

export default meta;

export const Default: Story = {
    args: {
        title: 'Add Item',
        ariaLabel: 'Add Item',
        children: <AddFillIcon />,
    },
};
export const Primary: Story = {
    args: {
        ...Default.args,
        variant: 'primary',
    },
};
export const Secondary: Story = {
    args: {
        ...Default.args,
        variant: 'secondary',
    },
};
export const Tertiary: Story = {
    args: {
        ...Default.args,
        variant: 'tertiary',
    },
};
export const Subtle: Story = {
    args: {
        ...Default.args,
        variant: 'subtle',
    },
};
export const Disabled: Story = {
    args: {
        ...Default.args,
        variant: 'secondary',
        disabled: true,
    },
};
