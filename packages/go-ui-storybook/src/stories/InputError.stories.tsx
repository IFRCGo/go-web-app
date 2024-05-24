import { InputErrorProps } from '@ifrc-go/ui';
import type {
    Meta,
    StoryObj,
} from '@storybook/react';

import InputError from './InputError';

type InputErrorSpecificProps = InputErrorProps;
type Story = StoryObj<InputErrorSpecificProps>;

const meta: Meta<typeof InputError> = {
    title: 'Components/InputError',
    component: InputError,
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
        children: 'This is an error',
    },
};
export const Disabled: Story = {
    args: {
        children: 'This is an error ',
        disabled: true,
    },
};
