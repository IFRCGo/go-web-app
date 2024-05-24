import { PageContainerProps } from '@ifrc-go/ui';
import type {
    Meta,
    StoryObj,
} from '@storybook/react';

import PageConatainer from './PageContainer';

type PageConatainerSpecificProps = PageContainerProps;

type Story = StoryObj<PageConatainerSpecificProps>;

const meta: Meta<typeof PageConatainer> = {
    title: 'Components/PageConatainer',
    component: PageConatainer,
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
        children: 'Content goes here',
        contentAs: 'div',
        containerAs: 'div',
    },
};

export const WithNav: Story = {
    args: {
        children: 'Content goes here',
        contentAs: 'nav',
        containerAs: 'nav',
    },
};

export const Header: Story = {
    args: {
        children: 'Content goes here',
        contentAs: 'header',
        containerAs: 'header',
    },
};

export const Footer: Story = {
    args: {
        children: 'Content goes here',
        contentAs: 'footer',
        containerAs: 'footer',
    },
};

export const Main: Story = {
    args: {
        children: 'Content goes here',
        contentAs: 'main',
        containerAs: 'main',
    },
};
