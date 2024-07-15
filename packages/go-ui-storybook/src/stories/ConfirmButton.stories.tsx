import { useArgs } from '@storybook/preview-api';
import type {
    Args,
    Meta,
    StoryObj,
} from '@storybook/react';
import { fn } from '@storybook/test';

import ConfirmButton from './ConfirmButton';

type Story = StoryObj<typeof ConfirmButton>;

const meta: Meta<typeof ConfirmButton> = {
    title: 'Components/ConfirmButton',
    component: ConfirmButton,
    parameters: {
        layout: 'centered',
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/myeW85ibN5p2SlnXcEpxFD/IFRC-GO---UI-Current---1?type=design&node-id=0-4957&mode=design&t=KwxbuoUQxqcLyZbG-0',
        },
    },
    args: {
        onClick: fn(),
        onConfirm: fn(),
    },
    tags: ['autodocs'],
};

export default meta;

function Template(args:Args) {
    const [
        {
            onConfirm,
        },
    ] = useArgs();

    const handleConfirm = (name: string) => {
        onConfirm(name);
    };

    return (
        <ConfirmButton
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...args}
            name="confirmButton"
            confirmMessage="This action cannot be undone. Are you sure you want to proceed?"
            confirmHeading="Confirmation"
            onConfirm={handleConfirm}
        >
            Delete
        </ConfirmButton>
    );
}

export const Primary: Story = {
    render: Template,
};

export const Secondary: Story = {
    render: Template,
    args: {
        variant: 'secondary',
    },
};

export const Tertiary: Story = {
    render: Template,
    args: {
        variant: 'tertiary',
    },
};

export const Disabled: Story = {
    render: Template,
    args: {
        disabled: true,
    },
};
