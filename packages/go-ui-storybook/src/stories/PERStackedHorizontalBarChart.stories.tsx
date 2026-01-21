import type {
    Meta,
    StoryObj,
} from '@storybook/react';

import PERStackedHorizontalBarChart from './PERStackedHorizontalBarChart';

const sampleData = [
    {
        name: 'Component 1',
        SelfAssessment: 25,
        Simulation: 15,
        Operational: 10,
        PostOperational: 5,
    },
    {
        name: 'Component 2',
        SelfAssessment: 20,
        Simulation: 20,
        Operational: 15,
        PostOperational: 10,
    },
    {
        name: 'Component 3',
        SelfAssessment: 30,
        Simulation: 10,
        Operational: 20,
        PostOperational: 15,
    },
];

const meta: Meta<typeof PERStackedHorizontalBarChart> = {
    title: 'Components/PERStackedHorizontalBarChart',
    component: PERStackedHorizontalBarChart,
    parameters: {
        layout: 'centered',
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/k9SOqgh5jk9PxzuBKdMKsA/IFRC-GO---UI-Library',
        },
        docs: {
            description: {
                component: 'A horizontal stacked bar chart component showing data distribution across categories.',
            },
        },
    },
    argTypes: {
        data: {
            description: 'Array of data items for the chart',
            control: 'object',
        },
        transitionSpeed: {
            description: 'Animation duration in milliseconds',
            control: 'number',
        },
        maxValue: {
            description: 'Maximum value for x-axis',
            control: 'number',
        },
    },
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        data: sampleData,
        transitionSpeed: 800,
    },
};

export const WithMaxValue: Story = {
    args: {
        ...Default.args,
        maxValue: 100,
    },
};
