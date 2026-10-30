import type {
    Meta,
    StoryObj,
} from '@storybook/react';

import PERRatingAnalysis from './PERRatingAnalysis';

const meta = {
    title: 'Components/PERRatingAnalysis',
    component: PERRatingAnalysis,
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component: 'PERRatingAnalysis component displays a detailed analysis of PER (Preparedness Evaluation Report) ratings. It shows overall rating, area-wise ratings, and component-wise ratings with their changes and status.',
            },
        },
    },
    tags: ['autodocs'],
} satisfies Meta<typeof PERRatingAnalysis>;

export default meta;
type Story = StoryObj<typeof PERRatingAnalysis>;

const mockData = {
    overallRating: {
        rating: 3.5,
        change: 0.5,
        changeDirection: 'up' as const,
        cycleRatings: [
            { cycle: 'Cycle 1', rating: 2.5 },
            { cycle: 'Cycle 2', rating: 3.0 },
            { cycle: 'Cycle 3', rating: 3.2 },
            { cycle: 'Cycle 4', rating: 3.4 },
            { cycle: 'Cycle 5', rating: 3.5 },
        ],
    },
    areaData: [
        {
            name: 'Policy, Strategy and Standards',
            type: 'area' as const,
            rating: 3.8,
            change: 0.3,
            changeDirection: 'up' as const,
            cycleRatings: [
                { cycle: 'Cycle 1', rating: 2.5 },
                { cycle: 'Cycle 2', rating: 3.0 },
                { cycle: 'Cycle 3', rating: 3.3 },
                { cycle: 'Cycle 4', rating: 3.6 },
                { cycle: 'Cycle 5', rating: 3.8 },
            ],
            areaColor: '#8E24AA',
        },
        {
            name: 'Analysis and Planning',
            type: 'area' as const,
            rating: 3.2,
            change: -0.1,
            changeDirection: 'down' as const,
            cycleRatings: [
                { cycle: 'Cycle 1', rating: 2.8 },
                { cycle: 'Cycle 2', rating: 3.0 },
                { cycle: 'Cycle 3', rating: 3.3 },
                { cycle: 'Cycle 4', rating: 3.3 },
                { cycle: 'Cycle 5', rating: 3.2 },
            ],
            areaColor: '#FB8C00',
        },
        {
            name: 'Operational Capacity',
            type: 'area' as const,
            rating: 4.0,
            change: 0.5,
            changeDirection: 'up' as const,
            cycleRatings: [
                { cycle: 'Cycle 1', rating: 3.0 },
                { cycle: 'Cycle 2', rating: 3.2 },
                { cycle: 'Cycle 3', rating: 3.5 },
                { cycle: 'Cycle 4', rating: 3.8 },
                { cycle: 'Cycle 5', rating: 4.0 },
            ],
            areaColor: '#3F51B5',
        },
        {
            name: 'Operations Support',
            type: 'area' as const,
            rating: 3.5,
            change: 0.2,
            changeDirection: 'up' as const,
            cycleRatings: [
                { cycle: 'Cycle 1', rating: 2.8 },
                { cycle: 'Cycle 2', rating: 3.0 },
                { cycle: 'Cycle 3', rating: 3.2 },
                { cycle: 'Cycle 4', rating: 3.4 },
                { cycle: 'Cycle 5', rating: 3.5 },
            ],
            areaColor: '#7CB342',
        },
        {
            name: 'Coordination',
            type: 'area' as const,
            rating: 3.0,
            change: 0,
            changeDirection: 'up' as const,
            cycleRatings: [
                { cycle: 'Cycle 1', rating: 2.5 },
                { cycle: 'Cycle 2', rating: 2.7 },
                { cycle: 'Cycle 3', rating: 2.8 },
                { cycle: 'Cycle 4', rating: 2.9 },
                { cycle: 'Cycle 5', rating: 3.0 },
            ],
            areaColor: '#E53935',
        },
    ],
    componentData: [
        {
            id: 1,
            key: '1',
            name: 'Policy and Strategy Framework',
            type: 'component' as const,
            rating: 4.0,
            change: 0.5,
            changeDirection: 'up' as const,
            cycleRatings: [
                { cycle: 'Cycle 1', rating: 3.0 },
                { cycle: 'Cycle 2', rating: 3.3 },
                { cycle: 'Cycle 3', rating: 3.5 },
                { cycle: 'Cycle 4', rating: 3.8 },
                { cycle: 'Cycle 5', rating: 4.0 },
            ],
            areaColor: '#8E24AA',
        },
        {
            id: 2,
            key: '2',
            name: 'Risk Assessment and Planning',
            type: 'component' as const,
            rating: 3.5,
            change: 0.2,
            changeDirection: 'up' as const,
            cycleRatings: [
                { cycle: 'Cycle 1', rating: 2.8 },
                { cycle: 'Cycle 2', rating: 3.0 },
                { cycle: 'Cycle 3', rating: 3.2 },
                { cycle: 'Cycle 4', rating: 3.4 },
                { cycle: 'Cycle 5', rating: 3.5 },
            ],
            areaColor: '#FB8C00',
        },
        {
            id: 3,
            key: '3',
            name: 'Response and Recovery',
            type: 'component' as const,
            rating: 3.8,
            change: 0.3,
            changeDirection: 'up' as const,
            cycleRatings: [
                { cycle: 'Cycle 1', rating: 3.0 },
                { cycle: 'Cycle 2', rating: 3.2 },
                { cycle: 'Cycle 3', rating: 3.4 },
                { cycle: 'Cycle 4', rating: 3.6 },
                { cycle: 'Cycle 5', rating: 3.8 },
            ],
            areaColor: '#3F51B5',
        },
        {
            id: 4,
            key: '4',
            name: 'Coordination',
            type: 'component' as const,
            rating: 4.1,
            change: 0.3,
            changeDirection: 'up' as const,
            cycleRatings: [
                { cycle: 'Cycle 1', rating: 2.8 },
                { cycle: 'Cycle 2', rating: 3.3 },
                { cycle: 'Cycle 3', rating: 3.2 },
                { cycle: 'Cycle 4', rating: 3.9 },
                { cycle: 'Cycle 5', rating: 4.1 },
            ],
            areaColor: '#7CB342',
        },
        {
            id: 5,
            key: '5',
            name: 'Support Services',
            type: 'component' as const,
            rating: 4.0,
            change: 0.1,
            changeDirection: 'up' as const,
            cycleRatings: [
                { cycle: 'Cycle 1', rating: 2.5 },
                { cycle: 'Cycle 2', rating: 2.8 },
                { cycle: 'Cycle 3', rating: 3.0 },
                { cycle: 'Cycle 4', rating: 3.8 },
                { cycle: 'Cycle 5', rating: 4.0 },
            ],
            areaColor: '#E53935',
        },
    ],
};

export const Default: Story = {
    args: mockData,
};
