import { WikiHelpSectionLineIcon } from '@ifrc-go/icons';
import type {
    Meta,
    StoryObj,
} from '@storybook/react';

import KeyFigure from './KeyFigure';

type Story = StoryObj<typeof KeyFigure>

const meta: Meta<typeof KeyFigure> = {
    title: 'Components/KeyFigure',
    component: KeyFigure,
    parameters: {
        layout: 'centered',
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/myeW85ibN5p2SlnXcEpxFD/IFRC-GO---UI-Current---1?type=design&node-id=0-4957&mode=design&t=KwxbuoUQxqcLyZbG-0',
            allowFullscreen: true,
        },
    },
    tags: ['autodocs'],
    argTypes: {},
};

export default meta;

export const Default: Story = {
    args: {
        value: 500,
        description: 'Targeted population',
    },
};
export const WithProgress: Story = {
    args: {
        value: 500,
        description: 'Funding Requirements',
        progress: 50,
        progressDescription: '50% received',
    },
};
export const WithIconAndInfo: Story = {
    args: {
        value: 800,
        label: 'Targeted Population',
        description: 'Funding Requirements',
        progress: 22,
        progressDescription: '22% received',
        icon: <WikiHelpSectionLineIcon />,
        info: 'AFRICA - HUNGER CRISIS',
        children: 'Last updated:2023-10-06',
    },
};
