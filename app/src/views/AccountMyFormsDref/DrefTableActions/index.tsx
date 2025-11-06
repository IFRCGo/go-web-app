import {
    useCallback,
    useMemo,
    useState,
} from 'react';
import {
    AddLineIcon,
    CaseManagementIcon,
    CheckLineIcon,
    DocumentPdfLineIcon,
    DownloadLineIcon,
    PencilLineIcon,
    ShareLineIcon,
} from '@ifrc-go/icons';
import type { ButtonProps } from '@ifrc-go/ui';
import {
    Button,
    Message,
    Modal,
    RadioInput,
    TableActions,
} from '@ifrc-go/ui';
import { type Language } from '@ifrc-go/ui/contexts';
import {
    useBooleanState,
    useTranslation,
} from '@ifrc-go/ui/hooks';
import {
    resolveToString,
    stringLabelSelector,
} from '@ifrc-go/ui/utils';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

import DrefExportModal from '#components/domain/DrefExportModal';
import DrefShareModal from '#components/domain/DrefShareModal';
import DropdownMenuItem from '#components/DropdownMenuItem';
import Link from '#components/Link';
import useAlert from '#hooks/useAlert';
import useRouting from '#hooks/useRouting';
import { languageNameMap } from '#utils/common';
import {
    DREF_STATUS_DRAFT,
    DREF_STATUS_FAILED,
    DREF_STATUS_FINALIZED,
    DREF_TYPE_IMMINENT,
    DREF_TYPE_LOAN,
    type DrefStatus,
    type TypeOfDrefEnum,
} from '#utils/constants';
import {
    type GoApiBody,
    useLazyRequest,
} from '#utils/restRequest';

import { exportDrefAllocation } from './drefAllocationExport';

import i18n from './i18n.json';
import styles from './styles.module.css';

type SelectLanguageOption = {
    key: Language,
    label: string,
}

function selectLanguageKeySelector(option: SelectLanguageOption) {
    return option.key;
}

export interface Props {
    drefId: number;
    id: number;
    status: DrefStatus | null | undefined;

    applicationType: 'DREF' | 'OPS_UPDATE' | 'FINAL_REPORT';
    canAddOpsUpdate: boolean;
    canCreateFinalReport: boolean;
    hasPermissionToApprove?: boolean;
    isDrefImminentV2?: boolean;
    startingLanguage?: Language;

    onPublishSuccess?: () => void;
    drefType?: TypeOfDrefEnum | null | undefined;
}

function DrefTableActions(props: Props) {
    const {
        id,
        drefId: drefIdFromProps,
        status,
        applicationType,
        canAddOpsUpdate,
        canCreateFinalReport,
        hasPermissionToApprove,
        isDrefImminentV2,
        onPublishSuccess,
        drefType,
        startingLanguage,
    } = props;

    const [selectOpsLanguage, setSelectOpsLanguage] = useState<Language | undefined>();

    const [selectFinalLanguage, setSelectFinalLanguage] = useState<Language | undefined>();

    const { navigate } = useRouting();

    const alert = useAlert();

    const strings = useTranslation(i18n);

    const selectLanguageOptions: SelectLanguageOption[] | undefined = useMemo(() => {
        if (isNotDefined(startingLanguage)) {
            return undefined;
        }
        return [
            {
                key: startingLanguage,
                label: `${languageNameMap[startingLanguage]} (${strings.drefOpsUpdateStartingLanguageLabel})`,
            },
            { key: 'en', label: languageNameMap.en },
        ];
    }, [startingLanguage, strings.drefOpsUpdateStartingLanguageLabel]);

    const [showExportModal, {
        setTrue: setShowExportModalTrue,
        setFalse: setShowExportModalFalse,
    }] = useBooleanState(false);

    const {
        trigger: fetchDref,
        pending: fetchingDref,
    } = useLazyRequest({
        url: '/api/v2/dref/{id}/',
        pathVariables: (ctx: number) => (
            isDefined(ctx) ? {
                id: String(ctx),
            } : undefined
        ),
        onSuccess: (response) => {
            const exportData = {
                // FIXME: use translations
                allocationFor: response?.type_of_dref === DREF_TYPE_LOAN ? 'Emergency Appeal' : 'DREF Operation',
                appealManager: response?.ifrc_appeal_manager_name,
                projectManager: response?.ifrc_project_manager_name,
                affectedCountry: response?.country_details?.name,
                name: response?.title,
                disasterType: response?.disaster_type_details?.name,
                // FIXME: use translations
                responseType: response?.type_of_dref === DREF_TYPE_IMMINENT ? 'Imminent Crisis' : response?.type_of_onset_display,
                noOfPeopleTargeted: response?.num_assisted,
                nsRequestDate: response?.ns_request_date,
                disasterStartDate: response?.event_date,
                implementationPeriod: response?.type_of_dref === DREF_TYPE_IMMINENT
                    ? `${response.operation_timeframe_imminent} days` : `${response?.operation_timeframe} months`,
                totalDREFAllocation: response?.amount_requested,
                previousAllocation: undefined,
                allocationRequested: response.type_of_dref === DREF_TYPE_IMMINENT
                    ? response.total_cost : response?.amount_requested,
                // FIXME: use translations
                toBeAllocatedFrom: response?.type_of_dref === DREF_TYPE_IMMINENT ? 'Anticipatory Pillar' : 'Response Pillar',
                focalPointName: response?.regional_focal_point_name,
            };
            exportDrefAllocation(exportData);
        },
    });

    const {
        trigger: fetchOpsUpdate,
        pending: fetchingOpsUpdate,
    } = useLazyRequest({
        url: '/api/v2/dref-op-update/{id}/',
        pathVariables: (ctx: number) => (
            isDefined(ctx) ? {
                id: String(ctx),
            } : undefined
        ),
        onSuccess: (response) => {
            const exportData = {
                allocationFor: response?.type_of_dref === DREF_TYPE_LOAN ? 'Emergency Appeal' : 'DREF Operation',
                appealManager: response?.ifrc_appeal_manager_name,
                projectManager: response?.ifrc_project_manager_name,
                affectedCountry: response?.country_details?.name,
                name: response?.title,
                disasterType: response?.disaster_type_details?.name,
                responseType:
                    response?.type_of_dref === DREF_TYPE_IMMINENT
                        // FIXME: add translations
                        ? 'Imminent Crisis'
                        : response?.type_of_onset_display,
                nsRequestDate: response?.ns_request_date,
                disasterStartDate: response?.event_date,
                implementationPeriod: `${response?.total_operation_timeframe} months`,
                allocationRequested: response?.additional_allocation,
                previousAllocation: response?.dref_allocated_so_far ?? 0,
                totalDREFAllocation: response?.total_dref_allocation,
                noOfPeopleTargeted: response?.number_of_people_targeted,
                toBeAllocatedFrom:
                    response?.type_of_dref === DREF_TYPE_IMMINENT
                        // FIXME: add translations
                        ? 'Anticipatory Pillar'
                        : 'Response Pillar',
                focalPointName: response?.regional_focal_point_name,
            };
            exportDrefAllocation(exportData);
        },
    });

    const {
        trigger: publishDref,
        pending: publishDrefPending,
    } = useLazyRequest({
        method: 'POST',
        url: '/api/v2/dref/{id}/approve/',
        pathVariables: { id: String(id) },
        // FIXME: typings should be fixed in the server
        body: () => ({} as never),
        onSuccess: () => {
            alert.show(
                strings.drefApprovalSuccessTitle,
                { variant: 'success' },
            );
            if (onPublishSuccess) {
                onPublishSuccess();
            }
        },
        onFailure: ({
            value: { messageForNotification },
        }) => {
            alert.show(
                strings.drefApprovalFailureTitle,
                {
                    description: messageForNotification,
                    variant: 'danger',
                },
            );
        },
    });

    const {
        trigger: publishOpsUpdate,
        pending: publishOpsUpdatePending,
    } = useLazyRequest({
        method: 'POST',
        url: '/api/v2/dref-op-update/{id}/approve/',
        pathVariables: { id: String(id) },
        // FIXME: typings should be fixed in the server
        body: () => ({} as never),
        onSuccess: () => {
            alert.show(
                strings.drefApprovalSuccessTitle,
                { variant: 'success' },
            );
            if (onPublishSuccess) {
                onPublishSuccess();
            }
        },
        onFailure: ({
            value: { messageForNotification },
        }) => {
            alert.show(
                strings.drefApprovalFailureTitle,
                {
                    description: messageForNotification,
                    variant: 'danger',
                },
            );
        },
    });

    const {
        trigger: publishFinalReport,
        pending: publishFinalReportPending,
    } = useLazyRequest({
        method: 'POST',
        url: '/api/v2/dref-final-report/{id}/approve/',
        pathVariables: { id: String(id) },
        // FIXME: typings should be fixed in the server
        body: () => ({} as never),
        onSuccess: () => {
            alert.show(
                strings.drefApprovalSuccessTitle,
                { variant: 'success' },
            );
            if (onPublishSuccess) {
                onPublishSuccess();
            }
        },
        onFailure: ({
            value: { messageForNotification },
        }) => {
            alert.show(
                strings.drefApprovalFailureTitle,
                {
                    description: messageForNotification,
                    variant: 'danger',
                },
            );
        },
    });

    const {
        trigger: finalizeDref,
        pending: finalizeDrefPending,
    } = useLazyRequest({
        method: 'POST',
        url: '/api/v2/dref/{id}/finalize/',
        pathVariables: { id: String(id) },
        body: () => ({} as never),
        onSuccess: () => {
            alert.show(
                strings.drefFinalizeSuccessTitle,
                { variant: 'success' },
            );
            if (onPublishSuccess) {
                onPublishSuccess();
            }
        },
        onFailure: ({
            value: { messageForNotification },
        }) => {
            alert.show(
                strings.drefFinalizeFailureTitle,
                {
                    description: messageForNotification,
                    variant: 'danger',
                },
            );
        },
    });

    const {
        trigger: finalizeOpsUpdate,
        pending: finalizeOpsUpdatePending,
    } = useLazyRequest({
        method: 'POST',
        url: '/api/v2/dref-op-update/{id}/finalize/',
        pathVariables: { id: String(id) },
        body: () => ({} as never),
        onSuccess: () => {
            alert.show(
                strings.drefFinalizeSuccessTitle,
                { variant: 'success' },
            );
            if (onPublishSuccess) {
                onPublishSuccess();
            }
        },
        onFailure: ({
            value: { messageForNotification },
        }) => {
            alert.show(
                strings.drefFinalizeFailureTitle,
                {
                    description: messageForNotification,
                    variant: 'danger',
                },
            );
        },
    });

    const {
        trigger: finalizeFinalReport,
        pending: finalizeFinalReportPending,
    } = useLazyRequest({
        method: 'POST',
        url: '/api/v2/dref-final-report/{id}/finalize/',
        pathVariables: { id: String(id) },
        body: () => ({} as never),
        onSuccess: () => {
            alert.show(
                strings.drefFinalizeSuccessTitle,
                { variant: 'success' },
            );
            if (onPublishSuccess) {
                onPublishSuccess();
            }
        },
        onFailure: ({
            value: { messageForNotification },
        }) => {
            alert.show(
                strings.drefFinalizeFailureTitle,
                {
                    description: messageForNotification,
                    variant: 'danger',
                },
            );
        },
    });

    // FIXME: the type should be fixed on the server
    type OpsUpdateRequestBody = GoApiBody<'/api/v2/dref-op-update/', 'POST'>;

    const {
        trigger: createOpsUpdate,
        pending: createOpsUpdatePending,
    } = useLazyRequest({
        method: 'POST',
        url: '/api/v2/dref-op-update/',
        // FIXME: the type should be fixed on the server
        body: (
            drefId: number,
        ) => ({
            dref: drefId,
            starting_language: startingLanguage === 'en' ? startingLanguage : selectOpsLanguage,
        } as unknown as OpsUpdateRequestBody),
        enforceLanguageForMutation: selectOpsLanguage,
        onSuccess: (response) => {
            navigate(
                'drefOperationalUpdateForm',
                { params: { opsUpdateId: response.id } },
                { state: { isNewOpsUpdate: true } },
            );
        },
        onFailure: ({
            value: { messageForNotification },
        }) => {
            alert.show(
                strings.drefAccountCouldNotCreate,
                {
                    description: messageForNotification,
                    variant: 'danger',
                },
            );
        },
    });

    // FIXME: the type should be fixed on the server
    type FinalReportRequestBody = GoApiBody<'/api/v2/dref-final-report/', 'POST'>;
    const {
        trigger: createFinalReport,
        pending: createFinalReportPending,
    } = useLazyRequest({
        method: 'POST',
        url: '/api/v2/dref-final-report/',
        enforceLanguageForMutation: selectFinalLanguage,
        // FIXME: the type should be fixed on the server
        body: (
            drefId: number,
        ) => ({
            dref: drefId,
            starting_language: startingLanguage === 'en' ? startingLanguage : selectFinalLanguage,
        } as FinalReportRequestBody),
        onSuccess: (response) => {
            navigate(
                isDrefImminentV2 ? 'drefFinalReportForm' : 'oldDrefFinalReportForm',
                { params: { finalReportId: response.id } },
            );
        },
        onFailure: ({
            value: { messageForNotification },
        }) => {
            alert.show(
                strings.drefAccountCouldNotCreateFinalReport,
                {
                    description: messageForNotification,
                    variant: 'danger',
                },
            );
        },
    });

    const handleAddOpsUpdate = useCallback(
        () => {
            createOpsUpdate(drefIdFromProps);
        },
        [drefIdFromProps, createOpsUpdate],
    );

    const handleAddFinalReport = useCallback(
        () => {
            createFinalReport(drefIdFromProps);
        },
        [drefIdFromProps, createFinalReport],
    );

    const [showShareModal, {
        setTrue: setShowShareModalTrue,
        setFalse: setShowShareModalFalse,
    }] = useBooleanState(false);

    const [showOperationConfirmModal, {
        setTrue: setShowOperationConfirmModalTrue,
        setFalse: setShowOperationConfirmModalFalse,
    }] = useBooleanState(false);

    const [showFinalReportConfirmModal, {
        setTrue: setShowFinalReportConfirmModalTrue,
        setFalse: setShowFinalReportConfirmModalFalse,
    }] = useBooleanState(false);

    const handleExportClick: NonNullable<ButtonProps<undefined>['onClick']> = useCallback(
        () => {
            setShowExportModalTrue();
        },
        [setShowExportModalTrue],
    );

    const handleShareClick: NonNullable<ButtonProps<undefined>['onClick']> = useCallback(
        () => {
            setShowShareModalTrue();
        },
        [setShowShareModalTrue],
    );

    const handlePublishClick = useCallback(
        () => {
            if (applicationType === 'DREF') {
                publishDref(null);
            } else if (applicationType === 'OPS_UPDATE') {
                publishOpsUpdate(null);
            } else if (applicationType === 'FINAL_REPORT') {
                publishFinalReport(null);
            } else {
                applicationType satisfies never;
            }
        },
        [
            applicationType,
            publishDref,
            publishOpsUpdate,
            publishFinalReport,
        ],
    );

    const handleFinalizeClick = useCallback(
        () => {
            if (applicationType === 'DREF') {
                finalizeDref(null);
            } else if (applicationType === 'OPS_UPDATE') {
                finalizeOpsUpdate(null);
            } else if (applicationType === 'FINAL_REPORT') {
                finalizeFinalReport(null);
            } else {
                applicationType satisfies never;
            }
        },
        [
            applicationType,
            finalizeDref,
            finalizeOpsUpdate,
            finalizeFinalReport,
        ],
    );

    const handleDrefAllocationExport = useCallback(
        () => {
            if (applicationType === 'DREF') {
                fetchDref(id);
            } else if (applicationType === 'OPS_UPDATE') {
                fetchOpsUpdate(id);
            }
        },
        [fetchDref, fetchOpsUpdate, applicationType, id],
    );

    const drefApprovalPending = publishDrefPending
        || publishOpsUpdatePending
        || publishFinalReportPending;

    const canDownloadAllocation = (applicationType === 'DREF' || applicationType === 'OPS_UPDATE');

    const canApprove = status === DREF_STATUS_FINALIZED && hasPermissionToApprove;

    const canFinalize = status === (DREF_STATUS_DRAFT
        || DREF_STATUS_FAILED)
        && hasPermissionToApprove;

    const shouldConfirmImminentAddOpsUpdate = drefType === DREF_TYPE_IMMINENT && isDrefImminentV2;

    const disabled = fetchingDref
        || fetchingOpsUpdate
        || publishDrefPending
        || finalizeDrefPending
        || finalizeOpsUpdatePending
        || finalizeFinalReportPending
        || publishOpsUpdatePending
        || publishFinalReportPending
        || createOpsUpdatePending
        || createFinalReportPending;

    return (
        <TableActions
            persistent
            extraActions={(
                <>
                    {canFinalize && (
                        <DropdownMenuItem
                            name={undefined}
                            type="confirm-button"
                            icons={<CheckLineIcon className={styles.icon} />}
                            confirmMessage={
                                resolveToString(
                                    strings.drefAccountFinalizeConfirmMessage,
                                    {
                                        selectedLanguage: startingLanguage ? languageNameMap[startingLanguage] : '--',
                                    },
                                )
                            }
                            onConfirm={handleFinalizeClick}
                            disabled={disabled}
                            persist
                        >
                            {strings.dropdownActionFinalizeLabel}
                        </DropdownMenuItem>
                    )}
                    {canApprove && (
                        <DropdownMenuItem
                            name={undefined}
                            type="confirm-button"
                            icons={<CheckLineIcon className={styles.icon} />}
                            confirmMessage={strings.drefAccountConfirmMessage}
                            onConfirm={handlePublishClick}
                            disabled={disabled}
                            persist
                        >
                            {strings.dropdownActionApproveLabel}
                        </DropdownMenuItem>
                    )}
                    {canDownloadAllocation && (
                        <DropdownMenuItem
                            name={undefined}
                            type="button"
                            onClick={handleDrefAllocationExport}
                            icons={<DownloadLineIcon className={styles.icon} />}
                            disabled={disabled}
                            persist
                        >
                            {strings.dropdownActionAllocationFormLabel}
                        </DropdownMenuItem>
                    )}
                    {canAddOpsUpdate && (
                        <DropdownMenuItem
                            name={undefined}
                            type="button"
                            icons={<AddLineIcon className={styles.icon} />}
                            onClick={setShowOperationConfirmModalTrue}
                            disabled={disabled}
                            persist
                        >
                            {strings.dropdownActionAddOpsUpdateLabel}
                        </DropdownMenuItem>
                    )}
                    {canCreateFinalReport && (
                        <DropdownMenuItem
                            name={undefined}
                            type="button"
                            onClick={setShowFinalReportConfirmModalTrue}
                            icons={<CaseManagementIcon className={styles.icon} />}
                            disabled={disabled}
                            persist
                        >
                            {strings.dropdownActionCreateFinalReportLabel}
                        </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                        name={undefined}
                        type="button"
                        icons={<ShareLineIcon className={styles.icon} />}
                        onClick={handleShareClick}
                        disabled={disabled}
                        persist
                    >
                        {strings.dropdownActionShareLabel}
                    </DropdownMenuItem>
                    {drefType !== DREF_TYPE_LOAN && (
                        <DropdownMenuItem
                            name={undefined}
                            type="button"
                            icons={<DocumentPdfLineIcon className={styles.icon} />}
                            onClick={handleExportClick}
                            disabled={disabled}
                            persist
                        >
                            {strings.dropdownActionExportLabel}
                        </DropdownMenuItem>
                    )}
                </>
            )}
        >
            {
                (status === DREF_STATUS_DRAFT || status === DREF_STATUS_FINALIZED) && applicationType === 'DREF' && (
                    <Link
                        to="drefApplicationForm"
                        urlParams={{ drefId: id }}
                        variant="secondary"
                        icons={<PencilLineIcon className={styles.icon} />}
                    >
                        {strings.dropdownActionEditLabel}
                    </Link>
                )
            }
            {
                (status === DREF_STATUS_DRAFT || status === DREF_STATUS_FINALIZED) && applicationType === 'OPS_UPDATE' && (
                    <Link
                        to="drefOperationalUpdateForm"
                        urlParams={{ opsUpdateId: id }}
                        variant="secondary"
                        icons={<PencilLineIcon className={styles.icon} />}
                    >
                        {strings.dropdownActionEditLabel}
                    </Link>
                )
            }
            {
                (status === DREF_STATUS_DRAFT || status === DREF_STATUS_FINALIZED) && applicationType === 'FINAL_REPORT' && (
                    <Link
                        to={isDrefImminentV2 ? 'drefFinalReportForm' : 'oldDrefFinalReportForm'}
                        urlParams={{ finalReportId: id }}
                        variant="secondary"
                        icons={<PencilLineIcon className={styles.icon} />}
                    >
                        {strings.dropdownActionEditLabel}
                    </Link>
                )
            }
            {
                showExportModal && (
                    <DrefExportModal
                        onCancel={setShowExportModalFalse}
                        id={id}
                        applicationType={applicationType}
                        drefType={drefType}
                        isDrefImminentV2={isDrefImminentV2}
                    />
                )
            }
            {
                showShareModal && (
                    <DrefShareModal
                        onCancel={setShowShareModalFalse}
                        onSuccess={setShowShareModalFalse}
                        drefId={drefIdFromProps}
                    />
                )
            }
            {
                showOperationConfirmModal && (
                    <Modal
                        heading={strings.dropdownActionImminentNewOpsUpdateConfirmationHeading}
                        onClose={setShowOperationConfirmModalFalse}
                        childrenContainerClassName={styles.addOpsUpdateModal}
                        footerActions={(
                            <Button
                                name={undefined}
                                onClick={handleAddOpsUpdate}
                                disabled={(startingLanguage !== 'en' && !selectOpsLanguage)}
                            >
                                {strings.dropdownActionAddOpsUpdateLabel}
                            </Button>
                        )}
                    >
                        <p>{strings.dropdownActionNewOpsUpdateConfirmationMessage}</p>
                        {shouldConfirmImminentAddOpsUpdate
                            && strings.dropdownActionImminentNewOpsUpdateConfirmationMessage}
                        {startingLanguage !== 'en' && (
                            <>
                                <p>
                                    {strings
                                        .dropdownActionNewOpsUpdateLanguageSelectLanguageMessage}
                                </p>
                                <RadioInput
                                    name={undefined}
                                    value={selectOpsLanguage}
                                    options={selectLanguageOptions}
                                    onChange={setSelectOpsLanguage}
                                    keySelector={selectLanguageKeySelector}
                                    labelSelector={stringLabelSelector}
                                />
                            </>
                        )}
                    </Modal>
                )
            }
            {
                showFinalReportConfirmModal && (
                    <Modal
                        heading={strings.dropdownActionNewFinalReportConfirmationHeading}
                        onClose={setShowFinalReportConfirmModalFalse}
                        childrenContainerClassName={styles.addOpsUpdateModal}
                        footerActions={(
                            <Button
                                name={undefined}
                                onClick={handleAddFinalReport}
                                disabled={(startingLanguage !== 'en' && !selectFinalLanguage)}
                            >
                                {strings.dropdownActionAddFinalReportLabel}
                            </Button>
                        )}
                    >
                        <p>{strings.dropdownActionNewFinalReportConfirmationMessage}</p>
                        {startingLanguage !== 'en' && (
                            <>
                                <p>
                                    {strings
                                        .dropdownActionNewFinalReportLanguageSelectLanguageMessage}
                                </p>
                                <RadioInput
                                    name={undefined}
                                    value={selectFinalLanguage}
                                    options={selectLanguageOptions}
                                    onChange={setSelectFinalLanguage}
                                    keySelector={selectLanguageKeySelector}
                                    labelSelector={stringLabelSelector}
                                />
                            </>
                        )}
                    </Modal>
                )
            }
            {
                drefApprovalPending && (
                    <Modal>
                        <Message
                            pending
                            title={strings.drefApprovalInProgressTitle}
                        />
                    </Modal>
                )
            }
        </TableActions>
    );
}

export default DrefTableActions;
