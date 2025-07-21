import {
    useEffect,
    useMemo,
    useState,
} from 'react';
import { DownloadLineIcon } from '@ifrc-go/icons';
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
    const [includePga, setIncludePga] = useState<boolean>(false);

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
                is_pga: includePga,
                selector: '#pdf-preview-ready',
                per_country: undefined,
            };
        },
        [
            id,
            includePga,
            applicationType,
        ],
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
                strings.drefFailureToExportMessage,
                { variant: 'danger' },
            );
        },
    });

    useEffect(() => {
        if (isDefined(exportId) || isNotDefined(id)) {
            return;
        }

        // Don't automatically trigger the export for imminent DREF Applications
        // We need to allow users to configure PGA before the export
        if (drefType === DREF_TYPE_IMMINENT && applicationType === 'DREF') {
            return;
        }

        triggerExport(null);
    }, [exportId, id, drefType, applicationType, triggerExport]);

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
            heading={strings.drefExportTitle}
            onClose={onCancel}
            className={styles.drefExportModal}
        >
            {exportStatus === 'PREPARE' && (
                <Message
                    pending
                    title={strings.drefPreparingExport}
                />
            )}
            {exportStatus === 'WAITING' && (
                <Message
                    pending
                    title={strings.drefWaitingExport}
                />
            )}
            {exportStatus === 'FAILED' && (
                <Message
                    title={strings.drefExportFailed}
                    description={exportError?.value.messageForNotification
                            ?? exportStatusError?.value.messageForNotification}
                />
            )}
            {exportStatus === 'SUCCESS' && (
                <Message
                    title={strings.drefExportSuccessfully}
                    description={strings.drefClickDownloadLink}
                    actions={(
                        <Link
                            variant="secondary"
                            href={exportStatusResponse?.pdf_file}
                            icons={<DownloadLineIcon className={styles.icon} />}
                            external
                        >
                            {strings.drefDownloadPDF}
                        </Link>
                    )}
                />
            )}
            {exportStatus === 'NOT_STARTED' && (
                <Message
                    title={strings.configureExportLabel}
                    description={drefType === DREF_TYPE_IMMINENT && applicationType !== 'FINAL_REPORT' && (
                        <Checkbox
                            name={undefined}
                            value={includePga}
                            onChange={setIncludePga}
                            label={strings.includePgaLabel}
                        />
                    )}
                    actions={(
                        <Button
                            name={null}
                            onClick={triggerExport}
                        >
                            {strings.startExportLabel}
                        </Button>
                    )}
                />
            )}
        </Modal>
    );
}

export default DrefExportModal;
