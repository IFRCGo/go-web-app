import { useMemo } from 'react';
import { CheckboxCircleLineIcon } from '@ifrc-go/icons';
import { ConfirmButton } from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { resolveToString } from '@ifrc-go/ui/utils';
import { _cs } from '@togglecorp/fujs';

import usePermissions from '#hooks/domain/usePermissions';
import useAlert from '#hooks/useAlert';
import { useLazyRequest } from '#utils/restRequest';

import i18n from './i18n.json';
import styles from './styles.module.css';

interface Props {
    countryId: number;
    localUnitId: number;
    isValidated: boolean;
    onActionSuccess: () => void;
    localUnitName: string | null | undefined;
    disabled?: boolean;
    readOnly?: boolean;
}

function LocalUnitValidateButton(props: Props) {
    const strings = useTranslation(i18n);
    const {
        countryId,
        localUnitId,
        localUnitName,
        isValidated,
        onActionSuccess,
        disabled,
        readOnly,
    } = props;

    const { isCountryAdmin, isSuperUser } = usePermissions();
    const alert = useAlert();

    const hasValidatePermission = isSuperUser || isCountryAdmin(countryId);

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

    const label = useMemo(
        () => {
            if (isValidated) {
                return strings.localUnitsValidated;
            }

            if (readOnly) {
                return strings.localUnitsNotValidated;
            }

            return strings.localUnitsValidate;
        },
        [isValidated, readOnly, strings],
    );

    return (
        <ConfirmButton
            className={_cs(isValidated
                ? styles.localUnitValidatedButton
                : styles.localUnitValidateButton)}
            // NOTE sending an empty post request to validate the local unit
            name={null}
            spacing="compact"
            confirmHeading={strings.validateLocalUnitHeading}
            confirmMessage={resolveToString(
                strings.validateLocalUnitMessage,
                { localUnitName: localUnitName ?? '' },
            )}
            onConfirm={validateLocalUnit}
            disabled={disabled
                || validateLocalUnitPending
                || !hasValidatePermission
                || isValidated}
            icons={isValidated && <CheckboxCircleLineIcon className={styles.icon} />}
        >
            {label}
        </ConfirmButton>
    );
}

export default LocalUnitValidateButton;
