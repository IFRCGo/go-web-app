import {
    useCallback,
    useState,
} from 'react';

import Button, { Props as ButtonProps } from '#components/Button';
import Dialog from '#components/Dialog';
import ListView from '#components/ListView';
import useTranslation from '#hooks/useTranslation';

import i18n from './i18n.json';

export interface Props<NAME> extends ButtonProps<NAME> {
    /** Body content of the confirmation dialog */
    confirmMessage?: React.ReactNode;
    /** Heading of the confirmation dialog */
    confirmHeading?: React.ReactNode;
    onClick?: (name: NAME, e: React.MouseEvent<HTMLButtonElement>) => void;
    /** Called with the button name once the user confirms */
    onConfirm: (name: NAME) => void;
}

/**
 * Button that asks for confirmation before acting (specific layer).
 *
 * Extends Button (including its curated `variant` API); `onClick` fires
 * immediately while `onConfirm` only fires after the user accepts the
 * confirmation dialog.
 */
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
                <Dialog
                    heading={confirmHeading}
                    closeOnEscape={false}
                    size="sm"
                    footerActions={(
                        <ListView spacing="sm">
                            <Button
                                name={false}
                                onClick={setShowConfirmation}
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
                        </ListView>
                    )}
                >
                    {confirmMessage}
                </Dialog>
            )}
        </>
    );
}

export default ConfirmButton;
