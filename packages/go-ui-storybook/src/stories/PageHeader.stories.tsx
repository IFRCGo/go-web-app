import {
    PageHeaderProps,
    Tab,
    TabList,
} from '@ifrc-go/ui';
import type {
    Meta,
    StoryObj,
} from '@storybook/react';

import PageHeader from './PageHeader';

type PageHeaderSpecificProps = PageHeaderProps;

type Story = StoryObj<PageHeaderSpecificProps>;

const meta: Meta<typeof PageHeader> = {
    title: 'Components/PageHeader',
    component: PageHeader,
    parameters: {
        layout: 'centered',
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/myeW85ibN5p2SlnXcEpxFD/IFRC-GO---UI-Current---1?type=design&node-id=0-4957&mode=design&t=KwxbuoUQxqcLyZbG-0',
        },
    },
    tags: ['autodocs'],
};

export default meta;

export const Default: Story = {
    args: {
        heading: 'IFRC Disaster Response and Preparedness',
    },
};

export const WithDescription: Story = {
    args: {
        heading: 'IFRC Disaster Response and Preparedness',
        description: 'IFRC GO aims to make all disaster information universally accessible and useful to IFRC responders for better decision making.',
    },
};

export const WithAction: Story = {
    args: {
        heading: 'IFRC Disaster Response and Preparedness',
        actions: [
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
            </TabList>,
        ],
    },
};
