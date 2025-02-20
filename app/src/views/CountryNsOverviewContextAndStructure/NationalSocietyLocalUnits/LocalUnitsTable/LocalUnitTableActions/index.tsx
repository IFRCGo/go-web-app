import {
    useCallback,
    useState,
} from 'react';
import {
    Button,
    TableActions,
} from '@ifrc-go/ui';
import {
    useBooleanState,
    useTranslation,
} from '@ifrc-go/ui/hooks';

import DropdownMenuItem from '#components/DropdownMenuItem';
import { environment } from '#config';
import useAuth from '#hooks/domain/useAuth';
import useCountry from '#hooks/domain/useCountry';
import usePermissions from '#hooks/domain/usePermissions';

import LocalUnitDeleteModal from '../../LocalUnitDeleteModal';
import LocalUnitsFormModal from '../../LocalUnitsFormModal';
import LocalUnitValidateButton from '../../LocalUnitValidateButton';
import LocalUnitValidateModal from '../../LocalUnitValidateModal';

import i18n from './i18n.json';

export interface Props {
    countryId: number;
    localUnitName: string;
    localUnitId: number;
    isValidated: boolean;
    onDeleteActionSuccess: () => void;
    onValidationActionSuccess: () => void;
    isLocked: boolean;
}

function LocalUnitsTableActions(props: Props) {
    const {
        countryId,
        localUnitName,
        localUnitId,
        isValidated,
        onValidationActionSuccess,
        onDeleteActionSuccess,
        isLocked,
    } = props;

    const strings = useTranslation(i18n);

    const countryDetails = useCountry({ id: Number(countryId) });

    const {
        isSuperUser,
        isRegionAdmin,
        isCountryAdmin,
        isGuestUser,
    } = usePermissions();

    const { isAuthenticated } = useAuth();

    const hasValidatePermission = isSuperUser
        || isCountryAdmin(Number(countryId))
        || isRegionAdmin(Number(countryDetails?.region));

    const hasDeletePermission = isAuthenticated && !isGuestUser;
    const hasEditPermission = hasValidatePermission;

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
        onValidationActionSuccess();
    }, [onValidationActionSuccess, setShowValidateLocalUnitModalFalse]);

    const handleLocalUnitsFormModalClose = useCallback(
        (shouldUpdate?: boolean) => {
            setShowLocalUnitModalFalse();

            if (shouldUpdate) {
                onDeleteActionSuccess();
            }
        },
        [setShowLocalUnitModalFalse, onDeleteActionSuccess],
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
                        {hasDeletePermission && (
                            <DropdownMenuItem
                                type="button"
                                name={undefined}
                                onClick={setShowDeleteLocalUnitModalTrue}
                            >
                                {strings.localUnitActionsDelete}
                            </DropdownMenuItem>
                        )}
                        {!isLocked && hasEditPermission && (
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
                {hasValidatePermission
                    && environment !== 'production' ? (
                        <LocalUnitValidateButton
                            onClick={handleValidateLocalUnitClick}
                            isValidated={isValidated}
                            hasValidatePermission={hasValidatePermission}
                        />
                    ) : (
                        <Button
                            name={localUnitId}
                            variant="tertiary"
                            onClick={handleViewLocalUnitClick}
                            disabled={isGuestUser}
                        >
                            {strings.localUnitActionsView}
                        </Button>
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
                    onDeleteActionSuccess={onDeleteActionSuccess}
                />
            )}
            {showDeleteLocalUnitModal && (
                <LocalUnitDeleteModal
                    onClose={setShowDeleteLocalUnitModalFalse}
                    localUnitName={localUnitName}
                    onDeleteActionSuccess={onDeleteActionSuccess}
                    localUnitId={localUnitId}
                />
            )}
        </>
    );
}

export default LocalUnitsTableActions;
