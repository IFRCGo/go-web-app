import {
    ListKey,
    RawListProps,
} from '@ifrc-go/ui';
import { useArgs } from '@storybook/preview-api';
import type {
    Meta,
    StoryObj,
} from '@storybook/react';

import RawList from './RawList';

type RawListSpecificProps = RawListProps<Option, ListKey, RendererProps>;

type Story = StoryObj<RawListSpecificProps>;

interface Option {
    id: string;
    key: string;
}

const options: Option[] = [
    { id: '1', key: 'Nepal' },
    { id: '4', key: 'France' },
    { id: '2', key: 'India' },
    { id: '5', key: 'Spain' },
];

type RendererProps = {
    children: React.ReactNode
};
function Option({ children }: RendererProps) {
    return (
        <div>
            { children }
        </div>
    );
}

const keySelector = (d: Option) => d.key;
const rendererParams = (_key: string, datum: Option) => ({ children: datum.key });

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
    decorators: [
        function Component(_, ctx) {
            const componentArgs = ctx.args as RawListSpecificProps;
            const [args] = useArgs();
            const { data } = args;
            return (
                <RawList
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...componentArgs}
                    data={data}
                    keySelector={keySelector}

                />
            );
        },
    ],
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

export const NoValue: Story = {
    args: {
        data: undefined,
        keySelector,
        renderer: Option,
        rendererParams,

    },
};
