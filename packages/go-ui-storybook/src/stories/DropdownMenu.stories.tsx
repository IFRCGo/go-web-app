import type {
    Meta,
    StoryObj,
} from '@storybook/react';

import DropdownMenu, { DropdownMenuProps } from './DropdownMenu';

type Story = StoryObj<DropdownMenuProps>;

const meta = {
    title: 'Components/DropdownMenu',
    component: DropdownMenu,
    parameters: {
        layout: 'centered',
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/myeW85ibN5p2SlnXcEpxFD/IFRC-GO---UI-Current---1?type=design&node-id=0-4957&mode=design&t=KwxbuoUQxqcLyZbG-0',
        },
    },
    tags: ['autodocs'],
} satisfies Meta<typeof DropdownMenu>;

export default meta;

export const Default = {
    args: {
        label: 'Select a language',
        children: [
            <>
                <div className="dropdown-option">English</div>
                <div className="dropdown-option">Spanish</div>
                <div className="dropdown-option">French</div>
                <div className="dropdown-option">Arabic</div>
            </>,
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
