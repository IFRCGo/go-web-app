import { CalendarLineIcon } from '@ifrc-go/icons';
import type {
    Meta,
    StoryObj,
} from '@storybook/react';

import InputContainer from './InputContainer';

const meta = {
    title: 'Components/InputContainer',
    component: InputContainer,
    parameters: {
        layout: 'centered',
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/myeW85ibN5p2SlnXcEpxFD/IFRC-GO---UI-Current---1?type=design&node-id=0-4957&mode=design&t=KwxbuoUQxqcLyZbG-0',
            allowFullscreen: true,
        },
    },
    tags: ['autodocs'],
    argTypes: {},
} satisfies Meta<typeof InputContainer>;

export default meta;
type Story = StoryObj<typeof InputContainer>;

export const Default: Story = {
    args: {
        label: 'Start After',
        input: <div>mm/dd/yy</div>,
        icons: <CalendarLineIcon />,
    },
};
export const Disabled: Story = {
    args: {
        label: 'Start After',
        input: <div>mm/dd/yy</div>,
        icons: <CalendarLineIcon />,
        disabled: true,

    },
};
export const WithError: Story = {
    args: {
        label: 'Start After',
        input: <div>mm/dd/yy</div>,
        icons: <CalendarLineIcon />,
        error: <p>This is an error message</p>,
    },
};

export const ReadOnly: Story = {
    args: {
        label: 'Start After',
        input: <div>mm/dd/yy</div>,
        icons: <CalendarLineIcon />,
        readOnly: true,
    },
};
export const WithHint: Story = {
    args: {
        label: 'Start After',
        input: <div>mm/dd/yy</div>,
        icons: <CalendarLineIcon />,
        hint: 'Please get this Hint',
    },
};
export const WithAsterisk: Story = {
    args: {
        label: 'Start After',
        input: <div>mm/dd/yy</div>,
        icons: <CalendarLineIcon />,
        withAsterisk: true,
    },
};
