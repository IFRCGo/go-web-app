import { PERExportButtonProps } from '@ifrc-go/ui';
import type {
    Meta,
    StoryObj,
} from '@storybook/react';

import PERExportButton from './PERExportButton';

const meta: Meta<typeof PERExportButton> = {
    title: 'Components/PERExportButton',
    component: PERExportButton,
    parameters: {
        layout: 'centered',
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/k9SOqgh5jk9PxzuBKdMKsA/IFRC-GO---UI-Library',
        },
    },
    argTypes: {
        /*
        onClick: {
            description: 'Callback when button is clicked',
        },
        */
        disabled: {
            description: 'Whether the button is disabled',
            control: 'boolean',
        },
        /*
        label: {
            description: 'Button label text',
            control: 'text',
        },
        */
    },
    args: {
        // onClick: fn(),
    },
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

function Template(args: PERExportButtonProps) {
    return (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <PERExportButton {...args} />
    );
}

export const Default: Story = {
    render: Template,
    args: {
        // label: 'Export',
    },
};

export const Disabled: Story = {
    render: Template,
    args: {
        // label: 'Export',
        disabled: true,
    },
};

export const CustomLabel: Story = {
    render: Template,
    args: {
        // label: 'Download Report',
    },
};
