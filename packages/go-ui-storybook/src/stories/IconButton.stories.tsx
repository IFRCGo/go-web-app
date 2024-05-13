import { WikiHelpSectionLineIcon } from '@ifrc-go/icons';
import { IconButtonProps } from '@ifrc-go/ui';
import type {
    Meta,
    StoryObj,
} from '@storybook/react';

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
            url: 'https://www.figma.com/file/myeW85ibN5p2SlnXcEpxFD/IFRC-GO---UI-Current---1?type=design&node-id=0-4957&mode=design&t=KwxbuoUQxqcLyZbG-0',
        },
    },
    tags: ['autodocs'],
    decorators: [
        function Component(_, ctx) {
            const componentArgs = ctx.args as IconButtonSpecificProps;
            return (
                <IconButton
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
        children: '1',
        className: 'Icon-button',
        variant: 'primary',
    },
};
export const WithIcon: Story = {
    args: {
        children: <WikiHelpSectionLineIcon />,
        className: 'Icon-button',
        variant: 'secondary',
    },
};
export const Disabled: Story = {
    args: {
        children: '1',
        className: 'Icon-button',
        variant: 'secondary',
        disabled: true,
    },
};
