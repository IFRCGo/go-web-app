import {
    ListKey,
    RawListProps,
} from '@ifrc-go/ui';
import type {
    Meta,
    StoryObj,
} from '@storybook/react';

import RawList from './RawList';

type RawListSpecificProps = RawListProps<Option, ListKey, RendererProps>;

type Story = StoryObj<RawListSpecificProps>;

interface Option {
    id: string;
    label: string;
}

const options: Option[] = [
    { id: '1', label: 'Nepal' },
    { id: '4', label: 'France' },
    { id: '2', label: 'India' },
    { id: '5', label: 'Spain' },
];

type RendererProps = {
    label: React.ReactNode
};

function Option({ label }: RendererProps) {
    return (
        <div>
            { label }
        </div>
    );
}

const keySelector = (d: Option) => d.label;
const rendererParams = (_: string, datum: Option) => ({ label: datum.label });

const meta: Meta<typeof RawList> = {
    title: 'Components/RawList',
    component: RawList,
    parameters: {
        layout: 'centered',
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/myeW85ibN5p2SlnXcEpxFD/IFRC-GO---UI-Current---1?type=design&node-id=0-4957&mode=design&t=KwxbuoUQxqcLyZbG-0',
            allowFullscreen: true,
        },
    },
    tags: ['autodocs'],
};

export default meta;

export const Default: Story = {
    args: {
        data: options,
        keySelector,
        renderer: Option,
        rendererParams,

    },
};
