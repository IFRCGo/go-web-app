import {
    useCallback,
    useMemo,
    useState,
} from 'react';
import {
    Button,
    Checkbox,
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
import {
    DREF_TYPE_IMMINENT,
    type TypeOfDrefEnum,
} from '#utils/constants';
import {
    useLazyRequest,
    useRequest,
} from '#utils/restRequest';

import i18n from './i18n.json';
import styles from './styles.module.css';

type ExportTypeEnum = components<'read'>['schemas']['ExportTypeEnum'];
type ExportStatusEnum = components<'read'>['schemas']['ExportStatusEnum'];

const EXPORT_STATUS_PENDING = 0 satisfies ExportStatusEnum;
const EXPORT_STATUS_COMPLETED = 1 satisfies ExportStatusEnum;
const EXPORT_STATUS_ERRORED = 2 satisfies ExportStatusEnum;

interface Props {
    id: number;
    onCancel: () => void;
    applicationType: 'DREF' | 'OPS_UPDATE' | 'FINAL_REPORT';
    drefType?: TypeOfDrefEnum | null;
}

function DrefExportModal(props: Props) {
    const {
        id,
        onCancel,
        applicationType,
        drefType,
    } = props;

    const strings = useTranslation(i18n);
    const alert = useAlert();

    const [exportId, setExportId] = useState<number | undefined>();
    const [isPga, setIsPga] = useState<boolean>(false);
    const [isPgaCheckboxVisible, setIsPgaCheckboxVisible] = useState(true);

    const drefExportTriggerBody = useMemo(
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
                is_pga: isPga,
                selector: '#pdf-preview-ready',
                per_country: undefined,
            };
        },
        [
            id,
            isPga,
            applicationType,
        ],
    );

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
                is_pga: isPga,
                selector: '#pdf-preview-ready',
                per_country: undefined,
            };
        },
        [
            id,
            isPga,
            applicationType,
        ],
    );

    const {
        pending: pendingDrefImminentExportTrigger,
        error: drefImminentExportError,
        trigger: drefImminentExportTrigger,
    } = useLazyRequest({
        method: 'POST',
        useCurrentLanguageForMutation: true,
        url: '/api/v2/pdf-export/',
        body: drefExportTriggerBody,
        onSuccess: (response) => {
            if (isDefined(response.id)) {
                setExportId(response.id);
            }
        },
        onFailure: () => {
            alert.show(
                strings.drefFailureToExportMessage,
                { variant: 'danger' },
            );
        },
    });

    const {
        pending: pendingExportTrigger,
        error: exportTriggerError,
    } = useRequest({
        skip: isDefined(exportId) || isNotDefined(id) || drefType === DREF_TYPE_IMMINENT,
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
                strings.drefFailureToExportMessage,
                { variant: 'danger' },
            );
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

    const handleDrefImminent = useCallback(() => {
        setIsPgaCheckboxVisible(false);
        drefImminentExportTrigger(drefExportTriggerBody);
    }, [
        drefExportTriggerBody,
        drefImminentExportTrigger,
    ]);

    return (
        <Modal
            heading={strings.drefExportTitle}
            onClose={onCancel}
        >
            {drefType === DREF_TYPE_IMMINENT
                && isPgaCheckboxVisible
                && !(pendingExportTrigger
                    || pendingExportStatus
                    || exportStatusResponse?.status === EXPORT_STATUS_PENDING)
                && (
                    <Checkbox
                        name={undefined}
                        value={isPga}
                        onChange={setIsPga}
                        label={strings.drefDownloadPDFWithPGA}
                    />
                )}
            {pendingExportTrigger && pendingDrefImminentExportTrigger && (
                <Message
                    pending
                    title={strings.drefPreparingExport}
                />
            )}
            {(pendingExportStatus
                || exportStatusResponse?.status === EXPORT_STATUS_PENDING) && (
                <Message
                    pending
                    title={strings.drefWaitingExport}
                />
            )}
            {(exportStatusResponse?.status === EXPORT_STATUS_ERRORED
                || isDefined(exportTriggerError)
                || isDefined(exportStatusError)
                || isDefined(drefImminentExportError)
            ) && (
                <Message
                    title={strings.drefExportFailed}
                    description={exportTriggerError?.value.messageForNotification
                            ?? exportStatusError?.value.messageForNotification
                            ?? drefImminentExportError?.value.messageForNotification}
                />
            )}
            {!(pendingExportTrigger
                || pendingExportStatus
                || exportStatusResponse?.status === EXPORT_STATUS_PENDING)
                && drefType === DREF_TYPE_IMMINENT
                && !drefImminentExportError && (
                exportStatusResponse?.pdf_file ? (
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
                ) : (!exportStatusResponse && (
                    <div className={styles.downloadButton}>
                        <Button
                            variant="secondary"
                            name={undefined}
                            onClick={handleDrefImminent}
                        >
                            {isPga
                                ? strings.drefDownloadPDFWithPGA
                                : strings.drefDownloadPDFwithoutPGA}
                        </Button>
                    </div>
                ))
            )}
            {isDefined(exportStatusResponse)
                && exportStatusResponse.status === EXPORT_STATUS_COMPLETED
                && isDefined(exportStatusResponse.pdf_file)
                && drefType !== DREF_TYPE_IMMINENT && (
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
