import { ChartAxisXProps } from '@ifrc-go/ui';
import type {
    Meta,
    StoryObj,
} from '@storybook/react';

import ChartAxisX from './ChartAxisX';

interface ticks{
    x:number,
    label:string,
}

type ChartAxesXSpecificProps = ChartAxisXProps;

type Story = StoryObj<ChartAxesXSpecificProps>;

const meta: Meta<typeof ChartAxisX> = {
    title: 'Components/ChartAxisX',
    component: ChartAxisX,
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
    { x: 1, label: '1' },
    { x: 2, label: '2' },
    { x: 3, label: '3' },
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
