import { useState, useCallback } from 'react';
import Button, { Props as ButtonProps } from '#components/Button';
import Modal from '#components/Modal';

export interface Props<NAME> extends ButtonProps<NAME> {
    confirmMessage?: React.ReactNode;
    confirmHeading?: React.ReactNode;
    onClick?: (name: NAME, e: React.MouseEvent<HTMLButtonElement>) => void;
    onConfirm: (name: NAME) => void;
}

function ConfirmButton<NAME>(props: Props<NAME>) {
    const {
        // FIXME: use translations
        confirmHeading = 'Confirmation',
        // FIXME: use translations
        confirmMessage = 'Are you sure you want to continue?',
        name,
        onConfirm,
        onClick,
        ...buttonProps
    } = props;

    const [showConfirmation, setShowConfirmation] = useState(false);

    const handleConfirmClick = useCallback(
        (confirmName: NAME) => {
            setShowConfirmation(false);
            onConfirm(confirmName);
        },
        [onConfirm],
    );

    const handleOnClick = useCallback(
        (confirmName: NAME, e: React.MouseEvent<HTMLButtonElement>) => {
            if (onClick) {
                onClick(confirmName, e);
            }
            setShowConfirmation(true);
        },
        [onClick],
    );

    return (
        <>
            <Button
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...buttonProps}
                name={name}
                onClick={handleOnClick}
            />
            {showConfirmation && (
                <Modal
                    heading={confirmHeading}
                    closeOnEscape={false}
                    size="sm"
                    footerActions={(
                        <>
                            <Button
                                name={false}
                                onClick={setShowConfirmation}
                                variant="secondary"
                                // FIXME: use translations
                            >
                                Cancel
                            </Button>
                            <Button
                                name={name}
                                variant="primary"
                                onClick={handleConfirmClick}
                                // FIXME: use translations
                            >
                                Ok
                            </Button>
                        </>
                    )}
                >
                    {confirmMessage}
                </Modal>
            )}
        </>
    );
}

export default ConfirmButton;
