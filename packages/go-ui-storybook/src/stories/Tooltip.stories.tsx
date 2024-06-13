import { TooltipProps } from '@ifrc-go/ui';
import type {
    Meta,
    StoryObj,
} from '@storybook/react';

import Tooltip from './Tooltip';

type TooltipSpecificProps = TooltipProps;

type Story = StoryObj<TooltipSpecificProps>;

const meta: Meta<typeof Tooltip> = {
    title: 'Components/Tooltip',
    component: Tooltip,
    parameters: {
        layout: 'centered',
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/k9SOqgh5jk9PxzuBKdMKsA/IFRC-GO---UI-Library?node-id=13837-218961&t=rxFDpy4yPC2JaFiF-4',
        },
    },
    tags: ['autodocs'],
};

export default meta;

// eslint-disable-next-line react/function-component-definition
export const Default: Story = () => (
    <div>
        <h2>Download</h2>
        <Tooltip
            title="Download"
            preferredWidth={10}
        />
    </div>
);
Default.args = {
    title: 'Download',
};
