import { TextInput } from '@ifrc-go/ui';
import type {
    Meta,
    StoryObj,
} from '@storybook/react';
import { fn } from '@storybook/test';

import InputSection, { InputSectionProps } from './InputSection';

const meta: Meta<typeof InputSection> = {
    title: 'Inputs/InputSection',
    component: InputSection,
};

export default meta;

type Story = StoryObj<InputSectionProps>;

function Items(length: number) {
    return (
        <>
            {Array.from({ length }, (_, i) => (
                <TextInput
                    name={undefined}
                    onChange={fn()}
                    value={undefined}
                    placeholder={`Item ${i + 1}`}
                    key={i}
                />

            ))}
        </>
    );
}

export const Default: Story = {
    args: {
        title: 'Section Title',
        description: 'This is a helpful description for the section.',
        children: Items(1),
    },
};

export const WithTooltip: Story = {
    args: {
        title: 'Section With Tooltip',
        description: 'Hover the info icon to see details.',
        tooltip: 'Additional contextual information goes here.',
        children: Items(1),
    },
};

export const RequiredSection: Story = {
    args: {
        title: 'Required Section',
        description: 'Fields marked with * are mandatory.',
        withAsteriskOnTitle: true,
        children: Items(1),
    },
};

export const TwoColumns: Story = {
    args: {
        title: 'Two Column Layout',
        description: 'Children arranged in two columns.',
        numPreferredColumns: 2,
        children: Items(4),
    },
};

export const FourColumns: Story = {
    args: {
        title: 'Four Column Layout',
        numPreferredColumns: 4,
        children: Items(8),
    },
};

export const WithoutTitle: Story = {
    args: {
        withoutTitleSection: true,
        children: Items(1),
    },
};

export const FullWidthContent: Story = {
    args: {
        title: 'Full Width Content',
        description: 'Content spans full width instead of sidebar layout.',
        withFullWidthContent: true,
        children: Items(1),
    },
};

export const WithoutPadding: Story = {
    args: {
        title: 'No Padding',
        description: 'Container padding removed.',
        withoutPadding: true,
        children: Items(1),
    },
};

export const WithoutBackground: Story = {
    args: {
        title: 'No Background',
        description: 'Background styling removed.',
        withoutBackground: true,
        children: Items(1),
    },
};

export const WithShadow: Story = {
    args: {
        title: 'Shadowed Section',
        description: 'Container shadow enabled.',
        withShadow: true,
        children: Items(1),
    },
};
