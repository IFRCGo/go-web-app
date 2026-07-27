import { Fragment } from 'react';
import { MenuProps } from '@ifrc-go/ui';
import type {
    Meta,
    StoryObj,
} from '@storybook/react';

import Menu from './Menu';

type Story = StoryObj<MenuProps>;

const meta = {
    title: 'Components/Menu',
    component: Menu,
    parameters: {
        layout: 'centered',
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/k9SOqgh5jk9PxzuBKdMKsA/IFRC-GO---UI-Library?node-id=11261-189957&t=JxlW0bNF2vjvkZ01-4',
        },
    },
    tags: ['autodocs'],
} satisfies Meta<typeof Menu>;

export default meta;

export const Default = {
    args: {
        label: 'Select a language',
        children: [
            <Fragment key="language">
                <div className="dropdown-option">English</div>
                <div className="dropdown-option">Spanish</div>
                <div className="dropdown-option">French</div>
                <div className="dropdown-option">Arabic</div>
            </Fragment>,
        ],
    },
} satisfies Story;

export const WithoutDropdownIcon: Story = {
    args: {
        ...Default.args,
        withoutDropdownIcon: true,
    },
};

export const Persistent: Story = {
    args: {
        ...Default.args,
        persistent: true,
    },
};

export const WithPreferredWidth: Story = {
    args: {
        ...Default.args,
        preferredPopupWidth: 30,
    },
};
