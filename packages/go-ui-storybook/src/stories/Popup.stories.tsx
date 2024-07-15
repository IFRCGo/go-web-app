import { PopupProps } from '@ifrc-go/ui';
import { useRef } from '@storybook/preview-api';
import type {
    Meta,
    StoryObj,
} from '@storybook/react';

import Popup from './Popup';

type PopupSpecificProps = PopupProps;

type Story = StoryObj<PopupSpecificProps>;

const meta: Meta<typeof Popup> = {
    title: 'Components/Popup',
    component: Popup,
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
            <div ref={containerRef}>Popup</div>
            <Popup parentRef={containerRef}>
                <div style={{ padding: '20px' }}>
                    This is the popup message
                </div>
            </Popup>
        </div>
    );
};

Default.args = {
    preferredWidth: 1,
};

export default meta;
