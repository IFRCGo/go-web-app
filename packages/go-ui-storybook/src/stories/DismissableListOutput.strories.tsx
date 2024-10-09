import { DismissableListOutputProps } from '@ifrc-go/ui';
import type {
    Meta,
    StoryObj,
} from '@storybook/react';
import { fn } from '@storybook/test';

import DismissableListOutput from './DismissableListOutput';

type DismissableListOutputSpecificProps = DismissableListOutputProps<
string | number, string | number, string | number>;

type Story = StoryObj<typeof DismissableListOutput>;

const meta: Meta<DismissableListOutputSpecificProps> = {
    title: 'Components/DismissableListOutput',
    component: DismissableListOutput,
    parameters: {
        layout: 'centered',
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/k9SOqgh5jk9PxzuBKdMKsA/IFRC-GO---UI-Library?node-id=14757-182346&t=rxFDpy4yPC2JaFiF-4',
        },
    },
    args: {},
    tags: ['autodocs'],
};

export default meta;

const data = [
    { id: 1, label: '22 Extracts' },
    { id: 2, label: '12 Sources' },
    { id: 3, label: '5 Resources' },
];

const labelSelector = (value: unknown) => {
    const option = value as { label: string };
    return option.label;
};
const keySelector = (value: unknown) => {
    const option = value as { id: number };
    return option.id;
};

export const Default: Story = {
    args: {
        value: 1,
        name: 'Extracts',
        onDismiss: fn(),
        labelSelector,
        keySelector,
        options: data,
    },
};

export const NoValue: Story = {
    args: {
        ...Default.args,
        value: undefined,
    },
};
