import {
    Tab,
    TabList,
    TabPanel,
    TabsProps,
} from '@ifrc-go/ui';
import { useArgs } from '@storybook/preview-api';
import type {
    Meta,
    StoryObj,
} from '@storybook/react';

import Tabs from './Tabs';

type TabsSpecificProps = TabsProps<string[] | undefined>

type Story = StoryObj< TabsSpecificProps>;

const meta: Meta<typeof Tabs> = {
    title: 'Components/ Tabs',
    component: Tabs,
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
            const [
                { value },
                updateArgs,
            ] = useArgs<{ value:string[] | undefined}>();
            const componentArgs = ctx.args as TabsSpecificProps;
            const onChange = (e: string[]) => {
                updateArgs({ value: e });
            };

            return (
                <Tabs
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...componentArgs}
                    onChange={onChange}
                    value={value || []}
                />

            );
        },
    ],
};
export default meta;

const children = (
    <>
        <TabList>
            <Tab name="Tab1">
                Home
            </Tab>
            <Tab name="Tab2">
                Profile
            </Tab>
            <Tab name="Tab3">
                Notifications
            </Tab>
        </TabList>

        <TabPanel name="Tab1" />
        <TabPanel
            name="Tab2"
        />
        <TabPanel
            name="Tab3"
        />
    </>
);

export const Default: Story = {
    args: {
        children,
        value: ['Tab1'],

    },
};

export const Primary: Story = {
    args: {
        children,
        variant: 'primary',
        value: ['Tab1'],

    },
};

export const Secondary: Story = {
    args: {
        children,
        variant: 'secondary',
        value: ['Tab1'],

    },
};

export const Tertiary: Story = {
    args: {
        children,
        variant: 'tertiary',
        value: ['Tab1'],

    },
};

export const Step: Story = {
    args: {
        children,
        variant: 'step',
        value: ['Tab1'],

    },
};

export const Vertical: Story = {
    args: {
        children,
        variant: 'vertical',
        value: ['Tab1'],

    },
};

export const VerticalCompact: Story = {
    args: {
        children,
        variant: 'vertical-compact',
        value: ['Tab1'],

    },
};

export const Disabled: Story = {
    args: {
        children,
        value: ['Tab1'],
        disabled: true,

    },
};
