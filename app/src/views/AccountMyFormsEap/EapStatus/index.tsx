import {
    useCallback,
    useMemo,
    useState,
} from 'react';
import { ArrowRightFillIcon } from '@ifrc-go/icons';
import {
    Button,
    DropdownMenu,
    Label,
    ListView,
    Modal,
    RawFileInput,
} from '@ifrc-go/ui';
import {
    isDefined,
    listToMap,
} from '@togglecorp/fujs';

import DropdownMenuItem from '#components/DropdownMenuItem';
import { type components } from '#generated/types';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import useAlert from '#hooks/useAlert';
import {
    EAP_STATUS_ACTIVATED,
    EAP_STATUS_APPROVED,
    EAP_STATUS_NS_ADDRESSING_COMMENTS,
    EAP_STATUS_PFA_SIGNED,
    EAP_STATUS_TECHNICALLY_VALIDATED,
    EAP_STATUS_UNDER_DEVELOPMENT,
    EAP_STATUS_UNDER_REVIEW,
} from '#utils/constants';
import {
    type GoApiBody,
    useLazyRequest,
} from '#utils/restRequest';

type EapStatusBody = GoApiBody<'/api/v2/eap-registration/{id}/status/', 'POST'>;
type EapStatus = components['schemas']['EapEapStatusEnumKey'];

const validStatusTransition: Record<EapStatus, EapStatus[]> = {
    [EAP_STATUS_UNDER_DEVELOPMENT]: [EAP_STATUS_UNDER_REVIEW],
    [EAP_STATUS_UNDER_REVIEW]: [
        EAP_STATUS_NS_ADDRESSING_COMMENTS,
        EAP_STATUS_TECHNICALLY_VALIDATED,
    ],
    [EAP_STATUS_NS_ADDRESSING_COMMENTS]: [
        EAP_STATUS_UNDER_REVIEW,
    ],
    [EAP_STATUS_TECHNICALLY_VALIDATED]: [
        EAP_STATUS_UNDER_REVIEW,
        EAP_STATUS_APPROVED,
    ],
    [EAP_STATUS_APPROVED]: [EAP_STATUS_PFA_SIGNED],
    [EAP_STATUS_PFA_SIGNED]: [EAP_STATUS_ACTIVATED],
    [EAP_STATUS_ACTIVATED]: [],
};

export interface Props {
    eapId: number;
    status: EapStatus;
    onStatusUpdate?: () => void;
}

function EapStatus(props: Props) {
    const {
        eapId,
        status,
        onStatusUpdate,
    } = props;

    const alert = useAlert();

    const { eap_eap_status: eapStatusOptions } = useGlobalEnums();
    const [newStatus, setNewStatus] = useState<EapStatus | undefined>();
    const [checklistFile, setChecklistFile] = useState<File | undefined>();

    const statusLabelMapping = listToMap(
        eapStatusOptions,
        ({ key }) => key,
        ({ value }) => value,
    );

    const { trigger: triggerStatusUpdate } = useLazyRequest({
        method: 'POST',
        url: '/api/v2/eap-registration/{id}/status/',
        pathVariables: {
            id: eapId,
        },
        body: (fields: EapStatusBody) => fields,
        onSuccess: () => {
            setNewStatus(undefined);
            if (onStatusUpdate) {
                onStatusUpdate();
            }

            alert.show(
                'Status updated successfully!',
                { variant: 'success' },
            );
        },
        formData: true,
        onFailure: () => {
            alert.show(
                'Failed to update the status!',
                { variant: 'danger' },
            );
        },
    });

    // FIXME: fix typings in the server
    const requestBody = useMemo<EapStatusBody>(
        () => ({
            status: newStatus,
            review_checklist_file: checklistFile,
        } as EapStatusBody),
        [newStatus, checklistFile],
    );

    const handleStatusUpdateCancel = useCallback(() => {
        setNewStatus(undefined);
    }, []);

    return (
        <>
            <DropdownMenu
                label={statusLabelMapping?.[status] ?? '--'}
                labelColorVariant="text"
                labelStyleVariant="translucent"
            >
                {eapStatusOptions?.map((option) => (
                    <DropdownMenuItem
                        key={option.key}
                        type="button"
                        name={option.key}
                        disabled={!validStatusTransition[status].includes(option.key)}
                        onClick={setNewStatus}
                    >
                        {option.value}
                    </DropdownMenuItem>
                ))}
            </DropdownMenu>
            {isDefined(newStatus) && (
                <Modal
                    // FIXME: use strings
                    heading="Update Status"
                    onClose={handleStatusUpdateCancel}
                    footerActions={(
                        <Button
                            name={requestBody}
                            onClick={triggerStatusUpdate}
                        >
                            Confirm
                        </Button>
                    )}
                >
                    <ListView layout="block">
                        <div>
                            Are you sure you want to update the status?
                        </div>
                        <ListView>
                            <div>
                                {statusLabelMapping?.[status]}
                            </div>
                            <ArrowRightFillIcon />
                            <div>
                                {statusLabelMapping?.[newStatus]}
                            </div>
                        </ListView>
                        {newStatus === EAP_STATUS_NS_ADDRESSING_COMMENTS && (
                            <ListView
                                layout="block"
                                spacing="sm"
                            >
                                <RawFileInput
                                    name="review_checklist_file"
                                    onChange={setChecklistFile}
                                >
                                    Select review checklist file
                                </RawFileInput>
                                <Label>
                                    {isDefined(checklistFile) && checklistFile.name}
                                </Label>
                            </ListView>
                        )}
                    </ListView>
                </Modal>
            )}
        </>
    );
}

export default EapStatus;
