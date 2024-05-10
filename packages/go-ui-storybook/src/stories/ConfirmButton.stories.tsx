import { ConfirmButtonProps } from '@ifrc-go/ui';
import type {
    Meta,
    StoryObj,
} from '@storybook/react';

import ConfirmButton from './ConfirmButton';

type ConfirmButtonSpecificProps = ConfirmButtonProps<string>;

type Story = StoryObj< ConfirmButtonSpecificProps>;

const meta: Meta<typeof ConfirmButton> = {
    title: 'Components/ ConfirmButton',
    component: ConfirmButton,
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
            const componentArgs = ctx.args as ConfirmButtonSpecificProps;
            return (
                <ConfirmButton
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
        confirmMessage: 'Are you sure?',
        confirmHeading: 'Confirmation',
        children: 'Confirm-button',
    },
};

export const Disabled: Story = {
    args: {
        confirmMessage: 'Are you sure?',
        confirmHeading: 'Confirmation',
        children: 'Confirm-button',
        disabled: true,
    },
};
