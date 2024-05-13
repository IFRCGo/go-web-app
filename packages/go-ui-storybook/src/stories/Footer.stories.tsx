import { FooterProps } from '@ifrc-go/ui';
import type {
    Meta,
    StoryObj,
} from '@storybook/react';

import Footer from './Footer';

type FooterSpecificProps = FooterProps;

type Story = StoryObj< FooterSpecificProps>;

const meta: Meta<typeof Footer> = {
    title: 'Components/ Footer',
    component: Footer,
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
        children: 'Footer',
    },
};

export const WithNoChildren: Story = {
    args: {
        className: 'custom-footer',
    },
};

export const WithSpacing: Story = {
    args: {
        children: 'Footer',
        spacing: 'comfortable',

    },
};
