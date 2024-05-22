import {
    useCallback,
    useRef,
} from 'react';
import { Modal } from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';

import LocalUnitsForm from './LocalUnitsForm';

import i18n from './i18n.json';

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
    const submitButtonContainerRef = useRef<HTMLDivElement>(null);

    const handleSuccess = useCallback(
        () => { onClose(true); },
        [onClose],
    );

    return (
        <Modal
            heading={strings.localUnitsModalHeading}
            onClose={onClose}
            size="full"
            withHeaderBorder
            headingLevel={2}
            footerActions={!readOnly && (
                <div ref={submitButtonContainerRef} />
            )}
            withFooterBorder={!readOnly}
        >
            <LocalUnitsForm
                localUnitId={localUnitId}
                onSuccess={handleSuccess}
                readOnly={readOnly}
                submitButtonContainerRef={submitButtonContainerRef}
            />
        </Modal>
    );
}

export default LocalUnitsFormModal;
