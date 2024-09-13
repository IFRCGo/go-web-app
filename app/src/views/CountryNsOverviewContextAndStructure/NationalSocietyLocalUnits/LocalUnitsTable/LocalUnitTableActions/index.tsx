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

    const [readOnlyLocalUnitModal, setReadOnlyLocalUnitModal] = useState(false);

    const [showLocalUnitModal, {
        setTrue: setShowLocalUnitModalTrue,
        setFalse: setShowLocalUnitModalFalse,
    }] = useBooleanState(false);

    const handleLocalUnitsFormModalClose = useCallback(
        (shouldUpdate?: boolean) => {
            setShowLocalUnitModalFalse();

            if (shouldUpdate) {
                onActionSuccess();
            }
        },
        [setShowLocalUnitModalFalse, onActionSuccess],
    );

    const handleViewLocalUnitClick = useCallback(
        () => {
            setReadOnlyLocalUnitModal(true);
            setShowLocalUnitModalTrue();
        },
        [setShowLocalUnitModalTrue],
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
                            disabled={!hasValidatePermission}
                        >
                            {strings.localUnitsView}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            type="button"
                            name={localUnitId}
                            onClick={handleEditLocalUnitClick}
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
                {environment !== 'production' ? (
                    <LocalUnitValidateButton
                        countryId={countryId}
                        localUnitName={localUnitName}
                        isValidated={isValidated}
                        onActionSuccess={onActionSuccess}
                        localUnitId={localUnitId}
                    />
                ) : (
                    <Button
                        name={localUnitId}
                        variant="tertiary"
                        onClick={handleViewLocalUnitClick}
                        disabled={!hasValidatePermission}
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
                />
            )}
        </>
    );
}

export default LocalUnitsTableActions;
