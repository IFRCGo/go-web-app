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
        title: 'Server Maintenance',
        description: 'The server will be down for maintenance tonight from 10 PM to 2 AM. Please save your work.',
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
