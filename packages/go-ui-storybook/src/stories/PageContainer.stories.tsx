import {
    Footer,
    Header,
    PageContainerProps,
} from '@ifrc-go/ui';
import type {
    Meta,
    StoryObj,
} from '@storybook/react';

import PageContainer from './PageContainer';

type Story = StoryObj<PageContainerProps>;

const meta: Meta<typeof PageContainer> = {
    title: 'Components/PageContainer',
    component: PageContainer,
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
        children: (
            <div className="page-container">
                <div className="page-container-header">
                    Header
                </div>
                <div className="page-container-main">
                    Main
                </div>
                <div className="page-container-footer">
                    Footer
                </div>
            </div>
        ),
        contentAs: 'div',
        containerAs: 'div',
    },
};

export const WithNavigation: Story = {
    args: {
        children: (
            <nav className="footer-items">
                <a href="/" className="footer-text">
                    Home
                </a>
                <a href="/" className="footer-text">
                    About
                </a>
                <a href="/" className="footer-text">
                    Services
                </a>
                <a href="/" className="footer-text">
                    Contact
                </a>
            </nav>
        ),
        contentAs: 'nav',
        containerAs: 'div',
    },
};

export const WithHeader: Story = {
    args: {
        children: (
            <Header
                heading="Overview of the International Federation of Red Cross and Red Crescent Societies (IFRC)"
            />
        ),
        contentAs: 'header',
        containerAs: 'header',
    },
};

export const WithFooter: Story = {
    args: {
        children: (
            <Footer>
                <div className="footer-items">
                    <a href="/" className="footer-text">
                        Home
                    </a>
                    <a href="/" className="footer-text">
                        About
                    </a>
                    <a href="/" className="footer-text">
                        Services
                    </a>
                    <a href="/" className="footer-text">
                        Contact
                    </a>
                </div>
            </Footer>
        ),
        contentAs: 'footer',
        containerAs: 'footer',
    },
};
