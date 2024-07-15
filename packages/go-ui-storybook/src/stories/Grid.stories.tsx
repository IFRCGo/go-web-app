import { GridProps } from '@ifrc-go/ui';
import type {
    Meta,
    StoryObj,
} from '@storybook/react';

import Grid from './Grid';

interface Option {
    key: string;
    label: string;
}

const options: Option[] = [
    { key: '1', label: 'Cat' },
    { key: '2', label: 'Dog' },
    { key: '3', label: 'Elephant' },
    { key: '4', label: 'Giraffe' },
    { key: '5', label: 'Lion' },
];

type RendererProps = {
    label: string;
};

type GridSpecificProps = GridProps<Option, string, RendererProps>;
type Story = StoryObj<GridSpecificProps>;

const meta: Meta<typeof Grid> = {
    title: 'Components/Grid',
    component: Grid,
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
        <div className="grid-item">
            {label}
        </div>
    );
}

const keySelector = (datum: Option) => datum.key;

const rendererParams = (_key: string, option: Option) => ({ label: option.label });

export const Default: Story = {
    args: {
        className: 'grid-story',
        data: options,
        keySelector,
        renderer: Option,
        rendererParams,
    },
};

export const WithPreferredColumns: Story = {
    args: {
        ...Default.args,
        numPreferredColumns: 2,
    },
};
