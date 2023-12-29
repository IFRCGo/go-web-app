import {
    useCallback,
    useState,
} from 'react';

import Button, { Props as ButtonProps } from '#components/Button';
import Modal from '#components/Modal';
import useTranslation from '#hooks/useTranslation';

import i18n from './i18n.json';

export interface Props<NAME> extends ButtonProps<NAME> {
    confirmMessage?: React.ReactNode;
    confirmHeading?: React.ReactNode;
    onClick?: (name: NAME, e: React.MouseEvent<HTMLButtonElement>) => void;
    onConfirm: (name: NAME) => void;
}

function ConfirmButton<NAME>(props: Props<NAME>) {
    const strings = useTranslation(i18n);

    const {
        confirmHeading = strings.confirmation,
        confirmMessage = strings.confirmMessage,
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
                            >
                                {strings.buttonCancel}
                            </Button>
                            <Button
                                name={name}
                                variant="primary"
                                onClick={handleConfirmClick}
                            >
                                {strings.buttonOk}
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
