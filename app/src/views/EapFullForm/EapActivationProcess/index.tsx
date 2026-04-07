import { useCallback } from 'react';
import { AddLineIcon } from '@ifrc-go/icons';
import {
    Button,
    Container,
    Description,
    InputSection,
    Label,
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
import ExplanatoryNote from '#components/ExplanatoryNote';
import NonFieldError from '#components/NonFieldError';
import TabPage from '#components/TabPage';

import { charLimits } from '../common';
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
                        <ExplanatoryNote
                            heading={strings.activationProcessHeading}
                            ariaLabel={strings.activationProcessHeading}
                            title={strings.activationProcessHeading}
                            content={(
                                <Description>
                                    {strings.activationProcessTooltip}
                                </Description>
                            )}
                        />
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
                        headerActions={(
                            <ExplanatoryNote
                                heading={strings.activationProcessTitle}
                                ariaLabel={strings.activationProcessTitle}
                                title={strings.activationProcessTitle}
                                content={(
                                    <ListView layout="block">
                                        <ListView spacing="xs" layout="block" withSpacingOpticalCorrection>
                                            <Label strong>
                                                {strings.activationProcessExplanatoryLabel}
                                            </Label>
                                            <Description>
                                                {strings.activationImplementationExplanatoryNote}
                                            </Description>
                                        </ListView>
                                        <ListView spacing="xs" layout="block" withSpacingOpticalCorrection>
                                            <Label strong>
                                                {strings.activationProcessRequiredPointsLabel}
                                            </Label>
                                            <Description>
                                                <ul>
                                                    <li>
                                                        {strings.activationRequiredPoint1}
                                                    </li>
                                                    <li>
                                                        {strings.activationRequiredPoint2}
                                                    </li>
                                                    <li>
                                                        {strings.activationRequiredPoint3}
                                                    </li>
                                                    <li>
                                                        {strings.activationRequiredPoint4}
                                                    </li>
                                                </ul>
                                            </Description>
                                        </ListView>
                                    </ListView>
                                )}
                            />
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
                            maxLength={charLimits.early_action_implementation_process}
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
                        headerActions={(
                            <ExplanatoryNote
                                heading={strings.activationTriggerTitle}
                                ariaLabel={strings.activationTriggerTitle}
                                title={strings.activationTriggerTitle}
                                content={(
                                    <ListView layout="block">
                                        <ListView spacing="xs" layout="block" withSpacingOpticalCorrection>
                                            <Label strong>
                                                {strings.activationProcessExplanatoryLabel}
                                            </Label>
                                            <Description>
                                                {strings.activationTriggerExplanatoryNote}
                                            </Description>
                                        </ListView>
                                        <ListView spacing="xs" layout="block" withSpacingOpticalCorrection>
                                            <Label strong>
                                                {strings.activationProcessRequiredPointsLabel}
                                            </Label>
                                            <Description>
                                                <ul>
                                                    <li>
                                                        {strings.activationTriggerRequiredPoint1}
                                                    </li>
                                                    <li>
                                                        {strings.activationTriggerRequiredPoint2}
                                                    </li>
                                                    <li>
                                                        {strings.activationTriggerRequiredPoint3}
                                                    </li>
                                                </ul>
                                            </Description>
                                        </ListView>
                                    </ListView>
                                )}
                            />
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
                            maxLength={charLimits.trigger_activation_system}
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
                        headerActions={(
                            <ExplanatoryNote
                                heading={strings.activationSelectionPopulationTitle}
                                ariaLabel={strings.activationSelectionPopulationTitle}
                                title={strings.activationSelectionPopulationTitle}
                                content={(
                                    <ListView layout="block">
                                        <ListView spacing="xs" layout="block" withSpacingOpticalCorrection>
                                            <Label strong>
                                                {strings.activationProcessExplanatoryLabel}
                                            </Label>
                                            <Description>
                                                {strings.activationSelectionExplanatoryNote}
                                            </Description>
                                        </ListView>
                                        <ListView spacing="xs" layout="block" withSpacingOpticalCorrection>
                                            <Label strong>
                                                {strings.activationProcessRequiredPointsLabel}
                                            </Label>
                                            <Description>
                                                <ul>
                                                    <li>
                                                        {strings.activationSelectionDescription1}
                                                    </li>
                                                    <li>
                                                        {strings.activationSelectionDescription2}
                                                    </li>
                                                    <li>
                                                        {strings.activationSelectionDescription3}
                                                    </li>
                                                </ul>
                                            </Description>
                                        </ListView>
                                    </ListView>
                                )}
                            />
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
                            maxLength={charLimits.selection_of_target_population}
                        />
                    </InputSection>
                    <InputSection
                        withAsteriskOnTitle
                        title={strings.activationStopMechanismTitle}
                        headerActions={(
                            <ExplanatoryNote
                                heading={strings.activationStopMechanismTitle}
                                ariaLabel={strings.activationStopMechanismTitle}
                                title={strings.activationStopMechanismTitle}
                                content={(
                                    <ListView layout="block">
                                        <ListView spacing="xs" layout="block" withSpacingOpticalCorrection>
                                            <Label strong>
                                                {strings.activationProcessExplanatoryLabel}
                                            </Label>
                                            <Description>
                                                {strings.activationStopMechanismExplanatoryNote}
                                            </Description>
                                        </ListView>
                                        <ListView spacing="xs" layout="block" withSpacingOpticalCorrection>
                                            <Label strong>
                                                {strings.activationProcessRequiredPointsLabel}
                                            </Label>
                                            <Description>
                                                <ul>
                                                    <li>{strings.activationStopDescription1}</li>
                                                    <li>{strings.activationStopDescription2}</li>
                                                    <li>{strings.activationStopDescription3}</li>
                                                </ul>
                                            </Description>
                                        </ListView>
                                    </ListView>
                                )}
                            />
                        )}
                        description={(
                            <ul>
                                <li>{strings.activationStopDescription1}</li>
                                <li>{strings.activationStopDescription2}</li>
                                <li>{strings.activationStopDescription3}</li>
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
                            maxLength={charLimits.stop_mechanism}
                        />
                    </InputSection>
                    <InputSection
                        title={strings.activationAttachFilesTitle}
                        description={strings.activationAttachFilesDescription}
                    >
                        <GoMultiFileInput
                            name="activation_process_relevant_files"
                            accept=".pdf, .docx, .pptx, image/*"
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
