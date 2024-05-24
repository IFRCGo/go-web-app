import { useArgs } from '@storybook/preview-api';
import type {
    Meta,
    StoryObj,
} from '@storybook/react';
import { fn } from '@storybook/test';

import TextArea from './TextArea';

const meta: Meta<typeof TextArea> = {
    title: 'Components/TextArea',
    component: TextArea,
    parameters: {
        layout: 'centered',
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/myeW85ibN5p2SlnXcEpxFD/IFRC-GO---UI-Current---1?type=design&node-id=0-4957&mode=design&t=KwxbuoUQxqcLyZbG-0',
        },
    },
    args: {
        onChange: fn(),
    },
    decorators: [
        function Component(_, ctx) {
            const [
                { value },
                setArgs,
            ] = useArgs<{ value: string | undefined }>();
            const onChange = (val: string | undefined, name: string) => {
                setArgs({ value: val });
                ctx.args.onChange(val, name);
            };

            return (
                <TextArea
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...ctx.args}
                    onChange={onChange}
                    value={value}
                    name="TextArea"
                />
            );
        },
    ],
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        label: 'Text Area',
        value: 'This is text area',
    },
};
export const Disabled: Story = {
    args: {
        label: 'Text Area',
        value: 'This is text area',
        disabled: true,
    },
};
export const Error: Story = {
    args: {
        label: 'Text Area',
        value: 'This is text area',
        error: 'This is error',
    },
};
export const Hint: Story = {
    args: {
        label: 'Text Area',
        value: 'This is text area',
        hint: 'This is a hint',
    },
};
export const ReadOnly: Story = {
    args: {
        label: 'Text Area',
        value: 'This is text area',
        readOnly: true,
    },
};
export const WithAsterisk: Story = {
    args: {
        label: 'Text Area',
        value: 'This is text area',
        withAsterisk: true,
    },
};

export const ErrorOnTooltip: Story = {
    args: {
        label: 'Text Area',
        value: 'This is text area',
        error: 'This is an error message',
        errorOnTooltip: true,
    },
};
