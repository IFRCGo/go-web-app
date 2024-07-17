import { useCallback } from 'react';
import { TableActions } from '@ifrc-go/ui';
import {
    useBooleanState,
    useTranslation,
} from '@ifrc-go/ui/hooks';

import DropdownMenuItem from '#components/DropdownMenuItem';
import usePermissions from '#hooks/domain/usePermissions';
import { type GoApiResponse } from '#utils/restRequest';

import LocalUnitDeleteButton from '../../LocalUnitDeleteButton';
import LocalUnitsFormModal from '../../LocalUnitsFormModal';
import LocalUnitValidateButton from '../../LocalUnitValidateButton';

import i18n from './i18n.json';

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

    const hasValidatePermission = isSuperUser || isCountryAdmin(countryId);

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
                            disabled={!hasValidatePermission}
                        >
                            {strings.localUnitsView}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            type="button"
                            name={localUnitId}
                            onClick={setShowLocalUnitEditModalTrue}
                            disabled={!hasValidatePermission}
                        >
                            {strings.localUnitsEdit}
                        </DropdownMenuItem>
                        <LocalUnitDeleteButton
                            variant="dropdown-item"
                            countryId={countryId}
                            localUnitName={localUnitName}
                            onActionSuccess={onActionSuccess}
                            localUnitId={localUnitId}
                        />
                    </>
                )}
            >
                <LocalUnitValidateButton
                    countryId={countryId}
                    localUnitName={localUnitName}
                    isValidated={isValidated}
                    onActionSuccess={onActionSuccess}
                    localUnitId={localUnitId}
                />
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
