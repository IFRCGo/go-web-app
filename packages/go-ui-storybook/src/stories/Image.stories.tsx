import { ImageProps } from '@ifrc-go/ui';
import type {
    Meta,
    StoryObj,
} from '@storybook/react';

import Image from './Image';

type Story = StoryObj<ImageProps>;

const meta: Meta<typeof Image> = {
    title: 'Components/Image',
    component: Image,
    parameters: {
        layout: 'centered',
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/k9SOqgh5jk9PxzuBKdMKsA/IFRC-GO---UI-Library?node-id=14406-193651&t=pARdc5n4ifPxahdr-4',
        },
    },
    tags: ['autodocs'],
    decorators: [(Story) => (
        <div className="image-container">
            <Story />
        </div>
    )],
};

export default meta;

export const Default: Story = {
    args: {
        className: 'image',
        src: 'https://images.unsplash.com/photo-1655815226495-68d7d78894c4?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        alt: 'Desert landscape with sand dunes',
    },
};

export const WithCaption: Story = {
    args: {
        ...Default.args,
        caption: "Golden waves of sand stretch endlessly under the scorching sun, painting a timeless portrait of nature's serene beauty.",
    },
};

export const WithCaptionHidden: Story = {
    args: {
        ...Default.args,
        alt: 'Desert landscape with sand dunes',
        caption: "Golden waves of sand stretch endlessly under the scorching sun, painting a timeless portrait of nature's serene beauty.",
        withCaptionHidden: true,
    },
};
