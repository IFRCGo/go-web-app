import { DropdownMenuProps } from '@ifrc-go/ui';
import type {
    Meta,
    StoryObj,
} from '@storybook/react';

import DropdownMenu from './DropdownMenu';

type DropdownMenuSpecificProps = DropdownMenuProps & {
    name: string;
};

type Story = StoryObj<DropdownMenuSpecificProps>;

const meta: Meta<typeof DropdownMenu> = {
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
    decorators: [
        function Component(_, ctx) {
            const componentArgs = ctx.args as DropdownMenuSpecificProps;

            return (
                <DropdownMenu
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...componentArgs}
                />
            );
        },
    ],
};

export default meta;

export const Default: Story = {
    args: {
        label: 'Click me',
        children: 'Spanish',
    },
};

export const WithoutDropdownIcon: Story = {
    args: {
        label: 'Click me',
        withoutDropdownIcon: true,
        children: 'Spanish',
    },
};

export const Persistent: Story = {
    args: {
        label: 'Click me',
        persistent: true,
        children: 'Spanish',

    },
};

export const Variant: Story = {
    args: {
        label: 'Click me',
        persistent: true,
        variant: 'primary',
        children: 'Spanish',
    },
};
