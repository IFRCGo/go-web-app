import { useState } from 'react';
import {
    OptionKey,
    SearchMultiSelectInputProps,
} from '@ifrc-go/ui';
import { useArgs } from '@storybook/preview-api';
import type {
    Meta,
    StoryObj,
} from '@storybook/react';

import SearchMultiSelectInput from './SearchMultiSelectInput';

interface Option {
    key: string;
    label:string;
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

type SearchMultiSelectInputSpecificProps =
SearchMultiSelectInputProps<OptionKey, string, Option, object, never>;
type Story = StoryObj<SearchMultiSelectInputSpecificProps>;

const meta: Meta<typeof SearchMultiSelectInput> = {
    title: 'Components/SearchMultiSelectInput',
    component: SearchMultiSelectInput,
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
            ] = useArgs<{ value:string[] | undefined}>();
            const componentArgs = ctx.args as SearchMultiSelectInputSpecificProps;
            const onChange = (e: string[]) => {
                updateArgs({ value: e });
            };

            return (
                <SearchMultiSelectInput
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...componentArgs}
                    options={options}
                    value={value}
                    onChange={onChange}
                    keySelector={keySelector}
                    labelSelector={labelSelector}
                    name="SearchMultiSelectInput"
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
        selectedOnTop: true,
        value: ['1', '2'],
    },
};

export const NoValue: Story = {
    args: {
        options,
        keySelector,
        labelSelector,
        value: undefined,
    },
};

export const Disabled : Story = {
    args: {
        options,
        keySelector,
        labelSelector,
        value: ['1', '2'],
        disabled: true,
    },
};

export const ReadOnly:Story = {
    args: {
        value: ['1', '2'],
        readOnly: true,
    },
};
export const HideOptionFilter: Story = {
    args: {
        options,
        keySelector,
        labelSelector,
        hideOptionFilter: () => true,
    },
};
