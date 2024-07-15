import { RawFileInputProps } from '@ifrc-go/ui';
import type {
    Meta,
    StoryObj,
} from '@storybook/react';
import { fn } from '@storybook/test';

import RawFileInput from './RawFileInput';

type RawFileInputSpecificProps = RawFileInputProps<string>;

type Story = StoryObj<RawFileInputSpecificProps>;

const meta: Meta<typeof RawFileInput> = {
    title: 'Components/RawFileInput',
    component: RawFileInput,
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
        name: 'RawFileInput',
        children: 'Upload File',
        multiple: false,
        onChange: fn(),
    },
};

export const Multiple: Story = {
    args: {
        name: 'RawFileInput',
        children: 'Upload Files',
        variant: 'secondary',
        multiple: true,
        onChange: fn(),
    },
};

export const WithAccept: Story = {
    args: {
        name: 'RawFileInput',
        accept: 'image/png,image/jpeg',
        children: 'Upload Image',
        multiple: false,
        onChange: fn(),
    },
};

export const Disabled: Story = {
    args: {
        name: 'RawFileInput',
        children: 'Export',
        multiple: false,
        onChange: fn(),
        disabled: true,
    },
};

export const ReadOnly: Story = {
    args: {
        name: 'RawFileInput',
        children: 'Export',
        readOnly: true,
        multiple: false,
        onChange: fn(),
    },
};
