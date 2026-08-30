import { InlineLayoutProps } from '@ifrc-go/ui';
import type {
    Meta,
    StoryObj,
} from '@storybook/react';

import InlineLayout from './InlineLayout';

const meta: Meta<InlineLayoutProps> = {
    title: 'Layouts/InlineLayout',
    component: InlineLayout,
    parameters: {
        layout: 'centered',
    },
    args: {
        before: <div className="layout-content">Before Content</div>,
        after: <div className="layout-content">After Content</div>,
        children: <div className="layout-content">Content</div>,
    },
    decorators: [
        (Story) => (
            <div className="dash-border">
                <Story />
            </div>
        ),
    ],
};

export default meta;

type Story = StoryObj<InlineLayoutProps>;

export const Default: Story = {
    args: {
        spacing: 'sm',
        withPadding: true,
    },
};
