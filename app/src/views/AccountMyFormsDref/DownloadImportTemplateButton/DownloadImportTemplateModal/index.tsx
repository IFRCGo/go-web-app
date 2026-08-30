import {
    useCallback,
    useContext,
    useMemo,
    useState,
} from 'react';
import {
    Button,
    Description,
    ListView,
    Message,
    Modal,
    RadioInput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { stringValueSelector } from '@ifrc-go/ui/utils';
import {
    isDefined,
    isNotDefined,
    listToMap,
} from '@togglecorp/fujs';

import DomainContext from '#contexts/domain';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import {
    DREF_TYPE_IMMINENT,
    DREF_TYPE_RESPONSE,
    type TypeOfDrefEnum,
} from '#utils/constants';
import { createImportTemplate } from '#utils/importTemplate';

import useImportTemplateSchema from './template/useImportTemplateSchema';
import { generateTemplate } from './template/utils';

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
    const {
        countriesPending,
        disasterTypesPending,
        globalEnumsPending,
        primarySectorsPending,
    } = useContext(DomainContext);
    const strings = useTranslation(i18n);

    const [generationPending, setGenerationPending] = useState(false);
    const [typeOfDref, setTypeOfDref] = useState<TypeOfDrefEnum>(DREF_TYPE_RESPONSE);

    const { drefSchemaByType, optionsMap, templateStrings } = useImportTemplateSchema();
    const drefFormSchema = drefSchemaByType[typeOfDref];
    const templateActions = isDefined(drefFormSchema)
        ? createImportTemplate(drefFormSchema, optionsMap)
        : undefined;

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

    // Templates can currently be generated only for Response and Imminent.
    const supportedTypeOptions = useMemo(
        () => dref_dref_dref_type?.filter(
            (option) => option.key === DREF_TYPE_RESPONSE
                || option.key === DREF_TYPE_IMMINENT,
        ),
        [dref_dref_dref_type],
    );

    const isImminentType = typeOfDref === DREF_TYPE_IMMINENT;

    const requiredDataPending = countriesPending
        || disasterTypesPending
        || globalEnumsPending
        || (isImminentType && primarySectorsPending);

    // Refuse to generate a half-empty template if the dropdown reference data hasn't loaded.
    const requiredDataReady = optionsMap.national_society.length > 0
        && optionsMap.disaster_type.length > 0
        && optionsMap.type_of_onset.length > 0
        && (!isImminentType || optionsMap.primary_sector.length > 0);

    const isRequiredDataMissing = !requiredDataPending && !requiredDataReady;
    const canDownload = isDefined(drefFormSchema)
        && requiredDataReady
        && !requiredDataPending;

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
                    templateStrings,
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
        templateStrings,
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
                    disabled={generationPending || !canDownload}
                >
                    {strings.downloadButtonLabel}
                </Button>
            )}
            onClose={onComplete}
        >
            <ListView layout="block">
                <RadioInput
                    name={undefined}
                    label={strings.selectDrefTypeLabel}
                    options={supportedTypeOptions}
                    keySelector={typeOfDrefKeySelector}
                    labelSelector={stringValueSelector}
                    value={typeOfDref}
                    onChange={setTypeOfDref}
                />
                {requiredDataPending && (
                    <Message
                        compact
                        pending
                        title={strings.dataPendingMessage}
                    />
                )}
                {isRequiredDataMissing && (
                    <Message
                        compact
                        variant="error"
                        title={strings.dataMissingTitle}
                        description={strings.dataMissingDescription}
                    />
                )}
                {!requiredDataPending && !isRequiredDataMissing && (
                    <Description>
                        {strings.description}
                    </Description>
                )}
            </ListView>
        </Modal>
    );
}

export default DownloadImportTemplateModal;
