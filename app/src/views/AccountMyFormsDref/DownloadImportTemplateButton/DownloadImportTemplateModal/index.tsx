import {
    useCallback,
    useMemo,
    useState,
} from 'react';
import {
    Button,
    Modal,
    RadioInput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { stringValueSelector } from '@ifrc-go/ui/utils';
import {
    isNotDefined,
    listToMap,
} from '@togglecorp/fujs';

import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import {
    DREF_TYPE_RESPONSE,
    type TypeOfDrefEnum,
} from '#utils/constants';
import { createImportTemplate } from '#utils/importTemplate';

import useImportTemplateSchema from './useImportTemplateSchema';
import { generateTemplate } from './utils';

import i18n from './i18n.json';

function typeOfDrefKeySelector(option: { key: TypeOfDrefEnum }) {
    return option.key;
}

interface Props {
    onComplete: () => void;
}

function DownloadImportTemplateModal(props: Props) {
    const { onComplete } = props;

    const { dref_dref_dref_type } = useGlobalEnums();
    const strings = useTranslation(i18n);

    const [generationPending, setGenerationPending] = useState(false);
    const [typeOfDref, setTypeOfDref] = useState<TypeOfDrefEnum>(DREF_TYPE_RESPONSE);

    const { drefFormSchema, optionsMap } = useImportTemplateSchema();
    const templateActions = createImportTemplate(drefFormSchema, optionsMap);

    const drefTypeLabelMap = useMemo(
        () => (
            listToMap(
                dref_dref_dref_type,
                (option) => option.key,
                (option) => option.value,
            )
        ),
        [dref_dref_dref_type],
    );

    const handleDownloadClick = useCallback(() => {
        if (isNotDefined(templateActions)) {
            return;
        }

        setGenerationPending((alreadyGenerating) => {
            if (!alreadyGenerating) {
                generateTemplate(
                    templateActions,
                    optionsMap,
                    drefTypeLabelMap,
                    typeOfDref,
                    () => {
                        setGenerationPending(false);
                        onComplete();
                    },
                );
            }

            return true;
        });
    }, [
        templateActions,
        optionsMap,
        onComplete,
        drefTypeLabelMap,
        typeOfDref,
    ]);

    return (
        <Modal
            heading={strings.heading}
            footerActions={(
                <Button
                    name={undefined}
                    onClick={handleDownloadClick}
                    disabled={generationPending || isNotDefined(drefFormSchema)}
                >
                    {strings.downloadButtonLabel}
                </Button>
            )}
            contentViewType="vertical"
            spacing="comfortable"
            onClose={onComplete}
        >
            <RadioInput
                name={undefined}
                label="Select type of DREF for template"
                options={dref_dref_dref_type}
                keySelector={typeOfDrefKeySelector}
                labelSelector={stringValueSelector}
                value={typeOfDref}
                onChange={setTypeOfDref}
                // Only response type is available for now
                readOnly
            />
            <div>
                {strings.description}
            </div>
        </Modal>
    );
}

export default DownloadImportTemplateModal;
