import {
    useCallback,
    useRef,
    useState,
} from 'react';
import { Modal } from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';

import LocalUnitsForm from './LocalUnitsForm';

import i18n from './i18n.json';
import styles from './styles.module.css';

interface Props {
    localUnitId?: number;
    viewMode?: boolean;
    onClose: (requestDone?: boolean) => void;
}

function LocalUnitsFormModal(props: Props) {
    const {
        onClose,
        localUnitId,
        viewMode = false,
    } = props;

    const strings = useTranslation(i18n);
    const actionsContainerRef = useRef<HTMLDivElement>(null);
    const headingDescriptionRef = useRef<HTMLDivElement>(null);
    const headerDescriptionRef = useRef<HTMLDivElement>(null);

    const [readOnly, setReadOnly] = useState<boolean>(viewMode);

    const handleSuccess = useCallback(
        () => { onClose(true); },
        [onClose],
    );

    const handleEditButtonClick = useCallback(
        () => { setReadOnly(false); },
        [],
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
                onEditButtonClick={handleEditButtonClick}
                actionsContainerRef={actionsContainerRef}
                headingDescriptionRef={headingDescriptionRef}
                headerDescriptionRef={headerDescriptionRef}
            />
        </Modal>
    );
}

export default LocalUnitsFormModal;
