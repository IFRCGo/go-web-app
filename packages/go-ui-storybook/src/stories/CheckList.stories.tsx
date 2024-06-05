import {
    ChecklistProps,
    type ListKey,
} from '@ifrc-go/ui';
import { useArgs } from '@storybook/preview-api';
import type {
    Args,
    Meta,
    StoryObj,
} from '@storybook/react';
import { fn } from '@storybook/test';

import Checklist from './Checklist';

interface Option{
    key: string;
    label:string;
}

const options: Option[] = [
    { key: '1', label: 'TODO' },
    { key: '2', label: 'In Progress' },
    { key: '3', label: 'Done' },
];

const keySelector = (d: Option) => d.key;
const labelSelector = (d: Option) => d.label;

type ChecklistSpecificProps = ChecklistProps<ListKey, string, Option>;

type Story = StoryObj<ChecklistSpecificProps>;

const meta: Meta<typeof Checklist> = {
    title: 'Components/CheckList',
    component: Checklist,
    parameters: {
        layout: 'centered',
        design: {
            type: 'figma',
            url: ' https://www.figma.com/file/myeW85ibN5p2SlnXcEpxFD/IFRC-GO---UI-Current---1?type=design&node-id=0-4957&mode=design&t=KwxbuoUQxqcLyZbG-0',
            allowFullscreen: true,
        },
    },
    args: {
        onChange: fn(),
    },
    tags: ['autodocs'],
};

export default meta;

function Template(args:Args) {
    const [
        { value },
        setArgs,
    ] = useArgs<{ value: ListKey[] | null | undefined }>();
    const onChange = (val: ListKey[]) => {
        setArgs({ value: val });
    };

    return (
        <Checklist
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...args}
            name="Checklist"
            value={value}
            options={options}
            onChange={onChange}
            keySelector={keySelector}
            labelSelector={labelSelector}
        />
    );
}

export const Default: Story = {
    render: Template,
};

export const Novalue: Story = {
    render: Template,
    args: {
        value: undefined,
    },
};

export const Disabled: Story = {
    render: Template,
    args: {
        disabled: true,
    },
};

export const Readonly: Story = {
    render: Template,
    args: {
        readOnly: true,
    },
};

export const Error: Story = {
    render: Template,
    args: {
        error: 'Please select at least one option.',
    },
};
