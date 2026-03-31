import {
    useCallback,
    useRef,
} from 'react';
import {
    ListView,
    Modal,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { isDefined } from '@togglecorp/fujs';

import LocalUnitsForm from './LocalUnitsForm';

import i18n from './i18n.json';

interface Props {
    localUnitId?: number;
    readOnly?: boolean;
    setReadOnly?: React.Dispatch<React.SetStateAction<boolean>>;
    onClose: (requestDone?: boolean) => void;
    onDeleteActionSuccess?: () => void;
}

function LocalUnitsFormModal(props: Props) {
    const {
        onClose,
        localUnitId,
        readOnly,
        setReadOnly,
        onDeleteActionSuccess,
    } = props;

    const strings = useTranslation(i18n);
    const actionsContainerRef = useRef<HTMLDivElement>(null);
    const headingDescriptionRef = useRef<HTMLDivElement>(null);
    const headerDescriptionRef = useRef<HTMLDivElement>(null);

    const handleSuccess = useCallback(
        () => {
            onClose(true);
        },
        [onClose],
    );

    const handleEditButtonClick = useCallback(
        () => {
            if (isDefined(setReadOnly)) {
                setReadOnly(false);
            }
        },
        [setReadOnly],
    );

    return (
        <Modal
            heading={readOnly
                ? strings.localUnitsModalReadOnlyHeading
                : strings.localUnitsModalHeading}
            onClose={onClose}
            size="pageWidth"
            withHeaderBorder
            headingLevel={2}
            headerActions={<ListView elementRef={actionsContainerRef} />}
            // FIXME: heading description
            headerDescription={(
                <ListView layout="block">
                    <div ref={headingDescriptionRef} />
                    <div ref={headerDescriptionRef} />
                </ListView>
            )}
            withFooterBorder={!readOnly}
            withContentOverflow
        >
            <LocalUnitsForm
                localUnitId={localUnitId}
                onSuccess={handleSuccess}
                readOnly={readOnly}
                onEditButtonClick={handleEditButtonClick}
                actionsContainerRef={actionsContainerRef}
                headingDescriptionRef={headingDescriptionRef}
                headerDescriptionRef={headerDescriptionRef}
                onDeleteActionSuccess={onDeleteActionSuccess}
            />
        </Modal>
    );
}

export default LocalUnitsFormModal;
