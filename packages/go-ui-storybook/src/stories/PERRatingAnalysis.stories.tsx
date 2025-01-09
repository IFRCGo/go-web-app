import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { PERRatingAnalysisProps } from '@ifrc-go/ui';

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

const CYCLE_COLORS = ['#E0E3E7', '#99A5B3', '#4B5563', '#374151', '#1F2937'];

const mockData = {
  overallRating: {
    rating: 3.5,
    change: 0.5,
    changeDirection: 'up' as const,
    status: "Good performing" as const,
    cycleRatings: [
      { cycle: 'Cycle 1', rating: 2.5, color: CYCLE_COLORS[0] },
      { cycle: 'Cycle 2', rating: 3.0, color: CYCLE_COLORS[1] },
      { cycle: 'Cycle 3', rating: 3.2, color: CYCLE_COLORS[2] },
      { cycle: 'Cycle 4', rating: 3.4, color: CYCLE_COLORS[3] },
      { cycle: 'Cycle 5', rating: 3.5, color: CYCLE_COLORS[4] },
    ],
  },
  areaData: [
    {
      name: 'Policy, Strategy and Standards',
      type: 'area' as const,
      rating: 3.8,
      status: "Good performing" as const,
      change: 0.3,
      changeDirection: 'up' as const,
      cycleRatings: [
        { cycle: 'Cycle 1', rating: 2.5, color: CYCLE_COLORS[0] },
        { cycle: 'Cycle 2', rating: 3.0, color: CYCLE_COLORS[1] },
        { cycle: 'Cycle 3', rating: 3.3, color: CYCLE_COLORS[2] },
        { cycle: 'Cycle 4', rating: 3.6, color: CYCLE_COLORS[3] },
        { cycle: 'Cycle 5', rating: 3.8, color: CYCLE_COLORS[4] },
      ],
      areaColor: '#8E24AA',
    },
    {
      name: 'Analysis and Planning',
      type: 'area' as const,
      rating: 3.2,
      status: "Needs improvement" as const,
      change: -0.1,
      changeDirection: 'down' as const,
      cycleRatings: [
        { cycle: 'Cycle 1', rating: 2.8, color: CYCLE_COLORS[0] },
        { cycle: 'Cycle 2', rating: 3.0, color: CYCLE_COLORS[1] },
        { cycle: 'Cycle 3', rating: 3.3, color: CYCLE_COLORS[2] },
        { cycle: 'Cycle 4', rating: 3.3, color: CYCLE_COLORS[3] },
        { cycle: 'Cycle 5', rating: 3.2, color: CYCLE_COLORS[4] },
      ],
      areaColor: '#FB8C00',
    },
    {
      name: 'Operational Capacity',
      type: 'area' as const,
      rating: 4.0,
      status: "High performing" as const,
      change: 0.5,
      changeDirection: 'up' as const,
      cycleRatings: [
        { cycle: 'Cycle 1', rating: 3.0, color: CYCLE_COLORS[0] },
        { cycle: 'Cycle 2', rating: 3.2, color: CYCLE_COLORS[1] },
        { cycle: 'Cycle 3', rating: 3.5, color: CYCLE_COLORS[2] },
        { cycle: 'Cycle 4', rating: 3.8, color: CYCLE_COLORS[3] },
        { cycle: 'Cycle 5', rating: 4.0, color: CYCLE_COLORS[4] },
      ],
      areaColor: '#3F51B5',
    },
    {
      name: 'Operations Support',
      type: 'area' as const,
      rating: 3.5,
      status: "Good performing" as const,
      change: 0.2,
      changeDirection: 'up' as const,
      cycleRatings: [
        { cycle: 'Cycle 1', rating: 2.8, color: CYCLE_COLORS[0] },
        { cycle: 'Cycle 2', rating: 3.0, color: CYCLE_COLORS[1] },
        { cycle: 'Cycle 3', rating: 3.2, color: CYCLE_COLORS[2] },
        { cycle: 'Cycle 4', rating: 3.4, color: CYCLE_COLORS[3] },
        { cycle: 'Cycle 5', rating: 3.5, color: CYCLE_COLORS[4] },
      ],
      areaColor: '#7CB342',
    },
    {
      name: 'Coordination',
      type: 'area' as const,
      rating: 3.0,
      status: "Needs improvement" as const,
      change: 0,
      changeDirection: 'up' as const,
      cycleRatings: [
        { cycle: 'Cycle 1', rating: 2.5, color: CYCLE_COLORS[0] },
        { cycle: 'Cycle 2', rating: 2.7, color: CYCLE_COLORS[1] },
        { cycle: 'Cycle 3', rating: 2.8, color: CYCLE_COLORS[2] },
        { cycle: 'Cycle 4', rating: 2.9, color: CYCLE_COLORS[3] },
        { cycle: 'Cycle 5', rating: 3.0, color: CYCLE_COLORS[4] },
      ],
      areaColor: '#E53935',
    },
  ],
  componentData: [
    {
      id: 1,
      name: 'Policy and Strategy Framework',
      type: 'component' as const,
      rating: 4.0,
      status: "High performing" as const,
      change: 0.5,
      changeDirection: 'up' as const,
      cycleRatings: [
        { cycle: 'Cycle 1', rating: 3.0, color: CYCLE_COLORS[0] },
        { cycle: 'Cycle 2', rating: 3.3, color: CYCLE_COLORS[1] },
        { cycle: 'Cycle 3', rating: 3.5, color: CYCLE_COLORS[2] },
        { cycle: 'Cycle 4', rating: 3.8, color: CYCLE_COLORS[3] },
        { cycle: 'Cycle 5', rating: 4.0, color: CYCLE_COLORS[4] },
      ],
      areaColor: '#8E24AA',
    },
    {
      id: 2,
      name: 'Risk Assessment and Planning',
      type: 'component' as const,
      rating: 3.5,
      status: "Good performing" as const,
      change: 0.2,
      changeDirection: 'up' as const,
      cycleRatings: [
        { cycle: 'Cycle 1', rating: 2.8, color: CYCLE_COLORS[0] },
        { cycle: 'Cycle 2', rating: 3.0, color: CYCLE_COLORS[1] },
        { cycle: 'Cycle 3', rating: 3.2, color: CYCLE_COLORS[2] },
        { cycle: 'Cycle 4', rating: 3.4, color: CYCLE_COLORS[3] },
        { cycle: 'Cycle 5', rating: 3.5, color: CYCLE_COLORS[4] },
      ],
      areaColor: '#FB8C00',
    },
    {
      id: 3,
      name: 'Response and Recovery',
      type: 'component' as const,
      rating: 3.8,
      status: "Good performing" as const,
      change: 0.3,
      changeDirection: 'up' as const,
      cycleRatings: [
        { cycle: 'Cycle 1', rating: 3.0, color: CYCLE_COLORS[0] },
        { cycle: 'Cycle 2', rating: 3.2, color: CYCLE_COLORS[1] },
        { cycle: 'Cycle 3', rating: 3.4, color: CYCLE_COLORS[2] },
        { cycle: 'Cycle 4', rating: 3.6, color: CYCLE_COLORS[3] },
        { cycle: 'Cycle 5', rating: 3.8, color: CYCLE_COLORS[4] },
      ],
      areaColor: '#3F51B5',
    },
    {
      id: 4,
      name: 'Coordination',
      type: 'component' as const,
      rating: 4.1,
      status: "Good performing" as const,
      change: 0.3,
      changeDirection: 'up' as const,
      cycleRatings: [
        { cycle: 'Cycle 1', rating: 2.8, color: CYCLE_COLORS[0] },
        { cycle: 'Cycle 2', rating: 3.3, color: CYCLE_COLORS[1] },
        { cycle: 'Cycle 3', rating: 3.2, color: CYCLE_COLORS[2] },
        { cycle: 'Cycle 4', rating: 3.9, color: CYCLE_COLORS[3] },
        { cycle: 'Cycle 5', rating: 4.1, color: CYCLE_COLORS[4] },
      ],
      areaColor: '#7CB342',
    },
    {
      id: 5,
      name: 'Support Services',
      type: 'component' as const,
      rating: 4.0,
      status: "Good performing" as const,
      change: 0.1,
      changeDirection: 'up' as const,
      cycleRatings: [
        { cycle: 'Cycle 1', rating: 2.5, color: CYCLE_COLORS[0] },
        { cycle: 'Cycle 2', rating: 2.8, color: CYCLE_COLORS[1] },
        { cycle: 'Cycle 3', rating: 3.0, color: CYCLE_COLORS[2] },
        { cycle: 'Cycle 4', rating: 3.8, color: CYCLE_COLORS[3] },
        { cycle: 'Cycle 5', rating: 4.0, color: CYCLE_COLORS[4] },
      ],
      areaColor: '#E53935',
    },
  ],
};

export const Default: Story = {
  args: mockData,
};

export const WithLowRatings: Story = {
  args: {
    ...mockData,
    overallRating: {
      ...mockData.overallRating,
      rating: 2.5,
      status: 'Needs improvement',
      change: -0.3,
      changeDirection: 'down',
    },
  },
};
