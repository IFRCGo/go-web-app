import { NavigationTabListProps } from '@ifrc-go/ui';
import type {
    Meta,
    StoryObj,
} from '@storybook/react';

import NavigationTabList from './NavigationTabList';

type NavigationTabListSpecificProps = NavigationTabListProps;

type Story = StoryObj<NavigationTabListSpecificProps>;

const meta: Meta<typeof NavigationTabList> = {
    title: 'Components/NavigationTabList',
    component: NavigationTabList,
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
        children: [
            <div key="home">Home</div>,
            <div key="about">About</div>,
            <div key="services">Services</div>,
            <div key="contacts">Contact</div>,
        ],
        styleVariant: 'nav',
        colorVariant: 'primary',
    },
};

export const Primary: Story = {
    args: {
        ...Default.args,
        styleVariant: 'nav',
        colorVariant: 'primary',
    },
};

export const Secondary: Story = {
    args: {
        ...Default.args,
        styleVariant: 'nav',
        colorVariant: 'secondary',
    },
};

export const Tertiary: Story = {
    args: {
        ...Default.args,
        styleVariant: 'pill',
    },
};

export const Step: Story = {
    args: {
        ...Default.args,
        styleVariant: 'step',
    },
};

export const Vertical: Story = {
    args: {
        ...Default.args,
        styleVariant: 'vertical',
    },
};
