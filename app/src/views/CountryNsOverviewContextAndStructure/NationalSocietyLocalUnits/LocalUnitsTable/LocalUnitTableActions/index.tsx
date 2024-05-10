import { useCallback } from 'react';
import { TableActions } from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { resolveToString } from '@ifrc-go/ui/utils';

import DropdownMenuItem from '#components/DropdownMenuItem';
import usePermissions from '#hooks/domain/usePermissions';
import useAlert from '#hooks/useAlert';
import {
    type GoApiResponse,
    useLazyRequest,
} from '#utils/restRequest';

import i18n from './i18n.json';
import styles from './styles.module.css';

export interface Props {
    countryId: number;
    localUnitName: string | null | undefined;
    localUnitId: number;
    isValidated: boolean;
    onActionSuccess: () => void;
}

export type LocalUnitValidateResponsePostBody = GoApiResponse<'/api/v2/local-units/{id}/'>;

function LocalUnitsTableActions(props: Props) {
    const {
        countryId,
        localUnitName,
        localUnitId,
        isValidated,
        onActionSuccess,
    } = props;

    const { isCountryAdmin, isSuperUser } = usePermissions();
    const strings = useTranslation(i18n);
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
                strings.validationMessage,
                { localUnitName: response.local_branch_name ?? response.english_branch_name },
            );
            alert.show(
                validationMessage,
                { variant: 'success' },
            );
            onActionSuccess();
        },
    });

    const handleLocalUnitValidate = useCallback(() => {
        // NOTE sending an empty post request to validate the local unit
        validateLocalUnit(null);
    }, [validateLocalUnit]);

    return (
        <TableActions
            persistent
            extraActions={(
                <>
                    <DropdownMenuItem
                        type="link"
                        to={undefined}
                    >
                        {strings.localUnitsEdit}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        type="link"
                        to={undefined}
                    >
                        {strings.localUnitsView}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        persist
                        name={undefined}
                        type="confirm-button"
                        variant="tertiary"
                        className={styles.button}
                        confirmHeading={strings.validateLocalUnitHeading}
                        confirmMessage={resolveToString(
                            strings.validateLocalUnitMessage,
                            { localUnitName: localUnitName ?? '' },
                        )}
                        onConfirm={handleLocalUnitValidate}
                        disabled={
                            validateLocalUnitPending
                        || !hasValidatePermission
                        || isValidated
                        }
                    >
                        {strings.localUnitsValidate}
                    </DropdownMenuItem>
                </>
            )}
        />
    );
}

export default LocalUnitsTableActions;
