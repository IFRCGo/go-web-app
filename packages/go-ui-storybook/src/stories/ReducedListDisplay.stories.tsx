import { ReducedListDisplayProps } from '@ifrc-go/ui';
import type {
    Meta,
    StoryObj,
} from '@storybook/react';

import ReducedListDisplay from './ReducedListDisplay';

interface Option {
    label: string;
}

const options: Option[] = [
    { label: 'Green' },
    { label: 'Yellow' },
    { label: 'Blue' },
    { label: 'White' },
    { label: 'Black' },
];

type RendererProps = {
    value: React.ReactNode
};

type ReducedListDisplaySpecificProps = ReducedListDisplayProps<Option, RendererProps>;

type Story = StoryObj<ReducedListDisplaySpecificProps>;

const meta: Meta<typeof ReducedListDisplay> = {
    title: 'Components/ReducedListDisplay',
    component: ReducedListDisplay,
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

function Option({ value }: RendererProps) {
    return (
        <div>
            { value }
        </div>
    );
}

const keySelector = (d: Option) => d.label;

const rendererParams = (option: Option) => ({ value: option.label });

export const Default: Story = {
    args: {
        title: 'Colors',
        list: options,
        keySelector,
        renderer: Option,
        rendererParams,
        separator: ' ',
    },
};

export const WithMaxItems: Story = {
    args: {
        ...Default.args,
        maxItems: 3,
    },
};

export const WithMinItems: Story = {
    args: {
        ...Default.args,
        minItems: 3,
    },
};
