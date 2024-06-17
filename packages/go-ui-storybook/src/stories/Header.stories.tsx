import { WikiHelpSectionLineIcon } from '@ifrc-go/icons';
import {
    Button,
    HeaderProps,
} from '@ifrc-go/ui';
import type {
    Args,
    Meta,
    StoryObj,
} from '@storybook/react';

import Header from './Header';

type HeaderSpecificProps = HeaderProps;

type Story = StoryObj<HeaderSpecificProps>;

const meta: Meta<typeof Header> = {
    title: 'Components/Header',
    component: Header,
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
function Template(args:Args) {
    return (
        <Header
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...args}
            heading="Company Overview"
        />
    );
}

export const Default: Story = {
    render: Template,
    args: {
        headingDescription: 'Learn more about our company and what sets us apart in the market.',
        headingLevel: 2,
    },
};

export const EllipsizeHeading: Story = {
    render: Template,
    args: {
        headingDescription: 'Learn more about our company and what sets us apart in the market.',
        ellipsizeHeading: true,
    },
};

export const WithIcon: Story = {
    render: Template,
    args: {
        headingLevel: 2,
        heading: 'Introduction',
        icons: <WikiHelpSectionLineIcon />,
    },
};

export const WithAction: Story = {
    render: Template,
    args: {
        heading: 'Company Overview',
        headingDescription: 'Learn more about our company and what sets us apart in the market.',
        headingLevel: 2,
        actions: [
            <Button
                name={undefined}
                variant="primary"
            >
                Export
            </Button>,
        ],

    },
};
