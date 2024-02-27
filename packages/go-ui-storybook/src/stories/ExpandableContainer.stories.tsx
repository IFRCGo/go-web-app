import { ExpandableContainerProps } from '@ifrc-go/ui';
import type {
    Meta,
    StoryObj,
} from '@storybook/react';

import ExpandableContainer from './ExpandableContainer';

type ExpandableContainerSpecificProps = ExpandableContainerProps & {
    description?: string;
    footer?: string;
};

type Story =StoryObj<ExpandableContainerSpecificProps>;

const meta: Meta<typeof ExpandableContainer> = {
    title: 'Components/ExpandableContainer',
    component: ExpandableContainer,
    parameters: {
        layout: 'centered',
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/myeW85ibN5p2SlnXcEpxFD/IFRC-GO---UI-Current---1?type=design&node-id=0-4957&mode=design&t=KwxbuoUQxqcLyZbG-0',
        },
    },
    tags: ['autodocs'],
};
export default meta;

export const Default: Story = {
    args: {
        heading: 'Extended Matrixes',
        children: 'I should expand on arrow click and not the whole header',
        initiallyExpanded: false,
    },
};

export const InitiallyExpanded: Story = {
    args: {
        heading: 'Extended Matrixes',
        children: 'I should expand on arrow click and not the whole header.',
        initiallyExpanded: true,
    },
};

export const WithHeaderAndDescription: Story = {
    args: {
        heading: 'Extended Matrixes',
        description: 'This is a header description',
        children: 'I should expand on arrow click and not the whole header',
        initiallyExpanded: false,
    },
};

export const WithFooter: Story = {
    args: {
        heading: 'Extended Matrixes',
        children: 'I should expand on arrow click and not the whole header',
        footer: 'This is a footer',
        initiallyExpanded: false,
    },
};

export const WithFilters: Story = {
    args: {
        heading: 'Extended Matrixes',
        children: 'I should expand on arrow click and not the whole header',
        filters: <div>Filters</div>,
        initiallyExpanded: false,
    },
};

export const WithChildren: Story = {
    args: {
        heading: 'Extended Matrixes',
        children: 'I am a child component',
        initiallyExpanded: false,
    },
};
