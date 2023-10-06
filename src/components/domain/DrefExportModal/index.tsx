import { useMemo, useState } from 'react';

import { isDefined, isNotDefined } from '@togglecorp/fujs';

import Message from '#components/Message';
import Modal from '#components/Modal';
import Link from '#components/Link';
import { type components } from '#generated/types';
import useTranslation from '#hooks/useTranslation';
import { useRequest } from '#utils/restRequest';

import i18n from './i18n.json';

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

    const strings = useTranslation(i18n);

    const [exportId, setExportId] = useState<number | undefined>();

    const exportTriggerBody = useMemo(
        () => {
            let type: ExportTypeEnum;
            if (applicationType === 'OPS_UPDATE') {
                type = 'dref-operational-updates';
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
        useCurrentLanguageForMutation: true,
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
        // FIXME: typings should be fixed in the server
        pathVariables: isDefined(exportId) ? ({ id: String(exportId) }) : undefined,
        shouldPoll: (poll) => {
            if (poll?.errored || poll?.value?.status !== EXPORT_STATUS_PENDING) {
                return -1;
            }

            return 5000;
        },
    });

    return (
        <Modal
            heading={strings.drefExportTitle}
            onClose={onCancel}
        >
            {pendingExportTrigger && (
                <Message
                    pending
                    title={strings.drefPreparingExport}
                />
            )}
            {(pendingExportStatus || exportStatusResponse?.status === EXPORT_STATUS_PENDING) && (
                <Message
                    pending
                    title={strings.drefWaitingExport}
                />
            )}
            {(exportStatusResponse?.status === EXPORT_STATUS_ERRORED
                || isDefined(exportTriggerError)
                || isDefined(exportStatusError)
            ) && (
                <Message
                    title={strings.drefExportFailed}
                    description={exportTriggerError?.value.messageForNotification
                            ?? exportStatusError?.value.messageForNotification}
                />
            )}
            {isDefined(exportStatusResponse)
                && exportStatusResponse.status === EXPORT_STATUS_COMPLETED
                && isDefined(exportStatusResponse.pdf_file) && (
                <Message
                    title={strings.drefExportSuccessfully}
                    description={strings.drefClickDownloadLink}
                    actions={(
                        <Link
                            variant="secondary"
                            href={exportStatusResponse?.pdf_file}
                            external
                        >
                            {strings.drefDownloadPDF}
                        </Link>
                    )}
                />
            )}
        </Modal>
    );
}

export default DrefExportModal;
