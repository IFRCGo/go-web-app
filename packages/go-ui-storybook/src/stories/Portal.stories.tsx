import {
    Button,
    PortalProps,
} from '@ifrc-go/ui';
import type {
    Meta,
    StoryObj,
} from '@storybook/react';

import Portal from './Portal';

type PortalSpecificProps = PortalProps;

type Story = StoryObj<PortalSpecificProps>;

const meta: Meta<typeof Portal> = {
    title: 'Components/Portal',
    component: Portal,
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
            const componentArgs = ctx.args as PortalSpecificProps;
            return (
                <Portal
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
        children: [
            <Button
                name={undefined}
                variant="primary"
            >
                Save
            </Button>,
        ],
        portalKey: 'test',
    },
};
