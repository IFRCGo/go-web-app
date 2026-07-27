import { FileInputButtonProps } from '@ifrc-go/ui';
import type {
    Meta,
    StoryObj,
} from '@storybook/react';
import { fn } from '@storybook/test';

import FileInputButton from './FileInputButton';

type FileInputButtonSpecificProps = FileInputButtonProps<string>;

type Story = StoryObj<FileInputButtonSpecificProps>;

const meta: Meta<typeof FileInputButton> = {
    title: 'Inputs/FileInputButton',
    component: FileInputButton,
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
        name: 'FileInputButton',
        children: 'Upload File',
        onChange: fn(),
    },
};

export const Multiple: Story = {
    args: {
        name: 'FileInputButton',
        children: 'Upload Files',
        multiple: true,
        styleVariant: 'outline',
        colorVariant: 'primary',
        onChange: fn(),
    },
};

export const WithAccept: Story = {
    args: {
        name: 'FileInputButton',
        accept: 'image/png,image/jpeg',
        children: 'Upload Image',
        onChange: fn(),
    },
};

export const Disabled: Story = {
    args: {
        name: 'FileInputButton',
        children: 'Export',
        onChange: fn(),
        disabled: true,
    },
};

export const ReadOnly: Story = {
    args: {
        name: 'FileInputButton',
        children: 'Export',
        readOnly: true,
        onChange: fn(),
    },
};
