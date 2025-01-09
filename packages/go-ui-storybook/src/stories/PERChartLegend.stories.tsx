import { PERChartLegendProps } from '@ifrc-go/ui';
import type {
    Meta,
    StoryObj,
} from '@storybook/react';

import PERChartLegend from './PERChartLegend';

const sampleData = [
    {
        label: 'Self-assessment',
        count: 85,
        color: '#236192',
    },
    {
        label: 'Simulation',
        count: 24,
        color: '#418FDE',
    },
    {
        label: 'Operational',
        count: 9,
        color: '#009CDD',
    },
    {
        label: 'Post-operational',
        count: 4,
        color: '#C6C6C6',
    },
];

const meta: Meta<typeof PERChartLegend> = {
    title: 'Components/PERChartLegend',
    component: PERChartLegend,
    parameters: {
        layout: 'centered',
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/k9SOqgh5jk9PxzuBKdMKsA/IFRC-GO---UI-Library',
        },
        docs: {
            description: {
                component: 'Legend component for PER charts displaying color-coded labels and values.',
            },
        },
    },
    argTypes: {
        data: {
            control: 'object',
            description: 'Array of data items with label, count, and color',
        },
        className: {
            control: 'text',
            description: 'Additional CSS class names',
        },
        /*
        onItemClick: {
            description: 'Callback when a legend item is clicked',
        },
        */
        layout: {
            control: 'select',
            options: ['horizontal', 'vertical'],
            description: 'Layout direction of legend items',
        },
        activeIndex: {
            control: 'text',
            description: 'Currently active legend item',
        },
        disabledIndices: {
            control: 'object',
            description: 'Array of indices for disabled items',
        },
    },
    args: {
        // onItemClick: fn(),
    },
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

function Template(args: PERChartLegendProps) {
    return (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <PERChartLegend {...args} />
    );
}

export const Default: Story = {
    render: Template,
    args: {
        data: sampleData,
        layout: 'horizontal',
    },
};

export const Vertical: Story = {
    render: Template,
    args: {
        data: sampleData,
        layout: 'vertical',
    },
};

export const WithActiveItem: Story = {
    render: Template,
    args: {
        data: sampleData,
        layout: 'horizontal',
        activeIndex: 'Self-assessment',
    },
};

export const WithDisabledItems: Story = {
    render: Template,
    args: {
        data: sampleData,
        layout: 'horizontal',
        disabledIndices: [1, 3],
    },
};
