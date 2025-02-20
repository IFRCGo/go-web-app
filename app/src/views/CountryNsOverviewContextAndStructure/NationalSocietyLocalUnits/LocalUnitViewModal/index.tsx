import { Modal } from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';

import { type PartialLocalUnits } from '../LocalUnitsFormModal/LocalUnitsForm/schema';
import LocalUnitView from '../LocalUnitView';

import i18n from './i18n.json';

interface Props {
    footerActions: React.ReactNode;
    onClose: () => void;
    localUnitId: number | undefined;
    locallyChangedValue?: PartialLocalUnits;
}

function LocalUnitViewModal(props: Props) {
    const {
        footerActions,
        onClose,
        locallyChangedValue,
        localUnitId,
    } = props;

    const strings = useTranslation(i18n);

    return (
        <Modal
            heading={strings.confirmChangesModalHeading}
            headerDescription={strings.confirmChangesContentQuestion}
            withHeaderBorder
            onClose={onClose}
            footerActions={footerActions}
        >
            <LocalUnitView
                localUnitId={localUnitId}
                locallyChangedValue={locallyChangedValue}
            />
        </Modal>
    );
}

export default LocalUnitViewModal;
