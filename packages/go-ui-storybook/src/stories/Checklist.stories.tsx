import { ChecklistProps } from '@ifrc-go/ui';
import { useArgs } from '@storybook/preview-api';
import type {
    Args,
    Meta,
    StoryObj,
} from '@storybook/react';
import { fn } from '@storybook/test';

import Checklist from './Checklist';

type ListKey = string | number;

interface Option {
    key: string;
    label:string;
}

const options: Option[] = [
    { key: 'a', label: 'Not Started' },
    { key: 'b', label: 'Ongoing' },
    { key: 'c', label: 'Completed' },
    { key: 'd', label: 'Deferred' },
    { key: 'e', label: 'Waiting for Review' },
    { key: 'f', label: 'Approved' },
    { key: 'g', label: 'Rejected' },
];
const keySelector = (d: Option) => d.key;
const labelSelector = (d: Option) => d.label;

type ChecklistSpecificProps = ChecklistProps<ListKey, string, Option>;

type Story = StoryObj<ChecklistSpecificProps>;

const meta: Meta<typeof Checklist> = {
    title: 'Components/Checklist',
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
        { value, onChange },
        setArgs,
    ] = useArgs();

    const handleChange = (val: ListKey[], key: string) => {
        onChange(val, key);
        setArgs({ value: val });
    };

    return (
        <Checklist
            name="checklist"
            options={options}
            keySelector={keySelector}
            labelSelector={labelSelector}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...args}
            value={value}
            onChange={handleChange}
        />
    );
}

export const Default: Story = {
    render: Template,
    args: {
        name: 'checklist',
        options,
        keySelector,
        labelSelector,
    },
};

export const NoValue: Story = {
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
