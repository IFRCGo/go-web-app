import { SwitchProps } from '@ifrc-go/ui';
import { useArgs } from '@storybook/preview-api';
import type {
    Meta,
    StoryObj,
} from '@storybook/react';
import { fn } from '@storybook/test';

import Switch from './Switch';

type SwitchSpecificProps = SwitchProps<string>;

type Story = StoryObj< SwitchSpecificProps>;

const meta: Meta<typeof Switch> = {
    title: 'Components/ Switch',
    component: Switch,
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
    decorators: [
        function Component(_, ctx) {
            const [
                { value },
                updateArgs,
            ] = useArgs();
            const componentArgs = ctx.args as SwitchSpecificProps;

            const onChange = (
                newValue: boolean | undefined,
            ) => {
                updateArgs({ value: newValue });
            };
            return (
                <Switch
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
        label: 'I agree to be awesome',
        value: false,
    },
};

export const Disabled: Story = {
    args: {
        label: 'I agree to be awesome',
        value: false,
        disabled: true,
    },
};

export const Checked: Story = {
    args: {
        label: 'I agree to be awesome',
        value: true,
    },
};
