import {
    useCallback,
    useMemo,
    useState,
} from 'react';
import {
    ArrowRightFillIcon,
    UploadLineIcon,
} from '@ifrc-go/icons';
import {
    Alert,
    Button,
    Description,
    DropdownMenu,
    Label,
    ListView,
    Modal,
    RawFileInput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    isDefined,
    isNotDefined,
    listToMap,
} from '@togglecorp/fujs';

import DropdownMenuItem from '#components/DropdownMenuItem';
import Link from '#components/Link';
import { type components } from '#generated/types';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import useAlert from '#hooks/useAlert';
import {
    EAP_STATUS_APPROVED,
    EAP_STATUS_NS_ADDRESSING_COMMENTS,
    EAP_STATUS_PENDING_PFA,
    EAP_STATUS_TECHNICALLY_VALIDATED,
    EAP_STATUS_UNDER_DEVELOPMENT,
    EAP_STATUS_UNDER_REVIEW,
    EAP_TYPE_FULL,
    EAP_TYPE_SIMPLIFIED,
} from '#utils/constants';
import {
    type GoApiBody,
    useLazyRequest,
} from '#utils/restRequest';
import { type ResponseObjectError } from '#utils/restRequest/error';

import { type EapListItem } from '../utils';

import i18n from './i18n.json';

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
        EAP_STATUS_NS_ADDRESSING_COMMENTS,
        EAP_STATUS_PENDING_PFA,
    ],
    [EAP_STATUS_PENDING_PFA]: [EAP_STATUS_APPROVED],
    [EAP_STATUS_APPROVED]: [],
};

export interface Props {
    eapId: number;
    status: EapStatus;
    onStatusUpdate?: () => void;
    hasValidatedBudgetFile?: boolean;
    details: EapListItem;
}

function EapStatus(props: Props) {
    const {
        eapId,
        status,
        onStatusUpdate,
        hasValidatedBudgetFile,
        details,
    } = props;

    const latestId = useMemo(() => {
        if (details.eap_type === EAP_TYPE_SIMPLIFIED) {
            return details.latest_simplified_eap ?? undefined;
        }

        if (details.eap_type === EAP_TYPE_FULL) {
            return details.latest_full_eap ?? undefined;
        }

        return undefined;
    }, [details]);

    const latestSimplifiedEap = details.eap_type === EAP_TYPE_SIMPLIFIED
        ? details.simplified_eap_details.find(({ id }) => latestId === id)
        : undefined;

    const latestFullEap = details.eap_type === EAP_TYPE_FULL
        ? details.full_eap_details.find(({ id }) => latestId === id)
        : undefined;

    const alert = useAlert();

    const { eap_eap_status: eapStatusOptions } = useGlobalEnums();
    const [newStatus, setNewStatus] = useState<EapStatus | undefined>();
    const [checklistFile, setChecklistFile] = useState<File | undefined>();
    const [responseFormErrors, setResponseFormErrors] = useState<ResponseObjectError>();

    const strings = useTranslation(i18n);

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
                strings.statusUpdateSuccessAlert,
                { variant: 'success' },
            );
        },
        formData: true,
        onFailure: (error) => {
            const {
                value: { formErrors, messageForNotification },
            } = error;

            if (isDefined(formErrors)) {
                setResponseFormErrors(formErrors);
            }

            alert.show(
                strings.statusUpdateFailedAlert,
                {
                    variant: 'danger',
                    description: messageForNotification,
                },
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

    const isSimplifiedEapLocked = status === EAP_STATUS_NS_ADDRESSING_COMMENTS
        && latestSimplifiedEap?.is_locked;
    const isFullEapLocked = status === EAP_STATUS_NS_ADDRESSING_COMMENTS
        && latestFullEap?.is_locked;

    const confirmDisabled = (
        (newStatus === EAP_STATUS_NS_ADDRESSING_COMMENTS && isNotDefined(checklistFile))
            || (newStatus === EAP_STATUS_PENDING_PFA && !hasValidatedBudgetFile)
        || isDefined(responseFormErrors)
        || isSimplifiedEapLocked || isFullEapLocked
    );

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
                        disabled={!validStatusTransition[status].includes(option.key)
                            || isNotDefined(latestId)}
                        onClick={setNewStatus}
                    >
                        {option.value}
                    </DropdownMenuItem>
                ))}
            </DropdownMenu>
            {isDefined(newStatus) && (
                <Modal
                    heading={strings.updateStatusHeading}
                    onClose={handleStatusUpdateCancel}
                    footerActions={(
                        <ListView>
                            {!isSimplifiedEapLocked
                                && details.eap_type === EAP_TYPE_SIMPLIFIED
                                && responseFormErrors
                                && (
                                    <Link
                                        to="simplifiedEapForm"
                                        urlParams={{ eapId }}
                                        urlSearch={isDefined(latestSimplifiedEap?.version)
                                            ? `version=${latestSimplifiedEap.version}`
                                            : undefined}
                                        title={strings.editSimplifiedEapFormLinkLabel}
                                        state={{ error: responseFormErrors }}
                                        styleVariant="outline"
                                        colorVariant="primary"
                                    >
                                        {strings.editSimplifiedEapFormLinkLabel}
                                    </Link>
                                )}
                            {!isFullEapLocked
                                && details.eap_type === EAP_TYPE_FULL
                                && responseFormErrors
                                && (
                                    <Link
                                        to="eapFullExport"
                                        urlParams={{ eapId }}
                                        urlSearch={isDefined(latestFullEap?.version)
                                            ? `version=${latestFullEap.version}`
                                            : undefined}
                                        title={strings.editFullEapFormLinkLabel}
                                        state={{ error: responseFormErrors }}
                                        styleVariant="outline"
                                        colorVariant="primary"
                                    >
                                        {strings.editFullEapFormLinkLabel}
                                    </Link>
                                )}
                            <Button
                                name={requestBody}
                                onClick={triggerStatusUpdate}
                                disabled={confirmDisabled}
                            >
                                {strings.confirmStatusButtonLabel}
                            </Button>
                        </ListView>
                    )}
                >
                    <ListView
                        layout="block"
                    >
                        <Description>
                            {strings.updateStatusDescription}
                        </Description>
                        <ListView spacing="sm">
                            <Label strong>
                                {statusLabelMapping?.[status]}
                            </Label>
                            <ArrowRightFillIcon />
                            <Label strong>
                                {statusLabelMapping?.[newStatus]}
                            </Label>
                        </ListView>
                        {newStatus === EAP_STATUS_NS_ADDRESSING_COMMENTS && (
                            <ListView
                                layout="block"
                                spacing="sm"
                            >
                                <Description withLightText>
                                    {strings.reviewChecklistDescription}
                                </Description>
                                <RawFileInput
                                    name="review_checklist_file"
                                    onChange={setChecklistFile}
                                    before={<UploadLineIcon />}
                                    accept=".pdf, .docx, .pptx, .xlsx, .xlsm"
                                >
                                    {strings.reviewChecklistInputLabel}
                                </RawFileInput>
                                <Label>
                                    {isDefined(checklistFile) && checklistFile.name}
                                </Label>
                            </ListView>
                        )}
                        {(isSimplifiedEapLocked || isFullEapLocked) && (
                            <Alert
                                name="revise-error-warning"
                                type="warning"
                                title={strings.reviseFormErrorMessage}
                                withLightBackground
                                withoutShadow
                            />
                        )}
                        {!(isSimplifiedEapLocked || isFullEapLocked)
                            && isDefined(responseFormErrors)
                            && (
                                <Alert
                                    name="form-error-warning"
                                    type="warning"
                                    title={strings.submitFormErrorMessage}
                                    withLightBackground
                                    withoutShadow
                                />
                            )}
                        {newStatus === EAP_STATUS_PENDING_PFA && !hasValidatedBudgetFile && (
                            <Alert
                                name="no-budget-file-warning"
                                type="danger"
                                title={strings.noBudgetAlertTitle}
                                withLightBackground
                                withoutShadow
                            />
                        )}
                    </ListView>
                </Modal>
            )}
        </>
    );
}

export default EapStatus;
