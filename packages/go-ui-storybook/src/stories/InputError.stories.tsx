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
            url: 'https://www.figma.com/file/k9SOqgh5jk9PxzuBKdMKsA/IFRC-GO---UI-Library?node-id=14535-221328&t=3m6inp5M0GbY81Vz-4',
        },
    },
    tags: ['autodocs'],
};

export default meta;
export const Default: Story = {
    args: {
        children: 'An error occurred. Please try again.',
    },
};

export const Disabled: Story = {
    args: {
        children: 'An error occurred. Please try again.',
        disabled: true,
    },
};
