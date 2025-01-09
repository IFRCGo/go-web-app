import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { PERMapProps } from '@ifrc-go/ui';

import PERMap from './PERMap';

// Public token for demo purposes only
const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';

const meta: Meta<typeof PERMap> = {
    title: 'Components/PERMap',
    component: PERMap,
    parameters: {
        layout: 'fullscreen',
        design: {
            type: 'figma',
            url: '',
        },
        docs: {
            description: {
                component: 'An interactive map component for displaying PER assessment data with dynamic bubbles representing assessment values.',
            },
        },
    },
    argTypes: {
        accessToken: { control: 'text' },
        data: { control: 'object' },
        valueField: { control: 'text' },
        mapboxStyle: { control: 'text' },
        center: { control: 'object' },
        zoom: { control: 'number' },
        minRadius: { control: 'number' },
        maxRadius: { control: 'number' },
        tooltipTrigger: {
            control: 'select',
            options: ['hover', 'click'],
        },
        enableClickToFilter: { control: 'boolean' },
    },
    decorators: [
        (Story) => (
            <div style={{
                width: '100%',
                height: '100vh',
                position: 'relative',
                backgroundColor: '#F8F8F8',
            }}>
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof PERMap>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleData = [
    {
        id: 1,
        latitude: 40.7128,
        longitude: -74.0060,
        assessment_number: 15,
        name: 'New York',
        color: '#F5333F',
    },
    {
        id: 2,
        latitude: 51.5074,
        longitude: -0.1278,
        assessment_number: 8,
        name: 'London',
        color: '#F5333F',
    },
    {
        id: 3,
        latitude: 35.6762,
        longitude: 139.6503,
        assessment_number: 3,
        name: 'Tokyo',
        color: '#F5333F',
    },
    {
        id: 4,
        latitude: -33.8688,
        longitude: 151.2093,
        assessment_number: 10,
        name: 'Sydney',
        color: '#F5333F',
    },
    {
        id: 5,
        latitude: -1.2921,
        longitude: 36.8219,
        assessment_number: 6,
        name: 'Nairobi',
        color: '#F5333F',
    },
];

export const Default: Story = {
    args: {
        accessToken: MAPBOX_ACCESS_TOKEN,
        mapboxStyle: "mapbox://styles/go-ifrc/ckrfe16ru4c8718phmckdfjh0",
        data: sampleData,
        center: [0, 20],
        zoom: 2,
        minRadius: 5,
        maxRadius: 25,
        tooltipTrigger: 'click',
        enableClickToFilter: true,
        onClick: fn(),
    },
    render: (args) => (
        <div style={{ width: '100%', height: '100%', minHeight: '400px' }}>
            <PERMap {...args} />
        </div>
    ),
};
