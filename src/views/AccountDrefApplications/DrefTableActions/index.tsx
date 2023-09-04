import {
    AddLineIcon,
    CaseManagementIcon,
    CheckLineIcon,
    DocumentPdfLineIcon,
    DownloadLineIcon,
    PencilLineIcon,
    ShareLineIcon,
} from '@ifrc-go/icons';

import DropdownMenuItem from '#components/DropdownMenuItem';
import TableActions from '#components/Table/TableActions';
import Link from '#components/Link';
import useTranslation from '#hooks/useTranslation';
import { components } from '#generated/types';
import {
    DREF_STATUS_COMPLETED,
    DREF_STATUS_IN_PROGRESS,
} from '#utils/constants';

import i18n from './i18n.json';
import styles from './styles.module.css';

type DrefStatus = components['schemas']['OperationTypeEnum'];

export interface Props {
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
        status,
        applicationType,
        canAddOpsUpdate,
        canCreateFinalReport,
    } = props;

    const strings = useTranslation(i18n);

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
                    >
                        {strings.dropdownActionShareLabel}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        name={undefined}
                        type="button"
                        icons={<DocumentPdfLineIcon className={styles.icon} />}
                    >
                        {strings.dropdownActionShareExport}
                    </DropdownMenuItem>
                </>
            )}
        >
            {/* TODO: Add links for OPS_UPDATE and FINAL_REPORT */}
            {status === DREF_STATUS_IN_PROGRESS && applicationType === 'DREF' && (
                <Link
                    to="drefApplicationForm"
                    urlParams={{ drefId: id }}
                    variant="secondary"
                    icons={<PencilLineIcon className={styles.icon} />}
                >
                    {strings.dropdownActionEditExport}
                </Link>
            )}
            {status === DREF_STATUS_IN_PROGRESS && applicationType === 'OPS_UPDATE' && (
                <Link
                    to="drefOperationalUpdateForm"
                    urlParams={{ opsUpdateId: id }}
                    variant="secondary"
                    icons={<PencilLineIcon className={styles.icon} />}
                >
                    {strings.dropdownActionEditExport}
                </Link>
            )}
        </TableActions>
    );
}

export default DrefTableActions;
