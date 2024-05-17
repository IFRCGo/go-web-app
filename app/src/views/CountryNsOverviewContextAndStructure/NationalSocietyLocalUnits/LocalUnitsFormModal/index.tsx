import { useCallback } from 'react';
import { Modal } from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';

import LocalUnitsForm from './LocalUnitsForm';

import i18n from './i18n.json';
import styles from './styles.module.css';

interface Props {
    localUnitId?: number;
    readOnly?: boolean;
    onClose: (requestDone?: boolean) => void;
}

function LocalUnitsFormModal(props: Props) {
    const {
        onClose,
        localUnitId,
        readOnly,
    } = props;

    const strings = useTranslation(i18n);

    const handleSuccess = useCallback(
        () => { onClose(true); },
        [onClose],
    );

    return (
        <Modal
            childrenContainerClassName={styles.addEditModal}
            heading={strings.localUnitsModalHeading}
            onClose={onClose}
            size="full"
            withHeaderBorder
            headingLevel={1}
        >
            <LocalUnitsForm
                localUnitId={localUnitId}
                onSuccess={handleSuccess}
                readOnly={readOnly}
            />
        </Modal>
    );
}

export default LocalUnitsFormModal;
