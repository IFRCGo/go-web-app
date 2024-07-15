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
            name="textarea"
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...args}
            value={value}
            onChange={onChange}
        />
    );
}

export const Default: Story = {
    render: Template,
    args: {
        label: 'Feedback',
        value: 'I appreciate the quick response from your support team!',
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

export const Hint: Story = {
    args: {
        label: 'Feedback',
        hint: 'We value your input! Please share your feedback.',
    },
};

export const WithAsterisk: Story = {
    args: {
        label: 'Feedback',
        withAsterisk: true,
    },
};
