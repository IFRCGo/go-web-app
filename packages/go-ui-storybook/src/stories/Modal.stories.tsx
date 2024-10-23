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
        heading: 'Quotes',
        children: (
            <div>
                <div>
                    But why should we have to be useful and for what reason?
                    Who divided the world into useless and useful, and by what right?
                </div>
                <div>
                    Everyone knows the profit to be reaped from the useful,
                    but nobody knows the benefit to be gained from the useless.
                </div>
                <div>- Olga Tokarczuk</div>
            </div>
        ),
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
