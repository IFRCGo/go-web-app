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
    title: 'Components/IconButton',
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
        children: <AddFillIcon />,
        variant: 'primary',
    },
};
export const Disabled: Story = {
    args: {
        title: 'Download',
        children: <AddFillIcon />,
        variant: 'secondary',
        disabled: true,
    },
};
