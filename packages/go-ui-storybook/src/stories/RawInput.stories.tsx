import { RawInputProps } from '@ifrc-go/ui';
import { useArgs } from '@storybook/preview-api';
import type {
    Meta,
    StoryObj,
} from '@storybook/react';

import RawInput from './RawInput';

type RawInputSpecificProps = RawInputProps<string>;

type Story = StoryObj<RawInputSpecificProps>;

const meta: Meta<typeof RawInput> = {
    title: 'Components/RawInput',
    component: RawInput,
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
            const componentArgs = ctx.args as RawInputSpecificProps;
            const [{ value }, updateArgs] = useArgs();
            const onChange = (e: string | undefined) => {
                updateArgs({ value: e });
            };

            return (
                <RawInput
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...componentArgs}
                    value={value}
                    onChange={onChange}
                    name="RawInput"

                />
            );
        },
    ],
};

export default meta;

export const Default: Story = {
    args: {
        className: 'Raw-Input',
        value: 'Total Population',
    },
};

export const ReadOnly: Story = {
    args: {
        className: 'Raw-Input',
        value: 'Total Population',
        readOnly: true,
    },
};

export const WithPlaceholder: Story = {
    args: {
        className: 'Raw-Input',
        placeholder: 'Effected-population',
    },
};

export const Disabled: Story = {
    args: {
        className: 'Raw-Input',
        value: 'Total Population',
        disabled: true,
    },
};
