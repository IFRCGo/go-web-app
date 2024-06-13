import {
    Checkbox,
    CheckboxProps,
} from '@ifrc-go/ui';
import { useArgs } from '@storybook/preview-api';
import type {
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
    decorators: [
        function Component(_, ctx) {
            const [
                { value },
                setArgs,
            ] = useArgs<{ value: boolean | null | undefined }>();
            const onChange = (val: boolean, name: string) => {
                setArgs({ value: val });
                ctx.args.onChange(val, name);
            };

            return (
                <Checkbox
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...ctx.args}
                    onChange={onChange}
                    value={value}
                    name="checkbox"
                />
            );
        },
    ],
};

export default meta;

export const Default: Story = {
    args: {
        label: 'Ready!',
        name: 'Checkbox',
    },
};

export const Checked: Story = {
    args: {
        label: 'Ready',
        name: 'checkbox',
        value: true,
    },
};
export const Unchecked: Story = {
    args: {
        label: 'Ready',
        name: 'checkbox',
        value: false,
    },
};
export const Disabled: Story = {
    args: {
        label: 'Can\'t check it',
        name: 'checkbox',
        value: true,
        disabled: true,
    },
};
export const Indeterminate: Story = {
    args: {
        label: 'Get set!',
        value: false,
        indeterminate: true,
    },
};

export const Readonly: Story = {
    args: {
        label: 'GO! GO! ',
        value: false,
        readOnly: true,
    },
};
