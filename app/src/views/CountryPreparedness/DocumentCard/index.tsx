import { useCallback } from 'react';
import {
    DeleteBinLineIcon,
    DownloadFillIcon,
} from '@ifrc-go/icons';
import {
    ConfirmButton,
    DateOutput,
    Label,
    ListView,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';

import Link from '#components/Link';
import useAlert from '#hooks/useAlert';
import {
    type GoApiResponse,
    useLazyRequest,
} from '#utils/restRequest';

import i18n from './i18n.json';

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
        <ListView>
            <ListView
                withSpacingOpticalCorrection
                spacing="xs"
            >
                <Label>
                    {getFileNameFromUrl(document.file)}
                </Label>
                <DateOutput value={document.created_at} />
            </ListView>
            <ListView spacing="2xs">
                <Link
                    external
                    styleVariant="action"
                    download
                    title={strings.download}
                    href={document.file}
                >
                    <DownloadFillIcon />
                </Link>
                <ConfirmButton
                    name={document.id}
                    onConfirm={handleFileDelete}
                    title={strings.removeFileButtonTitle}
                    styleVariant="action"
                    spacing="none"
                    disabled={perDocumentDeletePending}
                >
                    <DeleteBinLineIcon />
                </ConfirmButton>
            </ListView>
        </ListView>
    );
}

export default DocumentCard;
