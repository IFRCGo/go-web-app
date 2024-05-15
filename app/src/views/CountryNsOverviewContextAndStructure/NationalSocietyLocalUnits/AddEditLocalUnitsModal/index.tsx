import { Modal } from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { resolveToString } from '@ifrc-go/ui/utils';

import { useRequest } from '#utils/restRequest';

import AddEditLocalUnitsForm from './AddEditLocalUnitsForm';

import i18n from './i18n.json';
import styles from './styles.module.css';

interface Props {
    onClose: () => void;
}
function AddEditLocalUnitsModal(props: Props) {
    const strings = useTranslation(i18n);
    const { onClose } = props;
    const {
        response: localUnitsOptions,
        // pending: localUnitsOptionsResponsePending,
    } = useRequest({
        url: '/api/v2/local-units-options/',
    });

    return (
        <Modal
            childrenContainerClassName={styles.addEditModal}
            heading={resolveToString(
                strings.localUnitsModalHeading,
                {
                    // FIXME Pass local unit type
                    type: 'Administrative',
                },
            )}
            onClose={onClose}
            size="xl"
        >
            <AddEditLocalUnitsForm
                localUnitsOptions={localUnitsOptions}
            />
        </Modal>
    );
}

export default AddEditLocalUnitsModal;
