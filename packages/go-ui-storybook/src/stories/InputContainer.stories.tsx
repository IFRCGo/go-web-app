import { CalendarLineIcon } from '@ifrc-go/icons';
import type {
    Meta,
    StoryObj,
} from '@storybook/react';

import InputContainer, { InputContainerProps } from './InputContainer';

type Story = StoryObj<InputContainerProps>;

const meta: Meta<InputContainerProps> = {
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
    argTypes: {
        spacing: {
            options: ['none', 'condensed', 'compact', 'cozy', 'default', 'comfortable', 'relaxed', 'loose'],
            control: { type: 'select' },
        },
    },
    args: {},
    tags: ['autodocs'],
};

export default meta;

export const Default: Story = {
    args: {
        label: 'Select a date',
        input: <div>mm/dd/yy</div>,
        actions: <CalendarLineIcon />,
        icons: undefined,
        disabled: false,
        error: undefined,
        actionsContainerClassName: '',
        errorContainerClassName: '',
        hintContainerClassName: '',
        iconsContainerClassName: '',
        errorOnTooltip: false,
        hint: '',
        inputSectionClassName: '',
        labelClassName: '',
        readOnly: false,
        required: false,
        variant: 'form',
        withAsterisk: false,
        className: '',
        containerRef: undefined,
        inputSectionRef: undefined,
    },
};

export const Disabled: Story = {
    args: {
        ...Default.args,
        disabled: true,
    },
};

export const WithError: Story = {
    args: {
        ...Default.args,
        error: <p>Invalid Date</p>,
    },
};

export const ReadOnly: Story = {
    args: {
        ...Default.args,
        readOnly: true,
    },
};

export const WithHint: Story = {
    args: {
        ...Default.args,
        hint: 'Enter a date in the format mm/dd/yy that the event should start after.',
    },
};

export const WithAsterisk: Story = {
    args: {
        ...Default.args,
        withAsterisk: true,
    },
};

export const ErrorOnTooltip: Story = {
    args: {
        ...Default.args,
        errorOnTooltip: true,
    },
};

export const Variant: Story = {
    args: {
        ...Default.args,
        variant: 'form',
    },
};

export const Required: Story = {
    args: {
        ...Default.args,
        required: true,
    },
};

export const WithIcon: Story = {
    args: {
        ...Default.args,
        icons: <CalendarLineIcon />,
    },
};
