import { useArgs } from '@storybook/preview-api';
import type {
    Meta,
    StoryObj,
} from '@storybook/react';
import { fn } from '@storybook/test';

import PasswordInput from './PasswordInput';

type Story = StoryObj<typeof PasswordInput>;

const meta: Meta<typeof PasswordInput> = {
    title: 'Components/PasswordInput',
    component: PasswordInput,
    parameters: {
        layout: 'centered',
        design: {
            type: 'figma',
            url: ' https://www.figma.com/file/myeW85ibN5p2SlnXcEpxFD/IFRC-GO---UI-Current---1?type=design&node-id=0-4957&mode=design&t=KwxbuoUQxqcLyZbG-0',
        },
    },
    args: {
        onChange: fn(),
    },
    tags: ['autodocs'],
    decorators: [
        function Component(_, ctx) {
            const [
                { value },
                setArgs,
            ] = useArgs<{ value: string }>();
            const onChange = (val:string | undefined, name: string) => {
                setArgs({ value: val });
                ctx.args.onChange(val, name);
            };

            return (
                <PasswordInput
                // eslint-disable-next-line react/jsx-props-no-spreading
                    {...ctx.args}
                    onChange={onChange}
                    value={value}
                    name="PasswordInput"
                />
            );
        },
    ],
};

export default meta;

export const Default: Story = {
    args: {
        label: 'Password',
    },
};
export const Disabled: Story = {
    args: {
        label: 'Password',
        value: 'password',
        disabled: true,
    },
};

export const ReadOnly: Story = {
    args: {
        label: 'Password',
        value: 'password',
        readOnly: true,
    },
};

export const WithPlaceholder: Story = {
    args: {
        label: 'Password',
        placeholder: 'Enter your password',
    },
};

export const WithError: Story = {
    args: {
        label: 'Password',
        error: <p>This field is required</p>,
    },
};
export const WithAsterisk: Story = {
    args: {
        label: 'Password',
        withAsterisk: true,
    },
};
