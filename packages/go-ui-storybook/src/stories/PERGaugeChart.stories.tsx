import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { PERGaugeChartProps } from '@ifrc-go/ui';

import PERGaugeChart from './PERGaugeChart';

const meta: Meta<typeof PERGaugeChart> = {
    title: 'Components/PERGaugeChart',
    component: PERGaugeChart,
    parameters: {
        layout: 'centered',
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/k9SOqgh5jk9PxzuBKdMKsA/IFRC-GO---UI-Library',
        },
    },
    argTypes: {
        value: {
            description: 'Value for the gauge (0-100)',
            control: 'number',
        },
        size: {
            description: 'Size of the gauge chart',
            control: 'number',
        },
        label: {
            description: 'Label to display below the gauge',
            control: 'text',
        },
        icon: {
            description: 'Icon to display in the center of the gauge',
            control: 'text',
        },
        color: {
            description: 'Color of the gauge',
            control: 'color',
        },
    },
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

function Template(args: PERGaugeChartProps) {
    return (
        <PERGaugeChart {...args} />
    );
}

export const Default: Story = {
    render: Template,
    args: {
        value: 75,
        size: 200,
        label: 'Overall Progress',
        icon: '/environment.svg',
        color: '#236192',
    },
};

export const NoIcon: Story = {
    render: Template,
    args: {
        value: 60,
        size: 200,
        label: 'Without Icon',
        color: '#236192',
    },
};

export const Small: Story = {
    render: Template,
    args: {
        value: 45,
        size: 100,
        label: 'Small Gauge',
        icon: '/environment.svg',
        color: '#236192',
    },
};

export const CustomColor: Story = {
    render: Template,
    args: {
        value: 85,
        size: 200,
        label: 'Custom Color',
        icon: '/environment.svg',
        color: '#F5333F',
    },
};

export const NoLabel: Story = {
    render: Template,
    args: {
        value: 60,
        size: 150,
    },
};
