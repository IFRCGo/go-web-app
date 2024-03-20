import { RawTextAreaProps } from '@ifrc-go/ui';
import { useArgs } from '@storybook/preview-api';
import type {
    Meta,
    StoryObj,
} from '@storybook/react';

import RawTextArea from './RawTextArea';

type RawTextAreaSpecificProps = RawTextAreaProps<string>;

type Story = StoryObj<RawTextAreaSpecificProps>;

const meta: Meta<typeof RawTextArea> = {
    title: 'Components/RawTextArea',
    component: RawTextArea,
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
                setArgs,
            ] = useArgs<{ value: string | null | undefined }>();
            const onChange = (val:string| undefined, name: string) => {
                setArgs({ value: val });
                if (ctx.args && ctx.args.onChange) {
                    ctx.args.onChange((val), name);
                }
            };

            return (
                <RawTextArea
                // eslint-disable-next-line react/jsx-props-no-spreading
                    {...ctx.args}
                    onChange={onChange}
                    value={value}
                    name="RawTextArea"
                />
            );
        },
    ],
};

export default meta;
export const Default: Story = {
    args: {
        name: 'Raw-text Area',
        value: 'This is Rawtext-area',
    },
};
