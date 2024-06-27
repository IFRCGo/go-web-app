import { useArgs } from '@storybook/preview-api';
import type {
    Args,
    Meta,
    StoryObj,
} from '@storybook/react';
import { fn } from '@storybook/test';

import BooleanInput from './BooleanInput';

type Story = StoryObj<typeof BooleanInput>;

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
    args: {
        onChange: fn(),
    },
    argTypes: {
        value: {
            control: {
                type: 'boolean',
            },
        },
    },
};

export default meta;

function Template(args: Args) {
    const [
        { value, onChange },
        updateArgs,
    ] = useArgs();

    const handleChange = (val: boolean | undefined, id: string) => {
        onChange(val, id);
        updateArgs({ value: val });
    };

    return (
        <BooleanInput
            name="booleanInput"
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...args}
            onChange={handleChange}
            value={value}
        />
    );
}

export const Default: Story = {
    render: Template,
    args: {
        name: 'booleanInput',
    },
};

export const Disabled: Story = {
    render: Template,
    args: {
        disabled: true,
    },
};
