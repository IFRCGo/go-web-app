import { useCallback } from 'react';
import {
    Tab,
    TabList,
    TabPanel,
    TabsProps,
} from '@ifrc-go/ui';
import { useArgs } from '@storybook/preview-api';
import type {
    Args,
    Meta,
    StoryObj,
} from '@storybook/react';
import { fn } from '@storybook/test';

import Tabs from './Tabs';

type TabsSpecificProps = TabsProps<string | undefined>

type Story = StoryObj<TabsSpecificProps>;

const meta: Meta<typeof Tabs> = {
    title: 'Components/ Tabs',
    component: Tabs,
    parameters: {
        layout: 'centered',
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/k9SOqgh5jk9PxzuBKdMKsA/IFRC-GO---UI-Library?node-id=14450-215118&t=JxlW0bNF2vjvkZ01-4',
        },
    },
    args: {
        onChange: fn(),
    },
    tags: ['autodocs'],
};
export default meta;

function Template(args:Args) {
    const [
        {
            onChange,
        },
        updateArgs,
    ] = useArgs();

    const handleChange = useCallback((key: string) => {
        updateArgs({ value: key });
        onChange(key);
    }, [updateArgs, onChange]);

    return (
        <Tabs
            value="Tab1"
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...args}
            onChange={handleChange}
        >
            <TabList>
                <Tab name="Tab1">
                    Home
                </Tab>
                <Tab name="Tab2">
                    Profile
                </Tab>
                <Tab name="Tab3">
                    Notifications
                </Tab>
            </TabList>
            <TabPanel name="Tab1" />
            <TabPanel
                name="Tab2"
            />
            <TabPanel
                name="Tab3"
            />
        </Tabs>
    );
}

export const Default: Story = {
    render: Template,
    args: {
        styleVariant: 'tab',
    },
};

export const Pill: Story = {
    render: Template,
    args: {
        styleVariant: 'pill',
        colorVariant: 'primary',
    },
};

export const Step: Story = {
    render: Template,
    args: {
        styleVariant: 'step',
        colorVariant: 'primary',
    },
};

export const Vertical: Story = {
    render: Template,
    args: {
        styleVariant: 'vertical',
        colorVariant: 'primary',
    },
};

export const VerticalCompact: Story = {
    render: Template,
    args: {
        styleVariant: 'vertical-compact',
        colorVariant: 'primary',
    },
};

export const Disabled: Story = {
    render: Template,
    args: {
        disabled: true,

    },
};
