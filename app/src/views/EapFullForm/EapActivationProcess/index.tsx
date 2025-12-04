import { useCallback } from 'react';
import {
    Button,
    Container,
    InputSection,
    ListView,
    NumberInput,
    TextArea,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { randomString } from '@togglecorp/fujs';
import {
    type EntriesAsList,
    type Error,
    getErrorObject,
    getErrorString,
    useFormArray,
} from '@togglecorp/toggle-form';

import GoMultiFileInput from '#components/domain/GoMultiFileInput';
import MultiImageWithCaptionInput from '#components/domain/MultiImageWithCaptionInput';
import NonFieldError from '#components/NonFieldError';
import TabPage from '#components/TabPage';

import { type PartialEapFullFormType } from '../schema';
import ActivationSourceInformationInput from './ActivationSourcesInformationInput';

import i18n from './i18n.json';

type ActivationSourceInformationFormFields = NonNullable<PartialEapFullFormType['activation_process_source_of_information']>[number];

interface Props {
    value: PartialEapFullFormType;
    setFieldValue: (...entries: EntriesAsList<PartialEapFullFormType>) => void;
    error: Error<PartialEapFullFormType> | undefined;
    disabled?: boolean;
    fileIdToUrlMap: Record<number, string>;
    setFileIdToUrlMap?: React.Dispatch<React.SetStateAction<Record<number, string>>>;
}

function EapActivationProcess(props: Props) {
    const {
        value,
        setFieldValue,
        error: formError,
        disabled,
        fileIdToUrlMap,
        setFileIdToUrlMap,
    } = props;

    const strings = useTranslation(i18n);

    const error = getErrorObject(formError);

    const {
        setValue: onRiskSourceInformationChange,
        removeValue: onRiskSourceInformationRemove,
    } = useFormArray<'activation_process_source_of_information', ActivationSourceInformationFormFields>(
        'activation_process_source_of_information',
        setFieldValue,
    );

    const handleSourceInformationAdd = useCallback(() => {
        const newSourceInformationItem: ActivationSourceInformationFormFields = {
            client_id: randomString(),
        };

        setFieldValue(
            (oldValue: ActivationSourceInformationFormFields[] | undefined) => (
                [...(oldValue ?? []), newSourceInformationItem]
            ),
            'activation_process_source_of_information' as const,
        );
    }, [setFieldValue]);

    return (
        <TabPage>
            <Container>
                <ListView
                    layout="block"
                    spacing="sm"
                >
                    <InputSection
                        title={strings.eapFullFormImplementationProcessTitle}
                        description={(
                            <ul>
                                <li>{strings.eapFullFormImplementationProcessDescription1}</li>
                                <li>{strings.eapFullFormImplementationProcessDescription2}</li>
                            </ul>
                        )}
                        withAsteriskOnTitle
                    >
                        <TextArea
                            label={strings.eapFullFormImplementationProcessDescriptionLabel}
                            name="early_action_implementation_process"
                            onChange={setFieldValue}
                            value={value?.early_action_implementation_process}
                            error={error?.early_action_implementation_process}
                            disabled={disabled}
                        />
                        <MultiImageWithCaptionInput
                            name="early_action_implementation_images"
                            url="/api/v2/eap-file/multiple/"
                            value={value?.early_action_implementation_images}
                            onChange={setFieldValue}
                            error={getErrorObject(error?.early_action_implementation_images)}
                            fileIdToUrlMap={fileIdToUrlMap}
                            setFileIdToUrlMap={setFileIdToUrlMap}
                            label={strings.eapFullFormImplementationProcessUploadLabel}
                            disabled={disabled}
                        />
                    </InputSection>
                    <InputSection
                        withAsteriskOnTitle
                        title={strings.eapFullFormImplementationTriggerActivationTitle}
                        description={(
                            <ul>
                                <li>
                                    {strings.eapFullFormImplementationTriggerActivationDescription1}
                                </li>
                                <li>
                                    {strings.eapFullFormImplementationTriggerActivationDescription2}
                                </li>
                                <li>
                                    {strings.eapFullFormImplementationTriggerActivationDescription3}
                                </li>
                            </ul>
                        )}
                    >
                        <TextArea
                            label={strings.eapFullFormImplementationProcessDescriptionLabel}
                            name="trigger_activation_system"
                            onChange={setFieldValue}
                            value={value?.trigger_activation_system}
                            error={error?.trigger_activation_system}
                            disabled={disabled}
                        />
                        <MultiImageWithCaptionInput
                            name="trigger_activation_system_images"
                            url="/api/v2/eap-file/multiple/"
                            value={value?.trigger_activation_system_images}
                            onChange={setFieldValue}
                            error={getErrorObject(error?.trigger_activation_system_images)}
                            fileIdToUrlMap={fileIdToUrlMap}
                            setFileIdToUrlMap={setFileIdToUrlMap}
                            label={strings.eapFullFormImplementationProcessUploadLabel}
                            disabled={disabled}
                        />
                    </InputSection>
                    <InputSection
                        title={strings.eapFullFormImplementationPeopleTargetedTitle}
                        description={strings.eapFullFormImplementationPeopleTargetedDescription}
                        withAsteriskOnTitle
                    >
                        <NumberInput
                            name="people_targeted"
                            onChange={setFieldValue}
                            value={value?.people_targeted}
                            error={error?.people_targeted}
                            disabled={disabled}
                        />
                    </InputSection>
                    <InputSection
                        withAsteriskOnTitle
                        title={strings.eapFullFormImplementationSelectionPopulationTitle}
                        description={(
                            <ul>
                                <li>
                                    {strings.eapFullFormImplementationSelectionDescription1}
                                </li>
                                <li>
                                    {strings.eapFullFormImplementationSelectionDescription2}
                                </li>
                                <li>
                                    {strings.eapFullFormImplementationSelectionDescription3}
                                </li>
                            </ul>
                        )}
                    >
                        <TextArea
                            label={strings.eapFullFormImplementationProcessDescriptionLabel}
                            name="selection_of_target_population"
                            onChange={setFieldValue}
                            value={value?.selection_of_target_population}
                            error={error?.selection_of_target_population}
                            disabled={disabled}
                        />
                    </InputSection>
                    <InputSection
                        withAsteriskOnTitle
                        title={strings.eapFullFormImplementationStopMechanismTitle}
                        description={(
                            <ul>
                                <li>
                                    {strings.eapFullFormImplementationStopMechanismDescription1}
                                </li>
                                <li>
                                    {strings.eapFullFormImplementationStopMechanismDescription2}
                                </li>
                                <li>
                                    {strings.eapFullFormImplementationStopMechanismDescription3}
                                </li>
                            </ul>
                        )}
                    >
                        <TextArea
                            label={strings.eapFullFormImplementationProcessDescriptionLabel}
                            name="stop_mechanism"
                            onChange={setFieldValue}
                            value={value?.stop_mechanism}
                            error={error?.stop_mechanism}
                            disabled={disabled}
                        />
                    </InputSection>
                    <InputSection
                        title={strings.eapFullFormImplementationAttachFilesTitle}
                        description={strings.eapFullFormImplementationAttachFilesDescription}
                    >
                        <GoMultiFileInput
                            name="activation_process_relevant_files"
                            accept=".pdf, .docx, .pptx"
                            fileIdToUrlMap={fileIdToUrlMap}
                            onChange={setFieldValue}
                            url="/api/v2/eap-file/multiple/"
                            value={value?.activation_process_relevant_files}
                            error={getErrorString(error?.activation_process_relevant_files)}
                            setFileIdToUrlMap={setFileIdToUrlMap}
                            clearable
                            disabled={disabled}
                            useCurrentLanguageForMutation
                        >
                            {strings.eapFullFormImplementationProcessUploadLabel}
                        </GoMultiFileInput>
                    </InputSection>
                    <InputSection
                        title={strings.eapFullFormImplementationSourceOfInformationTitle}
                        description={
                            strings.eapFullFormImplementationSourceOfInformationDescription
                        }
                    >
                        <NonFieldError
                            error={getErrorObject(error?.activation_process_source_of_information)}
                        />
                        {value?.activation_process_source_of_information?.map((source, index) => (
                            <ActivationSourceInformationInput
                                key={source.client_id}
                                index={index}
                                value={source}
                                onChange={onRiskSourceInformationChange}
                                onRemove={onRiskSourceInformationRemove}
                                error={getErrorObject(error
                                    ?.activation_process_source_of_information)}
                                disabled={disabled}
                            />
                        ))}
                        <Button
                            name={undefined}
                            onClick={handleSourceInformationAdd}
                            disabled={disabled}
                        >
                            {strings.eapFullFormImplementationSourceOfInformationAddNewLabel}
                        </Button>
                    </InputSection>
                </ListView>
            </Container>
        </TabPage>
    );
}

export default EapActivationProcess;
