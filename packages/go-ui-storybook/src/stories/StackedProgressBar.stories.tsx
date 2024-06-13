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
            url: 'https://www.figma.com/file/k9SOqgh5jk9PxzuBKdMKsA/IFRC-GO---UI-Library?node-id=14450-215139&t=qmirLf8EtsAXR5l4-4',
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
