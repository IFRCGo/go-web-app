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
    title: 'Components/Container',
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
        footerContent: 'Footer content',
        filters: 'Filter content',
        children: 'Container content',
    },
};

export const ContentViewType: Story = {
    args: {
        heading: 'Container Heading',
        headerDescription: 'This is a description for the header',
        footerContent: 'Footer content',
        filters: 'Filter content',
        children: 'Container content',
        contentViewType: 'default',
    },
};

export const EllipsizeHeading: Story = {
    args: {
        heading: 'Container Heading',
        headerDescription: 'This is a description for the header',
        footerContent: 'Footer content',
        filters: 'Filter content',
        children: 'Container content',
        ellipsizeHeading: true,
    },
};

export const FooterAction: Story = {
    args: {
        heading: 'Container Heading',
        headerDescription: 'This is a description for the header',
        footerContent: 'Footer content',
        filters: 'Filter content',
        children: 'Container content',
        footerActions: [
            <Button
                name={undefined}
            >
                save
            </Button>,
        ],
    },
};
export const WithFooterIcons: Story = {
    args: {
        heading: 'Container Heading',
        headerDescription: 'This is a description for the header',
        footerContent: 'Footer content',
        filters: 'Filter content',
        children: 'Container content',
        footerIcons: <WikiLineIcon />,
    },
};

export const WithGridViewAndPadding: Story = {
    args: {
        heading: 'Container Heading',
        headerDescription: 'This is a description for the header',
        footerContent: 'Footer content',
        filters: 'Filter content',
        children: 'Container content',
        contentViewType: 'grid',
        spacing: 'default',
        numPreferredGridContentColumns: 2,
        withGridViewInFilter: true,
    },
};

export const ContainerElementRef: Story = {
    args: {
        heading: 'Container Heading',
        headerDescription: 'This is a description for the header',
        footerContent: 'Footer content',
        filters: 'Filter content',
        children: 'Container content',
    },
};

export const WithHeadinglevel: Story = {
    args: {
        heading: 'Container Heading',
        headerDescription: 'This is a description for the header',
        footerContent: 'Footer content',
        filters: 'Filter content',
        children: 'Container content',
        contentViewType: 'default',
        spacing: 'default',
        headingLevel: 1,
        numPreferredGridContentColumns: 2,
    },
};

export const WithIcons: Story = {
    args: {
        heading: 'Container Heading',
        headerDescription: 'This is a description for the header',
        footerContent: 'Footer content',
        filters: 'Filter content',
        children: 'Container content',
        contentViewType: 'default',
        spacing: 'default',
        icons: <WikiLineIcon />,
    },
};

export const NumPreferredGridContentColumns: Story = {
    args: {
        heading: 'Container Heading',
        headerDescription: 'This is a description for the header',
        footerContent: 'Footer content',
        filters: 'Filter content',
        children: 'Container content',
        contentViewType: 'default',
        spacing: 'default',
        numPreferredGridContentColumns: 2,
    },
};
export const Withspacing: Story = {
    args: {
        heading: 'Container Heading',
        headerDescription: 'This is a description for the header',
        footerContent: 'Footer content',
        filters: 'Filter content',
        children: 'Container content',
        contentViewType: 'default',
        spacing: 'none',
        numPreferredGridContentColumns: 2,
        withGridViewInFilter: true,
    },
};

export const WithGridViewInFilter: Story = {
    args: {
        heading: 'Container Heading',
        headerDescription: 'This is a description for the header',
        footerContent: 'Footer content',
        filters: 'Filter content',
        children: 'Container content',
        contentViewType: 'default',
        spacing: 'default',
        numPreferredGridContentColumns: 2,
        withGridViewInFilter: true,
    },
};

export const WithHeaderBorder: Story = {
    args: {
        heading: 'Container Heading',
        headerDescription: 'This is a description for the header',
        footerContent: 'Footer content',
        filters: 'Filter content',
        children: 'Container content',
        contentViewType: 'grid',
        spacing: 'default',
        numPreferredGridContentColumns: 2,
        withHeaderBorder: true,
    },
};

export const WithInternalPadding: Story = {
    args: {
        heading: 'Container Heading',
        headerDescription: 'This is a description for the header',
        footerContent: 'Footer content',
        filters: 'Filter content',
        children: 'Container content',
        contentViewType: 'grid',
        spacing: 'default',
        numPreferredGridContentColumns: 2,
        withInternalPadding: true,
    },
};

export const WithoutWrapInHeading: Story = {
    args: {
        heading: 'Container Heading',
        headerDescription: 'This is a description for the header',
        footerContent: 'Footer content',
        filters: 'Filter content',
        children: 'Container content',
        contentViewType: 'grid',
        spacing: 'default',
        numPreferredGridContentColumns: 2,
        withoutWrapInHeading: true,
    },
};
