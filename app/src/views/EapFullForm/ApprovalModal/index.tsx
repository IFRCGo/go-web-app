import { useMemo } from 'react';
import {
    Button,
    ListView,
    Modal,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';

import { type components } from '#generated/types';
import useAlert from '#hooks/useAlert';
import {
    EAP_STATUS_UNDER_DEVELOPMENT,
    EAP_STATUS_UNDER_REVIEW,
} from '#utils/constants';
import {
    type GoApiBody,
    useLazyRequest,
} from '#utils/restRequest';

import i18n from './i18n.json';

type EapStatusBody = GoApiBody<'/api/v2/eap-registration/{id}/status/', 'POST'>;
type EapStatus = components['schemas']['EapEapStatusEnumKey'];

interface Props {
    onClose: () => void;
    eapId: string;
    status: EapStatus;
}
function ApprovalModal(props: Props) {
    const { onClose, eapId, status } = props;
    const alert = useAlert();

    const strings = useTranslation(i18n);

    const disabled = useMemo(() => status !== EAP_STATUS_UNDER_DEVELOPMENT, [status]);

    const { trigger: triggerStatusUpdate } = useLazyRequest({
        method: 'POST',
        url: '/api/v2/eap-registration/{id}/status/',
        pathVariables: {
            id: Number(eapId),
        },
        body: (fields: EapStatusBody) => fields,
        onSuccess: () => {
            alert.show('Status updated successfully!', { variant: 'success' });
        },
        formData: true,
        onFailure: () => {
            alert.show('Failed to update the status!', { variant: 'danger' });
        },
    });

    // FIXME: fix typings in the server
    const requestBody = useMemo<EapStatusBody>(
        () => ({
            status: EAP_STATUS_UNDER_REVIEW,
            review_checklist_file: undefined,
        } as EapStatusBody),
        [],
    );

    return (
        <Modal
            heading={strings.approvalFullEapHeading}
            onClose={onClose}
            footerActions={(
                <ListView>
                    <Button name={requestBody} onClick={triggerStatusUpdate} disabled={disabled}>
                        Confirm
                    </Button>
                    <Button name={undefined} onClick={onClose}>
                        Cancel
                    </Button>
                </ListView>
            )}
        >
            {strings.approvalFullEapDescription}
        </Modal>
    );
}

export default ApprovalModal;
