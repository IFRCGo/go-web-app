import { StackedProgressBarProps } from '@ifrc-go/ui';
import type {
    Meta,
    StoryObj,
} from '@storybook/react';

import StackedProgressBar from './StackedProgressBar';

type StackedProgressBarSpecificProps = StackedProgressBarProps<number>;

type Story = StoryObj<StackedProgressBarSpecificProps>;

const meta: Meta<typeof StackedProgressBar> = {
    title: 'Components/StackedProgressBar',
    component: StackedProgressBar,
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
            const componentArgs = ctx.args as StackedProgressBarSpecificProps;
            return (
                <StackedProgressBar
                // eslint-disable-next-line react/jsx-props-no-spreading
                    {...componentArgs}
                />
            );
        },
    ],
};

export default meta;

const valueSelector = (value: number) => value;
const labelSelector = (value: number) => `Label ${value}`;
const colorSelector = () => 'red';

export const Default: Story = {
    args: {
        data: [10, 20, 40],
        valueSelector,
        labelSelector,
        colorSelector,
    },
};
