import {
    Button,
    Modal,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { resolveToString } from '@ifrc-go/ui/utils';
import { isDefined } from '@togglecorp/fujs';

import useAlert from '#hooks/useAlert';
import { useLazyRequest } from '#utils/restRequest';

import LocalUnitView from '../LocalUnitView';

import i18n from './i18n.json';

interface Props {
    localUnitId: number;
    onActionSuccess?: () => void;
    onClose: () => void;
    localUnitName: string | null | undefined;
}

function LocalUnitValidateModal(props: Props) {
    const strings = useTranslation(i18n);
    const {
        localUnitId,
        localUnitName,
        onActionSuccess,
        onClose,
    } = props;

    const alert = useAlert();
    const {
        pending: validateLocalUnitPending,
        trigger: validateLocalUnit,
    } = useLazyRequest({
        method: 'POST',
        url: '/api/v2/local-units/{id}/validate/',
        pathVariables: { id: localUnitId },
        // FIXME: typings should be fixed in the server
        body: () => ({} as never),
        onSuccess: (response) => {
            const validationMessage = resolveToString(
                strings.validationSuccessMessage,
                { localUnitName: response.local_branch_name ?? response.english_branch_name },
            );
            alert.show(
                validationMessage,
                { variant: 'success' },
            );

            if (isDefined(onActionSuccess)) {
                onActionSuccess();
            }
        },
        onFailure: (response) => {
            const {
                value: { messageForNotification },
                debugMessage,
            } = response;

            alert.show(
                resolveToString(
                    strings.validationFailureMessage,
                    { localUnitName },
                ),
                {
                    variant: 'danger',
                    description: messageForNotification,
                    debugMessage,
                },
            );
        },
    });

    return (
        <Modal
            onClose={onClose}
            size="md"
            heading={
                resolveToString(
                    strings.validateLocalUnitHeading,
                    { localUnitName: localUnitName ?? '' },
                )
            }
            footerActions={(
                <Button
                    name={null}
                    onClick={validateLocalUnit}
                    disabled={validateLocalUnitPending}
                >
                    {strings.validateButtonLabel}
                </Button>
            )}
        >
            <LocalUnitView
                localUnitId={localUnitId}
            />
        </Modal>
    );
}

export default LocalUnitValidateModal;
