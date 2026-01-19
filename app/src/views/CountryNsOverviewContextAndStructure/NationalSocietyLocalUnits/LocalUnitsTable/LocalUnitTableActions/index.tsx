import {
    useCallback,
    useState,
} from 'react';
import { TableActions } from '@ifrc-go/ui';
import {
    useBooleanState,
    useTranslation,
} from '@ifrc-go/ui/hooks';

import DropdownMenuItem from '#components/DropdownMenuItem';
import { environment } from '#config';
import useAuth from '#hooks/domain/useAuth';
import useCountry from '#hooks/domain/useCountry';
import usePermissions from '#hooks/domain/usePermissions';

import {
    EXTERNALLY_MANAGED,
    VALIDATED,
} from '../../common';
import LocalUnitDeleteModal from '../../LocalUnitDeleteModal';
import LocalUnitsFormModal from '../../LocalUnitsFormModal';
import LocalUnitValidateButton from '../../LocalUnitValidateButton';
import LocalUnitValidateModal from '../../LocalUnitValidateModal';

import i18n from './i18n.json';

export interface Props {
    countryId: number;
    localUnitName: string;
    localUnitId: number;
    localUnitType: number;
    isBulkUploadLocalUnit: boolean;
    status: number | undefined;
    onLocalUnitUpdate: () => void;
    isExternallyManagedType?: boolean;
}

function LocalUnitsTableActions(props: Props) {
    const {
        countryId,
        localUnitName,
        localUnitId,
        localUnitType,
        status,
        isBulkUploadLocalUnit,
        onLocalUnitUpdate,
        isExternallyManagedType,
    } = props;

    const strings = useTranslation(i18n);

    const countryDetails = useCountry({ id: Number(countryId) });

    const { isAuthenticated } = useAuth();

    const {
        isLocalUnitGlobalValidatorByType,
        isLocalUnitCountryValidatorByType,
        isLocalUnitRegionValidatorByType,
        isSuperUser,
        isGuestUser,
        isCountryAdmin,
        isRegionAdmin,
        canEditLocalUnit,
    } = usePermissions();

    const isLocked = status !== VALIDATED;

    const countryAdmin = isCountryAdmin(countryDetails?.id);
    const regionAdmin = isRegionAdmin(countryDetails?.region);

    const isExternallyManaged = status === EXTERNALLY_MANAGED
        || isExternallyManagedType;

    const hasValidatePermission = isAuthenticated
        && !isExternallyManaged
        && (isSuperUser
            || isLocalUnitGlobalValidatorByType(localUnitType)
            || isLocalUnitCountryValidatorByType(countryDetails?.id, localUnitType)
            || isLocalUnitRegionValidatorByType(countryDetails?.region, localUnitType));

    const hasAddEditLocalUnitPermission = !isLocked && (
        (hasValidatePermission || countryAdmin || regionAdmin || canEditLocalUnit(countryId))
    && !isBulkUploadLocalUnit);

    const [readOnlyLocalUnitModal, setReadOnlyLocalUnitModal] = useState(false);

    const [
        showLocalUnitModal,
        {
            setTrue: setShowLocalUnitModalTrue,
            setFalse: setShowLocalUnitModalFalse,
        },
    ] = useBooleanState(false);

    const [
        showDeleteLocalUnitModal,
        {
            setTrue: setShowDeleteLocalUnitModalTrue,
            setFalse: setShowDeleteLocalUnitModalFalse,
        },
    ] = useBooleanState(false);

    const [
        showValidateLocalUnitModal,
        {
            setTrue: setShowValidateLocalUnitModalTrue,
            setFalse: setShowValidateLocalUnitModalFalse,
        },
    ] = useBooleanState(false);

    const handleValidationSuccess = useCallback(() => {
        setShowValidateLocalUnitModalFalse();
        onLocalUnitUpdate();
    }, [onLocalUnitUpdate, setShowValidateLocalUnitModalFalse]);

    const handleLocalUnitsFormModalClose = useCallback(
        (shouldUpdate?: boolean) => {
            setShowLocalUnitModalFalse();

            if (shouldUpdate) {
                onLocalUnitUpdate();
            }
        },
        [setShowLocalUnitModalFalse, onLocalUnitUpdate],
    );

    const handleViewLocalUnitClick = useCallback(
        () => {
            setReadOnlyLocalUnitModal(true);
            setShowLocalUnitModalTrue();
        },
        [setShowLocalUnitModalTrue],
    );

    const handleValidateLocalUnitClick = useCallback(
        () => {
            setShowValidateLocalUnitModalTrue();
        },
        [setShowValidateLocalUnitModalTrue],
    );

    const handleEditLocalUnitClick = useCallback(
        () => {
            setReadOnlyLocalUnitModal(false);
            setShowLocalUnitModalTrue();
        },
        [setShowLocalUnitModalTrue],
    );

    return (
        <>
            <TableActions
                persistent
                extraActions={environment !== 'production' && (
                    <>
                        <DropdownMenuItem
                            type="button"
                            name={localUnitId}
                            onClick={handleViewLocalUnitClick}
                            disabled={isGuestUser}
                        >
                            {strings.localUnitActionsView}
                        </DropdownMenuItem>
                        {(hasValidatePermission
                            && !isBulkUploadLocalUnit) && (
                            <DropdownMenuItem
                                type="button"
                                name={undefined}
                                onClick={setShowDeleteLocalUnitModalTrue}
                            >
                                {strings.localUnitActionsDelete}
                            </DropdownMenuItem>
                        )}
                        {(hasAddEditLocalUnitPermission) && (
                            <DropdownMenuItem
                                type="button"
                                name={localUnitId}
                                onClick={handleEditLocalUnitClick}
                            >
                                {strings.localUnitActionsEdit}
                            </DropdownMenuItem>
                        )}
                    </>
                )}
            >
                {hasValidatePermission && (environment !== 'production') && (
                    <LocalUnitValidateButton
                        onClick={handleValidateLocalUnitClick}
                        status={status}
                        hasValidatePermission={hasValidatePermission}
                    />
                )}
            </TableActions>
            {showValidateLocalUnitModal && (
                <LocalUnitValidateModal
                    localUnitId={localUnitId}
                    onClose={setShowValidateLocalUnitModalFalse}
                    localUnitName={localUnitName}
                    onActionSuccess={handleValidationSuccess}
                />
            )}
            {showLocalUnitModal && (
                <LocalUnitsFormModal
                    onClose={handleLocalUnitsFormModalClose}
                    localUnitId={localUnitId}
                    readOnly={readOnlyLocalUnitModal}
                    setReadOnly={setReadOnlyLocalUnitModal}
                />
            )}
            {showDeleteLocalUnitModal && (
                <LocalUnitDeleteModal
                    onClose={setShowDeleteLocalUnitModalFalse}
                    localUnitName={localUnitName}
                    onDeleteActionSuccess={onLocalUnitUpdate}
                    localUnitId={localUnitId}
                />
            )}
        </>
    );
}

export default LocalUnitsTableActions;
