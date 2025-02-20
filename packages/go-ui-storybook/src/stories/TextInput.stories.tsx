import { TextInputProps } from '@ifrc-go/ui';
import { useArgs } from '@storybook/preview-api';
import type {
    Args,
    Meta,
    StoryObj,
} from '@storybook/react';
import { fn } from '@storybook/test';

import TextInput from './TextInput';

type TextInputSpecificProps = TextInputProps<string>;

type Story = StoryObj<TextInputSpecificProps>;

const meta: Meta<typeof TextInput> = {
    title: 'Components/TextInput',
    component: TextInput,
    parameters: {
        layout: 'centered',
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/k9SOqgh5jk9PxzuBKdMKsA/IFRC-GO---UI-Library?node-id=11261-189019&t=rxFDpy4yPC2JaFiF-4',
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
    ] = useArgs();

    const onChange = (val:string | undefined, name: string) => {
        setArgs({ value: val });
        // eslint-disable-next-line react/destructuring-assignment
        args.onChange(val, name);
    };

    return (
        <TextInput
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...args}
            name="textInput"
            onChange={onChange}
            value={value}
        />
    );
}

export const Default: Story = {
    render: Template,
    args: {
        label: 'Email Address',
    },
};

export const Disabled: Story = {
    args: {
        ...Default.args,
        value: 'ifrcgo@ifrc.org',
        disabled: true,

    },
};
export const ReadOnly: Story = {
    args: {
        ...Default.args,
        value: 'ifrcgo@ifrc.org',
        readOnly: true,

    },
};

export const WithHint: Story = {
    args: {
        ...Default.args,
        hint: 'Enter your email address.',

    },
};

export const WithAsterisk: Story = {
    args: {
        ...Default.args,
        withAsterisk: true,

    },
};

export const Variant: Story = {
    args: {
        ...Default.args,
        variant: 'general',
    },
};
