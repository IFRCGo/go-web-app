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
        description: 'This is an information alert.',
    },
};

export const Success: Story = {
    args: {
        name: 'success',
        title: 'Success',
        type: 'success',
        description: 'This is a Success alert.',
    },
};

export const Warning : Story = {
    args: {
        name: 'warning',
        title: 'Warning',
        type: 'warning',
        description: 'This is a warning alert.',
    },
};

export const Danger : Story = {
    args: {
        name: 'danger',
        title: 'Danger',
        type: 'danger',
        description: 'This is a danger alert.',
    },
};
