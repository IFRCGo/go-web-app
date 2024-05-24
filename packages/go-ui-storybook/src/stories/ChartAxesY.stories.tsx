import { ChartAxisYProps } from '@ifrc-go/ui';
import type {
    Meta,
    StoryObj,
} from '@storybook/react';

import ChartAxisY from './ChartAxisY';

interface ticks{
    x:number,
    y:number,
    label:string,
}

type ChartAxesYSpecificProps = ChartAxisYProps;

type Story = StoryObj<ChartAxesYSpecificProps>;

const meta: Meta<typeof ChartAxisY> = {
    title: 'Components/ChartAxisY',
    component: ChartAxisY,
    parameters: {
        layout: 'centered',
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/myeW85ibN5p2SlnXcEpxFD/IFRC-GO---UI-Current---1?type=design&node-id=0-4957&mode=design&t=KwxbuoUQxqcLyZbG-0',
        },
    },
    tags: ['autodocs'],
};

export default meta;

const ticks: ticks[] = [
    { x: 0, y: 1, label: '1' },
    { x: 1, y: 2, label: '2' },
    { x: 2, y: 3, label: '3' },
];

export const Default: Story = {
    args: {
        ticks,
        chartMargin: {
            top: 10, right: 10, bottom: 33, left: 33,
        },
        chartBounds: {
            width: 50,
            height: 5,
        },
        chartInnerOffset: 2,
    },
};
