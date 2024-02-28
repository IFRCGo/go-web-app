import { TextOutputProps } from '@ifrc-go/ui';
import type {
    Meta,
    StoryObj,
} from '@storybook/react';

import TextOutput from './TextOutput';

type TextOutputSpecificProps = TextOutputProps;

type Story = StoryObj<TextOutputSpecificProps>;

const meta: Meta<typeof TextOutput> = {
    title: 'Components/TextOutput',
    component: TextOutput,
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
        label: 'Name',
        value: 'John Doe',
    },
};

export const WithNumberValue: Story = {
    args: {
        label: 'Total Budget',
        valueType: 'number',
        value: 45000000,
    },
};

export const DateValue: Story = {
    args: {
        label: 'Today',
        valueType: 'date',
        value: 1624888295037,
    },
};

export const WithBooleanValue: Story = {
    args: {
        label: 'Is Active',
        value: true,
        valueType: 'boolean',
    },
};

export const WithDateValue: Story = {
    args: {
        label: 'Birth Date',
        value: new Date(1990, 1, 1),
        valueType: 'date',
    },
};

export const WithNullValue: Story = {
    args: {
        label: 'Undefined Value',
        value: null,
        valueType: 'text',
    },
};
export const Nested: Story = {
    args: {
        label: 'Recently Active',
        value: (
            <>
                <TextOutput
                    value="Max Planck"
                    description="April 24, 1947"
                />
                <TextOutput
                    value="Albert Einstien"
                    description="April 18, 1955"
                />
                <TextOutput
                    value="Erwin Schrodinger"
                    description="January 4, 1961"
                />
            </>
        ),
    },
};
