import {
    ButtonVariant,
    ConfirmButton,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { resolveToString } from '@ifrc-go/ui/utils';

import usePermissions from '#hooks/domain/usePermissions';
import useAlert from '#hooks/useAlert';
import { useLazyRequest } from '#utils/restRequest';

import i18n from './i18n.json';

const hideDelete = true;

interface Props {
    countryId: number;
    localUnitId: number;
    onActionSuccess: () => void;
    localUnitName: string | null | undefined;
    disabled?: boolean;
    variant?: ButtonVariant;
}

function LocalUnitDeleteButton(props: Props) {
    const strings = useTranslation(i18n);
    const {
        countryId,
        localUnitId,
        localUnitName,
        onActionSuccess,
        disabled,
        variant = 'secondary',
    } = props;

    const { isCountryAdmin, isSuperUser } = usePermissions();
    const alert = useAlert();

    const hasDeletePermission = isSuperUser || isCountryAdmin(countryId);

    const {
        pending: validateLocalUnitPending,
        trigger: validateLocalUnit,
    } = useLazyRequest({
        method: 'DELETE',
        url: '/api/v2/local-units/{id}/',
        pathVariables: { id: localUnitId },
        onSuccess: () => {
            const validationMessage = resolveToString(
                strings.deleteSuccessMessage,
                { localUnitName },
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
                    strings.deleteFailureMessage,
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

    if (hideDelete) {
        return null;
    }

    return (
        <ConfirmButton
            variant={variant}
            // NOTE sending an empty post request to validate the local unit
            name={null}
            spacing="compact"
            confirmHeading={strings.deleteLocalUnitHeading}
            confirmMessage={resolveToString(
                strings.deleteLocalUnitMessage,
                { localUnitName: localUnitName ?? '' },
            )}
            onConfirm={validateLocalUnit}
            disabled={disabled
                || validateLocalUnitPending
                || !hasDeletePermission}
        >
            {strings.localUnitsDelete}
        </ConfirmButton>
    );
}

export default LocalUnitDeleteButton;
