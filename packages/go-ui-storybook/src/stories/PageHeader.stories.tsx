import { WikiHelpSectionLineIcon } from '@ifrc-go/icons';
import {
    PageHeaderProps,
    Tab,
    TabList,
} from '@ifrc-go/ui';
import type {
    Args,
    Meta,
    StoryObj,
} from '@storybook/react';

import PageHeader from './PageHeader';

type PageHeaderSpecificProps = PageHeaderProps;

type Story = StoryObj<typeof PageHeader>;

const meta: Meta<PageHeaderSpecificProps> = {
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
    argTypes: {},
};

export default meta;

function Template(args: Args) {
    return (
        <PageHeader
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...args}
        />
    );
}

export const Default: Story = {
    render: Template,
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

export const WithWikiLink: Story = {
    args: {
        heading: 'IFRC Disaster Response and Preparedness',
        description: 'IFRC GO aims to make all disaster information universally accessible and useful to IFRC responders for better decision making.',
        wikiLink: <WikiHelpSectionLineIcon />,
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

export const WithInfo: Story = {
    args: {
        heading: 'IFRC Disaster Response and Preparedness',
        description: 'IFRC GO aims to make all disaster information universally accessible and useful to IFRC responders for better decision making.',
        info: 'The following data displays the current and ongoing emergencies within the country that are reported by the National Societies and partners',
    },
};
