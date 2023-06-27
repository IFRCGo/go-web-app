import { useState, useCallback } from 'react';
import Button, { Props as ButtonProps } from '#components/Button';
import Modal from '#components/Modal';

interface Props<NAME> extends Omit<ButtonProps<NAME>, 'onClick'>{
    confirmMessage?: React.ReactNode;
    confirmHeading?: React.ReactNode;
    onConfirm: (name: NAME) => void;
}

function ConfirmButton<NAME>(props: Props<NAME>) {
    const {
        confirmHeading,
        confirmMessage,
        name,
        onConfirm,
        // onClick,
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

    return (
        <>
            <Button
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...buttonProps}
                name
                onClick={setShowConfirmation}
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
                            >
                                Cancel
                            </Button>
                            <Button
                                name={name}
                                variant="primary"
                                onClick={handleConfirmClick}
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
