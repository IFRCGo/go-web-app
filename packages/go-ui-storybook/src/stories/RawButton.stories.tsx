import { RawButtonProps } from '@ifrc-go/ui';
import { useArgs } from '@storybook/preview-api';
import type {
    Meta,
    StoryObj,
} from '@storybook/react';

import RawButton from './RawButton';

type RawButtonSpecificProps = RawButtonProps<string>;

type Story = StoryObj<RawButtonSpecificProps>;

const meta: Meta<typeof RawButton> = {
    title: 'Components/RawButton',
    component: RawButton,
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
            const componentArgs = ctx.args as RawButtonSpecificProps;
            const [
                ,
                updateArgs,
            ] = useArgs();
            const onCliclk = (e: string) => {
                updateArgs({ value: e });
            };
            return (
                <RawButton
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...componentArgs}
                    onClick={onCliclk}
                    name="Raw-button"

                />
            );
        },
    ],
};

export default meta;

export const Default: Story = {
    args: {
        children: 'Test',
        name: 'Button',
    },
};

export const Disabled: Story = {
    args: {
        children: 'Test',
        name: 'Button',
        disabled: true,
    },
};
