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
        { value },
        setArgs,
    ] = useArgs<{ value: string | undefined }>();

    // NOTE: We are casting args as props because of discriminated union
    // used in RadionInputProps

    const onChange = (val: string | undefined, name: string) => {
        setArgs({ value: val });
        // eslint-disable-next-line react/destructuring-assignment
        if (args.clearable) {
            // eslint-disable-next-line react/destructuring-assignment
            args.onChange(val, name);
        } else if (isDefined(val)) {
            // eslint-disable-next-line react/destructuring-assignment
            args.onChange(val, name);
        }
    };
    return (
        <RadioInput
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...args}
            name="RadioInput"
            value={value}
            options={options}
            onChange={onChange}
            keySelector={keySelector}
            labelSelector={labelSelector}
        />
    );
}

export const Default:Story = {
    render: Template,
};

export const Disabled: Story = {
    render: Template,
    args: {
        value: 'option2',
        disabled: true,
    },
};

export const ReadOnly: Story = {
    render: Template,
    args: {
        value: 'option1',
        readOnly: true,
    },
};
export const Error: Story = {
    render: Template,
    args: {
        error: 'Please select an option. This field is required.',
    },
};
