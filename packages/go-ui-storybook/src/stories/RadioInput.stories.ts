import type {
    Meta,
    StoryObj,
} from '@storybook/react';

import RadioInput from './RadioInput';

const meta = {
    title: 'Components/RadioInput',
    component: RadioInput,
    parameters: {
        layout: 'centered',
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/myeW85ibN5p2SlnXcEpxFD/IFRC-GO---UI-Current---1?type=design&node-id=0-4957&mode=design&t=KwxbuoUQxqcLyZbG-0',
            allowFullscreen: true,
        },
    },
    tags: ['autodocs'],
} satisfies Meta<typeof RadioInput>;

export default meta;

type Story = StoryObj<typeof meta>;
interface Option {
    key: string;
    label: string;
}
const options: Option[] = [
    { key: 'option1', label: 'Option 1' },
    { key: 'option2', label: 'Option 2' },
];

const keySelector = (o: Option) => o.key;
const labelSelector = (o: Option) => o.label;

export const Default:Story = {
    args: {
        name: 'radio-input',
        options,
        value: 'option1',
        keySelector,
        labelSelector,
    },
};

export const Disabled: Story = {
    args: {
        name: 'radio-input',
        options,
        value: 'option2',
        keySelector,
        labelSelector,
        disabled: true,
    },
};

export const ReadOnly: Story = {
    args: {
        name: 'radio-input',
        value: 'option1',
        options,
        keySelector,
        labelSelector,
        readOnly: true,
    },
};
export const Error: Story = {
    args: {
        name: 'radio-input',
        value: 'option1',
        options,
        keySelector,
        labelSelector,
        error: 'This is an wrong',
    },
};
