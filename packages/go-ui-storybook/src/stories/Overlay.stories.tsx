import { OverlayProps } from '@ifrc-go/ui';
import type {
    Meta,
    StoryObj,
} from '@storybook/react';

import Overlay from './Overlay';

type OverlaySpecificProps = OverlayProps;

type Story = StoryObj<OverlaySpecificProps>;

const meta: Meta<typeof Overlay> = {
    title: 'Components/Overlay',
    component: Overlay,
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
            const componentArgs = ctx.args as OverlaySpecificProps;
            return (
                <Overlay
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
        children: 'Test',
    },
};

export const Light: Story = {
    args: {
        children: 'Test',
        variant: 'light',
    },
};

export const Dark: Story = {
    args: {
        children: 'Test',
        variant: 'dark',
    },
};
