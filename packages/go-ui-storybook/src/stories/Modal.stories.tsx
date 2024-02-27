import {
    useCallback,
    useState,
} from 'react';
import {
    Button,
    ModalProps,
} from '@ifrc-go/ui';
import type {
    Meta,
    StoryObj,
} from '@storybook/react';

import Modal from './Modal';

type ModalSpecificProps = ModalProps;

type Story = StoryObj<typeof Modal>;

const meta: Meta<ModalSpecificProps> = {
    title: 'Components/Modal',
    component: Modal,
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
            const [isOpen, setIsOpen] = useState(true);
            const onClose = useCallback(() => {
                setIsOpen(false);
                if (ctx.args.onClose) {
                    ctx.args.onClose();
                }
            }, [ctx.args]);

            return (
                // eslint-disable-next-line react/jsx-no-useless-fragment
                <>
                    {isOpen && (
                        <Modal
                            // eslint-disable-next-line react/jsx-props-no-spreading
                            {...ctx.args}
                            onClose={onClose}
                        >
                            <p>{ctx.args.children}</p>
                        </Modal>
                    )}
                </>
            );
        },
    ],
};

export default meta;

export const Default: Story = {
    args: {
        heading: 'Heading',
        children: 'You are about  to submit the result of PER  work plan. once submitted, you will  be  redirected  to the accout page.',
        closeOnEscape: false,
        withoutCloseButton: false,
        closeOnClickOutside: true,
        size: 'sm',
        footerContent: 'Footer'
    },
};
