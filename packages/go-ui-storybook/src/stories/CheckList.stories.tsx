import {
    ChecklistProps,
    type ListKey,
} from '@ifrc-go/ui';
import { useArgs } from '@storybook/preview-api';
import type {
    Meta,
    StoryObj,
} from '@storybook/react';
import { fn } from '@storybook/test';

import Checklist from './Checklist';

interface Option{
    key: string;
    label:string;
}
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
    decorators: [
        function Component(_, ctx) {
            const [
                { value },
                setArgs,
            ] = useArgs<{ value: ListKey[] | null | undefined }>();
            const onChange = (val: ListKey[], name: string) => {
                setArgs({ value: val });
                ctx.args.onChange(val, name);
            };

            return (
                <Checklist
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...ctx.args}
                    onChange={onChange}
                    value={value}
                    name="checklist"
                />
            );
        },
    ],
};

export default meta;

const options: Option[] = [
    { key: 'option1', label: 'Option 1' },
    { key: 'option2', label: 'Option 2' },
    { key: 'option3', label: 'option 3' },
];

const keySelector = (d: Option) => d.key;
const labelSelector = (d: Option) => d.label;

export const Default: Story = {
    args: {
        options,
        keySelector,
        labelSelector,
        value: [true],
    },
};

export const Novalue: Story = {
    args: {
        options,
        keySelector,
        labelSelector,
        value: undefined,
    },
};

export const Disabled: Story = {
    args: {
        options,
        keySelector,
        labelSelector,
        value: [true],
        disabled: true,
    },
};

export const Readonly: Story = {
    args: {
        options,
        keySelector,
        labelSelector,
        value: [true],
        readOnly: true,
    },
};

export const Error: Story = {
    args: {
        options,
        keySelector,
        labelSelector,
        value: [true],
        error: 'This is an error',
    },
};
