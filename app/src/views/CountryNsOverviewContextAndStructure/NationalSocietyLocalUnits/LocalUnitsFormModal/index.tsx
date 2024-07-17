import {
    useCallback,
    useRef,
} from 'react';
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
    const actionsContainerRef = useRef<HTMLDivElement>(null);
    const headingDescriptionRef = useRef<HTMLDivElement>(null);
    const headerDescriptionRef = useRef<HTMLDivElement>(null);

    const handleSuccess = useCallback(
        () => { onClose(true); },
        [onClose],
    );

    return (
        <Modal
            className={styles.localUnitsFormModal}
            heading={strings.localUnitsModalHeading}
            onClose={onClose}
            size="pageWidth"
            withHeaderBorder
            headingLevel={2}
            actions={!readOnly && (
                <div ref={actionsContainerRef} />
            )}
            headingContainerClassName={styles.headingContainer}
            headingDescription={
                <div ref={headingDescriptionRef} />
            }
            headerDescription={
                <div ref={headerDescriptionRef} />
            }
            withFooterBorder={!readOnly}
            spacing="relaxed"
        >
            <LocalUnitsForm
                localUnitId={localUnitId}
                onSuccess={handleSuccess}
                readOnly={readOnly}
                actionsContainerRef={actionsContainerRef}
                headingDescriptionRef={headingDescriptionRef}
                headerDescriptionRef={headerDescriptionRef}
            />
        </Modal>
    );
}

export default LocalUnitsFormModal;
