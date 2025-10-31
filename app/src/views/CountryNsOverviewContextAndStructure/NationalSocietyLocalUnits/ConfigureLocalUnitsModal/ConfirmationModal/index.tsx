import {
    useCallback,
    useState,
} from 'react';
import { useOutletContext } from 'react-router-dom';
import {
    Button,
    Modal,
    TextInput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { resolveToString } from '@ifrc-go/ui/utils';
import { isDefined } from '@togglecorp/fujs';

import useAlert from '#hooks/useAlert';
import { type CountryOutletContext } from '#utils/outletContext';
import { useLazyRequest } from '#utils/restRequest';

import i18n from './i18n.json';

export type ManageLocalUnitsValues = {
    id: number | undefined;
    country: number;
    local_unit_type: number;
    enabled: boolean;
}

interface Props {
    onClose: () => void;
    manageLocalUnitsValues?: ManageLocalUnitsValues;
    isNewManageLocalUnit: boolean;
    localUnitName?: string;
    onUpdate: () => void;
}

function ConfirmationModal(props: Props) {
    const {
        onClose,
        manageLocalUnitsValues,
        isNewManageLocalUnit,
        localUnitName,
        onUpdate,
    } = props;
    const alert = useAlert();

    const { countryResponse } = useOutletContext<CountryOutletContext>();
    const [nationalSocietyName, setNationalSocietyName] = useState<string>();
    const strings = useTranslation(i18n);

    const nationalSocietyValid = JSON.stringify(nationalSocietyName)
        === JSON.stringify(countryResponse?.society_name);

    const {
        trigger: addManageLocalUnit,
        pending: addManageLocalUnitPending,
    } = useLazyRequest({
        url: '/api/v2/externally-managed-local-unit/',
        method: 'POST',
        body: (values: ManageLocalUnitsValues) => values,
        onSuccess: () => {
            alert.show(
                manageLocalUnitsValues?.enabled
                    ? strings.confirmationSuccessEnabledMessage
                    : strings.confirmationSuccessDisabledMessage,
                { variant: 'success' },
            );
            onUpdate();
            onClose();
        },
        onFailure: (response) => {
            const {
                value: {
                    messageForNotification,
                },
                debugMessage,
            } = response;
            alert.show(
                strings.confirmationFailedMessage,
                {
                    variant: 'danger',
                    description: messageForNotification,
                    debugMessage,
                },
            );
        },
    });

    const {
        trigger: updateManageLocalUnit,
        pending: updateManageLocalUnitPending,
    } = useLazyRequest({
        url: '/api/v2/externally-managed-local-unit/{id}/',
        method: 'PUT',
        body: (values: ManageLocalUnitsValues) => values,
        pathVariables: isDefined(manageLocalUnitsValues?.id)
            ? { id: manageLocalUnitsValues.id } : undefined,
        onSuccess: () => {
            alert.show(
                manageLocalUnitsValues?.enabled
                    ? strings.confirmationSuccessEnabledMessage
                    : strings.confirmationSuccessDisabledMessage,
                { variant: 'success' },
            );
            onUpdate();
            onClose();
        },
    });

    const pending = addManageLocalUnitPending || updateManageLocalUnitPending;

    const handleConfirmButtonChange = useCallback(() => {
        if (isNewManageLocalUnit) {
            addManageLocalUnit(manageLocalUnitsValues);
        }
        updateManageLocalUnit(manageLocalUnitsValues);
    }, [isNewManageLocalUnit,
        addManageLocalUnit, manageLocalUnitsValues, updateManageLocalUnit]);

    return (
        <Modal
            onClose={onClose}
            heading={strings.confirmationModalHeading}
            headerDescription={
                resolveToString(
                    strings.confirmationModalDescription,
                    {
                        localUnitType: localUnitName,
                    },
                )
            }
            size="sm"
            footerActions={(
                <>
                    <Button
                        name={undefined}
                        onClick={onClose}
                        variant="secondary"
                    >
                        {strings.cancelButtonLabel}
                    </Button>
                    <Button
                        name={undefined}
                        onClick={handleConfirmButtonChange}
                        disabled={pending || !nationalSocietyValid}
                    >
                        {strings.confirmButtonLabel}
                    </Button>
                </>
            )}
        >
            <TextInput
                name={undefined}
                value={nationalSocietyName}
                onChange={setNationalSocietyName}
                label={strings.societyNameTextLabel}
            />
        </Modal>
    );
}

export default ConfirmationModal;
