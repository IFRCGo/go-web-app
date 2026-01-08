import {
    useEffect,
    useMemo,
    useState,
} from 'react';
import { DownloadLineIcon } from '@ifrc-go/icons';
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
import useAlert from '#hooks/useAlert';
import { EAP_TYPE_SIMPLIFIED } from '#utils/constants';
import {
    type GoApiBody,
    useLazyRequest,
    useRequest,
} from '#utils/restRequest';

import i18n from './i18n.json';
import styles from './styles.module.css';

type EapType = components['schemas']['EapEapTypeEnumKey'];
type ExportStatusEnum = components<'read'>['schemas']['ExportStatusEnum'];

type ExportBody = GoApiBody<'/api/v2/pdf-export/', 'POST'>;

const EXPORT_STATUS_PENDING = 0 satisfies ExportStatusEnum;
const EXPORT_STATUS_COMPLETED = 1 satisfies ExportStatusEnum;
const EXPORT_STATUS_ERRORED = 2 satisfies ExportStatusEnum;

interface Props {
    eapId: number;
    eapType: EapType;
    version?: number;
    onClose: () => void;
    diff?: boolean;
    summary?: boolean;
}

function EapExportModal(props: Props) {
    const {
        eapId,
        eapType,
        onClose,
        version,
        diff,
        summary,
    } = props;

    const strings = useTranslation(i18n);
    const alert = useAlert();

    const [exportId, setExportId] = useState<number | undefined>();

    const exportTriggerBody = useMemo<ExportBody>(
        () => ({
            export_id: eapId,
            export_type: eapType === EAP_TYPE_SIMPLIFIED ? 'simplified' : 'full',
            selector: '#pdf-preview-ready',
            is_pga: undefined,
            per_country: undefined,
            version,
            summary,
            diff,
        }),
        [eapId, eapType, version, diff, summary],
    );

    const {
        pending: exportPending,
        error: exportError,
        trigger: triggerExport,
    } = useLazyRequest({
        method: 'POST',
        useCurrentLanguageForMutation: true,
        url: '/api/v2/pdf-export/',
        body: exportTriggerBody,
        onSuccess: (response) => {
            if (isDefined(response.id)) {
                setExportId(response.id);
            }
        },
        onFailure: () => {
            alert.show(
                strings.failureToExportMessage,
                { variant: 'danger' },
            );
        },
    });

    useEffect(() => {
        triggerExport(null);
    }, [triggerExport]);

    const {
        pending: exportStatusPending,
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

    const exportStatus = useMemo(() => {
        if (exportPending) {
            return 'PREPARE';
        }

        if (exportStatusPending || exportStatusResponse?.status === EXPORT_STATUS_PENDING) {
            return 'WAITING';
        }

        if (isDefined(exportStatusError)
            || isDefined(exportError)
            || (isDefined(exportStatusResponse)
                && exportStatusResponse.status === EXPORT_STATUS_ERRORED)
        ) {
            return 'FAILED';
        }

        if (isDefined(exportStatusResponse)
            && isDefined(exportStatusResponse.status === EXPORT_STATUS_COMPLETED)
            && isDefined(exportStatusResponse.pdf_file)
        ) {
            return 'SUCCESS';
        }

        return 'NOT_STARTED';
    }, [
        exportPending,
        exportStatusError,
        exportError,
        exportStatusPending,
        exportStatusResponse,
    ]);

    return (
        <Modal
            heading={strings.exportTitle}
            onClose={onClose}
            className={styles.drefExportModal}
        >
            {exportStatus === 'PREPARE' && (
                <Message
                    pending
                    title={strings.preparingExport}
                />
            )}
            {exportStatus === 'WAITING' && (
                <Message
                    pending
                    title={strings.waitingExport}
                />
            )}
            {exportStatus === 'FAILED' && (
                <Message
                    title={strings.exportFailed}
                    description={exportError?.value.messageForNotification
                            ?? exportStatusError?.value.messageForNotification}
                />
            )}
            {exportStatus === 'SUCCESS' && (
                <Message
                    title={strings.exportSuccessfully}
                    description={strings.downloadLinkDescription}
                    actions={(
                        <Link
                            colorVariant="primary"
                            styleVariant="outline"
                            href={exportStatusResponse?.pdf_file}
                            before={<DownloadLineIcon className={styles.icon} />}
                            external
                        >
                            {strings.downloadLinkLabel}
                        </Link>
                    )}
                />
            )}
        </Modal>
    );
}

export default EapExportModal;
