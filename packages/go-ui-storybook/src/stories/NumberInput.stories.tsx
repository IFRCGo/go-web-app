import { NumberInputProps } from '@ifrc-go/ui';
import { useArgs } from '@storybook/preview-api';
import type {
    Meta,
    StoryObj,
} from '@storybook/react';

import NumberInput from './NumberInput';

type NumberInputSpecificProps = NumberInputProps<string>;

type Story = StoryObj<NumberInputSpecificProps>;

const meta: Meta<typeof NumberInput> = {
    title: 'Components/NumberInput',
    component: NumberInput,
    parameters: {
        layout: 'centered',
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/myeW85ibN5p2SlnXcEpxFD/IFRC-GO---UI-Current---1?type=design&node-id=0-4957&mode=design&t=KwxbuoUQxqcLyZbG-0',
        },
    },
    tags: ['autodocs'],
    decorators: [
        function Component(_, ctx) {
            const [
                { value },
                setArgs,
            ] = useArgs<{ value: number | null | undefined }>();
            const onChange = (val:number| undefined, name: string) => {
                setArgs({ value: val });
                if (ctx.args && ctx.args.onChange) {
                    ctx.args.onChange(Number(val), name);
                }
            };

            return (
                <NumberInput
                // eslint-disable-next-line react/jsx-props-no-spreading
                    {...ctx.args}
                    onChange={onChange}
                    value={value}
                    name="NumberInput"
                />
            );
        },
    ],
};

export default meta;

export const Default: Story = {
    args: {
        label: 'Age',
        value: 1123,
    },
};

export const Disabled: Story = {
    args: {
        ...Default.args,
        disabled: true,
    },
};

export const ReadOnly: Story = {
    args: {
        ...Default.args,
        readOnly: true,
    },
};

export const WithAsterisk: Story = {
    args: {
        ...Default.args,
        withAsterisk: true,
    },
};

export const Hint: Story = {
    args: {
        ...Default.args,
        hint: 'This is hint',
    },
};

export const WithError: Story = {
    args: {
        ...Default.args,
        error: 'This is an error',
    },
};
export const WithPlaceholder: Story = {
    args: {
        label: 'Age',
        placeholder: 'Enter your age',
    },
};
