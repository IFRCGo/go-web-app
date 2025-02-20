import {
    useCallback,
    useState,
} from 'react';
import {
    OptionKey,
    SearchSelectInputProps,
} from '@ifrc-go/ui';
import { useArgs } from '@storybook/preview-api';
import type {
    Args,
    Meta,
    StoryObj,
} from '@storybook/react';
import { fn } from '@storybook/test';
import { isDefined } from '@togglecorp/fujs';

import SearchSelectInput from './SearchSelectInput';

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
        setArgs,
    ] = useArgs();
    const [filteredOptions, setFilteredOptions] = useState(options);

    const handleChange = useCallback((
        newValue: OptionKey | undefined,
        name: string,
        val: Option | undefined,
    ) => {
        onChange(newValue, name, val);
        setArgs({ value: newValue });
    }, [onChange, setArgs]);

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
        <SearchSelectInput
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...args}
            keySelector={keySelector}
            labelSelector={labelSelector}
            onChange={handleChange}
            value={value}
            name="search"
            options={options}
            onSearchValueChange={handleSearchValueChange}
            searchOptions={filteredOptions}
            selectedOnTop
        />
    );
}

export const Default: Story = {
    render: Template,
};

export const WithPlaceholder: Story = {
    render: Template,
    args: {
        placeholder: 'Select a fruit',
    },
};

export const Disabled: Story = {
    render: Template,
    args: {
        value: 1,
        disabled: true,
    },
};

export const ReadOnly: Story = {
    render: Template,
    args: {
        value: 2,
        readOnly: true,
    },
};
