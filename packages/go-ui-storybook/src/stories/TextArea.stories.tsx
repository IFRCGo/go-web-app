import { useArgs } from '@storybook/preview-api';
import type {
    Args,
    Meta,
    StoryObj,
} from '@storybook/react';
import { fn } from '@storybook/test';

import TextArea from './TextArea';

type Story = StoryObj<typeof meta>;

const meta: Meta<typeof TextArea> = {
    title: 'Components/TextArea',
    component: TextArea,
    parameters: {
        layout: 'centered',
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/k9SOqgh5jk9PxzuBKdMKsA/IFRC-GO---UI-Library?node-id=11261-189575&t=rxFDpy4yPC2JaFiF-4',
        },
    },
    args: {
        onChange: fn(),
    },
    tags: ['autodocs'],
};

export default meta;

function Template(args:Args) {
    const [
        { value },
        setArgs,
    ] = useArgs<{ value: string | undefined }>();
    const onChange = (val: string | undefined, name: string) => {
        setArgs({ value: val });
        // eslint-disable-next-line react/destructuring-assignment
        args.onChange(val, name);
    };

    return (
        <TextArea
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...args}
            name="Text"
            value={value}
            onChange={onChange}
        />
    );
}

export const Default: Story = {
    render: Template,
    args: {
        label: 'Feedback',
        value: 'Please enter your feedback here...',
    },
};
export const Disabled: Story = {
    args: {
        label: 'Feedback',
        value: 'Please enter your feedback here...',
        disabled: true,
    },
};
export const Error: Story = {
    args: {
        label: 'Feedback',
        value: 'Please enter your feedback here...',
        error: 'Feedback is required.',
    },
};
export const Hint: Story = {
    args: {
        label: 'Feedback',
        value: 'Please enter your feedback here...',
        hint: 'Your feedback helps us improve our product.',
    },
};
export const ReadOnly: Story = {
    args: {
        label: 'Feedback',
        value: 'Please enter your feedback here...',
        readOnly: true,
    },
};
export const WithAsterisk: Story = {
    args: {
        label: 'Feedback',
        value: 'Please enter your feedback here...',
        withAsterisk: true,
    },
};

export const ErrorOnTooltip: Story = {
    args: {
        label: 'Feedback',
        value: 'Please enter your feedback here...',
        error: 'Feedback is required.',
        errorOnTooltip: true,
    },
};
