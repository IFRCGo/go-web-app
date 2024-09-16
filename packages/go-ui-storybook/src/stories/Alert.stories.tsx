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
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/k9SOqgh5jk9PxzuBKdMKsA/IFRC-GO---UI-Library?node-id=11261-191021&t=qmirLf8EtsAXR5l4-4',
        },
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
        type: 'info',
        nonDismissable: true,
        description: 'This alert provides informative details to the user.',
    },
    parameters: {
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/k9SOqgh5jk9PxzuBKdMKsA/IFRC-GO---UI-Library?node-id=11262-185381&t=7UbPoK27NQN0IBx8-4',
            allowFullscreen: false,
        },
    },
};

export const Success: Story = {
    args: {
        name: 'success',
        type: 'success',
        nonDismissable: true,
        description: 'This alert indicates a successful operation or task.',
    },
    parameters: {
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/k9SOqgh5jk9PxzuBKdMKsA/IFRC-GO---UI-Library?node-id=11262-185380&t=7UbPoK27NQN0IBx8-4',
            allowFullscreen: false,
        },
    },
};

export const Warning : Story = {
    args: {
        name: 'warning',
        type: 'warning',
        nonDismissable: true,
        description: 'This alert warns the user about potential issues or risks.',
    },
};

export const Danger : Story = {
    args: {
        name: 'danger',
        type: 'danger',
        nonDismissable: true,
        description: 'This alert indicates a dangerous or potentially harmful situation.',
    },
    parameters: {
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/k9SOqgh5jk9PxzuBKdMKsA/IFRC-GO---UI-Library?node-id=11262-185379&t=7UbPoK27NQN0IBx8-4',
            allowFullscreen: false,
        },
    },
};

export const NonDismissable: Story = {
    args: {
        name: 'danger',
        type: 'danger',
        description: 'This alert indicates a dangerous or potentially harmful situation.',
        nonDismissable: true,
    },
};
