import { PERGaugeChartProps } from '@ifrc-go/ui';
import type {
    Meta,
    StoryObj,
} from '@storybook/react';

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
        percentage: {
            description: 'Value for the gauge (0-100)',
            control: 'number',
        },
        label: {
            description: 'Label to display below the gauge',
            control: 'text',
        },
        gaugeColor: {
            description: 'Color of the gauge',
            control: 'color',
        },
        backgroundColor: {
            description: 'Background color of the gauge',
            control: 'color',
        },
        title: {
            description: 'Title of the gauge',
            control: 'text',
        },
        icon: {
            description: 'URL of the icon to display in the center',
            control: 'text',
        },
    },
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

function Template(args: PERGaugeChartProps) {
    return (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <PERGaugeChart {...args} />
    );
}

export const Default: Story = {
    render: Template,
    args: {
        percentage: 75,
        label: 'EPI-ready',
        gaugeColor: '#236192',
        backgroundColor: '#F2F2F2',
        title: 'Chart Title',
        icon: '/analysis.svg',
    },
};

export const WithDifferentColors: Story = {
    render: Template,
    args: {
        percentage: 50,
        label: 'Climate-ready',
        gaugeColor: '#2F9C67',
        backgroundColor: '#E9E9E9',
        title: 'Climate Readiness',
        icon: '/analysis.svg',
    },
};
