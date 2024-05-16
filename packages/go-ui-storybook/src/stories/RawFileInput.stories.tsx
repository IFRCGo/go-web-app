import { DownloadTwoLineIcon } from '@ifrc-go/icons';
import { RawFileInputProps } from '@ifrc-go/ui';
import type {
    Meta,
    StoryObj,
} from '@storybook/react';

import RawFileInput from './RawFileInput';

type RawFileInputSpecificProps = RawFileInputProps<string>;

type Story = StoryObj<RawFileInputSpecificProps>;

const meta: Meta<typeof RawFileInput > = {
    title: 'Components/RawFileInput',
    component: RawFileInput,
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
            const componentArgs = ctx.args as RawFileInputSpecificProps;
            const onChange = () => {};

            return (
                <RawFileInput
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...componentArgs}
                    onChange={onChange}
                    name="RawFileInput"

                />
            );
        },
    ],
};

export default meta;

export const Default: Story = {
    args: {
        name: 'RawFileInput',
        children: <DownloadTwoLineIcon />,
    },
};

export const Multiple: Story = {
    args: {
        name: 'RawFileInput',
        children: 'Export',
        multiple: true,
    },
};

export const ReadOnly: Story = {
    args: {
        name: 'RawFileInput',
        children: 'Export',
        readOnly: true,
    },
};

export const Disabled: Story = {
    args: {
        name: 'RawFileInput',
        children: 'Export',
        disabled: true,
    },
};
