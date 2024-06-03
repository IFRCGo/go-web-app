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
            const [isOpen, setIsOpen] = useState(false);
            const onClose = useCallback(() => {
                setIsOpen(false);
                if (ctx.args.onClose) {
                    ctx.args.onClose();
                }
            }, [ctx.args]);

            const handleClick = useCallback(() => {
                setIsOpen(true);
            }, []);

            return (
                // eslint-disable-next-line react/jsx-no-useless-fragment
                <>
                    <Button
                        name={undefined}
                        variant="secondary"
                        onClick={handleClick}
                    >
                        Open Modal
                    </Button>
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
        heading: 'Modal',
        children: 'A modal is a user interface element that appears on top of the main content, creating a focused interaction by overlaying the rest of the page.It is typically used to capture user attention for a specific task, such as filling out a form, confirming an action, or displaying critical information.By temporarily blocking interaction with the rest of the application, modals ensure that users complete the necessary action before returning to the main content.Modals enhance user experience by providing a streamlined way to handle interactions that require immediate attention or additional input.',
        footerActions: (
            <>
                <Button
                    name={undefined}
                    variant="secondary"
                    onClick={undefined}
                >
                    Cancel
                </Button>
                <Button
                    name={undefined}
                    variant="primary"
                    onClick={undefined}
                >
                    Submit
                </Button>
            </>
        ),
        closeOnEscape: false,
        withoutCloseButton: false,
        closeOnClickOutside: true,
        size: 'md',
    },
};
