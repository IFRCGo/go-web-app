import { SpinnerProps } from '@ifrc-go/ui';
import type {
    Meta,
    StoryObj,
} from '@storybook/react';

import Spinner from './Spinner';

type SpinnerSpecificProps = SpinnerProps;

type Story = StoryObj<SpinnerSpecificProps>;

const meta: Meta<typeof Spinner> = {
    title: 'Components/Spinner',
    component: Spinner,
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
        className: 'spinner',
    },
};
