import type {
    Meta,
    StoryObj,
} from '@storybook/react';

import InputHint from './InputHint';

const meta = {
    title: 'Components/InputHint',
    component: InputHint,
    parameters: {
        layout: 'centered',
        design: {
            type: 'figma',
            url: ' https://www.figma.com/file/myeW85ibN5p2SlnXcEpxFD/IFRC-GO---UI-Current---1?type=design&node-id=0-4957&mode=design&t=KwxbuoUQxqcLyZbG-0',
            allowFullscreen: true,
        },
    },
    tags: ['autodocs'],
    argTypes: {},
} satisfies Meta<typeof InputHint>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        children: 'Enter your information in the provided field.',
    },
};
