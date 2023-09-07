import { useCallback } from 'react';
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
import { components } from '#generated/types';
import {
    DREF_STATUS_COMPLETED,
    DREF_STATUS_IN_PROGRESS,
} from '#utils/constants';

import DrefExportModal from './DrefExportModal';
import i18n from './i18n.json';
import styles from './styles.module.css';
import DrefShareModal from './DrefShareModal';

type DrefStatus = components['schemas']['OperationTypeEnum'];

export interface Props {
    drefId: number;
    id: number;
    status: DrefStatus | null | undefined;

    // FIXME: typings should be fixed in the server
    // Should be DREF | OPS_UPDATE | FINAL_REPORT
    applicationType: string;
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

    const canDownloadAllocation = status === DREF_STATUS_COMPLETED
        && (applicationType === 'DREF' || applicationType === 'OPS_UPDATE');

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
                    id={drefId}
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
