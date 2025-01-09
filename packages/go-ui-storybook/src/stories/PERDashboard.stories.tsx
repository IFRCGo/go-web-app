import type { Meta, StoryObj } from '@storybook/react';
import { PERDashboard, PERDashboardProps } from '@ifrc-go/ui';

const meta: Meta<typeof PERDashboard> = {
    title: 'Components/PERDashboard',
    component: PERDashboard,
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component: 'PERDashboard component provides layout for PER (Preparedness for Effective Response) dashboard views.',
            },
        },
    },
    argTypes: {
        className: { type: 'string' },
        variant: {
            control: 'radio',
            options: ['summary', 'performance'],
        },
    },
} satisfies Meta<typeof PERDashboard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Summary: Story = {
    args: {
        variant: 'summary',
        accessToken: "pk.eyJ1IjoiZ28taWZyYyIsImEiOiJja3E2bGdvb3QwaXM5MnZtbXN2eGtmaWgwIn0.llipq3Spc_PPA2bLjPwIPQ\n"
    },
};

export const Performance: Story = {
    args: {
        variant: 'performance',
    },
};
