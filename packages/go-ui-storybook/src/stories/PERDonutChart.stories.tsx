import { PERDonutChartProps } from '@ifrc-go/ui';
import type {
    Meta,
    StoryObj,
} from '@storybook/react';
import { fn } from '@storybook/test';

import PERDonutChart from './PERDonutChart';

const sampleData: PERDonutChartProps['data'] = [
    {
        label: 'Self-assessment',
        count: 85,
    },
    {
        label: 'Simulation',
        count: 24,
    },
    {
        label: 'Operational',
        count: 9,
    },
    {
        label: 'Post-operational',
        count: 4,
    },
];

const meta: Meta<typeof PERDonutChart> = {
    title: 'Components/PERDonutChart',
    component: PERDonutChart,
    parameters: {
        layout: 'centered',
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/k9SOqgh5jk9PxzuBKdMKsA/IFRC-GO---UI-Library',
        },
        docs: {
            description: {
                component: 'DonutChart is a circular visualization component that displays proportional data as segments of a ring. It is particularly effective for showing part-to-whole relationships and categorical distributions.',
            },
        },
    },
    argTypes: {
        data: {
            control: 'object',
            description: 'Array of data points for the chart',
        },
        height: {
            control: 'number',
            description: 'Height of the chart',
        },
        width: {
            control: 'number',
            description: 'Width of the chart',
        },
        cutout: {
            control: 'text',
            description: 'Donut cutout percentage',
        },
        circumference: {
            control: 'number',
            description: 'Total circumference of the chart in degrees',
        },
        rotation: {
            control: 'number',
            description: 'Starting rotation of the chart in degrees',
        },
        hoverOffset: {
            control: 'number',
            description: 'Distance to separate hovered segment',
        },
        animation: {
            control: 'boolean',
            description: 'Whether to animate chart changes',
        },
        tooltipEnabled: {
            control: 'boolean',
            description: 'Whether to show tooltips',
        },
        centerText: {
            control: 'text',
            description: 'Primary text to display in center of donut',
        },
        centerTextSecondary: {
            control: 'text',
            description: 'Secondary text to display in center of donut',
        },
        maintainAspectRatio: {
            control: 'boolean',
            description: 'Whether to maintain aspect ratio',
        },
        responsive: {
            control: 'boolean',
            description: 'Whether to make the chart responsive',
        },
        hoverDarkenPercent: {
            control: 'number',
            description: 'Percentage to darken hover color',
        },
        colors: {
            control: 'object',
            description: 'Array of colors for chart segments',
        },
    },
    args: {
        onClick: fn(),
        onHover: fn(),
    },
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

function Template(args: PERDonutChartProps) {
    return (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <PERDonutChart {...args} />
    );
}

export const Default: Story = {
    render: Template,
    args: {
        data: sampleData,
        height: 300,
        width: 300,
        cutout: '50%',
        circumference: 360,
        rotation: -90,
        hoverOffset: 4,
        animation: true,
        tooltipEnabled: true,
        centerText: '122',
        centerTextSecondary: 'Total',
        maintainAspectRatio: false,
        responsive: true,
        hoverDarkenPercent: -5,
        colors: ['#236192', '#418FDE', '#009CDD', '#C6C6C6'],
    },
};

export const NoAnimation: Story = {
    render: Template,
    args: {
        ...Default.args,
        animation: false,
    },
};

export const NoTooltip: Story = {
    render: Template,
    args: {
        ...Default.args,
        tooltipEnabled: false,
    },
};

export const CustomCenterText: Story = {
    render: Template,
    args: {
        ...Default.args,
        centerText: '85%',
        centerTextSecondary: 'Completion',
    },
};
