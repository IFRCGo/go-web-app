import { DateRangeDisplayProps } from '@ifrc-go/ui';
import type {
    Meta,
    StoryObj,
} from '@storybook/react';

import DateRangeDisplay from './DateRangeDisplay';

type Story = StoryObj<DateRangeDisplayProps>;

const meta: Meta<typeof DateRangeDisplay> = {
    title: 'Outputs/DateRangeDisplay',
    component: DateRangeDisplay,
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

export const Default: Story = {
    args: {
        startDate: '1992-12-27',
        endDate: '2012-10-12',
    },
};
