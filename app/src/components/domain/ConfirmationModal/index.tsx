import {
    Button,
    Description,
    ListView,
    Modal,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';

import i18n from './i18n.json';

interface Props {
    heading?: React.ReactNode;
    message: React.ReactNode;
    cancelButtonLabel?: string;
    confirmButtonLabel?: string;
    onCancel: () => void;
    onConfirm: () => void;
    disabled?: boolean;
}

function ConfirmationModal(props: Props) {
    const {
        heading,
        message,
        cancelButtonLabel,
        confirmButtonLabel,
        onCancel,
        onConfirm,
        disabled,
    } = props;

    const strings = useTranslation(i18n);

    return (
        <Modal
            heading={heading ?? strings.confirmationHeading}
            headingLevel={3}
            size="sm"
            onClose={onCancel}
            footerActions={(
                <ListView>
                    <Button
                        name={undefined}
                        onClick={onCancel}
                        disabled={disabled}
                    >
                        {cancelButtonLabel ?? strings.confirmationCancelButton}
                    </Button>
                    <Button
                        name={undefined}
                        onClick={onConfirm}
                        styleVariant="filled"
                        disabled={disabled}
                    >
                        {confirmButtonLabel ?? strings.confirmationConfirmButton}
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

export default ConfirmationModal;
