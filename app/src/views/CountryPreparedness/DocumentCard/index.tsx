import { useCallback } from 'react';
import {
    DeleteBinLineIcon,
    DownloadFillIcon,
} from '@ifrc-go/icons';
import {
    DateOutput,
    IconButton,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';

import Link from '#components/Link';
import useAlert from '#hooks/useAlert';
import {
    type GoApiResponse,
    useLazyRequest,
} from '#utils/restRequest';

import i18n from './i18n.json';
import styles from './styles.module.css';

type PerDocumentUploadResponse = GoApiResponse<'/api/v2/per-document-upload/'>;
type PerDocumentListItem = NonNullable<PerDocumentUploadResponse['results']>[number];

function getFileNameFromUrl(urlString: string) {
    const url = new URL(urlString);
    const fileName = url.pathname.split('/').pop();

    return fileName;
}

interface Props {
    document: PerDocumentListItem;
    onDeleteSuccess: () => void;
}

function DocumentCard(props: Props) {
    const {
        document,
        onDeleteSuccess,
    } = props;

    const alert = useAlert();
    const strings = useTranslation(i18n);

    const {
        pending: perDocumentDeletePending,
        trigger: perDocumentDelete,
    } = useLazyRequest({
        method: 'DELETE',
        url: '/api/v2/per-document-upload/{id}/',
        pathVariables: ({ id }) => ({ id }),
        onSuccess: () => {
            onDeleteSuccess();
            alert.show(
                strings.relevantDocumentDeletedSuccessMessage,
                { variant: 'success' },
            );
        },
        onFailure: () => {
            alert.show(
                strings.relevantDocumentDeletedFailureMessage,
                { variant: 'danger' },
            );
        },

    });

    const handleFileDelete = useCallback((id: number) => {
        perDocumentDelete({ id });
    }, [perDocumentDelete]);

    return (
        <div className={styles.documentItem}>
            <div
                className={styles.info}
            >
                <div className={styles.name}>
                    {getFileNameFromUrl(document.file)}
                </div>
                <DateOutput value={document.created_at} />
            </div>
            <div className={styles.actions}>
                <Link
                    external
                    variant="tertiary"
                    download
                    title={strings.download}
                    href={document.file}
                >
                    <DownloadFillIcon />
                </Link>
                <IconButton
                    name={document.id}
                    onClick={handleFileDelete}
                    title={strings.removeFileButtonTitle}
                    ariaLabel={strings.removeFileButtonTitle}
                    variant="tertiary"
                    spacing="none"
                    disabled={perDocumentDeletePending}
                >
                    <DeleteBinLineIcon />
                </IconButton>
            </div>
        </div>
    );
}

export default DocumentCard;
