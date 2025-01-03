import { Modal } from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';

import { GoApiResponse } from '#utils/restRequest';

import { PartialLocalUnits } from '../LocalUnitsFormModal/LocalUnitsForm/schema';
import LocalUnitView from '../LocalUnitView';

import i18n from './i18n.json';

type LocalUnitResponse = GoApiResponse<'/api/v2/local-units/{id}/'>;

interface Props {
    footerActions: React.ReactNode;
    onClose: () => void;
    oldValues: LocalUnitResponse | undefined;
    value: PartialLocalUnits;
}

function LocalUnitViewModal(props: Props) {
    const {
        footerActions,
        onClose,
        oldValues,
        value,
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
                oldValues={oldValues}
                value={value}
            />
        </Modal>
    );
}

export default LocalUnitViewModal;
