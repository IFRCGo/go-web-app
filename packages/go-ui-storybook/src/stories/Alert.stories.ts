import type {
    Meta,
    StoryObj,
} from '@storybook/react';
import { fn } from '@storybook/test';

import Alert from './Alert';

const meta = {
    title: 'Components/Alert',
    component: Alert,
    parameters: {
        layout: 'centered',
        allowfullscreen: true,
    },
    tags: ['autodocs'],
    args: {
        onCloseButtonClick: fn(),
    },
    argTypes: {},
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Info: Story = {
    args: {
        name: 'info',
        title: 'Information',
        type: 'info',
        description: 'This alert provides informative details to the user.',
    },
};

export const Success: Story = {
    args: {
        name: 'success',
        title: 'Success',
        type: 'success',
        description: 'This alert indicates a successful operation or task.',
    },
};

export const Warning : Story = {
    args: {
        name: 'warning',
        title: 'Warning',
        type: 'warning',
        description: 'This alert warns the user about potential issues or risks.',
    },
};

export const Danger : Story = {
    args: {
        name: 'danger',
        title: 'Danger',
        type: 'danger',
        description: 'This alert indicates a dangerous or potentially harmful situation.',
    },
};

export const NonDismissable: Story = {
    args: {
        name: 'danger',
        title: 'Danger',
        type: 'danger',
        description: 'This alert indicates a dangerous or potentially harmful situation.',
        nonDismissable: true,
    },
};
