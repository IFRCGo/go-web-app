import { RadioInputProps } from '@ifrc-go/ui';
import { useArgs } from '@storybook/preview-api';
import type {
    Meta,
    StoryObj,
} from '@storybook/react';
import { fn } from '@storybook/test';
import { isDefined } from '@togglecorp/fujs';

import RadioInput from './RadioInput';

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
    decorators: [
        function Component(_, ctx) {
            const [
                { value },
                setArgs,
            ] = useArgs<{ value: string | undefined }>();

            // NOTE: We are casting args as props because of discriminated union
            // used in RadionInputProps
            const componentArgs = ctx.args as RadioInputSpecificProps;
            const onChange = (val: string | undefined, name: string) => {
                setArgs({ value: val });
                if (componentArgs.clearable) {
                    componentArgs.onChange(val, name);
                } else if (isDefined(val)) {
                    componentArgs.onChange(val, name);
                }
            };

            return (
                <RadioInput
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...componentArgs}
                    onChange={onChange}
                    value={value}
                />
            );
        },
    ],
};

export default meta;

interface Option {
    key: string;
    label: string;
}
const options: Option[] = [
    { key: 'option1', label: 'Option 1' },
    { key: 'option2', label: 'Option 2' },
    { key: 'option3', label: 'Option 3' },
];

const keySelector = (o: Option) => o.key;
const labelSelector = (o: Option) => o.label;

export const Default:Story = {
    args: {
        name: 'radio-input',
        options,
        keySelector,
        labelSelector,
    },
};

export const Disabled: Story = {
    args: {
        name: 'radio-input',
        options,
        value: 'option2',
        keySelector,
        labelSelector,
        disabled: true,
    },
};

export const ReadOnly: Story = {
    args: {
        name: 'radio-input',
        value: 'option1',
        options,
        keySelector,
        labelSelector,
        readOnly: true,
    },
};
export const Error: Story = {
    args: {
        name: 'radio-input',
        value: 'option1',
        options,
        keySelector,
        labelSelector,
        error: <p>This is error</p>,
    },
};
