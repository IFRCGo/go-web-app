import { useCallback } from 'react';
import { isDefined } from '@togglecorp/fujs';
import {
    AddLineIcon,
    CaseManagementIcon,
    CheckLineIcon,
    DocumentPdfLineIcon,
    DownloadLineIcon,
    PencilLineIcon,
    ShareLineIcon,
} from '@ifrc-go/icons';

import useRouting from '#hooks/useRouting';
import { type Props as ButtonProps } from '#components/Button';
import DropdownMenuItem from '#components/DropdownMenuItem';
import TableActions from '#components/Table/TableActions';
import Link from '#components/Link';
import Modal from '#components/Modal';
import Message from '#components/Message';
import DrefShareModal from '#components/domain/DrefShareModal';
import DrefExportModal from '#components/domain/DrefExportModal';
import { type components } from '#generated/types';
import useBooleanState from '#hooks/useBooleanState';
import useTranslation from '#hooks/useTranslation';
import useAlert from '#hooks/useAlert';
import { useLazyRequest } from '#utils/restRequest';
import { DREF_STATUS_IN_PROGRESS } from '#utils/constants';

import { exportDrefAllocation } from './drefAllocationExport';
import i18n from './i18n.json';
import styles from './styles.module.css';

type DrefStatus = components<'read'>['schemas']['OperationTypeEnum'];

export interface Props {
    drefId: number;
    id: number;
    status: DrefStatus | null | undefined;

    applicationType: 'DREF' | 'OPS_UPDATE' | 'FINAL_REPORT';
    canAddOpsUpdate: boolean;
    canCreateFinalReport: boolean;
    hasPermissionToApprove?: boolean;

    onPublishSuccess?: () => void;
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
        onPublishSuccess,
    } = props;

    const { navigate } = useRouting();

    const alert = useAlert();

    const strings = useTranslation(i18n);
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
                allocationFor: response?.type_of_dref_display === 'Loan' ? 'Emergency Appeal' : 'DREF Operation',
                appealManager: response?.ifrc_appeal_manager_name,
                projectManager: response?.ifrc_project_manager_name,
                affectedCountry: response?.country_details?.name,
                name: response?.title,
                disasterType: response?.disaster_type_details?.name,
                responseType: response?.type_of_dref_display === 'Imminent' ? 'Imminent Crisis' : response?.type_of_onset_display,
                noOfPeopleTargeted: response?.num_assisted,
                nsRequestDate: response?.ns_request_date,
                disasterStartDate: response?.event_date,
                implementationPeriod: response?.operation_timeframe,
                allocationRequested: response?.amount_requested,
                previousAllocation: undefined,
                totalDREFAllocation: response?.amount_requested,
                toBeAllocatedFrom: response?.type_of_dref_display === 'Imminent' ? 'Anticipatory Pillar' : 'Response Pillar',
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
                allocationFor: response?.type_of_dref_display === 'Loan' ? 'Emergency Appeal' : 'DREF Operation',
                appealManager: response?.ifrc_appeal_manager_name,
                projectManager: response?.ifrc_project_manager_name,
                affectedCountry: response?.country_details?.name,
                name: response?.title,
                disasterType: response?.disaster_type_details?.name,
                responseType:
                    response?.type_of_dref_display === 'Imminent'
                    // FIXME: can't compare imminent with Imminent Crisis directly
                        ? 'Imminent Crisis'
                        : response?.type_of_onset_display,
                noOfPeopleTargeted: response?.number_of_people_targeted,
                nsRequestDate: response?.ns_request_date,
                disasterStartDate: response?.event_date,
                implementationPeriod: response?.total_operation_timeframe,
                allocationRequested: response?.additional_allocation,
                previousAllocation: response?.dref_allocated_so_far ?? 0,
                totalDREFAllocation: response?.total_dref_allocation,
                toBeAllocatedFrom:
                    response?.type_of_dref_display === 'Imminent'
                    // FIXME: can't compare imminent with Anticipatory Pillar
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
        url: '/api/v2/dref/{id}/publish/',
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
        url: '/api/v2/dref-op-update/{id}/publish/',
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
        url: '/api/v2/dref-final-report/{id}/publish/',
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
        trigger: createOpsUpdate,
        pending: createOpsUpdatePending,
    } = useLazyRequest({
        method: 'POST',
        url: '/api/v2/dref-op-update/',
        // FIXME: the type should be fixed on the server
        body: (drefId: number) => ({ dref: drefId }),
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

    const {
        trigger: createFinalReport,
        pending: createFinalReportPending,
    } = useLazyRequest({
        method: 'POST',
        url: '/api/v2/dref-final-report/',
        // FIXME: the type should be fixed on the server
        body: (drefId: number) => ({ dref: drefId }),
        onSuccess: (response) => {
            navigate(
                'drefFinalReportForm',
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
            }
        },
        [
            applicationType,
            publishDref,
            publishOpsUpdate,
            publishFinalReport,
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

    const canApprove = status === DREF_STATUS_IN_PROGRESS && hasPermissionToApprove;

    const disabled = fetchingDref
        || fetchingOpsUpdate
        || publishDrefPending
        || publishOpsUpdatePending
        || publishFinalReportPending
        || createOpsUpdatePending
        || createFinalReportPending;

    return (
        <TableActions
            persistent
            extraActions={(
                <>
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
                            onClick={handleAddOpsUpdate}
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
                            onClick={handleAddFinalReport}
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
                </>
            )}
        >
            {status === DREF_STATUS_IN_PROGRESS && applicationType === 'DREF' && (
                <Link
                    to="drefApplicationForm"
                    urlParams={{ drefId: id }}
                    variant="secondary"
                    icons={<PencilLineIcon className={styles.icon} />}
                >
                    {strings.dropdownActionEditLabel}
                </Link>
            )}
            {status === DREF_STATUS_IN_PROGRESS && applicationType === 'OPS_UPDATE' && (
                <Link
                    to="drefOperationalUpdateForm"
                    urlParams={{ opsUpdateId: id }}
                    variant="secondary"
                    icons={<PencilLineIcon className={styles.icon} />}
                >
                    {strings.dropdownActionEditLabel}
                </Link>
            )}
            {status === DREF_STATUS_IN_PROGRESS && applicationType === 'FINAL_REPORT' && (
                <Link
                    to="drefFinalReportForm"
                    urlParams={{ finalReportId: id }}
                    variant="secondary"
                    icons={<PencilLineIcon className={styles.icon} />}
                >
                    {strings.dropdownActionEditLabel}
                </Link>
            )}
            {showExportModal && (
                <DrefExportModal
                    onCancel={setShowExportModalFalse}
                    id={id}
                    applicationType={applicationType}
                />
            )}
            {showShareModal && (
                <DrefShareModal
                    onCancel={setShowShareModalFalse}
                    onSuccess={setShowShareModalFalse}
                    drefId={drefIdFromProps}
                />
            )}
            {drefApprovalPending && (
                <Modal>
                    <Message
                        pending
                        title={strings.drefApprovalInProgressTitle}
                    />
                </Modal>
            )}
        </TableActions>
    );
}

export default DrefTableActions;
