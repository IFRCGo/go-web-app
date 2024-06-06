import { LegendItemProps } from '@ifrc-go/ui';
import type {
    Meta,
    StoryObj,
} from '@storybook/react';

import LegendItem from './LegendItem';

type LegendItemSpecificProps = LegendItemProps;

type Story = StoryObj<LegendItemSpecificProps>;

const meta: Meta<typeof LegendItem> = {
    title: 'Components/LegendItem',
    component: LegendItem,
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
            const componentArgs = ctx.args as LegendItemSpecificProps;
            return (
                <LegendItem
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
        label: 'Early Action Protocol Activation',
        color: 'red',
    },
};

export const Color: Story = {
    args: {
        label: 'Multiple types',
        color: 'orange',
    },
};
