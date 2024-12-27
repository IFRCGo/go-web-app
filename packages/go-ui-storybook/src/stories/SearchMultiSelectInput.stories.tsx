import {
    useCallback,
    useState,
} from 'react';
import {
    OptionKey,
    SearchMultiSelectInputProps,
} from '@ifrc-go/ui';
import { useArgs } from '@storybook/preview-api';
import type {
    Args,
    Meta,
    StoryObj,
} from '@storybook/react';
import { fn } from '@storybook/test';
import { isDefined } from '@togglecorp/fujs';

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
        label: 'Forecast Based Action',
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

    const [filteredOptions, setFilteredOptions] = useState(options);

    const handleChange = useCallback((val: string[], name: string) => {
        onChange(val, name);
        updateArgs({ value: val });
    }, [onChange, updateArgs]);

    const handleSearchValueChange = useCallback((searchText: string | undefined) => {
        if (isDefined(searchText)) {
            const newOptions = options.filter(
                (v) => v.label.toLowerCase().includes(searchText.toLowerCase()),
            );
            setFilteredOptions(newOptions);
        } else {
            setFilteredOptions(options);
        }
    }, []);

    return (
        <SearchMultiSelectInput
            selectedOnTop={false}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...args}
            options={options}
            onSearchValueChange={handleSearchValueChange}
            searchOptions={filteredOptions}
            value={value}
            onChange={handleChange}
            keySelector={keySelector}
            labelSelector={labelSelector}
            placeholder="Select an emergency type"
            name="search"
        />
    );
}

export const Default: Story = {
    render: Template,
    args: {
        options,
        selectedOnTop: true,
    },
};

export const WithPlaceholder: Story = {
    render: Template,
    args: {
        placeholder: 'Select an appeal type',
    },
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
