import { TooltipProps } from '@ifrc-go/ui';
import type {
    Args,
    Meta,
    StoryObj,
} from '@storybook/react';

import Tooltip from './Tooltip';

type Story = StoryObj<TooltipProps>;

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

function Template(args:Args) {
    return (
        <div>
            <div>Help</div>
            <Tooltip
                {...args} // eslint-disable-line react/jsx-props-no-spreading
            />
        </div>
    );
}

export const Default: Story = {
    render: Template,
    args: {
        title: 'Need help?',
        description: 'Click here to access our help documentation and support resources.',
        preferredWidth: 20,
    },
};
