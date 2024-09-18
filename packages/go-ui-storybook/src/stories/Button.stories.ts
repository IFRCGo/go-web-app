import type {
    Meta,
    StoryObj,
} from '@storybook/react';
import { fn } from '@storybook/test';

import Button from './Button';

const meta = {
    title: 'Components/Button',
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
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
    args: {
        name: 'button',
        variant: 'primary',
        children: 'Primary Button',
    },
    parameters: {
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/k9SOqgh5jk9PxzuBKdMKsA/IFRC-GO---UI-Library?type=design&node-id=11261-189962&mode=design&t=H77btqXhNDop8ZRl-4',
            allowFullscreen: false,
        },
    },
};

export const PrimaryButtonWithIcon: Story = {
    args: {
        name: 'button',
        variant: 'primary',
        children: 'Primary Button',
        // icons: <DownloadTwoFillIcon /> ,
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
        variant: 'secondary',
        children: 'Secondary Button',
    },
    parameters: {
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/k9SOqgh5jk9PxzuBKdMKsA/IFRC-GO---UI-Library?type=design&node-id=11261-189950&mode=design&t=H77btqXhNDop8ZRl-4',
            allowFullscreen: false,
        },
    },
};

export const SecondaryButtonWithIcon: Story = {
    args: {
        name: 'button',
        variant: 'primary',
        children: 'Primary Button',
        // icons: <DownloadTwoFillIcon /> ,
    },
    parameters: {
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/k9SOqgh5jk9PxzuBKdMKsA/IFRC-GO---UI-Library?type=design&node-id=11261-189950&mode=design&t=H77btqXhNDop8ZRl-4',
            allowFullscreen: false,
        },
    },
};

export const Tertiary: Story = {
    args: {
        name: 'button',
        variant: 'tertiary',
        children: 'Tertiary Button',
    },
    parameters: {
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/k9SOqgh5jk9PxzuBKdMKsA/IFRC-GO---UI-Library?type=design&node-id=11261-189955&mode=design&t=H77btqXhNDop8ZRl-4',
            allowFullscreen: false,
        },
    },
};

export const TertiaryButtonWithIcon: Story = {
    args: {
        name: 'button',
        variant: 'tertiary',
        children: 'tertiary Button',
        // icons: <DownloadTwoFillIcon /> ,
    },
    parameters: {
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/k9SOqgh5jk9PxzuBKdMKsA/IFRC-GO---UI-Library?type=design&node-id=11261-189955&mode=design&t=H77btqXhNDop8ZRl-4',
            allowFullscreen: false,
        },
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

export const GreyTertiaryButtonWithIcon: Story = {
    args: {
        name: 'button',
        variant: 'grey-tertiary',
        children: 'Grey-Tertiary Button',
        // icons: <DownloadTwoFillIcon />
    },
};

export const ProcessButtonWithIcon: Story = {
    args: {
        name: 'button',
        variant: 'secondary',
        children: 'Process Button',
        // icons:<LoaderLineIcon/>
    },
};
