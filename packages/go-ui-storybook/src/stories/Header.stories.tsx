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

type Story = StoryObj<HeaderProps>;

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

export const Default: Story = {
    args: {
        heading: 'Overview of the International Federation of Red Cross and Red Crescent Societies (IFRC)',
        headingDescription: 'The International Federation of Red Cross and Red Crescent Societies (IFRC) is the world’s largest humanitarian network.',
        headingLevel: 2,
        headingContainerClassName: 'header-children',
    },
};

export const WithEllipsizedHeading: Story = {
    args: {
        ...Default.args,
        headingContainerClassName: 'header-ellipsized',
        ellipsizeHeading: true,
    },
};

export const WithWrapHeadingContent: Story = {
    args: {
        ...Default.args,
        wrapHeadingContent: true,
        headingContainerClassName: 'header-children',
        className: 'header-wrapped',
    },
};

export const WithIcon: Story = {
    args: {
        ...Default.args,
        iconsContainerClassName: 'header-icon',
        icons: <WikiHelpSectionLineIcon />,
    },
};

export const WithAction: Story = {
    args: {
        ...Default.args,
        actions: (
            <Button
                name={undefined}
                variant="primary"
            >
                Learn More
            </Button>
        ),
    },
};
