import { useMemo, useState } from 'react';

import Message from '#components/Message';
import Modal from '#components/Modal';
import { useRequest } from '#utils/restRequest';
import { isDefined, isNotDefined } from '@togglecorp/fujs';
import { type components } from '#generated/types';
import Link from '#components/Link';

type ExportTypeEnum = components<'read'>['schemas']['ExportTypeEnum'];
type ExportStatusEnum = components<'read'>['schemas']['Status1d2Enum'];

const EXPORT_STATUS_PENDING = 0 satisfies ExportStatusEnum;
const EXPORT_STATUS_COMPLETED = 1 satisfies ExportStatusEnum;
const EXPORT_STATUS_ERRORED = 2 satisfies ExportStatusEnum;

interface Props {
    id: number;
    onCancel: () => void;
    applicationType: 'DREF' | 'OPS_UPDATE' | 'FINAL_REPORT';
}

function DrefExportModal(props: Props) {
    const {
        id,
        onCancel,
        applicationType,
    } = props;

    const [exportId, setExportId] = useState<number | undefined>();

    const exportTriggerBody = useMemo(
        () => {
            let type: ExportTypeEnum;
            if (applicationType === 'OPS_UPDATE') {
                type = 'dref-ops-updates';
            } else if (applicationType === 'FINAL_REPORT') {
                type = 'dref-final-reports';
            } else {
                type = 'dref-applications';
            }

            return {
                export_id: id,
                export_type: type,
                selector: '#pdf-preview-ready',
            };
        },
        [id, applicationType],
    );

    const {
        pending: pendingExportTrigger,
        error: exportTriggerError,
    } = useRequest({
        skip: isDefined(exportId) || isNotDefined(id),
        method: 'POST',
        url: '/api/v2/pdf-export/',
        body: exportTriggerBody,
        onSuccess: (response) => {
            if (isDefined(response.id)) {
                setExportId(response.id);
            }
        },
    });

    const {
        pending: pendingExportStatus,
        response: exportStatusResponse,
        error: exportStatusError,
    } = useRequest({
        skip: isNotDefined(exportId),
        url: '/api/v2/pdf-export/{id}/',
        pathVariables: isDefined(exportId) ? ({ id: exportId }) : undefined,
        shouldPoll: (poll) => {
            if (poll?.errored || poll?.value?.status !== EXPORT_STATUS_PENDING) {
                return -1;
            }

            return 5000;
        },
    });

    return (
        <Modal
            // FIXME: use translations
            heading="Export DREF"
            onClose={onCancel}
        >
            {pendingExportTrigger && (
                <Message
                    pending
                    // FIXME: use translations
                    title="Preparing for export..."
                />
            )}
            {(pendingExportStatus || exportStatusResponse?.status === EXPORT_STATUS_PENDING) && (
                <Message
                    pending
                    // FIXME: use translations
                    title="Waiting for the export to complete..."
                />
            )}
            {(exportStatusResponse?.status === EXPORT_STATUS_ERRORED
                || isDefined(exportTriggerError)
                || isDefined(exportStatusError)
            ) && (
                <Message
                    // FIXME: use translations
                    title="Export failed!"
                    description={exportTriggerError?.value.messageForNotification
                            ?? exportStatusError?.value.messageForNotification}
                />
            )}
            {isDefined(exportStatusResponse)
                && exportStatusResponse.status === EXPORT_STATUS_COMPLETED
                && isDefined(exportStatusResponse.pdf_file) && (
                <Message
                    // FIXME: use translations
                    title="Export completed successfully"
                    // FIXME: use translations
                    description="Click on the download link below!"
                    actions={(
                        <Link
                            variant="secondary"
                            href={exportStatusResponse?.pdf_file}
                            external
                        >
                            {/* FIXME: use translations */}
                            Download PDF
                        </Link>
                    )}
                />
            )}
        </Modal>
    );
}

export default DrefExportModal;
