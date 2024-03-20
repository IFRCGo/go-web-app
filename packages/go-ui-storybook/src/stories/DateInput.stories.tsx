import { DateInputProps } from '@ifrc-go/ui';
import { useArgs } from '@storybook/preview-api';
import type {
    Meta,
    StoryObj,
} from '@storybook/react';

import DateInput from './DateInput';

type DateInputSpecificProps = DateInputProps<string>;

type Story = StoryObj<DateInputSpecificProps>;

const meta: Meta<typeof DateInput> = {
    title: 'Components/DateInput',
    component: DateInput,
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
            ] = useArgs<{ value: string }>();
            const onChange = (val:string | undefined, name: string) => {
                setArgs({ value: val });
                ctx.args.onChange(val, name);
            };

            return (
                <DateInput
                // eslint-disable-next-line react/jsx-props-no-spreading
                    {...ctx.args}
                    onChange={onChange}
                    value={value}
                    name="DateInput"
                />
            );
        },
    ],
};
export default meta;

export const Default: Story = {
    args: {
        label: 'Date',
    },
};
export const Disabled: Story = {
    args: {
        label: 'Date',
        disabled: true,
    },
};

export const ReadOnly: Story = {
    args: {
        label: 'Date',
        readOnly: true,
    },
};

export const WithAsterisk: Story = {
    args: {
        label: 'Date',
        withAsterisk: true,

    },
};

export const Error: Story = {
    args: {
        label: 'Date',
        error: 'The is wrong',

    },
};
