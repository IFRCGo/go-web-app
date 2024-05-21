import { InputSectionProps } from '@ifrc-go/ui';
import type {
    Meta,
    StoryObj,
} from '@storybook/react';

import InputSection from './InputSection';

type InputSectionSpecificProps = InputSectionProps;

type Story = StoryObj<InputSectionSpecificProps>;

const meta: Meta<typeof InputSection> = {
    title: 'Components/InputSection',
    component: InputSection,
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
        title: 'Introduction',
        description: 'Discover the range of services we offer and how they can meet your needs',
    },
};
export const NumPreferredColumns: Story = {
    args: {
        title: 'Introduction',
        description: 'Discover the range of services we offer and how they can meet your needs',
        numPreferredColumns: 2,
    },
};

export const WithAsteriskOnTitle: Story = {
    args: {
        title: 'Introduction',
        description: 'Discover the range of services we offer and how they can meet your needs',
        numPreferredColumns: 3,
        withAsteriskOnTitle: true,
    },
};

export const Tooltip: Story = {
    args: {
        title: 'Introduction',
        description: 'Discover the range of services we offer and how they can meet your needs',
        numPreferredColumns: 2,
        tooltip: 'Stay informed with our latest insight.',

    },
};

export const WithoutPadding: Story = {
    args: {
        title: 'Introduction',
        description: 'Discover the range of services we offer and how they can meet your needs',
        numPreferredColumns: 2,
        withoutPadding: true,
    },
};
