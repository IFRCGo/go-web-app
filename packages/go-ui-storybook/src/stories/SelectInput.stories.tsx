import {
    OptionKey,
    SelectInputProps,
} from '@ifrc-go/ui';
import { useArgs } from '@storybook/preview-api';
import type {
    Meta,
    StoryObj,
} from '@storybook/react';
import { fn } from '@storybook/test';
import { isDefined } from '@togglecorp/fujs';

import SelectInput from './SelectInput';

interface Option {
    key: string;
    label: string;
}

const options: Option[] = [
    {
        key: '1',
        label: 'Apple',
    },
    {
        key: '2',
        label: 'Banana',
    },
    {
        key: '3',
        label: 'Grapes',
    },
    {
        key: '4',
        label: 'Avocado',
    },
    {
        key: '5',
        label: 'Pear',
    },
];

const keySelector = (d: Option) => d.key;
const labelSelector = (d: Option) => d.label;

type SelectInputSpecificProps = SelectInputProps<OptionKey, string, Option, object, never>;
type Story = StoryObj<SelectInputSpecificProps>;

const meta: Meta<typeof SelectInput> = {
    title: 'Components/SelectInput',
    component: SelectInput,
    parameters: {
        layout: 'centered',
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/k9SOqgh5jk9PxzuBKdMKsA/IFRC-GO---UI-Library?node-id=14405-190010&t=pARdc5n4ifPxahdr-4',
            allowFullscreen: true,
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
            ] = useArgs<{ value: OptionKey | null | undefined}>();

            // NOTE: We are casting args as props because of discriminated union
            // used in SelectInputProps
            const componentArgs = ctx.args as SelectInputSpecificProps;
            const onChange = (
                newValue: OptionKey | undefined,
                name: string,
                val: Option | undefined,
            ) => {
                setArgs({ value: newValue });
                if (componentArgs.nonClearable && isDefined(newValue) && isDefined(val)) {
                    componentArgs.onChange(newValue, name, val);
                } else if (isDefined(newValue) && isDefined(val)) {
                    componentArgs.onChange(newValue, name, val);
                }
            };
            return (
                <SelectInput
                // eslint-disable-next-line react/jsx-props-no-spreading
                    {...componentArgs}
                    keySelector={keySelector}
                    labelSelector={labelSelector}
                    name="select"
                    onChange={onChange}
                    value={value}
                />
            );
        },
    ],
};

export default meta;

export const Default: Story = {
    args: {
        options,
        value: '1',
        keySelector,
        labelSelector,
    },
};

export const Disabled: Story = {
    args: {
        options,
        value: '1',
        keySelector,
        labelSelector,
        disabled: true,
    },
};

export const NoValue: Story = {
    args: {
        name: 'no-value',
        options,
        value: undefined,
        keySelector,
        labelSelector,
    },
};

export const ReadOnly: Story = {
    args: {
        options,
        value: '1',
        keySelector,
        labelSelector,
        readOnly: true,
    },
};
