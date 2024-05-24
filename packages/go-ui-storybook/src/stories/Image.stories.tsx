import { ImageProps } from '@ifrc-go/ui';
import type {
    Meta,
    StoryObj,
} from '@storybook/react';

import Image from './Image';

type ImageSpecificProps = ImageProps;

type Story = StoryObj<ImageSpecificProps>;

const meta: Meta<typeof Image> = {
    title: 'Components/Image',
    component: Image,
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
            const componentArgs = ctx.args as ImageSpecificProps;
            return (
                <Image
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
        src: 'https://images.unsplash.com/photo-1655815226495-68d7d78894c4?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        alt: 'Desert landscape with sand dunes',
    },
};

export const WithCaption: Story = {
    args: {
        src: 'https://images.unsplash.com/photo-1655815226495-68d7d78894c4?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        alt: 'Desert landscape with sand dunes',
        caption: "Golden waves of sand stretch endlessly under the scorching sun, painting a timeless portrait of nature's serene beauty.",
    },
};

export const WithCaptionHidden: Story = {
    args: {
        src: 'https://images.unsplash.com/photo-1655815226495-68d7d78894c4?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        alt: 'Desert landscape with sand dunes',
        caption: "Golden waves of sand stretch endlessly under the scorching sun, painting a timeless portrait of nature's serene beauty.",
        withCaptionHidden: true,
    },
};
