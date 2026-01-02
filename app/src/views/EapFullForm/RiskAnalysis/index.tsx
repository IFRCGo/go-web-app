import { useCallback } from 'react';
import {
    Button,
    Heading,
    InputSection,
    ListView,
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
import PrioritisedImpactInput from './PrioritisedImpactInput';

import i18n from './i18n.json';

type PrioritisedImpactsFormFields = NonNullable<
    PartialEapFullFormType['prioritized_impacts']
>[number];

interface Props {
    value: PartialEapFullFormType;
    setFieldValue: (...entries: EntriesAsList<PartialEapFullFormType>) => void;
    error: Error<PartialEapFullFormType> | undefined;
    disabled?: boolean;
    fileIdToUrlMap: Record<number, string>;
    setFileIdToUrlMap?: React.Dispatch<
        React.SetStateAction<Record<number, string>>
    >;
}

function RiskAnalysis(props: Props) {
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
    } = useFormArray<
        'risk_analysis_source_of_information',
        SourceInformationFormFields
    >('risk_analysis_source_of_information', setFieldValue);

    const { setValue: onPrioritizedChange, removeValue: onPrioritizedRemove } = useFormArray<'prioritized_impacts', PrioritisedImpactsFormFields>(
        'prioritized_impacts',
        setFieldValue,
    );

    const handleSourceInformationAdd = useCallback(() => {
        const newSourceInformationItem: SourceInformationFormFields = {
            client_id: randomString(),
        };

        setFieldValue(
            (oldValue: SourceInformationFormFields[] | undefined) => [
                ...(oldValue ?? []),
                newSourceInformationItem,
            ],
            'risk_analysis_source_of_information' as const,
        );
    }, [setFieldValue]);

    const handlePrioritizedImpactAdd = useCallback(() => {
        const newPrioritizedImpactItem: PrioritisedImpactsFormFields = {
            client_id: randomString(),
        };

        setFieldValue(
            (oldValue: PrioritisedImpactsFormFields[] | undefined) => [
                ...(oldValue ?? []),
                newPrioritizedImpactItem,
            ],
            'prioritized_impacts' as const,
        );
    }, [setFieldValue]);

    return (
        <TabPage>
            <ListView layout="block">
                <Heading level={4}>
                    {strings.eapFullFormRiskAnalysisHeading}
                </Heading>
                <InputSection
                    title={strings.eapFullFormHazardSelectionTitle}
                    tooltip={(
                        <ListView layout="block">
                            <TextOutput
                                label={strings.eapFullFormRiskExplanatoryNoteLabel}
                                strongLabel
                                value={strings.eapFullFormHazardSelectionExplanatoryNote}
                            />
                            <TextOutput
                                label={strings.eapFullFormRiskRequiredPointsLabel}
                                strongLabel
                                value={(
                                    <ul>
                                        <li>
                                            {strings.eapFullFormHazardSelectionRequiredPoint1}
                                        </li>
                                        <li>
                                            {strings.eapFullFormHazardSelectionRequiredPoint2}
                                        </li>
                                        <li>
                                            {strings.eapFullFormHazardSelectionRequiredPoint3}
                                            <ul>
                                                <li>
                                                    {/* eslint-disable-next-line max-len */}
                                                    {strings.eapFullFormHazardSelectionRequiredPoint31}
                                                </li>
                                            </ul>
                                        </li>
                                        <li>
                                            {strings.eapFullFormHazardSelectionRequiredPoint4}
                                        </li>
                                    </ul>
                                )}
                            />
                        </ListView>
                    )}
                    description={(
                        <ul>
                            <li>{strings.eapFullFormHazardSelectionDescription1}</li>
                            <li>{strings.eapFullFormHazardSelectionDescription2}</li>
                            <li>{strings.eapFullFormHazardSelectionDescription3}</li>
                            <li>{strings.eapFullFormHazardSelectionDescription4}</li>
                        </ul>
                    )}
                    withAsteriskOnTitle
                >
                    <TextArea
                        label={strings.eapFullFormRiskDescriptionLabel}
                        name="hazard_selection"
                        onChange={setFieldValue}
                        value={value?.hazard_selection}
                        error={error?.hazard_selection}
                        disabled={disabled}
                    />
                    <MultiImageWithCaptionInput
                        name="hazard_selection_images"
                        url="/api/v2/eap-file/multiple/"
                        value={value?.hazard_selection_images}
                        onChange={setFieldValue}
                        error={getErrorObject(error?.hazard_selection_images)}
                        fileIdToUrlMap={fileIdToUrlMap}
                        setFileIdToUrlMap={setFileIdToUrlMap}
                        label="Upload"
                        disabled={disabled}
                    />
                </InputSection>
                <InputSection
                    title={strings.eapFullFormExposeElementTitle}
                    tooltip={(
                        <ListView layout="block">
                            <TextOutput
                                label={strings.eapFullFormRiskExplanatoryNoteLabel}
                                strongLabel
                                value={strings.eapFullFormExposeElementExplanatoryNote}
                            />
                            <TextOutput
                                label={strings.eapFullFormRiskRequiredPointsLabel}
                                strongLabel
                                value={(
                                    <ul>
                                        <li>
                                            {strings.eapFullFormExposeElementRequiredPoint1}
                                        </li>
                                        <li>
                                            {strings.eapFullFormExposeElementRequiredPoint2}
                                        </li>
                                        <li>
                                            {strings.eapFullFormExposeElementRequiredPoint3}
                                        </li>
                                        <li>
                                            {strings.eapFullFormExposeElementRequiredPoint4}
                                        </li>
                                        <li>
                                            {strings.eapFullFormExposeElementRequiredPoint5}
                                        </li>
                                    </ul>
                                )}
                            />
                        </ListView>
                    )}
                    description={(
                        <ul>
                            <li>{strings.eapFullFormExposeElementDescription1}</li>
                            <li>{strings.eapFullFormExposeElementDescription2}</li>
                            <li>{strings.eapFullFormExposeElementDescription3}</li>
                            <li>{strings.eapFullFormExposeElementDescription4}</li>
                            <li>{strings.eapFullFormExposeElementDescription5}</li>
                        </ul>
                    )}
                    withAsteriskOnTitle
                >
                    <TextArea
                        label={strings.eapFullFormRiskDescriptionLabel}
                        name="exposed_element_and_vulnerability_factor"
                        onChange={setFieldValue}
                        value={value?.exposed_element_and_vulnerability_factor}
                        disabled={disabled}
                    />
                    <MultiImageWithCaptionInput
                        name="exposed_element_and_vulnerability_factor_images"
                        url="/api/v2/eap-file/multiple/"
                        value={value?.exposed_element_and_vulnerability_factor_images}
                        onChange={setFieldValue}
                        error={getErrorObject(error?.hazard_selection_images)}
                        fileIdToUrlMap={fileIdToUrlMap}
                        setFileIdToUrlMap={setFileIdToUrlMap}
                        label={strings.eapFullFormAttachFilesSelectImagesLabel}
                        disabled={disabled}
                    />
                </InputSection>
                <InputSection
                    title={strings.eapFullFormPrioritisedImpactTitle}
                    tooltip={(
                        <TextOutput
                            label={strings.eapFullFormRiskExplanatoryNoteLabel}
                            strongLabel
                            value={strings.eapFullFormPrioritisedImpactExplanatoryNote}
                        />
                    )}
                    description={strings.eapFullFormPrioritisedImpactDescription}
                    withAsteriskOnTitle
                >
                    <TextOutput
                        withLightText
                        value={strings.eapFullFormPrioritisedImpactsLabel}
                    />
                    <NonFieldError
                        error={getErrorObject(error?.prioritized_impacts)}
                    />
                    {value?.prioritized_impacts?.map((impact, index) => (
                        <PrioritisedImpactInput
                            key={impact.client_id}
                            index={index}
                            value={impact}
                            onChange={onPrioritizedChange}
                            onRemove={onPrioritizedRemove}
                            error={getErrorObject(error?.prioritized_impacts)}
                            disabled={disabled}
                        />
                    ))}
                    <Button
                        name={undefined}
                        onClick={handlePrioritizedImpactAdd}
                        disabled={disabled}
                    >
                        {strings.eapFullFormImpactAddButtonLabel}
                    </Button>
                    <TextArea
                        label={strings.eapFullFormRiskDescriptionLabel}
                        name="prioritized_impact"
                        onChange={setFieldValue}
                        value={value?.prioritized_impact}
                        disabled={disabled}
                    />
                    <MultiImageWithCaptionInput
                        name="prioritized_impact_images"
                        url="/api/v2/eap-file/multiple/"
                        value={value?.prioritized_impact_images}
                        onChange={setFieldValue}
                        error={getErrorObject(error?.hazard_selection_images)}
                        fileIdToUrlMap={fileIdToUrlMap}
                        setFileIdToUrlMap={setFileIdToUrlMap}
                        label={strings.eapFullFormAttachFilesSelectImagesLabel}
                        disabled={disabled}
                    />
                </InputSection>
                <InputSection
                    title={strings.eapFullFormAttachFilesTitle}
                    description={strings.eapFullFormAttachFilesDescription}
                >
                    <GoMultiFileInput
                        name="risk_analysis_relevant_files"
                        accept=".pdf, .docx, .pptx"
                        fileIdToUrlMap={fileIdToUrlMap}
                        onChange={setFieldValue}
                        url="/api/v2/eap-file/multiple/"
                        value={value.risk_analysis_relevant_files}
                        error={getErrorString(error?.risk_analysis_relevant_files)}
                        setFileIdToUrlMap={setFileIdToUrlMap}
                        clearable
                        disabled={disabled}
                        useCurrentLanguageForMutation
                    >
                        {strings.eapFullFormAttachFilesUploadLabel}
                    </GoMultiFileInput>
                </InputSection>
                <InputSection
                    title={strings.eapFullFormSourceOfInformationTitle}
                    description={strings.eapFullFormSourceOfInformationDescription}
                >
                    <NonFieldError
                        error={getErrorObject(error?.risk_analysis_source_of_information)}
                    />
                    {value.risk_analysis_source_of_information?.map((source, index) => (
                        <EAPSourceInformationInput
                            key={source.client_id}
                            index={index}
                            value={source}
                            onChange={onRiskSourceInformationChange}
                            onRemove={onRiskSourceInformationRemove}
                            error={getErrorObject(
                                error?.risk_analysis_source_of_information,
                            )}
                            disabled={disabled}
                        />
                    ))}
                    <Button
                        name={undefined}
                        onClick={handleSourceInformationAdd}
                        disabled={disabled}
                    >
                        {strings.eapFullFormSourceOfInformationAddNewLabel}
                    </Button>
                </InputSection>
            </ListView>
        </TabPage>
    );
}

export default RiskAnalysis;
