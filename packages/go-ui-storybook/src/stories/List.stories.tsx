import { ListProps } from '@ifrc-go/ui';
import type {
    Meta,
    StoryObj,
} from '@storybook/react';

import List from './List';

interface Option {
    key: string;
    label: string;
}

const options: Option[] = [
    { key: '1', label: 'Apple' },
    { key: '2', label: 'Banana' },
    { key: '3', label: 'Cherry' },
    { key: '4', label: 'Date' },
    { key: '5', label: 'Elderberry' },
];

interface RendererProps {
    label: string;
}
type Story = StoryObj<ListProps<Option, string, RendererProps>>;

const meta: Meta<typeof List> = {
    title: 'Components/List',
    component: List,
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

function Option({ label }: RendererProps) {
    return (
        <div>
            { label }
        </div>
    );
}

const keySelector = (datum: Option) => datum.key;
const rendererParams = (_key: string, option: Option) => ({ label: option.label });

export const Default: Story = {
    args: {
        data: options,
        keySelector,
        renderer: Option,
        rendererParams,
    },
};

export const Pending: Story = {
    args: {
        className: 'list-story',
        keySelector,
        renderer: Option,
        rendererParams,
        pending: true,
        compact: true,
        pendingMessage: 'We are populating the data...',
    },
};

export const Errored: Story = {
    args: {
        className: 'list-story',
        keySelector,
        renderer: Option,
        rendererParams,
        errored: true,
        errorMessage: 'Failed to fetch data!',
    },
};

export const Filtered: Story = {
    args: {
        className: 'list-story',
        keySelector,
        renderer: Option,
        rendererParams,
        filtered: true,
        filteredEmptyMessage: 'Data is not available for selected filters',
    },
};
