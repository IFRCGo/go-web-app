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
            url: 'https://www.figma.com/file/myeW85ibN5p2SlnXcEpxFD/IFRC-GO---UI-Current---1?type=design&node-id=0-4957&mode=design&t=KwxbuoUQxqcLyZbG-0',
            allowFullscreen: true,
        },
    },
    tags: ['autodocs'],
    argTypes: {},
} satisfies Meta<typeof Container>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
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
