import { useCallback } from 'react';
import { TableActions } from '@ifrc-go/ui';
import {
    useBooleanState,
    useTranslation,
} from '@ifrc-go/ui/hooks';
import { resolveToString } from '@ifrc-go/ui/utils';

import DropdownMenuItem from '#components/DropdownMenuItem';
import usePermissions from '#hooks/domain/usePermissions';
import useAlert from '#hooks/useAlert';
import {
    type GoApiResponse,
    useLazyRequest,
} from '#utils/restRequest';

import LocalUnitsFormModal from '../../LocalUnitsFormModal';

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
                persistent
                extraActions={(
                    <>
                        <DropdownMenuItem
                            type="button"
                            name={localUnitId}
                            onClick={setShowLocalUnitViewModalTrue}
                        >
                            {strings.localUnitsView}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            type="button"
                            name={localUnitId}
                            onClick={setShowLocalUnitEditModalTrue}
                        >
                            {strings.localUnitsEdit}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            persist
                            // NOTE sending an empty post request to validate the local unit
                            name={null}
                            type="confirm-button"
                            variant="tertiary"
                            className={styles.button}
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
                        >
                            {strings.localUnitsValidate}
                        </DropdownMenuItem>
                    </>
                )}
            />
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
