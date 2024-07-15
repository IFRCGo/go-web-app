import {
    SocialFacebookIcon,
    SocialInstagramIcon,
    SocialTwitterIcon,
    SocialYoutubeIcon,
} from '@ifrc-go/icons';
import { FooterProps } from '@ifrc-go/ui';
import type {
    Meta,
    StoryObj,
} from '@storybook/react';

import Footer from './Footer';

type Story = StoryObj<FooterProps>;

const meta: Meta<typeof Footer> = {
    title: 'Components/ Footer',
    component: Footer,
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

function FooterActions() {
    return (
        <div>
            <div className="footer-items">
                <a href="https://www.facebook.com/" aria-label="facebook" className="footer-link">
                    <SocialFacebookIcon />
                </a>
                <a href="https://twitter.com/" aria-label="twitter" className="footer-link">
                    <SocialTwitterIcon />
                </a>
                <a href="https://www.instagram.com/" aria-label="instagram" className="footer-link">
                    <SocialInstagramIcon />
                </a>
                <a href="https://www.youtube.com/" aria-label="youtube" className="footer-link">
                    <SocialYoutubeIcon />
                </a>
            </div>
        </div>
    );
}

function FooterIcons() {
    return (
        <div>
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
        </div>
    );
}

export const Default: Story = {
    args: {
        className: 'footer',
        children: 'IFRC GO Component Library',
        icons: <FooterIcons />,
        actions: <FooterActions />,
    },
};
