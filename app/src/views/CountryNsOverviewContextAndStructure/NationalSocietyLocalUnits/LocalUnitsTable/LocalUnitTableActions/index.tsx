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
import useAlert from '#hooks/useAlert';
import {
    type GoApiBody,
    type GoApiResponse,
    useLazyRequest,
} from '#utils/restRequest';

import LocalUnitDeleteModal from '../../LocalUnitDeleteModal';
import LocalUnitsFormModal from '../../LocalUnitsFormModal';
import LocalUnitValidateButton from '../../LocalUnitValidateButton';

import i18n from './i18n.json';

type LocalUnitLatestChangesBody = GoApiBody<'/api/v2/local-units/{id}/latest-change-request/', 'POST'>
type LocalUnitResponse = GoApiResponse<'/api/v2/local-units/{id}/'>;

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

    const alert = useAlert();
    const { isAuthenticated } = useAuth();

    const hasValidatePermission = isSuperUser
        || isCountryAdmin(Number(countryId))
        || isRegionAdmin(Number(countryDetails?.region));

    const hasDeletePermission = isAuthenticated && !isGuestUser;

    const {
        response: previousData,
        trigger: latestChanges,
    } = useLazyRequest({
        url: '/api/v2/local-units/{id}/latest-change-request/',
        method: 'POST',
        pathVariables: { id: localUnitId },
        body: (ctx: LocalUnitLatestChangesBody) => ctx,
        onFailure: (error) => {
            const {
                value: {
                    messageForNotification,
                },
                debugMessage,
            } = error;
            alert.show(
                strings.latestChangesFailureMessage,
                {
                    variant: 'danger',
                    description: messageForNotification,
                    debugMessage,
                },
            );
        },
    });

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
            if (!isValidated) {
                latestChanges(localUnitId as never);
            }
            setReadOnlyLocalUnitModal(true);
            setShowLocalUnitModalTrue();
        },
        [setShowLocalUnitModalTrue, latestChanges, localUnitId, isValidated],
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
                            {strings.localUnitsView}
                        </DropdownMenuItem>
                        {hasDeletePermission && (
                            <DropdownMenuItem
                                type="button"
                                name={undefined}
                                onClick={setShowDeleteLocalUnitModalTrue}
                            >
                                {strings.localUnitsDelete}
                            </DropdownMenuItem>
                        )}
                        {!isLocked && (
                            <DropdownMenuItem
                                type="button"
                                name={localUnitId}
                                onClick={handleEditLocalUnitClick}
                                disabled={isGuestUser}
                            >
                                {strings.localUnitsEdit}
                            </DropdownMenuItem>
                        )}
                    </>
                )}
            >
                {hasValidatePermission && environment !== 'production' ? (
                    <LocalUnitValidateButton
                        countryId={countryId}
                        localUnitName={localUnitName}
                        isValidated={isValidated}
                        onActionSuccess={onValidationActionSuccess}
                        localUnitId={localUnitId}
                    />
                ) : (
                    <Button
                        name={localUnitId}
                        variant="tertiary"
                        onClick={handleViewLocalUnitClick}
                        disabled={isGuestUser}
                    >
                        {strings.localUnitsView}
                    </Button>
                )}
            </TableActions>
            {showLocalUnitModal && (
                <LocalUnitsFormModal
                    onClose={handleLocalUnitsFormModalClose}
                    localUnitId={localUnitId}
                    readOnly={readOnlyLocalUnitModal}
                    setReadOnly={setReadOnlyLocalUnitModal}
                    onDeleteActionSuccess={onDeleteActionSuccess}
                    previousData={
                        isValidated
                            ? undefined
                            : previousData?.previous_data_details as unknown as LocalUnitResponse
                    }
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
