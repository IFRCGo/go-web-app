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
        children: [<div>Test</div>],
        variant: 'primary',
    },
};

export const Primary: Story = {
    args: {
        children: [<div>Test</div>],
        variant: 'primary',
    },
};

export const Secondary: Story = {
    args: {
        children: [<div>Test</div>],
        variant: 'secondary',
    },
};

export const Tertiary: Story = {
    args: {
        children: [<div>Test</div>],
        variant: 'tertiary',
    },
};

export const Step: Story = {
    args: {
        children: [<div>Test</div>],
        variant: 'step',
    },
};

export const Vertical: Story = {
    args: {
        children: [<div>Test</div>],
        variant: 'vertical',
    },
};
