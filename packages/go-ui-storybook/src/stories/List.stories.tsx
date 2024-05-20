import {
    ListKey,
    ListProps,
} from '@ifrc-go/ui';
import { useArgs } from '@storybook/preview-api';
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
    { key: '1', label: 'Green' },
    { key: '2', label: 'Yellow' },
    { key: '3', label: 'Blue' },
    { key: '4', label: 'White' },
    { key: '5', label: 'Black' },
];
type RendererProps = {
    children: React.ReactNode
};

type ListSpecificProps = ListProps<Option, ListKey, RendererProps>;

type Story = StoryObj<ListSpecificProps>;

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
    decorators: [
        function Component(_, ctx) {
            const componentArgs = ctx.args as ListSpecificProps;
            const [args] = useArgs();
            const { data } = args;
            return (
                <List
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...componentArgs}
                    data={data}
                />
            );
        },
    ],

};

export default meta;

function Option({ children }: RendererProps) {
    return (
        <div>
            { children }
        </div>
    );
}

const keySelector = (datum: Option) => datum.key;

const rendererParams = (_key: string, option: Option) => ({ children: option.label });

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
        keySelector,
        renderer: Option,
        rendererParams,
        pending: true,
    },
};

export const Errored: Story = {
    args: {
        keySelector,
        renderer: Option,
        rendererParams,
        errored: true,
        errorMessage: 'Failed to fetch data!',
    },
};

export const Filtered: Story = {
    args: {
        keySelector,
        renderer: Option,
        rendererParams,
        filtered: true,
    },
};
