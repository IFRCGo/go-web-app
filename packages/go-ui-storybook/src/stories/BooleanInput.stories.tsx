import { BooleanInputProps } from '@ifrc-go/ui';
import { useArgs } from '@storybook/preview-api';
import type {
    Meta,
    StoryObj,
} from '@storybook/react';

import BooleanInput from './BooleanInput ';

// eslint-disable-next-line storybook/story-exports
type BooleanInputSpecificProps = BooleanInputProps<string>;

type Story = StoryObj<BooleanInputSpecificProps>;

const meta: Meta<typeof BooleanInput> = {
    title: 'Components/BooleanInput',
    component: BooleanInput,
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
                updateArgs,
            ] = useArgs();
            const componentArgs = ctx.args as BooleanInputSpecificProps;

            const onChange = (
                newValue: boolean | undefined,
            ) => {
                updateArgs({ value: newValue });
            };
            return (
                <BooleanInput
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...componentArgs}
                    value={value}
                    onChange={onChange}
                />
            );
        },
    ],
};

export default meta;

export const Default: Story = {
    args: {
        name: 'example',
        value: true,
        disabled: false,

    },
};

export const Disabled: Story = {
    args: {
        name: 'example',
        value: true,
        disabled: true,

    },
};
