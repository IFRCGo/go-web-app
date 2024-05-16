import { BooleanOutputProps } from '@ifrc-go/ui';
import type {
    Meta,
    StoryObj,
} from '@storybook/react';

import BooleanOutput from './BooleanOutput';

type BooleanOutputSpecificProps = BooleanOutputProps;

type Story = StoryObj<BooleanOutputSpecificProps>;

const meta: Meta<typeof BooleanOutput> = {
    title: 'Components/BooleanOutput',
    component: BooleanOutput,
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
            const componentArgs = ctx.args as BooleanOutputSpecificProps;
            return (
                <BooleanOutput
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...componentArgs}

                />
            );
        },
    ],
};

export default meta;

export const Default: Story = {
    args: {
        className: 'BooleanOutput',
        value: true,
    },
};

export const TrueValue : Story = {
    args: {
        className: 'BooleanOutput',
        value: true,
    },
};

export const FalseValue :Story = {
    args: {
        className: 'booleanOutput',
        value: false,
    },

};

export const InvalidText: Story = {
    args: {
        className: 'BooleanOutput',
        invalidText: 'Invalid value',
    },
};
