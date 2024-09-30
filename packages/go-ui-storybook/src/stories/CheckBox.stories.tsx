import {
    Checkbox,
    type CheckboxProps,
} from '@ifrc-go/ui';
import { useArgs } from '@storybook/preview-api';
import type {
    Args,
    Meta,
    StoryObj,
} from '@storybook/react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { fn } from '@storybook/test';

import CheckBox from './CheckBox';

type CheckboxSpecificProps = CheckboxProps<string>;

type Story = StoryObj<CheckboxSpecificProps>;

const meta: Meta<typeof CheckBox> = {
    title: 'Components/CheckBox',
    component: CheckBox,
    parameters: {
        layout: 'centered',
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/k9SOqgh5jk9PxzuBKdMKsA/IFRC-GO---UI-Library?node-id=14405-190072&t=pARdc5n4ifPxahdr-4',
        },
    },
    args: {
        onChange: fn(),
    },
    tags: ['autodocs'],
};

export default meta;

interface CheckboxArgs extends Args {
    value: boolean | null | undefined;
    onChange: (val: boolean, id: string) => void;
}

function Template(args: CheckboxArgs) {
    const [
        { value, onChange },
        setArgs,
    ] = useArgs<CheckboxArgs>();

    const handleChange = (val: boolean, name: string) => {
        setArgs({ value: val });
        onChange(val, name);
    };

    return (
        <Checkbox
            name="checkbox"
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...args}
            onChange={handleChange}
            value={value}
        />
    );
}
export const Default: Story = {
    render: Template,
    args: {
        label: ' I agree to the terms and conditions',
        name: 'Checkbox',
    },
};

export const Checked: Story = {
    args: {
        ...Default.args,
        value: true,
    },
};
export const Unchecked: Story = {
    args: {
        ...Default.args,
        value: false,
    },
};
export const Disabled: Story = {
    args: {
        ...Default.args,
        value: true,
        disabled: true,
    },
};
export const Indeterminate: Story = {
    args: {
        ...Default.args,
        value: false,
        indeterminate: true,
    },
};

export const Readonly: Story = {
    args: {
        ...Default.args,
        value: false,
        readOnly: true,
    },
};
