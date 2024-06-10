import { SegmentInputProps } from '@ifrc-go/ui';
import { useArgs } from '@storybook/preview-api';
import type {
    Args,
    Meta,
    StoryObj,
} from '@storybook/react';
import { fn } from '@storybook/test';

import SegmentInput from './SegmentInput';

interface Option {
    key: string;
    label: string;
}
const options: Option[] = [
    { key: '1', label: 'Global summary' },
    { key: '2', label: 'Global performance' },
    { key: '3', label: 'Opertional learning' },
    { key: '4', label: 'Catalogue of Resources' },
];

const keySelector = (o: Option) => o.key;
const labelSelector = (o: Option) => o.label;

type SegmentInputSpecificProps = SegmentInputProps<string, Option, string, never>;
type Story = StoryObj<SegmentInputSpecificProps>;

const meta: Meta<typeof SegmentInput> = {
    title: 'Components/SegmentInput',
    component: SegmentInput,
    parameters: {
        layout: 'centered',
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/myeW85ibN5p2SlnXcEpxFD/IFRC-GO---UI-Current---1?type=design&node-id=0-4957&mode=design&t=KwxbuoUQxqcLyZbG-0',
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
    // used in SegmentInput
    const onChange = (val: string, name: string) => {
        setArgs({ value: val });
        // eslint-disable-next-line react/destructuring-assignment
        args.onChange(val, name);
    };

    return (
        <SegmentInput
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...args}
            name="segementinput"
            value={value}
            options={options}
            onChange={onChange}
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
        value: '1',
        disabled: true,
    },
};

export const Readonly: Story = {
    render: Template,
    args: {
        value: '2',
        readOnly: true,
    },
};

export const Error: Story = {
    render: Template,
    args: {
        error: 'Please select. This field is required.',
    },
};
