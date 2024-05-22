import { InfoPopupProps } from '@ifrc-go/ui';
import type {
    Meta,
    StoryObj,
} from '@storybook/react';

import InfoPopup from './InfoPopup';

type InfoPopupSpecificProps = InfoPopupProps;

type Story = StoryObj<InfoPopupSpecificProps>;

const meta: Meta<typeof InfoPopup> = {
    title: 'Components/InfoPopup',
    component: InfoPopup,
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
        title: 'Test',
    },
};
export const WithDescription: Story = {
    args: {
        title: 'Test',
        description: 'All the Test are Listed below',
    },
};
export const Infolabel: Story = {
    args: {
        title: 'Test',
        description: 'All the Test are Listed below',
        infoLabel: 'DREF',
    },
};
