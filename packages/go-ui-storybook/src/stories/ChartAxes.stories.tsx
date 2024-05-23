import { ChartAxesProps } from '@ifrc-go/ui';
import { useArgs } from '@storybook/preview-api';
import type {
    Meta,
    StoryObj,
} from '@storybook/react';

import ChartAxes from './ChartAxes';

type ChartAxesSpecificProps = ChartAxesProps;

type Story = StoryObj<ChartAxesSpecificProps>;

const meta: Meta<typeof ChartAxes> = {
    title: 'Components/ChartAxes',
    component: ChartAxes,
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
            const componentArgs = ctx.args as ChartAxesSpecificProps;
            const [
                ,
                updateArgs,
            ] = useArgs();

            const onClick = (
                newValue: boolean | undefined,
            ) => {
                updateArgs({ value: newValue });
            };
            return (
                <ChartAxes
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...componentArgs}
                    onClick={onClick}

                />
            );
        },
    ],
};

export default meta;

export const Default: Story = {
    args: {
        chartData: {
            xAxisTicks: [{ key: '1', x: 1, label: 'Label 1' }],
            yAxisTicks: [{ y: 1, label: 'Label 1' }],
            dataAreaSize: { width: 50, height: 51 },
            chartMargin: {
                top: 5, right: 10, bottom: 5, left: 10,
            },
            chartSize: { width: 500, height: 500 },
            xAxisHeight: 50,
            yAxisWidth: 50,
        },
        onclick,
        yAxisLabel: 'Y Axis Label',
    },
};

export const TooltipSelector: Story = {
    args: {
        chartData: {
            xAxisTicks: [{ key: '1', x: 1, label: 'Label 1' }],
            yAxisTicks: [{ y: 1, label: 'Label 1' }],
            dataAreaSize: { width: 50, height: 51 },
            chartMargin: {
                top: 5, right: 10, bottom: 5, left: 10,
            },
            chartSize: { width: 500, height: 500 },
            xAxisHeight: 50,
            yAxisWidth: 60,
        },
        onclick,
        yAxisLabel: 'Y Axis Label',
        TooltipSelector: 1,
    },
};
