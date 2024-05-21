import { WikiHelpSectionLineIcon } from '@ifrc-go/icons';
import {
    Button,
    HeaderProps,
} from '@ifrc-go/ui';
import type {
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
    decorators: [
        function Component(_, ctx) {
            const componentArgs = ctx.args as HeaderSpecificProps;
            return (
                <Header
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...componentArgs}

                />
            );
        },
    ],
};

export default meta;

export const Default: Story = {
    args: {
        heading: 'Company Overview',
        headingDescription: 'Learn more about our company and what sets us apart in the market.',
    },
};

export const EllipsizeHeading: Story = {
    args: {
        heading: 'Company Overview',
        headingDescription: 'Learn more about our company and what sets us apart in the market.',
        ellipsizeHeading: true,
    },
};

export const WithIcon: Story = {
    args: {
        heading: 'Introduction',
        icons: <WikiHelpSectionLineIcon />,
    },
};
export const WithAction: Story = {
    args: {
        heading: 'Company Overview',
        headingDescription: 'Learn more about our company and what sets us apart in the market.',
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
