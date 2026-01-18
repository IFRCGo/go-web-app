import {
    useCallback,
    useMemo,
    useState,
} from 'react';
import { UploadLineIcon } from '@ifrc-go/icons';
import {
    Button,
    Description,
    Label,
    ListView,
    Modal,
    RawFileInput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { isDefined } from '@togglecorp/fujs';

import useAlert from '#hooks/useAlert';
import {
    type GoApiBody,
    useLazyRequest,
} from '#utils/restRequest';

import i18n from './i18n.json';

type UploadBudgetFileBody = GoApiBody<'/api/v2/eap-registration/{id}/upload-validated-budget-file/', 'POST'>;

interface Props {
    eapId: number;
    onBudgetFileUpload?: () => void;
    hasBudgetFile?: boolean;
}

function BudgetFileInput(props: Props) {
    const {
        eapId,
        onBudgetFileUpload,
        hasBudgetFile,
    } = props;

    const strings = useTranslation(i18n);

    const alert = useAlert();

    const [budgetFile, setBudgetFile] = useState<File | undefined>();
    const [showUploadModal, setShowUploadModal] = useState(false);

    const { trigger: triggerUploadBudget } = useLazyRequest({
        method: 'POST',
        url: '/api/v2/eap-registration/{id}/upload-validated-budget-file/',
        pathVariables: {
            id: eapId,
        },
        body: (fields: UploadBudgetFileBody) => fields,
        onSuccess: () => {
            if (onBudgetFileUpload) {
                onBudgetFileUpload();
            }

            alert.show(
                strings.uploadSuccessfulMessage,
                { variant: 'success' },
            );

            setBudgetFile(undefined);
            setShowUploadModal(false);
        },
        formData: true,
        onFailure: (error) => {
            alert.show(
                strings.uploadFailureMessage,
                {
                    variant: 'danger',
                    description: error.value.messageForNotification,
                },
            );
        },
    });

    // FIXME: fix typings in the server
    const requestBody = useMemo<UploadBudgetFileBody>(
        () => ({
            validated_budget_file: budgetFile,
        } as unknown as UploadBudgetFileBody),
        [budgetFile],
    );

    const handleUploadModalClose = useCallback(() => {
        setShowUploadModal(false);
        setBudgetFile(undefined);
    }, []);

    return (
        <>
            <Button
                name
                onClick={setShowUploadModal}
                before={<UploadLineIcon />}
            >
                {hasBudgetFile ? strings.updateBudgetFileLabel : strings.newBudgetFileUploadLabel}
            </Button>
            {showUploadModal && (
                <Modal
                    heading={strings.newBudgetFileUploadLabel}
                    onClose={handleUploadModalClose}
                    footerActions={(
                        <Button
                            name={requestBody}
                            onClick={triggerUploadBudget}
                        >
                            {strings.confirmButtonLabel}
                        </Button>
                    )}
                >
                    <ListView
                        layout="block"
                        spacing="sm"
                    >
                        <Description>
                            {strings.uploadFileDescription}
                        </Description>
                        <RawFileInput
                            name={undefined}
                            onChange={setBudgetFile}
                            before={<UploadLineIcon />}
                        >
                            {strings.fileInputLabel}
                        </RawFileInput>
                        <Label>
                            {isDefined(budgetFile) && budgetFile.name}
                        </Label>
                    </ListView>
                </Modal>
            )}
        </>
    );
}

export default BudgetFileInput;
