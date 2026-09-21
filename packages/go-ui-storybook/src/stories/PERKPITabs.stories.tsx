import { useCallback } from 'react';
import { PERKPITabsProps } from '@ifrc-go/ui';
import { useArgs } from '@storybook/preview-api';
import type {
    Meta,
    StoryObj,
} from '@storybook/react';
import { fn } from '@storybook/test';

import PERKPITabs from './PERKPITabs';

const meta: Meta<typeof PERKPITabs> = {
    title: 'Components/PERKPITabs',
    component: PERKPITabs,
    parameters: {
        layout: 'centered',
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/k9SOqgh5jk9PxzuBKdMKsA/IFRC-GO---UI-Library',
        },
    },
    argTypes: {
        kpis: {
            description: 'Array of KPI items to display',
        },
        disableTabs: {
            description: 'Whether to disable tab interaction',
            control: 'boolean',
        },
        onTabClick: {
            description: 'Callback when a tab is clicked',
        },
        activeIndex: {
            description: 'Controlled active tab index',
            control: 'number',
        },
        onActiveIndexChange: {
            description: 'Callback when active tab changes',
        },
    },
    args: {
        onTabClick: fn(),
        onActiveIndexChange: fn(),
    },
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

const kpis = [
    {
        key: 'total',
        value: 42,
        description: 'Total Projects',
        color: '#F5333F',
    },
    {
        key: 'active',
        value: 28,
        description: 'Active Projects',
        color: '#2F9C67',
    },
    {
        key: 'completed',
        value: 14,
        description: 'Completed Projects',
        color: '#FFA500',
    },
    {
        key: 'pending',
        value: 7,
        description: 'Pending Projects',
        color: '#0000FF',
    },
];

function Template(args: PERKPITabsProps) {
    const [{ activeIndex }, updateArgs] = useArgs();

    const handleActiveIndexChange = useCallback((index: number) => {
        updateArgs({ activeIndex: index });
        // eslint-disable-next-line react/destructuring-assignment
        args.onActiveIndexChange?.(index);
    }, [updateArgs, args]);

    return (
        <PERKPITabs
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...args}
            activeIndex={activeIndex}
            onActiveIndexChange={handleActiveIndexChange}
        />
    );
}

export const Default: Story = {
    render: Template,
    args: {
        kpis,
    },
};

export const Controlled: Story = {
    render: Template,
    args: {
        kpis,
        activeIndex: 1,
    },
};

export const Disabled: Story = {
    render: Template,
    args: {
        kpis,
        disableTabs: true,
    },
};
