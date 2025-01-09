import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { PERContainerProps } from '@ifrc-go/ui';

import PERContainer from './PERContainer';

const meta: Meta<typeof PERContainer> = {
    title: 'Components/PERContainer',
    component: PERContainer,
    parameters: {
        layout: 'centered',
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/k9SOqgh5jk9PxzuBKdMKsA/IFRC-GO---UI-Library',
        },
    },
    argTypes: {
        title: {
            control: 'text',
            description: 'The main title of the container',
        },
        subtitle: {
            control: 'text',
            description: 'A subtitle providing additional context',
        },
        minWidth: {
            control: 'text',
            description: 'The minimum width of the container',
        },
        minHeight: {
            control: 'text',
            description: 'The minimum height of the container',
        },
        showResetFilter: {
            control: 'boolean',
            description: 'Whether to show the reset filter button',
        },
        resetFilterLabel: {
            control: 'text',
            description: 'The label for the reset filter button',
        },
        disabled: {
            control: 'boolean',
            description: 'Whether the container is disabled',
        },
    },
    args: {
        onResetFilter: fn(),
    },
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

function Template(args: PERContainerProps) {
    return (
        <PERContainer {...args} />
    );
}

export const Default: Story = {
    render: Template,
    args: {
        title: 'Container Title',
        subtitle: 'Container subtitle text',
        children: 'Container content goes here',
        minWidth: '300px',
        minHeight: '300px',
        showResetFilter: false,
        resetFilterLabel: 'Reset Filters',
        disabled: false,
    },
};

export const WithResetFilter: Story = {
    render: Template,
    args: {
        ...Default.args,
        showResetFilter: true,
    },
};

export const WithActions: Story = {
    render: Template,
    args: {
        ...Default.args,
        actions: (
            <button
                type="button"
                style={{
                    padding: '4px 8px',
                    fontSize: '12px',
                    backgroundColor: '#236192',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                }}
            >
                Action
            </button>
        ),
    },
};
