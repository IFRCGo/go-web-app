import { TimeSeriesChartProps } from '@ifrc-go/ui';
import type {
    Meta,
    StoryObj,
} from '@storybook/react';

import TimeSeriesChart from './TimeSeriesChart ';

type TimeSeriesChartSpecificProps = TimeSeriesChartProps<string>;

type Story = StoryObj<TimeSeriesChartSpecificProps>;

const dataKeys = ['key1', 'key2'];
// eslint-disable-next-line max-len
const timePoints = Array.from({ length: 5 }).map((_, i) => new Date(new Date().getFullYear(), i, 1));
const valueSelector = () => Math.random() * 1;
const classNameSelector = (dataKey: string) => `class-${dataKey}`;
const xAxisFormatter = (date: Date) => date.getFullYear().toString();

const meta: Meta<typeof TimeSeriesChart> = {
    title: 'Components/TimeSeriesChart',
    component: TimeSeriesChart,
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
            const componentArgs = ctx.args as TimeSeriesChartSpecificProps;
            return (
                <TimeSeriesChart
                // eslint-disable-next-line react/jsx-props-no-spreading
                    {...componentArgs}
                    dataKeys={dataKeys}
                    timePoints={timePoints}
                    valueSelector={valueSelector}
                    classNameSelector={classNameSelector}
                    xAxisFormatter={xAxisFormatter}
                />
            );
        },
    ],
};

export default meta;

export const Default: Story = {
    args: {
        dataKeys,
        timePoints,
        valueSelector,
        classNameSelector,
        xAxisFormatter,
    },
};
export const WithActivePoint:Story = {
    args: {
        dataKeys,
        timePoints,
        valueSelector,
        classNameSelector,
        xAxisFormatter,
        activePointKey: 'key1',
    },
};
