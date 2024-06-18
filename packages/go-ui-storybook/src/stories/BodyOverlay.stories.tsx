import { BodyOverlayProps } from '@ifrc-go/ui';
import type {
    Meta,
    StoryObj,
} from '@storybook/react';

import BodyOverlay from './BodyOverlay';

type Story = StoryObj<BodyOverlayProps>;

const meta: Meta<typeof BodyOverlay> = {
    title: 'Components/BodyOverlay',
    component: BodyOverlay,
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
        className: 'BodyOverlay',
        children: 'Test',
    },
};
