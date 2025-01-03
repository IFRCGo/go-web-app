import {
    Button,
    Modal,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { resolveToString } from '@ifrc-go/ui/utils';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
import { removeNull } from '@togglecorp/toggle-form';

import useAlert from '#hooks/useAlert';
import {
    type GoApiResponse,
    useLazyRequest,
    useRequest,
} from '#utils/restRequest';

import LocalUnitView from '../LocalUnitView';

import i18n from './i18n.json';

type LocalUnitResponse = GoApiResponse<'/api/v2/local-units/{id}/'>;

interface Props {
    localUnitId: number;
    onActionSuccess: () => void;
    onClose: () => void;
    localUnitName: string | null | undefined;
    oldValue: LocalUnitResponse | undefined;
}

function LocalUnitValidateModal(props: Props) {
    const strings = useTranslation(i18n);
    const {
        localUnitId,
        localUnitName,
        onActionSuccess,
        onClose,
        oldValue,
    } = props;

    const alert = useAlert();

    const {
        response: localUnitDetailsResponse,
    } = useRequest({
        skip: isNotDefined(localUnitId),
        url: '/api/v2/local-units/{id}/',
        pathVariables: isDefined(localUnitId) ? { id: localUnitId } : undefined,
    });

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
            onActionSuccess();
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
            heading={
                resolveToString(
                    strings.validateLocalUnitHeading,
                    { localUnitName: localUnitName ?? '' },
                )
            }
            footerActions={(
                <Button
                    name={undefined}
                    onClick={validateLocalUnit}
                    disabled={validateLocalUnitPending}
                >
                    {strings.validateButtonLabel}
                </Button>
            )}
        >
            <LocalUnitView
                oldValues={oldValue}
                value={removeNull(localUnitDetailsResponse)}
            />
        </Modal>
    );
}

export default LocalUnitValidateModal;
