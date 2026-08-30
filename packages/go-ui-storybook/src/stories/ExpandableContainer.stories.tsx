import {
    Button,
    ExpandableContainerProps,
} from '@ifrc-go/ui';
import type {
    Meta,
    StoryObj,
} from '@storybook/react';

import ExpandableContainer from './ExpandableContainer';

const meta: Meta<typeof ExpandableContainer> = {
    title: 'Container/ExpandableContainer',
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    args: {
        heading: 'Container Heading',
        headerDescription: 'This is a description for the header',
        children: 'This is expandable content.',
    },
    component: ExpandableContainer,
};

export default meta;

type Story = StoryObj<ExpandableContainerProps>;

export const Default: Story = {};

export const WithCustomLabels: Story = {
    args: {
        initiallyExpanded: false,
        toggleButtonLabel: ['Show Content', 'Hide Content'],

    },
};

export const ToggleInFooter: Story = {
    args: {
        initiallyExpanded: false,
        withToggleButtonOnFooter: true,
    },
};

export const WithFooterActions: Story = {
    args: {
        footerActions: (
            <Button key="container-footer-action" name={undefined}>
                Save
            </Button>
        ),
    },
};
