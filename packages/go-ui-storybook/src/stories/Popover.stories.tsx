import { PopoverProps } from '@ifrc-go/ui';
import { useRef } from '@storybook/preview-api';
import type {
    Meta,
    StoryObj,
} from '@storybook/react';

import Popover from './Popover';

type PopoverSpecificProps = PopoverProps;

type Story = StoryObj<PopoverSpecificProps>;

const meta: Meta<typeof Popover> = {
    title: 'Components/Popover',
    component: Popover,
    parameters: {
        layout: 'centered',
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/myeW85ibN5p2SlnXcEpxFD/IFRC-GO---UI-Current---1?type=design&node-id=0-4957&mode=design&t=KwxbuoUQxqcLyZbG-0',
        },
    },
    tags: ['autodocs'],
};

// eslint-disable-next-line react/function-component-definition
export const Default: Story = () => {
    const containerRef = useRef<HTMLDivElement | null>(null);

    return (
        <div>
            <div ref={containerRef}>Popover</div>
            <Popover parentRef={containerRef}>
                <div style={{ padding: '20px' }}>
                    This is the popover message
                </div>
            </Popover>
        </div>
    );
};

Default.args = {
    preferredWidth: 1,
};

export default meta;
