import { useCallback } from 'react';
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
    { key: '1', label: 'Mount Everest' },
    { key: '2', label: 'Kanchenjunga' },
    { key: '3', label: 'Lhotse' },
    { key: '4', label: 'Makalu' },
];

const keySelector = (o: Option) => o.key;
const labelSelector = (o: Option) => o.label;

type SegmentInputSpecificProps = SegmentInputProps<string, Option, string, never>;
type Story = StoryObj<SegmentInputSpecificProps>;

const meta = {
    title: 'Components/SegmentInput',
    component: SegmentInput,
    parameters: {
        layout: 'centered',
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/k9SOqgh5jk9PxzuBKdMKsA/IFRC-GO---UI-Library?node-id=11699-191901&t=Ts3c39nyO8lGnuGx-4',
        },
    },
    args: {
        onChange: fn(),
    },
    tags: ['autodocs'],
} satisfies Meta<typeof SegmentInput>;

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
    // used in SegmentInput
    const handleChange = useCallback((val: string, name: string) => {
        setArgs({ value: val });

        onChange(val, name);
    }, [onChange, setArgs]);

    return (
        <SegmentInput
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...args}
            name="segementinput"
            value={value}
            options={options}
            onChange={handleChange}
            keySelector={keySelector}
            labelSelector={labelSelector}
        />
    );
}

export const Default = {
    render: Template,
    args: {
        value: '1',
        label: 'Select  a mountain',
        hint: 'Choose from famous mountains around the world.',
    },
} satisfies Story;

export const Disabled = {
    render: Template,
    args: {
        ...Default.args,
        disabled: true,
    },
} satisfies Story;

export const Readonly: Story = {
    args: {
        ...Default.args,
        value: '2',
        readOnly: true,
    },
} satisfies Story;

export const Required: Story = {
    render: Template,
    args: {
        ...Default.args,
        value: '3',
        required: true,
        withAsterisk: true,
    },
} satisfies Story;
