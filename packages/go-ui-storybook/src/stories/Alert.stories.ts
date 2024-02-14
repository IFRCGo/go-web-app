import type {
    Meta,
    StoryObj,
} from '@storybook/react';

import Alert from './Alert';

const meta = {
    title: 'Components/Alert',
    component: Alert,
    parameters: {
        layout: 'centered',
        allowfullscreen: true,
    },
    tags: ['autodocs'],
    argTypes: {},
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Info: Story = {
    args: {
        name: 'info',
        title: 'Information',
        type: 'info',
    },
};

export const Success: Story = {
    args: {
        name: 'success',
        title: 'Success',
        type: 'success',
    },
};

export const Warning : Story = {
    args: {
        name: 'warning',
        title: 'Warning',
        type: 'warning',
    },
};

export const Danger : Story = {
    args: {
        name: 'danger',
        title: 'Danger',
        type: 'danger',
    },
};
