import {
    useCallback,
    useState,
} from 'react';
import { _cs } from '@togglecorp/fujs';

import Button, { Props as ButtonProps } from '#components/Button';
import Modal from '#components/Modal';
import useTranslation from '#hooks/useTranslation';

import i18n from './i18n.json';
import styles from './styles.module.css';

export interface Props<NAME> extends ButtonProps<NAME> {
    confirmMessage?: React.ReactNode;
    confirmHeading?: React.ReactNode;
    onClick?: (name: NAME, e: React.MouseEvent<HTMLButtonElement>) => void;
    onConfirm: (name: NAME) => void;
    disabled?: boolean;
    className?: string;
}

function ConfirmButton<NAME>(props: Props<NAME>) {
    const strings = useTranslation(i18n);

    const {
        confirmHeading = strings.confirmation,
        confirmMessage = strings.confirmMessage,
        name,
        onConfirm,
        onClick,
        disabled,
        className,
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
                className={_cs(className, disabled && styles.disabled)}
                name={name}
                onClick={handleOnClick}
                disabled={disabled}
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
                                variant="tertiary"
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
