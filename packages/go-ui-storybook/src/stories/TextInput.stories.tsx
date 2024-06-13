import { TargetedPopulationIcon } from '@ifrc-go/icons';
import { TextInputProps } from '@ifrc-go/ui';
import type {
    Meta,
    StoryObj,
} from '@storybook/react';

import TextInput from './TextInput';

type TextInputSpecificProps = TextInputProps<string>;

type Story = StoryObj<TextInputSpecificProps>;

const meta: Meta<typeof TextInput> = {
    title: 'Components/TextInput',
    component: TextInput,
    parameters: {
        layout: 'centered',
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/k9SOqgh5jk9PxzuBKdMKsA/IFRC-GO---UI-Library?node-id=11261-189019&t=rxFDpy4yPC2JaFiF-4',
        },
    },
    tags: ['autodocs'],
};

export default meta;

export const Default: Story = {
    args: {
        label: 'Total affected population',

    },
};
export const WithIcon: Story = {
    args: {
        label: 'Total affected population',
        value: 'affected population',
        icons: <TargetedPopulationIcon />,

    },
};

export const ReadOnly: Story = {
    args: {
        label: 'Total affected population',
        value: 'affected population',
        readOnly: true,

    },
};

export const WithHint: Story = {
    args: {
        label: 'Total affected population',
        value: 'affected population',
        hint: 'People Affected include all those whose lives and livelihoods have been impacted as a direct result of the shock or stress.',

    },
};

export const WithAsterisk: Story = {
    args: {
        label: 'Total affected population',
        value: 'affected population',
        withAsterisk: true,

    },
};
export const WithError: Story = {
    args: {
        label: 'Total affected population',
        value: 'affected population',
        error: 'Invalid input. Please enter a number.',
    },
};

export const ErrorOnTooltip: Story = {
    args: {
        label: 'Total affected population',
        value: 'affected population',
        errorOnTooltip: true,
    },
};

export const Variant: Story = {
    args: {
        label: 'Total affected population',
        value: 'affected population',
        variant: 'general',
    },
};
