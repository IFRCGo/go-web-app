import { Button } from '@ifrc-go/ui';
import {
    useBooleanState,
    useTranslation,
} from '@ifrc-go/ui/hooks';

import { DrefRequestBody } from '../schema';
import DrefImportModal from './DrefImportModal';

import i18n from './i18n.json';

interface Props {
    onImport?: (formFields?: DrefRequestBody) => void;
}

function DrefImportButton(props: Props) {
    const { onImport } = props;
    const strings = useTranslation(i18n);

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
            >
                {strings.drefImportButton}
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
