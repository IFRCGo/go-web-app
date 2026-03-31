import { Button } from '@ifrc-go/ui';
import { useBooleanState } from '@ifrc-go/ui/hooks';

import DownloadImportTemplateModal from './DownloadImportTemplateModal';

function DownloadImportTemplateButton() {
    const [
        showDownloadImportTemplateModal,
        {
            setTrue: setShowDownloadImportTemplateTrue,
            setFalse: setShowDownloadImportTemplateFalse,
        },
    ] = useBooleanState(false);

    return (
        <>
            <Button
                onClick={setShowDownloadImportTemplateTrue}
                name={undefined}
                disabled={showDownloadImportTemplateModal}
            >
                Download Import Template
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
