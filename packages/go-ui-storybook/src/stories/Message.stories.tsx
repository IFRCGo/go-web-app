import { MessageProps } from '@ifrc-go/ui';
import type {
    Meta,
    StoryObj,
} from '@storybook/react';

import Message from './Message';

type Story = StoryObj<MessageProps>;

const meta: Meta<typeof Message> = {
    title: 'Components/Message',
    component: Message,
    parameters: {
        layout: 'centered',
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/myeW85ibN5p2SlnXcEpxFD/IFRC-GO---UI-Current---1?type=design&node-id=0-4957&mode=design&t=KwxbuoUQxqcLyZbG-0',
        },
    },
    tags: ['autodocs'],
};

export default meta;

export const Default: Story = {
    args: {
        title: 'IFRC supported Operation',
    },
};

export const WithDescription: Story = {
    args: {
        ...Default.args,
        description: 'If operation does not appear in the dropdown, the operation does not yet exist in GO. In that case, please submit a new Field Report to generate the operation, then come back to this form',
    },
};

export const Info :Story = {
    args: {
        ...Default.args,
        description: 'If operation does not appear in the dropdown, the operation does not yet exist in GO. In that case, please submit a new Field Report to generate the operation, then come back to this form',
        variant: 'info',

    },
};
export const Pending :Story = {
    args: {
        title: 'Fetching data...',
        pending: true,

    },
};

export const Error :Story = {
    args: {
        ...Default.args,
        variant: 'error',
        erroredTitle: 'Page Not Found',
        errored: true,
    },
};
