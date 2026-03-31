import {
    useCallback,
    useMemo,
    useState,
} from 'react';
import { useOutletContext } from 'react-router-dom';
import {
    Button,
    Modal,
    Table,
} from '@ifrc-go/ui';
import {
    useBooleanState,
    useTranslation,
} from '@ifrc-go/ui/hooks';
import {
    createElementColumn,
    createStringColumn,
    numericIdSelector,
    resolveToString,
} from '@ifrc-go/ui/utils';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

import { type CountryOutletContext } from '#utils/outletContext';
import {
    type GoApiResponse,
    useRequest,
} from '#utils/restRequest';

import { type ManageResponse } from '../common';
import ConfirmationModal, { type ManageLocalUnitsValues } from './ConfirmationModal';
import SwitchWrapper, { type Props as SwitchProps } from './SwitchWrapper';

import i18n from './i18n.json';

type LocalUnitOptions = NonNullable<GoApiResponse<'/api/v2/local-units-options/'>['type']>[number]

interface Props {
    onClose: () => void;
    manageResponse: ManageResponse;
    pending: boolean;
    onUpdate: () => void;
}

function ConfigureLocalUnitsModal(props: Props) {
    const {
        onClose,
        manageResponse,
        pending,
        onUpdate,
    } = props;

    const [manageLocalUnitsValues, setManageLocalUnitsValues] = useState<ManageLocalUnitsValues>();

    const [localUnitType, setLocalUnitType] = useState<number>();

    const { countryResponse } = useOutletContext<CountryOutletContext>();
    const strings = useTranslation(i18n);

    const [showConfirmationModal, {
        setTrue: setShowConfirmationModalTrue,
        setFalse: setShowConfirmationModalFalse,
    }] = useBooleanState(false);

    const handleLocalUnitSwitchChange = useCallback((value: boolean, name: number) => {
        setLocalUnitType(name);

        if (isDefined(countryResponse)) {
            const isNew = isNotDefined(manageResponse) || isNotDefined(manageResponse[name]);
            const manageId = isNew ? undefined : manageResponse[name]?.externallyManagedId;

            setManageLocalUnitsValues({
                id: manageId,
                country: countryResponse.id,
                local_unit_type: name,
                enabled: value,
            });
        }
        setShowConfirmationModalTrue();
    }, [
        setManageLocalUnitsValues,
        manageResponse,
        countryResponse,
        setShowConfirmationModalTrue,
    ]);

    const isNewManageLocalUnit = useMemo(() => {
        if (isNotDefined(manageLocalUnitsValues)
            || isNotDefined(manageLocalUnitsValues?.id)) {
            return true;
        }
        return false;
    }, [manageLocalUnitsValues]);

    const {
        response: localUnitsOptions,
        pending: localUnitsOptionsPending,
    } = useRequest({
        url: '/api/v2/local-units-options/',
    });

    const columns = useMemo(() => ([
        createStringColumn<LocalUnitOptions, number>(
            'type',
            strings.localUnitTypeTableLabel,
            (item) => item.name,
        ),
        createElementColumn<LocalUnitOptions, number, SwitchProps>(
            'actions',
            strings.localUnitActionsLabel,
            SwitchWrapper,
            (_, item) => ({
                value: manageResponse && manageResponse[item.id]?.enabled,
                name: item.id,
                formId: item.id,
                pending,
                onChange: handleLocalUnitSwitchChange,
            }),
            {
                headerInfoTitle: strings.localUnitActionsLabel,
                headerInfoDescription: strings.externallyManagedDescription,
            },
        ),
    ]), [
        pending,
        manageResponse,
        handleLocalUnitSwitchChange,
        strings.localUnitTypeTableLabel,
        strings.localUnitActionsLabel,
        strings.externallyManagedDescription,
    ]);

    const localUnitName = localUnitsOptions?.type.find(
        (unit) => unit.id === manageLocalUnitsValues?.local_unit_type,
    )?.name;

    return (
        <Modal
            heading={resolveToString(
                strings.modalHeading,
                { countryName: countryResponse?.name ?? '--' },
            )}
            onClose={onClose}
            withHeaderBorder
            footerActions={(
                <Button
                    name={undefined}
                    onClick={onClose}
                >
                    {strings.closeButtonLabel}
                </Button>
            )}
        >
            <Table
                pending={localUnitsOptionsPending}
                filtered={false}
                columns={columns}
                keySelector={numericIdSelector}
                data={localUnitsOptions?.type}
            />
            {showConfirmationModal && isDefined(localUnitType) && (
                <ConfirmationModal
                    onUpdate={onUpdate}
                    localUnitName={localUnitName}
                    isNewManageLocalUnit={isNewManageLocalUnit}
                    manageLocalUnitsValues={manageLocalUnitsValues}
                    onClose={setShowConfirmationModalFalse}
                />
            )}
        </Modal>
    );
}

export default ConfigureLocalUnitsModal;
