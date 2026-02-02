import { useCallback } from 'react';
import { AddLineIcon } from '@ifrc-go/icons';
import {
    Button,
    Container,
    Description,
    InfoPopup,
    InputSection,
    Label,
    ListView,
    NumberInput,
    TextArea,
    TextOutput,
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

import EAPSourceInformationInput, { type SourceInformationFormFields } from '../EAPSourceInformationInput';
import { type PartialEapFullFormType } from '../schema';
import SectionQualityCriteria from '../SectionQualityCriteria';

import i18n from './i18n.json';

interface Props {
    value: PartialEapFullFormType;
    setFieldValue: (...entries: EntriesAsList<PartialEapFullFormType>) => void;
    error: Error<PartialEapFullFormType> | undefined;
    disabled?: boolean;
    fileIdToUrlMap: Record<number, string>;
    setFileIdToUrlMap?: React.Dispatch<
        React.SetStateAction<Record<number, string>>
    >;
    readOnly?: boolean;
}

function EapActivationProcess(props: Props) {
    const {
        value,
        setFieldValue,
        error: formError,
        disabled,
        fileIdToUrlMap,
        setFileIdToUrlMap,
        readOnly,
    } = props;

    const strings = useTranslation(i18n);

    const error = getErrorObject(formError);

    const {
        setValue: onRiskSourceInformationChange,
        removeValue: onRiskSourceInformationRemove,
    } = useFormArray<
        'activation_process_source_of_information',
        SourceInformationFormFields
    >('activation_process_source_of_information', setFieldValue);

    const handleSourceInformationAdd = useCallback(() => {
        const newSourceInformationItem: SourceInformationFormFields = {
            client_id: randomString(),
        };

        setFieldValue(
            (oldValue: SourceInformationFormFields[] | undefined) => [
                ...(oldValue ?? []),
                newSourceInformationItem,
            ],
            'activation_process_source_of_information' as const,
        );
    }, [setFieldValue]);

    return (
        <TabPage
            headerAction={(
                <SectionQualityCriteria
                    heading={strings.activationSectionHeading}
                    content={(
                        <ListView layout="block" withSpacingOpticalCorrection>
                            <Label strong>
                                {strings.activationSectionCriteriaIntroduction1}
                            </Label>
                            <ListView spacing="xs" layout="block" withSpacingOpticalCorrection>
                                <Description>
                                    {strings.activationSectionCriteriaComment11}
                                </Description>
                                <Description>
                                    {strings.activationSectionCriteriaComment12}
                                </Description>
                                <Description>
                                    {strings.activationSectionCriteriaComment13}
                                </Description>
                            </ListView>
                            <Label strong>
                                {strings.activationSectionCriteriaIntroduction2}
                            </Label>
                            <Description>
                                {strings.activationSectionCriteriaComment2}
                            </Description>
                            <Label strong>
                                {strings.activationSectionCriteriaIntroduction3}
                            </Label>
                            <ListView spacing="xs" layout="block" withSpacingOpticalCorrection>
                                <Description>
                                    {strings.activationSectionCriteriaComment31}
                                </Description>
                                <Description>
                                    {strings.activationSectionCriteriaComment32}
                                </Description>
                            </ListView>
                        </ListView>
                    )}
                />
            )}
        >
            <Container
                heading={(
                    <ListView spacing="sm">
                        {strings.activationProcessHeading}
                        <InfoPopup description={strings.activationProcessTooltip} />
                    </ListView>
                )}
                variant="form"
            >
                <ListView
                    layout="block"
                    spacing="sm"
                >
                    <InputSection
                        title={strings.activationProcessTitle}
                        tooltip={(
                            <ListView layout="block">
                                <TextOutput
                                    strongLabel
                                    label={strings.activationProcessExplanatoryLabel}
                                    value={strings.activationImplementationExplanatoryNote}
                                />
                                <TextOutput
                                    strongLabel
                                    label={strings.activationProcessRequiredPointsLabel}
                                    value={(
                                        <ul>
                                            <li>
                                                {strings.activationImplementationRequiredPoint1}
                                            </li>
                                            <li>
                                                {strings.activationImplementationRequiredPoint2}
                                            </li>
                                            <li>
                                                {strings.activationImplementationRequiredPoint3}
                                            </li>
                                            <li>
                                                {strings.activationImplementationRequiredPoint4}
                                            </li>
                                        </ul>
                                    )}
                                />
                            </ListView>
                        )}
                        description={(
                            <ul>
                                <li>{strings.activationProcessDescription1}</li>
                                <li>{strings.activationProcessDescription2}</li>
                            </ul>
                        )}
                        withAsteriskOnTitle
                    >
                        <TextArea
                            label={strings.activationProcessDescriptionLabel}
                            name="early_action_implementation_process"
                            onChange={setFieldValue}
                            value={value?.early_action_implementation_process}
                            error={error?.early_action_implementation_process}
                            disabled={disabled}
                            readOnly={readOnly}
                        />
                        <MultiImageWithCaptionInput
                            name="early_action_implementation_images"
                            url="/api/v2/eap-file/multiple/"
                            value={value?.early_action_implementation_images}
                            onChange={setFieldValue}
                            error={getErrorObject(error?.early_action_implementation_images)}
                            fileIdToUrlMap={fileIdToUrlMap}
                            setFileIdToUrlMap={setFileIdToUrlMap}
                            label={strings.activationSelectImagesLabel}
                            description={strings.activationImageCountLabel}
                            disabled={disabled}
                            readOnly={readOnly}
                        />
                    </InputSection>
                    <InputSection
                        withAsteriskOnTitle
                        title={strings.activationTriggerTitle}
                        tooltip={(
                            <ListView layout="block">
                                <TextOutput
                                    strongLabel
                                    label={strings.activationProcessExplanatoryLabel}
                                    value={strings.activationTriggerExplanatoryNote}
                                />
                                <TextOutput
                                    strongLabel
                                    label={strings.activationProcessRequiredPointsLabel}
                                    value={(
                                        <ul>
                                            <li>{strings.activationTriggerRequiredPoint1}</li>
                                            <li>{strings.activationTriggerRequiredPoint2}</li>
                                            <li>{strings.activationTriggerRequiredPoint3}</li>
                                        </ul>
                                    )}
                                />
                            </ListView>
                        )}
                        description={(
                            <ul>
                                <li>{strings.activationTriggerDescription1}</li>
                                <li>{strings.activationTriggerDescription2}</li>
                                <li>{strings.activationTriggerDescription3}</li>
                            </ul>
                        )}
                    >
                        <TextArea
                            label={strings.activationProcessDescriptionLabel}
                            name="trigger_activation_system"
                            onChange={setFieldValue}
                            value={value?.trigger_activation_system}
                            error={error?.trigger_activation_system}
                            disabled={disabled}
                            readOnly={readOnly}
                        />
                        <MultiImageWithCaptionInput
                            name="trigger_activation_system_images"
                            url="/api/v2/eap-file/multiple/"
                            value={value?.trigger_activation_system_images}
                            onChange={setFieldValue}
                            error={getErrorObject(error?.trigger_activation_system_images)}
                            fileIdToUrlMap={fileIdToUrlMap}
                            setFileIdToUrlMap={setFileIdToUrlMap}
                            label={strings.activationSelectImagesLabel}
                            description={strings.activationImageCountLabel}
                            disabled={disabled}
                            readOnly={readOnly}
                        />
                    </InputSection>
                    <InputSection
                        title={strings.activationPeopleTargetedTitle}
                        description={strings.activationPeopleTargetedDescription}
                        withAsteriskOnTitle
                    >
                        <NumberInput
                            name="people_targeted"
                            onChange={setFieldValue}
                            value={value?.people_targeted}
                            error={error?.people_targeted}
                            disabled={disabled}
                            readOnly={readOnly}
                        />
                    </InputSection>
                    <InputSection
                        withAsteriskOnTitle
                        title={strings.activationSelectionPopulationTitle}
                        tooltip={(
                            <ListView layout="block">
                                <TextOutput
                                    strongLabel
                                    label={strings.activationProcessExplanatoryLabel}
                                    value={strings.activationSelectionExplanatoryNote}
                                />
                                <TextOutput
                                    strongLabel
                                    label={strings.activationProcessRequiredPointsLabel}
                                    value={(
                                        <ul>
                                            <li>{strings.activationSelectionDescription1}</li>
                                            <li>{strings.activationSelectionDescription2}</li>
                                            <li>{strings.activationSelectionDescription3}</li>
                                        </ul>
                                    )}
                                />
                            </ListView>
                        )}
                        description={(
                            <ul>
                                <li>{strings.activationSelectionDescription1}</li>
                                <li>{strings.activationSelectionDescription2}</li>
                                <li>{strings.activationSelectionDescription3}</li>
                            </ul>
                        )}
                    >
                        <TextArea
                            label={strings.activationProcessDescriptionLabel}
                            name="selection_of_target_population"
                            onChange={setFieldValue}
                            value={value?.selection_of_target_population}
                            error={error?.selection_of_target_population}
                            disabled={disabled}
                            readOnly={readOnly}
                        />
                    </InputSection>
                    <InputSection
                        withAsteriskOnTitle
                        title={strings.activationStopMechanismTitle}
                        tooltip={(
                            <ListView layout="block">
                                <TextOutput
                                    strongLabel
                                    label={strings.activationProcessExplanatoryLabel}
                                    value={strings.activationStopMechanismExplanatoryNote}
                                />
                                <TextOutput
                                    strongLabel
                                    label={strings.activationProcessRequiredPointsLabel}
                                    value={(
                                        <ul>
                                            <li>{strings.activationStopMechanismDescription1}</li>
                                            <li>{strings.activationStopMechanismDescription2}</li>
                                            <li>{strings.activationStopMechanismDescription3}</li>
                                        </ul>
                                    )}
                                />
                            </ListView>
                        )}
                        description={(
                            <ul>
                                <li>{strings.activationStopMechanismDescription1}</li>
                                <li>{strings.activationStopMechanismDescription2}</li>
                                <li>{strings.activationStopMechanismDescription3}</li>
                            </ul>
                        )}
                    >
                        <TextArea
                            label={strings.activationProcessDescriptionLabel}
                            name="stop_mechanism"
                            onChange={setFieldValue}
                            value={value?.stop_mechanism}
                            error={error?.stop_mechanism}
                            disabled={disabled}
                            readOnly={readOnly}
                        />
                    </InputSection>
                    <InputSection
                        title={strings.activationAttachFilesTitle}
                        description={strings.activationAttachFilesDescription}
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
                            readOnly={readOnly}
                        >
                            {strings.activationProcessUploadLabel}
                        </GoMultiFileInput>
                    </InputSection>
                    <InputSection
                        title={strings.activationSourceOfInformationTitle}
                        description={strings.activationSourceOfInformationDescription}
                    >
                        <NonFieldError
                            error={getErrorObject(
                                error?.activation_process_source_of_information,
                            )}
                        />
                        {value?.activation_process_source_of_information?.map(
                            (source, index) => (
                                <EAPSourceInformationInput
                                    key={source.client_id}
                                    index={index}
                                    value={source}
                                    onChange={onRiskSourceInformationChange}
                                    onRemove={onRiskSourceInformationRemove}
                                    error={getErrorObject(
                                        error?.activation_process_source_of_information,
                                    )}
                                    disabled={disabled}
                                    readOnly={readOnly}
                                />
                            ),
                        )}
                        <Button
                            name={undefined}
                            onClick={handleSourceInformationAdd}
                            disabled={disabled || readOnly}
                            before={<AddLineIcon />}
                        >
                            {strings.activationAddNewButtonLabel}
                        </Button>
                    </InputSection>
                </ListView>
            </Container>
        </TabPage>
    );
}

export default EapActivationProcess;
