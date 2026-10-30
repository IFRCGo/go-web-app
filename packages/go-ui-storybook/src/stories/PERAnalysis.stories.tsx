import type {
    Meta,
    StoryObj,
} from '@storybook/react';

import PERAnalysis from './PERAnalysis';

const meta = {
    title: 'Components/PERAnalysis',
    component: PERAnalysis,
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component: 'PERAnalysis component displays a comprehensive view of PER (Preparedness Evaluation Report) cycles. It shows the progress across multiple cycles, including completion rates, ratings, and rating changes. The component visualizes trends and improvements over time.',
            },
        },
    },
    tags: ['autodocs'],
} satisfies Meta<typeof PERAnalysis>;

export default meta;
type Story = StoryObj<typeof PERAnalysis>;

const mockData = {
    total_cycles: 3,
    cycles: [
        {
            cycle: 'Cycle 1',
            cycleNumber: 1,
            completed: 10,
            inProgress: 5,
            rating: 3.5,
            totalNS: 15,
            ratingChange: 1.5,
        },
        {
            cycle: 'Cycle 2',
            cycleNumber: 2,
            completed: 15,
            inProgress: 3,
            rating: 4.3,
            totalNS: 18,
            ratingChange: 0.8,
        },
        {
            cycle: 'Cycle 3',
            cycleNumber: 3,
            completed: 18,
            inProgress: 2,
            rating: 4.1,
            totalNS: 20,
            ratingChange: -0.2,
        },
    ],
};

const mockSummary = {
    averageRating: 4.0,
};

export const Default: Story = {
    args: {
        data: mockData,
        summary: mockSummary,
    },
};

export const WithInteraction: Story = {
    args: {
        ...Default.args,
        activeCycle: 2,
        onCycleClick: () => {},
    },
};
