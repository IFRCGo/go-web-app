import {
    Message,
    Modal,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { isDefined } from '@togglecorp/fujs';

import Link from '#components/Link';
import { useRequest } from '#utils/restRequest';

import i18n from './i18n.json';

interface Props {
    id: number;
    onClose: () => void;
}

function FlashUpdateExportModal(props: Props) {
    const {
        id,
        onClose,
    } = props;

    const strings = useTranslation(i18n);

    const {
        pending: exportPending,
        response: exportResponse,
        error: exportResponseError,
    } = useRequest({
        url: '/api/v2/export-flash-update/{id}/',
        pathVariables: { id: String(id) },
        shouldRetry: (retryParams, run) => {
            if (retryParams.errored || run > 10) {
                return -1;
            }

            if (retryParams.value.status === 'ready') {
                return -1;
            }

            return 3000;
        },
    });

    return (
        <Modal
            heading={strings.flashUpdateExportTitle}
            onClose={onClose}
        >
            {exportPending && (
                <Message
                    pending
                    title={strings.flashUpdateWaiting}
                />
            )}
            {isDefined(exportResponseError) && (
                <Message
                    title={strings.flashUpdateExportFailed}
                    description={exportResponseError.value.messageForNotification}
                />
            )}
            {isDefined(exportResponse) && (
                <Message
                    title={strings.flashUpdateExportCompleted}
                    description={strings.flashUpdateExportCompletedDescription}
                    actions={(
                        <Link
                            variant="secondary"
                            href={exportResponse?.url}
                            external
                        >
                            {strings.flashUpdateDownload}
                        </Link>
                    )}
                />
            )}
        </Modal>
    );
}

export default FlashUpdateExportModal;
