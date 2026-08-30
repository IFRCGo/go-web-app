import { WikiLineIcon } from '@ifrc-go/icons';
import {
    Button,
    ContainerProps,
} from '@ifrc-go/ui';
import type {
    Meta,
    StoryObj,
} from '@storybook/react';

import Container from './Container';

const meta = {
    title: 'Container/Container',
    component: Container,
    parameters: {
        layout: 'centered',
        design: {
            type: 'figma',
            allowFullscreen: true,
        },
    },
    tags: ['autodocs'],
} satisfies Meta<typeof Container>;

export default meta;
type Story = StoryObj<ContainerProps>;

export const Default: Story = {
    args: {
        heading: 'Container Heading',
        headerDescription: 'This is a description for the header',
        footer: 'Footer content',
        filters: 'Filter content',
        children: 'Container content',
    },
};

export const EllipsizeHeading: Story = {
    args: {
        heading: 'This extremely long container heading is intentionally written to test how the Container component behave',
        headerDescription: 'This is a description for the header',
        footer: 'Footer content',
        filters: 'Filter content',
        children: 'Container content',
        withEllipsizedHeading: true,
    },
};

export const FooterAction: Story = {
    args: {
        heading: 'Container Heading',
        headerDescription: 'This is a description for the header',
        footer: 'Footer content',
        filters: 'Filter content',
        children: 'Container content',
        footerActions: (
            <Button key="container-footer-action" name={undefined}>
                Save
            </Button>
        ),
    },
};

export const WithFooterIcons: Story = {
    args: {
        heading: 'Container Heading',
        headerDescription: 'This is a description for the header',
        footer: 'Footer content',
        filters: 'Filter content',
        children: 'Container content',
        footerIcons: <WikiLineIcon />,
    },
};

export const WithHeadingLevel: Story = {
    args: {
        heading: 'Container Heading',
        headerDescription: 'This is a description for the header',
        footer: 'Footer content',
        filters: 'Filter content',
        children: 'Container content',
        headingLevel: 1,
    },
};

export const WithCenteredContent: Story = {
    args: {
        heading: 'Container Heading',
        headerDescription: 'This is a description for the header',
        footer: 'Footer content',
        filters: 'Filter content',
        children: 'Container content',
        withCenteredContent: true,
    },
};

export const WithHeaderBorder: Story = {
    args: {
        heading: 'Container Heading',
        headerDescription: 'This is a description for the header',
        footer: 'Footer content',
        filters: 'Filter content',
        children: 'Container content',
        withHeaderBorder: true,
    },
};

export const WithBackground: Story = {
    args: {
        heading: 'Container with Background',
        headerDescription: 'This container has a background',
        children: 'Content goes here',
        withBackground: true,
        withPadding: true,
    },
};

export const WithShadow: Story = {
    args: {
        heading: 'Container with Shadow',
        children: 'Content with shadow',
        withShadow: true,
        withPadding: true,
    },
};

export const WithPadding: Story = {
    args: {
        heading: 'Container with Padding',
        children: 'Content with internal padding',
        withPadding: true,
        withBackground: true,
    },
};

export const PendingState: Story = {
    args: {
        heading: 'Pending Container',
        children: 'Waiting for data...',
        pending: true,
        pendingMessage: 'Loading data, please wait...',
    },
};

export const ErrorState: Story = {
    args: {
        heading: 'Errored Container',
        children: 'Data failed to load',
        errored: true,
        errorMessage: 'Something went wrong!',
    },
};

export const EmptyState: Story = {
    args: {
        heading: 'Empty Container',
        children: null,
        empty: true,
        emptyMessage: 'No content available.',
    },
};
