import { InlineViewProps } from '@ifrc-go/ui';
import type {
    Meta,
    StoryObj,
} from '@storybook/react';

import InlineView from './InlineView';

const meta: Meta<InlineViewProps> = {
    title: 'Views/InlineView',
    component: InlineView,
    parameters: { layout: 'centered' },
    decorators: [
        (Story) => (
            <div className="dash-border">
                <Story />
            </div>
        ),
    ],
};

export default meta;

type Story = StoryObj<InlineViewProps>;

export const Default: Story = {
    args: {
        wrapBreakpoint: 'none',
        spacing: 'sm',
        withPadding: true,
        before: <div className="layout-content">Before Content</div>,
        after: <div className="layout-content">After Content</div>,
        children: <div className="layout-content">Content</div>,
    },
};
