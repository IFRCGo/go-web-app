import { Button } from '@ifrc-go/ui';
import {
    useBooleanState,
    useTranslation,
} from '@ifrc-go/ui/hooks';

import DownloadImportTemplateModal from './DownloadImportTemplateModal';

import i18n from './i18n.json';

function DownloadImportTemplateButton() {
    const [
        showDownloadImportTemplateModal,
        {
            setTrue: setShowDownloadImportTemplateTrue,
            setFalse: setShowDownloadImportTemplateFalse,
        },
    ] = useBooleanState(false);
    const strings = useTranslation(i18n);

    return (
        <>
            <Button
                onClick={setShowDownloadImportTemplateTrue}
                name={undefined}
                disabled={showDownloadImportTemplateModal}
            >
                {strings.downloadImportTemplateButtonLabel}
            </Button>
            {showDownloadImportTemplateModal && (
                <DownloadImportTemplateModal
                    onComplete={setShowDownloadImportTemplateFalse}
                />
            )}
        </>
    );
}

export default DownloadImportTemplateButton;
