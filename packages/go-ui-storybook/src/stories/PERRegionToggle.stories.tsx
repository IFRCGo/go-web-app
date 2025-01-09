import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { PERRegionToggleProps } from '@ifrc-go/ui';

import PERRegionToggle from './PERRegionToggle';

const meta: Meta<typeof PERRegionToggle> = {
    title: 'Components/PERRegionToggle',
    component: PERRegionToggle,
    parameters: {
        layout: 'centered',
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/k9SOqgh5jk9PxzuBKdMKsA/IFRC-GO---UI-Library',
        },
        docs: {
            description: {
                component: 'RegionToggle is a component that displays a list of regions with optional count indicators. It allows users to filter or select regions, making it useful for geographic data filtering and regional analysis.',
            },
        },
    },
    argTypes: {
        regions: {
            control: 'object',
            description: 'Array of regions with their counts',
        },
        onRegionClick: {
            description: 'Callback when a region is clicked',
        },
        activeRegion: {
            control: 'text',
            description: 'Currently selected region',
        },
        precision: {
            control: 'number',
            description: 'Number of decimal places for count display',
        },
        showCount: {
            control: 'boolean',
            description: 'Whether to show count indicators',
        },
        className: {
            control: 'text',
            description: 'Additional CSS class',
        },
    },
    args: {
        onRegionClick: fn(),
    },
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

function Template(args: PERRegionToggleProps) {
    return (
        <PERRegionToggle {...args} />
    );
}

export const Default: Story = {
    render: Template,
    args: {
        regions: [
            { name: 'Africa', count: 17 },
            { name: 'Americas', count: 22 },
            { name: 'Asia Pacific', count: 24 },
            { name: 'Europe', count: 26 },
            { name: 'MENA', count: 16 },
        ],
        showCount: true,
        precision: 0,
        activeRegion: null,
    },
};

export const WithActiveRegion: Story = {
    render: Template,
    args: {
        ...Default.args,
        activeRegion: 'Europe',
    },
};

export const WithoutCounts: Story = {
    render: Template,
    args: {
        ...Default.args,
        showCount: false,
    },
};

export const WithDecimalPrecision: Story = {
    render: Template,
    args: {
        regions: [
            { name: 'Africa', count: 17.45 },
            { name: 'Americas', count: 22.78 },
            { name: 'Asia Pacific', count: 24.12 },
            { name: 'Europe', count: 26.89 },
            { name: 'MENA', count: 16.34 },
        ],
        showCount: true,
        precision: 2,
        activeRegion: null,
    },
};
