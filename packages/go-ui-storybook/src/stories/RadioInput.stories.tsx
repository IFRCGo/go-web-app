import { RadioInputProps } from '@ifrc-go/ui';
import { useArgs } from '@storybook/preview-api';
import type {
    Args,
    Meta,
    StoryObj,
} from '@storybook/react';
import { fn } from '@storybook/test';
import { isDefined } from '@togglecorp/fujs';

import RadioInput from './RadioInput';

interface Option {
    key: string;
    label: string;
}
const options: Option[] = [
    { key: 'red', label: ' Red' },
    { key: 'green', label: 'Green' },
    { key: 'yellow', label: 'Yellow' },
    { key: 'blue', label: 'blue' },
    { key: 'pink', label: 'pink' },
];

const keySelector = (o: Option) => o.key;
const labelSelector = (o: Option) => o.label;

type RadioInputSpecificProps = RadioInputProps<string, Option, string, never, never>;
type Story = StoryObj<RadioInputSpecificProps>;

const meta: Meta<typeof RadioInput> = {
    title: 'Components/RadioInput',
    component: RadioInput,
    parameters: {
        layout: 'centered',
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/k9SOqgh5jk9PxzuBKdMKsA/IFRC-GO---UI-Library?node-id=14405-190089&t=pARdc5n4ifPxahdr-4',
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

    // NOTE: We are casting args as props because of discriminated union
    // used in RadioInputProps
    const handleChange = (val: string | undefined, name: string) => {
        setArgs({ value: val });
        // eslint-disable-next-line react/destructuring-assignment
        if (args.clearable) {
            onChange(val, name);
        } else if (isDefined(val)) {
            onChange(val, name);
        }
    };
    return (
        <RadioInput
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...args}
            name="RadioInput"
            options={options}
            keySelector={keySelector}
            labelSelector={labelSelector}
            value={value}
            onChange={handleChange}
        />
    );
}

export const Default:Story = {
    render: Template,
    args: {
        value: 'red',
        hint: 'Please select a color from the options.',
    },
};

export const Disabled: Story = {
    render: Template,
    args: {
        value: 'red',
        disabled: true,
    },
};

export const ReadOnly: Story = {
    render: Template,
    args: {
        value: 'green',
        readOnly: true,
    },
};

export const Clearable: Story = {
    render: Template,
    args: {
        value: 'green',
        clearable: true,
    },
};
