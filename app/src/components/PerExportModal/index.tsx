import {
    useMemo,
    useState,
} from 'react';
import {
    Message,
    Modal,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

import Link from '#components/Link';
import { type components } from '#generated/types';
import { useRequest } from '#utils/restRequest';

import i18n from './i18n.json';

type ExportStatusEnum = components['schemas']['ExportStatusEnum'];

const EXPORT_STATUS_PENDING = 0 satisfies ExportStatusEnum;
const EXPORT_STATUS_COMPLETED = 1 satisfies ExportStatusEnum;
const EXPORT_STATUS_ERRORED = 2 satisfies ExportStatusEnum;

interface Props {
    perId: string;
    countryId: string;
    onCancel: () => void;
}
function PerExportModal(props: Props) {
    const {
        perId,
        countryId,
        onCancel,
    } = props;

    const strings = useTranslation(i18n);

    const [exportId, setExportId] = useState<number | undefined>();

    const exportTriggerBody = useMemo(
        () => ({
            export_id: Number(perId),
            export_type: 'per' as const,
            per_country: Number(countryId),
        }),
        [perId, countryId],
    );

    const {
        pending: pendingExportTrigger,
        error: exportTriggerError,
    } = useRequest({
        skip: isDefined(exportId) || isNotDefined(perId),
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
            heading={strings.perExportTitle}
            onClose={onCancel}
        >
            {pendingExportTrigger && (
                <Message
                    pending
                    title={strings.perPreparingExport}
                />
            )}
            {(pendingExportStatus || exportStatusResponse?.status === EXPORT_STATUS_PENDING) && (
                <Message
                    pending
                    title={strings.perWaitingExport}
                />
            )}
            {(exportStatusResponse?.status === EXPORT_STATUS_ERRORED
                    || isDefined(exportTriggerError)
                || isDefined(exportStatusError)
            ) && (
                <Message
                    title={strings.perExportFailed}
                    description={exportTriggerError?.value.messageForNotification
                        ?? exportStatusError?.value.messageForNotification}
                />
            )}
            {isDefined(exportStatusResponse)
                && exportStatusResponse.status === EXPORT_STATUS_COMPLETED
            && isDefined(exportStatusResponse.pdf_file) && (
                <Message
                    title={strings.perExportSuccessfully}
                    description={strings.perClickDownloadLink}
                    actions={(
                        <Link
                            variant="secondary"
                            href={exportStatusResponse?.pdf_file}
                            external
                        >
                            {strings.perDownloadPDF}
                        </Link>
                    )}
                />
            )}
        </Modal>
    );
}

export default PerExportModal;
