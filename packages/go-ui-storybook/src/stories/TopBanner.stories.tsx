import { TopBannerProps } from '@ifrc-go/ui';
import type {
    Meta,
    StoryObj,
} from '@storybook/react';

import TopBanner from './TopBanner';

type TopBannerSpecificProps = TopBannerProps;

type Story = StoryObj<TopBannerSpecificProps>;

const meta: Meta<typeof TopBanner> = {
    title: 'Components/TopBanner',
    component: TopBanner,
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
            const componentArgs = ctx.args as TopBannerSpecificProps;
            return (
                <TopBanner
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
        className: 'TopBanner',
        children: 'This is a warning',
    },
};

export const Warning: Story = {
    args: {
        className: 'TopBanner',
        children: 'This is a warning',
        variant: 'warning',
    },
};

export const Negative: Story = {
    args: {
        className: 'TopBanner',
        children: 'This is a danger ',
        variant: 'negative',
    },
};

export const Positive: Story = {
    args: {
        className: 'TopBanner',
        children: 'This is a Success ',
        variant: 'positive',
    },
};

export const Information: Story = {
    args: {
        className: 'TopBanner',
        children: 'This is an information',
        variant: 'information',
    },
};
