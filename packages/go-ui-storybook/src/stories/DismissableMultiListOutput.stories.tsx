import { useState } from 'react';
import { DismissableMultiListOutputProps } from '@ifrc-go/ui';
import type {
    Meta,
    StoryObj,
} from '@storybook/react';

import DismissableMultiListOutput from './DismissableMultiListOutput';

type Option = {
    id: number;
    label: string;
};

const options = [
    { id: 1, label: '22 Sources' },
    { id: 2, label: '27 Extracts' },
];

type DismissableListOutputSpecificProps<O, V extends string | number, N
extends string | number> = DismissableMultiListOutputProps<O, V, N>;

type Story = StoryObj<typeof DismissableMultiListOutput>;

const labelSelector = (value: unknown) => {
    const option = value as Option;
    return option.label;
};

const keySelector = (value: unknown) => {
    const option = value as Option;
    return option.id;
};

const meta: Meta<DismissableListOutputSpecificProps<Option, number, string>> = {
    title: 'Components/DismissableMultiListOutput',
    component: DismissableMultiListOutput,
    parameters: {
        layout: 'centered',
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/k9SOqgh5jk9PxzuBKdMKsA/IFRC-GO---UI-Library?node-id=14757-182346&t=rxFDpy4yPC2JaFiF-4',
        },
    },
    args: {
    },
    tags: ['autodocs'],
};

export default meta;

function Template<O, V extends string | number, N extends string | number>(
    args: DismissableListOutputSpecificProps<O, V, N>,
) {
    const [value, setValue] = useState<V[] | undefined>([1, 2] as V[]);

    return (
        <DismissableMultiListOutput
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...args}
            value={value}
            onDismiss={(updatedValue: V[] | undefined) => {
                setValue(updatedValue);
            }}
        />
    );
}

export const Default: Story = {
    render: Template,
    args: {
        name: 'Extracts',
        value: [1, 2],
        onDismiss: () => {},
        labelSelector,
        keySelector,
        options,
    },
};

export const EmptyState: Story = {
    render: Template,
    args: {
        value: [1, 2],
        name: 'Empty',
        onDismiss: () => {},
        labelSelector,
        keySelector,
        options: [],
    },
};
