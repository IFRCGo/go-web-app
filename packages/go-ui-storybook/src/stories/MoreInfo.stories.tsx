import { MoreInfoProps } from '@ifrc-go/ui';
import type {
    Meta,
    StoryObj,
} from '@storybook/react';

import MoreInfo from './MoreInfo';

type Story = StoryObj<MoreInfoProps>;

const meta: Meta<typeof MoreInfo> = {
    title: 'Components/MoreInfo',
    component: MoreInfo,
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
        title: 'Important Update',
        children: 'Stay informed with the latest updates and announcements. Please read through the details and take necessary actions. Thank you!',
    },
};

export const WithLabel: Story = {
    args: {
        ...Default.args,
        label: 'Notice',
    },
};
