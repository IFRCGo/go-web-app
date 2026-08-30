import { ListViewProps } from '@ifrc-go/ui';
import type {
    Meta,
    StoryObj,
} from '@storybook/react';

import ListView from './ListView';

const meta: Meta<ListViewProps> = {
    title: 'Views/ListView',
    component: ListView,
    tags: ['autodocs'],
    decorators: [
        (Story) => (
            <div className="dash-border">
                <Story />
            </div>
        ),
    ],
};

export default meta;

type Story = StoryObj<ListViewProps>;

const SampleItems = (
    <>
        {Array.from({ length: 6 }, (_, i) => (
            <div
                key={i}
                className="layout-content"
            >
                {`Item ${i + 1}`}
            </div>
        ))}
    </>
);

export const InlineLayout: Story = {
    args: {
        layout: 'inline',
        withWrap: true,
        withSpaceBetweenContents: true,
        withCenteredContents: false,
        withPadding: true,
        children: SampleItems,
    },
};

export const BlockLayout: Story = {
    args: {
        layout: 'block',
        withCenteredContents: true,
        withPadding: true,
        children: SampleItems,
    },
};

export const GridLayout: Story = {
    args: {
        layout: 'grid',
        numPreferredGridColumns: 3,
        minGridColumnSize: '150px',
        gridContentClassName: '',
        withPadding: true,
        children: SampleItems,
    },
};

export const GridLayoutWithSidebar: Story = {
    args: {
        layout: 'grid',
        withSidebar: true,
        sidebarPosition: 'start',
        withPadding: true,
    },
    render: (args: ListViewProps) => {
        const children = args.sidebarPosition === 'end' ? (
            <>
                <ListView layout="block">
                    {SampleItems}
                </ListView>
                <div className="list-view-sidebar">
                    Sidebar
                </div>
            </>
        ) : (
            <>
                <div className="list-view-sidebar">
                    Sidebar
                </div>
                <ListView layout="block">
                    {SampleItems}
                </ListView>
            </>
        );

        return (
            // eslint-disable-next-line react/jsx-props-no-spreading
            <ListView {...args}>
                {children}
            </ListView>
        );
    },
};
