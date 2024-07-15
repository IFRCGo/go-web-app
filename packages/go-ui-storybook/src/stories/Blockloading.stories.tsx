import type {
    Meta,
    StoryObj,
} from '@storybook/react';

import BlockLoading from './BlockLoading';

const meta = {
    title: 'Components/BlockLoading',
    component: BlockLoading,
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
} satisfies Meta<typeof BlockLoading>;

export default meta;
type Story = StoryObj<typeof BlockLoading>;

export const Default : Story = {
    args: {
        message: 'Loading...',
    },
};

export const Compact : Story = {
    args: {
        ...Default.args,
        compact: true,
    },
};

export const WithoutBorder : Story = {
    args: {
        ...Default.args,
        withoutBorder: true,
    },
};
