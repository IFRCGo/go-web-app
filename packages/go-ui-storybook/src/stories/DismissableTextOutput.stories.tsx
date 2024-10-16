import { DismissableTextOutputProps } from '@ifrc-go/ui';
import type {
    Meta,
    StoryObj,
} from '@storybook/react';

import DismissableTextOutput from './DismissableTextOutput';

type DismissableTextOutputSpecificProps = DismissableTextOutputProps<string>;

type Story = StoryObj<DismissableTextOutputSpecificProps>;

const meta: Meta<typeof DismissableTextOutput> = {
    title: 'Components/DismissableTextOutput',
    component: DismissableTextOutput,
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
        value: 'Extracts',
        name: 'extracts',
    },
};

export const Empty: Story = {
    args: {
        value: undefined,
        name: 'empty',
    },
};
