import Button from '#components/Button';
import Description from '#components/Description';
import ListView from '#components/ListView';
import Modal, { type Props as ModalProps } from '#components/Modal';
import useTranslation from '#hooks/useTranslation';

import i18n from './i18n.json';

export interface Props<NAME> extends Omit<ModalProps, 'children' | 'footerActions' | 'name'> {
    name: NAME;
    message?: React.ReactNode;
    cancelLabel?: React.ReactNode;
    confirmLabel?: React.ReactNode;
    disabled?: boolean;
    onCancel: () => void;
    onConfirm: (name: NAME) => void;
}

function ConfirmModal<NAME>(props: Props<NAME>) {
    const strings = useTranslation(i18n);

    const {
        heading = strings.confirmation,
        message = strings.confirmMessage,
        cancelLabel = strings.buttonCancel,
        confirmLabel = strings.buttonOk,
        disabled,
        name,
        onCancel,
        onClose = onCancel,
        onConfirm,
        ...modalProps
    } = props;

    return (
        <Modal
            closeOnEscape={false}
            size="sm"
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...modalProps}
            heading={heading}
            onClose={onClose}
            footerActions={(
                <ListView spacing="sm">
                    <Button
                        name={undefined}
                        onClick={onCancel}
                        disabled={disabled}
                    >
                        {cancelLabel}
                    </Button>
                    <Button
                        name={name}
                        styleVariant="filled"
                        onClick={onConfirm}
                        disabled={disabled}
                    >
                        {confirmLabel}
                    </Button>
                </ListView>
            )}
        >
            <Description>
                {message}
            </Description>
        </Modal>
    );
}

export default ConfirmModal;
