import { SwitchProps } from '@ifrc-go/ui';
import { useArgs } from '@storybook/preview-api';
import type {
    Args,
    Meta,
    StoryObj,
} from '@storybook/react';
import { fn } from '@storybook/test';

import Switch from './Switch';

type SwitchSpecificProps = SwitchProps<string>;

type Story = StoryObj<SwitchSpecificProps>;

const meta: Meta<typeof Switch> = {
    title: 'Components/ Switch',
    component: Switch,
    parameters: {
        layout: 'centered',
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/k9SOqgh5jk9PxzuBKdMKsA/IFRC-GO---UI-Library?node-id=14405-193575&t=pARdc5n4ifPxahdr-4',
        },
    },
    args: {
        onChange: fn(),
    },
    tags: ['autodocs'],
};

export default meta;

function Template(args:Args) {
    const [
        { value },
        updateArgs,
    ] = useArgs();

    const onChange = (
        newValue: boolean | undefined,
    ) => {
        updateArgs({ value: newValue });
    };
    return (
        <Switch
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...args}
            value={value}
            onChange={onChange}
            name="switch-input"
        />
    );
}

export const Default: Story = {
    render: Template,
    args: {
        label: 'Enable notifications',
        value: false,
    },
    parameters: {
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/k9SOqgh5jk9PxzuBKdMKsA/IFRC-GO---UI-Library?node-id=14405-193575&t=pARdc5n4ifPxahdr-4',
            allowFullscreen: false,
        },
    },
};

export const Disabled: Story = {
    render: Template,
    args: {
        label: 'Enable notifications',
        value: false,
        disabled: true,
    },
};

export const Checked: Story = {
    render: Template,
    args: {
        label: 'Enable notifications',
        value: true,
    },
    parameters: {
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/k9SOqgh5jk9PxzuBKdMKsA/IFRC-GO---UI-Library?node-id=14405-193576&t=pARdc5n4ifPxahdr-4',
            allowFullscreen: false,
        },
    },
};
