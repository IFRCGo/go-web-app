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

import { type Props as ButtonProps } from '#components/Button';
import DropdownMenuItem from '#components/DropdownMenuItem';
import TableActions from '#components/Table/TableActions';
import Link from '#components/Link';
import useBooleanState from '#hooks/useBooleanState';
import useTranslation from '#hooks/useTranslation';
import { useLazyRequest } from '#utils/restRequest';
import { type components } from '#generated/types';
import { DREF_STATUS_IN_PROGRESS } from '#utils/constants';

import DrefExportModal from './DrefExportModal';
import i18n from './i18n.json';
import styles from './styles.module.css';
import DrefShareModal from './DrefShareModal';
import { exportDrefAllocation } from './drefAllocationExport';

type DrefStatus = components<'read'>['schemas']['OperationTypeEnum'];

export interface Props {
    drefId: number;
    id: number;
    status: DrefStatus | null | undefined;

    applicationType: 'DREF' | 'OPS_UPDATE' | 'FINAL_REPORT';
    canAddOpsUpdate: boolean;
    canCreateFinalReport: boolean;
}

function DrefTableActions(props: Props) {
    const {
        id,
        drefId,
        status,
        applicationType,
        canAddOpsUpdate,
        canCreateFinalReport,
    } = props;

    const strings = useTranslation(i18n);
    const [showExportModal, {
        setTrue: setShowExportModalTrue,
        setFalse: setShowExportModalFalse,
    }] = useBooleanState(false);

    const {
        trigger: fetchDref,
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
    } = useLazyRequest({
        url: '/api/v2/dref-op-update/{id}/',
        pathVariables: (ctx: number) => (
            isDefined(ctx) ? {
                id: String(ctx),
            } : undefined
        ),
        onSuccess: (response) => {
            const exportData = {
                allocationFor: 'DREF Operation',
                appealManager: response?.ifrc_appeal_manager_name,
                projectManager: response?.ifrc_project_manager_name,
                affectedCountry: response?.country_details?.name,
                name: response?.title,
                disasterType: response?.disaster_type_details?.name,
                responseType:
                    response?.type_of_dref_display === 'Imminent'
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
                        ? 'Anticipatory Pillar'
                        : 'Response Pillar',
                focalPointName: response?.regional_focal_point_name,
            };
            exportDrefAllocation(exportData);
        },
    });

    const [showShareModal, {
        setTrue: setShowShareModalTrue,
        setFalse: setShowShareModalFalse,
    }] = useBooleanState(false);

    const handleExportClick: NonNullable<ButtonProps<undefined>['onClick']> = useCallback(
        (_, e) => {
            e.stopPropagation();
            setShowExportModalTrue();
        },
        [setShowExportModalTrue],
    );

    const handleShareClick: NonNullable<ButtonProps<undefined>['onClick']> = useCallback(
        (_, e) => {
            e.stopPropagation();
            setShowShareModalTrue();
        },
        [setShowShareModalTrue],
    );

    const handleDrefAllocationExport = useCallback(() => {
        if (applicationType === 'DREF') {
            fetchDref(id);
        } else if (applicationType === 'OPS_UPDATE') {
            fetchOpsUpdate(id);
        }
    }, [fetchDref, fetchOpsUpdate, applicationType, id]);

    const canDownloadAllocation = (applicationType === 'DREF' || applicationType === 'OPS_UPDATE');

    // TODO: check permission
    const canApprove = status === DREF_STATUS_IN_PROGRESS;

    return (
        <TableActions
            // TODO: Implement actions
            extraActions={(
                <>
                    {canApprove && (
                        <DropdownMenuItem
                            name={undefined}
                            type="button"
                            icons={<CheckLineIcon className={styles.icon} />}
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
                        >
                            {strings.dropdownActionAllocationFormLabel}
                        </DropdownMenuItem>
                    )}
                    {canAddOpsUpdate && (
                        <DropdownMenuItem
                            name={undefined}
                            type="button"
                            icons={<AddLineIcon className={styles.icon} />}
                        >
                            {strings.dropdownActionAddOpsUpdateLabel}
                        </DropdownMenuItem>
                    )}
                    {canCreateFinalReport && (
                        <DropdownMenuItem
                            name={undefined}
                            type="button"
                            icons={<CaseManagementIcon className={styles.icon} />}
                        >
                            {strings.dropdownActionCreateFinalReportLabel}
                        </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                        name={undefined}
                        type="button"
                        icons={<ShareLineIcon className={styles.icon} />}
                        onClick={handleShareClick}
                    >
                        {strings.dropdownActionShareLabel}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        name={undefined}
                        type="button"
                        icons={<DocumentPdfLineIcon className={styles.icon} />}
                        onClick={handleExportClick}
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
                    drefId={drefId}
                />
            )}
        </TableActions>
    );
}

export default DrefTableActions;
