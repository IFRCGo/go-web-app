import {
    useCallback,
    useState,
} from 'react';

import Button, { Props as ButtonProps } from '#components/Button';
import ConfirmModal from '#components/ConfirmModal';

export interface Props<NAME> extends ButtonProps<NAME> {
    confirmMessage?: React.ReactNode;
    confirmHeading?: React.ReactNode;
    onClick?: (name: NAME, e: React.MouseEvent<HTMLButtonElement>) => void;
    onConfirm: (name: NAME) => void;
}

function ConfirmButton<NAME>(props: Props<NAME>) {
    const {
        confirmHeading,
        confirmMessage,
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

    const handleCancelClick = useCallback(
        () => {
            setShowConfirmation(false);
        },
        [],
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
                <ConfirmModal
                    name={name}
                    heading={confirmHeading}
                    message={confirmMessage}
                    onCancel={handleCancelClick}
                    onConfirm={handleConfirmClick}
                />
            )}
        </>
    );
}

export default ConfirmButton;
