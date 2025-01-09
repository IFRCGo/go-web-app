import type { Meta, StoryObj } from '@storybook/react';
import { PERTreemapChartProps } from '@ifrc-go/ui';

import PERTreemapChart from './PERTreemapChart';

const sampleData = {
    name: 'Root',
    children: [
        {
            name: 'Area 1',
            color: '#236192',
            children: [
                { name: 'Component 1.1', value: 25 },
                { name: 'Component 1.2', value: 15 },
                { name: 'Component 1.3', value: 10 },
            ],
        },
        {
            name: 'Area 2',
            color: '#418FDE',
            children: [
                { name: 'Component 2.1', value: 20 },
                { name: 'Component 2.2', value: 30 },
                { name: 'Component 2.3', value: 15 },
            ],
        },
        {
            name: 'Area 3',
            color: '#009CDD',
            children: [
                { name: 'Component 3.1', value: 18 },
                { name: 'Component 3.2', value: 22 },
                { name: 'Component 3.3', value: 12 },
            ],
        },
    ],
};

const meta: Meta<typeof PERTreemapChart> = {
    title: 'Components/PERTreemapChart',
    component: PERTreemapChart,
    parameters: {
        layout: 'centered',
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/k9SOqgh5jk9PxzuBKdMKsA/IFRC-GO---UI-Library',
        },
        docs: {
            description: {
                component: 'A treemap chart component that displays hierarchical data using nested rectangles.',
            },
        },
    },
    argTypes: {
        d: {
            description: 'Hierarchical data structure for the treemap',
            control: 'object',
        },
        onClick: {
            description: 'Callback function when a node is clicked',
            control: 'function',
        },
        activeIndex: {
            description: 'Currently active node name',
            control: 'text',
        },
    },
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof PERTreemapChart>;

export const Default: Story = {
    args: {
        d: sampleData,
    },
    render: (args: PERTreemapChartProps) => (
        <div style={{ width: '800px', height: '400px' }}>
            <PERTreemapChart {...args} />
        </div>
    ),
};

export const WithActiveNode: Story = {
    args: {
        ...Default.args,
        activeIndex: 'Component 1.1',
    },
    render: Default.render,
};

export const WithInteraction: Story = {
    args: {
        ...Default.args,
        onClick: (data) => {
            console.log('Clicked:', data);
        },
    },
    render: Default.render,
};
