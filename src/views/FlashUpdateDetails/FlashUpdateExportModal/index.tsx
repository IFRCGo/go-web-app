import { isDefined } from '@togglecorp/fujs';

import Link from '#components/Link';
import Message from '#components/Message';
import Modal from '#components/Modal';
import { useRequest } from '#utils/restRequest';

interface Props {
    id: number;
    onClose: () => void;
}

function FlashUpdateExportModal(props: Props) {
    const {
        id,
        onClose,
    } = props;

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
            // FIXME: use translation
            heading="Export Flash Update"
            onClose={onClose}
        >
            {exportPending && (
                <Message
                    pending
                    // FIXME: use translations
                    title="Waiting for the export to complete..."
                />
            )}
            {isDefined(exportResponseError) && (
                <Message
                    // FIXME: use translations
                    title="Export failed!"
                    description={exportResponseError.value.messageForNotification}
                />
            )}
            {isDefined(exportResponse) && (
                <Message
                    // FIXME: use translations
                    title="Export completed successfully"
                    // FIXME: use translations
                    description="Click on the download link below!"
                    actions={(
                        <Link
                            variant="secondary"
                            href={exportResponse?.url}
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

export default FlashUpdateExportModal;
