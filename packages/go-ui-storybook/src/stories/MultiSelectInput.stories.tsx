import {
    MultiSelectInputProps,
    OptionKey,
} from '@ifrc-go/ui';
import { useArgs } from '@storybook/preview-api';
import type {
    Args,
    Meta,
    StoryObj,
} from '@storybook/react';
import { fn } from '@storybook/test';

import MultiSelectInput from './MultiSelectInput';

interface Option {
    key: string;
    label: string;
}

const options: Option[] = [
    {
        key: '1',
        label: 'DREF',
    },
    {
        key: '2',
        label: 'Emergency Appeal',
    },
    {
        key: '3',
        label: 'International Appeal',
    },
    {
        key: '4',
        label: 'Forecast Based Action',
    },
];

const keySelector = (d: Option) => d.key;
const labelSelector = (d: Option) => d.label;

// eslint-disable-next-line max-len
type MultiSelectInputSpecificProps = MultiSelectInputProps<OptionKey, string[], Option, object, never>; // Change the type of `value` to `string[]`
type Story = StoryObj<MultiSelectInputSpecificProps>;

const meta: Meta<typeof MultiSelectInput> = {
    title: 'Components/MultiSelectInput',
    component: MultiSelectInput,
    parameters: {
        layout: 'centered',
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/k9SOqgh5jk9PxzuBKdMKsA/IFRC-GO---UI-Library?node-id=14405-176079&t=pARdc5n4ifPxahdr-4',
            allowFullscreen: true,
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
        {
            value,
            onChange,
        },
        updateArgs,
    ] = useArgs();

    const setValue = (val: string[], name: string) => {
        onChange(val, name);
        updateArgs({ value: val });
    };

    return (
        <MultiSelectInput
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...args}
            name="multiselect"
            placeholder="Select an emergency type"
            value={value}
            options={options}
            onChange={setValue}
            keySelector={keySelector}
            labelSelector={labelSelector}
        />
    );
}

export const Default: Story = {
    render: Template,
};

export const Disabled: Story = {
    render: Template,
    args: {
        disabled: true,
        value: ['1', '3'],
    },
};

export const ReadOnly: Story = {
    render: Template,
    args: {
        value: ['1', '2'],
        readOnly: true,
    },
};

export const WithSelectAll: Story = {
    render: Template,
    args: {
        withSelectAll: true,
    },
};
