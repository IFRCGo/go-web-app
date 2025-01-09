import type {
    Meta,
    StoryObj,
} from '@storybook/react';

import PERConsiderations from './PERConsiderations';

const meta = {
    title: 'Components/PERConsiderations',
    component: PERConsiderations,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
} satisfies Meta<typeof PERConsiderations>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        data: {
            percentages: {
                epiPercentage: 75,
                climatePercentage: 60,
                urbanPercentage: 45,
                migrationPercentage: 90,
            },
            totals: {
                totalAssessments: 100,
                totalEpiConsiderations: 75,
                totalClimateConsiderations: 60,
                totalUrbanConsiderations: 45,
                totalMigrationConsiderations: 90,
            },
            data: [
                [
                    {
                        name: 'Africa',
                        SelfAssessment: 30,
                        Simulation: 20,
                        PostOperational: 15,
                        Operational: 10,
                    },
                    {
                        name: 'Americas',
                        SelfAssessment: 25,
                        Simulation: 15,
                        PostOperational: 10,
                        Operational: 5,
                    },
                ],
                [
                    {
                        name: 'Africa',
                        SelfAssessment: 20,
                        Simulation: 15,
                        PostOperational: 10,
                        Operational: 5,
                    },
                    {
                        name: 'Americas',
                        SelfAssessment: 15,
                        Simulation: 10,
                        PostOperational: 5,
                        Operational: 0,
                    },
                ],
                [
                    {
                        name: 'Africa',
                        SelfAssessment: 15,
                        Simulation: 10,
                        PostOperational: 5,
                        Operational: 0,
                    },
                    {
                        name: 'Americas',
                        SelfAssessment: 10,
                        Simulation: 5,
                        PostOperational: 0,
                        Operational: 0,
                    },
                ],
                [
                    {
                        name: 'Africa',
                        SelfAssessment: 35,
                        Simulation: 25,
                        PostOperational: 20,
                        Operational: 15,
                    },
                    {
                        name: 'Americas',
                        SelfAssessment: 30,
                        Simulation: 20,
                        PostOperational: 15,
                        Operational: 10,
                    },
                ],
            ],
        },
        activeIndex: null,
        onClick: (index: string) => {
            // eslint-disable-next-line no-console
            console.log('Clicked legend item:', index);
        },
        onClickPER: (key: string) => {
            // eslint-disable-next-line no-console
            console.log('Clicked PER item:', key);
        },
    },
};
