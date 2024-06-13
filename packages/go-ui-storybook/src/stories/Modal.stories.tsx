import {
    useCallback,
    useState,
} from 'react';
import {
    Button,
    ModalProps,
} from '@ifrc-go/ui';
import { useArgs } from '@storybook/preview-api';
import type {
    Args,
    Meta,
    StoryObj,
} from '@storybook/react';
import { fn } from '@storybook/test';

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
            url: 'https://www.figma.com/file/k9SOqgh5jk9PxzuBKdMKsA/IFRC-GO---UI-Library?node-id=14757-182346&t=rxFDpy4yPC2JaFiF-4',
        },
    },
    args: {
        onClose: fn(),
    },
    tags: ['autodocs'],
};

export default meta;

function Template(args:Args) {
    const [isOpen, setIsOpen] = useState(false);
    const [
        {
            onClose,
        },
    ] = useArgs();

    const handleClick = useCallback(() => {
        setIsOpen(true);
    }, []);

    const handleClose = useCallback(() => {
        setIsOpen(false);
        onClose();
    }, [onClose]);
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
                    {...args}
                    onClose={handleClose}
                />
            )}
        </>
    );
}

export const Default: Story = {
    render: Template,
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
