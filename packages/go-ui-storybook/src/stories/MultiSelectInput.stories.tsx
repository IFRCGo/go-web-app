import {
    MultiSelectInputProps,
    OptionKey,
} from '@ifrc-go/ui';
import { useArgs } from '@storybook/preview-api';
import type {
    Meta,
    StoryObj,
} from '@storybook/react';

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
        label: 'Forecasst Based Action',
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
            url: 'https://www.figma.com/file/myeW85ibN5p2SlnXcEpxFD/IFRC-GO---UI-Current---1?type=design&node-id=0-4957&mode=design&t=KwxbuoUQxqcLyZbG-0',
            allowFullscreen: true,
        },
    },
    tags: ['autodocs'],
    decorators: [
        function Component(_, ctx) {
            const [
                { value },
                updateArgs,
            ] = useArgs<{ value: string[] | undefined }>();

            const componentArgs = ctx.args as MultiSelectInputSpecificProps;

            const setValue = (e: string[]) => {
                updateArgs({ value: e });
            };
            return (
                <MultiSelectInput
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...componentArgs}
                    options={options}
                    value={value}
                    onChange={setValue}
                    keySelector={keySelector}
                    labelSelector={labelSelector}
                    name=" MultiSelect"
                />
            );
        },
    ],
};

export default meta;

export const Default: Story = {
    args: {
        options,
        keySelector,
        labelSelector,
        value: ['1'],
        withSelectAll: true,
    },
};
export const NoValue: Story = {
    args: {
        options,
        keySelector,
        labelSelector,
        value: undefined,
        withSelectAll: true,
    },
};

export const Disabled: Story = {
    args: {
        options,
        keySelector,
        labelSelector,
        disabled: true,
        value: ['1', '3'],
        withSelectAll: true,
    },
};

export const ReadOnly: Story = {
    args: {
        options,
        keySelector,
        labelSelector,
        readOnly: true,
        withSelectAll: true,
    },
};
