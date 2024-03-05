import {
    OptionKey,
    SearchSelectInputProps,
} from '@ifrc-go/ui';
import { useArgs } from '@storybook/preview-api';
import type {
    Meta,
    StoryObj,
} from '@storybook/react';
import { isDefined } from '@togglecorp/fujs';

import SearchSelectInput from './ SearchSelectInput';

interface Option {
    key: string;
    label:string;
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

type SearchSelectInputSpecificProps =
SearchSelectInputProps<OptionKey, string, Option, object, never>;
type Story = StoryObj<SearchSelectInputSpecificProps>;

const meta: Meta<typeof SearchSelectInput> = {
    title: 'Components/SearchSelectInput',
    component: SearchSelectInput,
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
                setArgs,
            ] = useArgs<{ value: OptionKey | null | undefined}>();

            // NOTE: We are casting args as props because of discriminated union
            // used in SearchSelectInputProps
            const componentArgs = ctx.args as SearchSelectInputSpecificProps;
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
                <SearchSelectInput
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...componentArgs}
                    keySelector={keySelector}
                    labelSelector={labelSelector}
                    onChange={onChange}
                    value={value}
                    name="SearchSelectInput"
                />
            );
        },
    ],
};

export default meta;

export const Default: Story = {
    args: {
        keySelector,
        labelSelector,
    },
};

export const WithPlaceholder: Story = {
    args: {
        options,
        placeholder: 'Search',
        keySelector,
        labelSelector,
    },
};
export const Disabled: Story = {
    args: {
        options,
        keySelector,
        labelSelector,
        disabled: true,
    },
};

export const Error: Story = {
    args: {
        options,
        keySelector,
        labelSelector,
        error: 'This is an error',
    },
};
export const ReadOnly: Story = {
    args: {
        options,
        keySelector,
        labelSelector,
        readOnly: true,
    },
};
