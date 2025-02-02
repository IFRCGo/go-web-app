import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import PERStackedBarChart from './PERStackedBarChart';

const sampleData = [
    {
        year: '2014',
        label: '2014',
        values: {
            Africa: 8,
            Americas: 10,
            'Asia Pacific': 12,
            Europe: 15,
            MENA: 5,
        },
    },
    {
        year: '2015',
        label: '2015',
        values: {
            Africa: 10,
            Americas: 12,
            'Asia Pacific': 15,
            Europe: 18,
            MENA: 7,
        },
    },
    {
        year: '2016',
        label: '2016',
        values: {
            Africa: 12,
            Americas: 15,
            'Asia Pacific': 18,
            Europe: 20,
            MENA: 10,
        },
    },
    {
        year: '2017',
        label: '2017',
        values: {
            Africa: 14,
            Americas: 18,
            'Asia Pacific': 20,
            Europe: 22,
            MENA: 12,
        },
    },
    {
        year: '2018',
        label: '2018',
        values: {
            Africa: 15,
            Americas: 20,
            'Asia Pacific': 22,
            Europe: 24,
            MENA: 14,
        },
    },
];

const categories = [
    { label: 'Africa', fillColor: '#1E3A8A' },
    { label: 'Americas', fillColor: '#1E40AF' },
    { label: 'Asia Pacific', fillColor: '#3B82F6' },
    { label: 'Europe', fillColor: '#60A5FA' },
    { label: 'MENA', fillColor: '#E5E7EB' },
];

const meta: Meta<typeof PERStackedBarChart> = {
    title: 'Components/PERStackedBarChart',
    component: PERStackedBarChart,
    parameters: {
        layout: 'centered',
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/k9SOqgh5jk9PxzuBKdMKsA/IFRC-GO---UI-Library',
        },
        docs: {
            description: {
                component: 'A stacked bar chart component showing data trends over time.',
            },
        },
    },
    argTypes: {
        data: {
            description: 'Array of data items for the chart',
            control: 'object',
        },
        height: {
            description: 'Height of the chart in pixels',
            control: 'number',
        },
        minWidth: {
            description: 'Minimum width of the chart in pixels',
            control: 'number',
        },
        tooltipEnabled: {
            description: 'Whether to show tooltips',
            control: 'boolean',
        },
        showDataLabels: {
            description: 'Whether to show data labels on bars',
            control: 'boolean',
        },
        marginBottom: {
            description: 'Margin below the chart',
            control: 'number',
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

export const Default: Story = {
    args: {
        data: sampleData,
        categories,
        height: 400,
        showDataLabels: true,
        marginBottom: 60,
    },
};

export const WithoutDataLabels: Story = {
    args: {
        ...Default.args,
        showDataLabels: false,
    },
};

export const CustomHeight: Story = {
    args: {
        ...Default.args,
        height: 500,
    },
};
