import { DateInputProps } from '@ifrc-go/ui';
import { useArgs } from '@storybook/preview-api';
import type {
    Args,
    Meta,
    StoryObj,
} from '@storybook/react';
import { fn } from '@storybook/test';

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
            url: 'https://www.figma.com/file/k9SOqgh5jk9PxzuBKdMKsA/IFRC-GO---UI-Library?node-id=11261-189135&t=pARdc5n4ifPxahdr-4',
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
    ] = useArgs<{ value: string }>();
    const onChange = (val:string | undefined, name: string) => {
        setArgs({ value: val });
        // eslint-disable-next-line react/destructuring-assignment
        args.onChange(val, name);
    };

    return (
        <DateInput
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...args}
            name="dateinput"
            onChange={onChange}
            value={value}
            label="Date"
        />
    );
}

export const Default: Story = {
    render: Template,
    args: {
        name: 'dateinput',
        value: '2024-06-07',
        label: 'Date',
        disabled: false,
        readOnly: false,
        withAsterisk: false,
        required: true,
    },
};

export const Disabled: Story = {
    render: Template,
    args: {
        ...Default.args,
        disabled: true,
    },
};

export const ReadOnly: Story = {
    render: Template,
    args: {
        ...Default.args,
        readOnly: true,
    },
};

export const WithAsterisk: Story = {
    render: Template,
    args: {
        ...Default.args,
        withAsterisk: true,
    },
};
