import { SegmentInputProps } from '@ifrc-go/ui';
import { useArgs } from '@storybook/preview-api';
import type {
    Meta,
    StoryObj,
} from '@storybook/react';

import SegmentInput from './SegmentInput';

interface Option {
    key: string;
    label: string;
}

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
    tags: ['autodocs'],
    decorators: [
        function Component(_, ctx) {
            const [
                { value },
                setArgs,
            ] = useArgs<{ value: string | undefined }>();
            // NOTE: We are casting args as props because of discriminated union
            // used in SegmentInput
            const componentArgs = ctx.args as SegmentInputSpecificProps;
            const onChange = (val: string, name: string) => {
                setArgs({ value: val });
                componentArgs.onChange(val, name);
            };

            return (
                <SegmentInput
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...componentArgs}
                    onChange={(val: string | undefined, name: string) => onChange(val || '', name)}
                    value={value}
                    name="SegementInput"
                />
            );
        },
    ],
};

export default meta;

const options: Option[] = [
    { key: 'option1', label: 'Option 1' },
    { key: 'option2', label: 'Option 2' },
    { key: 'option3', label: 'Option 3' },
    { key: 'option4', label: 'Option 4' },
    { key: 'option5', label: 'Option 5' },
    { key: 'option6', label: 'Option 6' },
];

const keySelector = (o: Option) => o.key;
const labelSelector = (o: Option) => o.label;

export const Default: Story = {
    args: {
        name: 'SegmentInput',
        options,
        keySelector,
        labelSelector,
    },
};
export const Disable: Story = {
    args: {
        name: 'SegmentInput',
        options,
        value: 'option1',
        keySelector,
        labelSelector,
        disabled: true,
    },
};
export const Readonly: Story = {
    args: {
        name: 'SegmentInput',
        value: 'option1',
        options,
        keySelector,
        labelSelector,
        readOnly: true,
    },
};
export const Error: Story = {
    args: {
        name: 'SegmentInput',
        options,
        value: 'option1',
        keySelector,
        labelSelector,
        error: 'This is an  error',
    },
};
