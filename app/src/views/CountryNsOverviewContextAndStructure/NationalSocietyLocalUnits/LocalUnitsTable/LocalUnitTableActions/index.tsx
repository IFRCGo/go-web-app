import { useCallback } from 'react';
import { ConfirmButton, TableActions } from '@ifrc-go/ui';
import {
    useBooleanState,
    useTranslation,
} from '@ifrc-go/ui/hooks';
import { resolveToString } from '@ifrc-go/ui/utils';

import DropdownMenuItem from '#components/DropdownMenuItem';
import { environment } from '#config';
import usePermissions from '#hooks/domain/usePermissions';
import useAlert from '#hooks/useAlert';
import {
    type GoApiResponse,
    useLazyRequest,
} from '#utils/restRequest';

import LocalUnitsFormModal from '../../LocalUnitsFormModal';

import i18n from './i18n.json';
import styles from './styles.module.css';
import { CheckboxCircleLineIcon } from '@ifrc-go/icons';

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

    const [showLocalUnitViewModal, {
        setTrue: setShowLocalUnitViewModalTrue,
        setFalse: setShowLocalUnitViewModalFalse,
    }] = useBooleanState(false);

    const [showLocalUnitEditModal, {
        setTrue: setShowLocalUnitEditModalTrue,
        setFalse: setShowLocalUnitEditModalFalse,
    }] = useBooleanState(false);

    const handleLocalUnitsFormModalClose = useCallback(
        (shouldUpdate?: boolean) => {
            setShowLocalUnitEditModalFalse();
            setShowLocalUnitViewModalFalse();

            if (shouldUpdate) {
                onActionSuccess();
            }
        },
        [setShowLocalUnitViewModalFalse, setShowLocalUnitEditModalFalse, onActionSuccess],
    );

    return (
        <>
            <TableActions
                className={styles.localUnitTableActions}
                persistent
                extraActions={(
                    <>
                        <DropdownMenuItem
                            type="button"
                            name={localUnitId}
                            onClick={setShowLocalUnitViewModalTrue}
                            disabled={!hasValidatePermission}
                        >
                            {strings.localUnitsView}
                        </DropdownMenuItem>
                        {environment !== 'production' && (
                            <DropdownMenuItem
                                type="button"
                                name={localUnitId}
                                onClick={setShowLocalUnitEditModalTrue}
                                disabled={!hasValidatePermission}
                            >
                                {strings.localUnitsEdit}
                            </DropdownMenuItem>
                        )}
                    </>
                )}
            >
                <ConfirmButton
                    // NOTE sending an empty post request to validate the local unit
                    name={null}
                    spacing="compact"
                    confirmHeading={strings.validateLocalUnitHeading}
                    confirmMessage={resolveToString(
                        strings.validateLocalUnitMessage,
                        { localUnitName: localUnitName ?? '' },
                    )}
                    onConfirm={validateLocalUnit}
                    disabled={
                        validateLocalUnitPending
                        || !hasValidatePermission
                        || isValidated
                    }
                    icons={isValidated && <CheckboxCircleLineIcon className={styles.icon} />}
                >
                    {isValidated ? strings.localUnitsValidated : strings.localUnitsValidate}
                </ConfirmButton>
            </TableActions>
            {(showLocalUnitViewModal || showLocalUnitEditModal) && (
                <LocalUnitsFormModal
                    onClose={handleLocalUnitsFormModalClose}
                    localUnitId={localUnitId}
                    readOnly={showLocalUnitViewModal}
                />
            )}
        </>
    );
}

export default LocalUnitsTableActions;
