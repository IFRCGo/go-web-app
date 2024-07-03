import { Button } from '@ifrc-go/ui';
import { useBooleanState } from '@ifrc-go/ui/hooks';

import { DrefRequestBody } from '../schema';
import DrefImportModal from './DrefImportModal';

interface Props {
    onImport?: (formFields?: DrefRequestBody) => void;
}

function DrefImportButton(props: Props) {
    const { onImport } = props;
    const [
        showImportModal,
        {
            setTrue: setShowImportModalTrue,
            setFalse: setShowImportModalFalse,
        },
    ] = useBooleanState(false);

    return (
        <>
            <Button
                variant="secondary"
                name={undefined}
                onClick={setShowImportModalTrue}
                // FIXME: use strings
            >
                Import
            </Button>
            {showImportModal && (
                <DrefImportModal
                    onClose={setShowImportModalFalse}
                    onImport={onImport}
                />
            )}
        </>
    );
}

export default DrefImportButton;
