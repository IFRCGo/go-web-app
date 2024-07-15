import type {
    Meta,
    StoryObj,
} from '@storybook/react';

import HtmlOutput from './HtmlOutput';

type Story = StoryObj<typeof HtmlOutput>;

const meta: Meta<typeof HtmlOutput> = {
    title: 'Components/HtmlOutput',
    component: HtmlOutput,
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
        value: '<p>IFRC GO aims to make all disaster information universally accessible and useful to IFRC responders for better decision making.</p>',
    },
};

export const WithImage: Story = {
    args: {
        value: `
            <p>IFRC GO aims to make all disaster information universally accessible and useful to IFRC responders for better decision making.</p>
            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRgbrM1jom-4qX5O5NM1tAcLa7ckXcBkao-KbaIFsQNVzLsNBNYewNPeJD_mC0N7FFzwHM&usqp=CAU"/>
        `,
    },
};
