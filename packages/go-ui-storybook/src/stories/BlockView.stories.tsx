import { BlockViewProps } from '@ifrc-go/ui';
import type {
    Meta,
    StoryObj,
} from '@storybook/react';

import BlockView from './BlockView';

type Story = StoryObj<BlockViewProps>;

const meta: Meta<BlockViewProps> = {
    title: 'Views/BlockView',
    component: BlockView,
    parameters: {
        layout: 'centered',
    },
    args: {
        spacing: 'md',
        withPadding: true,
        before: <div className="page-container-header"> Header</div>,
        after: <div className="page-container-footer">Footer</div>,
        children: (
            <div className="page-container">
                <div className="page-container-main">
                    Content
                </div>
            </div>),
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

export const Default: Story = {};

export const WithSpacing: Story = {
    args: {
        spacing: 'xl',
    },
};

export const WithoutPadding: Story = {
    args: {
        withPadding: false,
    },
};

export const WithSeparators: Story = {
    args: {
        withBeforeSeparator: true,
        withAfterSeparator: true,
    },
};
