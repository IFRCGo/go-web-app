import { useCallback } from 'react';
import { AddLineIcon } from '@ifrc-go/icons';
import {
    Button,
    Container,
    Description,
    InputSection,
    Label,
    ListView,
    TextArea,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    isNotDefined,
    randomString,
} from '@togglecorp/fujs';
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
    readOnly?: boolean;
}

function RiskAnalysis(props: Props) {
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
        <TabPage
            headerAction={(
                <SectionQualityCriteria
                    heading={strings.riskAnalysisSectionHeading}
                    content={(
                        <ListView withSpacingOpticalCorrection layout="block">
                            <Label strong>
                                {strings.riskSectionCriteriaIntroduction1}
                            </Label>
                            <ListView withSpacingOpticalCorrection spacing="xs" layout="block">
                                <Description>
                                    {strings.riskSectionCriteriaComment11}
                                </Description>
                                <Description>
                                    {strings.riskSectionCriteriaComment12}
                                </Description>
                                <Description>
                                    {strings.riskSectionCriteriaComment13}
                                </Description>
                                <Description>
                                    {strings.riskSectionCriteriaComment14}
                                </Description>
                            </ListView>
                            <Label strong>
                                {strings.riskSectionCriteriaIntroduction2}
                            </Label>
                            <ListView spacing="xs" withSpacingOpticalCorrection layout="block">
                                <Description>
                                    {strings.riskSectionCriteriaComment21}
                                </Description>
                                <Description>
                                    {strings.riskSectionCriteriaComment22}
                                </Description>
                            </ListView>
                            <Label strong>
                                {strings.riskSectionCriteriaIntroduction3}
                            </Label>
                            <ListView spacing="xs" withSpacingOpticalCorrection layout="block">
                                <Description>
                                    {strings.riskSectionCriteriaComment31}
                                </Description>
                                <Description>
                                    {strings.riskSectionCriteriaComment32}
                                </Description>
                            </ListView>
                            <Label strong>
                                {strings.riskSectionCriteriaIntroduction4}
                            </Label>
                            <ListView spacing="xs" withSpacingOpticalCorrection layout="block">
                                <Description>
                                    {strings.riskSectionCriteriaComment41}
                                </Description>
                                <Description>
                                    {strings.riskSectionCriteriaComment42}
                                </Description>
                            </ListView>
                            <Label strong>
                                {strings.riskSectionCriteriaIntroduction5}
                            </Label>
                            <Description>
                                {strings.riskSectionCriteriaComment5}
                            </Description>
                            <ListView spacing="xs" withSpacingOpticalCorrection layout="block">
                                <Label strong>
                                    {strings.riskSectionCriteriaIntroduction6}
                                </Label>
                                <Description>
                                    <ol>
                                        <li>{strings.riskSectionCriteriaIntroduction61}</li>
                                        <li>{strings.riskSectionCriteriaIntroduction62}</li>
                                        <li>{strings.riskSectionCriteriaIntroduction63}</li>
                                    </ol>
                                </Description>
                            </ListView>
                            <ListView spacing="xs" withSpacingOpticalCorrection layout="block">
                                <Description>
                                    {strings.riskSectionCriteriaComment61}
                                </Description>
                                <Description>
                                    {strings.riskSectionCriteriaComment62}
                                </Description>
                                <Description>
                                    {strings.riskSectionCriteriaComment63}
                                </Description>
                                <Description>
                                    {strings.riskSectionCriteriaComment64}
                                </Description>
                            </ListView>
                        </ListView>
                    )}
                />
            )}
        >
            <Container
                heading={strings.riskAnalysisHeading}
                variant="form"
            >
                <ListView layout="block" spacing="sm">
                    <InputSection
                        title={strings.hazardSelectionTitle}
                        headerActions={(
                            <ExplanatoryNote
                                ariaLabel={strings.hazardSelectionTitle}
                                title={strings.hazardSelectionTitle}
                                heading={strings.hazardSelectionTitle}
                                content={(
                                    <ListView layout="block">
                                        <Label strong>
                                            {strings.riskExplanatoryNoteLabel}
                                        </Label>
                                        <Description>
                                            {strings.hazardSelectionExplanatoryNote}
                                        </Description>
                                        <Label strong>
                                            {strings.riskRequiredPointsLabel}
                                        </Label>
                                        <Description>
                                            <ul>
                                                <li>
                                                    {strings.hazardSelectionRequiredPoint1}
                                                </li>
                                                <li>
                                                    {strings.hazardSelectionRequiredPoint2}
                                                </li>
                                                <li>
                                                    {strings.hazardSelectionRequiredPoint3}
                                                    <ul>
                                                        <li>
                                                            {strings
                                                                .hazardSelectionRequiredPoint31}
                                                        </li>
                                                    </ul>
                                                </li>
                                                <li>
                                                    {strings.hazardSelectionRequiredPoint4}
                                                </li>
                                            </ul>
                                        </Description>
                                    </ListView>
                                )}
                            />
                        )}
                        description={(
                            <ul>
                                <li>{strings.hazardSelectionDescription1}</li>
                                <li>{strings.hazardSelectionDescription2}</li>
                                <li>{strings.hazardSelectionDescription3}</li>
                                <li>{strings.hazardSelectionDescription4}</li>
                            </ul>
                        )}
                        withAsteriskOnTitle
                    >
                        <TextArea
                            label={strings.riskDescriptionLabel}
                            name="hazard_selection"
                            onChange={setFieldValue}
                            value={value?.hazard_selection}
                            error={error?.hazard_selection}
                            disabled={disabled}
                            readOnly={readOnly}
                            maxLength={charLimits.hazard_selection}
                        />
                        <MultiImageWithCaptionInput
                            name="hazard_selection_images"
                            url="/api/v2/eap-file/multiple/"
                            value={value?.hazard_selection_images}
                            onChange={setFieldValue}
                            error={getErrorObject(error?.hazard_selection_images)}
                            fileIdToUrlMap={fileIdToUrlMap}
                            setFileIdToUrlMap={setFileIdToUrlMap}
                            label={strings.attachFilesSelectImagesLabel}
                            disabled={disabled}
                            readOnly={readOnly}
                            description={strings.riskAnalysisImagesCountLabel}
                        />
                    </InputSection>
                    <InputSection
                        title={strings.exposeElementTitle}
                        headerActions={(
                            <ExplanatoryNote
                                heading={strings.exposeElementTitle}
                                ariaLabel={strings.exposeElementTitle}
                                title={strings.exposeElementTitle}
                                content={(
                                    <ListView layout="block">
                                        <Label strong>
                                            {strings.riskExplanatoryNoteLabel}
                                        </Label>
                                        <Description>
                                            {strings.exposeElementExplanatoryNote}
                                        </Description>
                                        <Label strong>
                                            {strings.riskRequiredPointsLabel}
                                        </Label>
                                        <Description>
                                            <ul>
                                                <li>
                                                    {strings.exposeElementRequiredPoint1}
                                                </li>
                                                <li>
                                                    {strings.exposeElementRequiredPoint2}
                                                </li>
                                                <li>
                                                    {strings.exposeElementRequiredPoint3}
                                                </li>
                                                <li>
                                                    {strings.exposeElementRequiredPoint4}
                                                </li>
                                                <li>
                                                    {strings.exposeElementRequiredPoint5}
                                                </li>
                                            </ul>
                                        </Description>
                                    </ListView>
                                )}
                            />
                        )}
                        description={(
                            <ul>
                                <li>{strings.exposeElementDescription1}</li>
                                <li>{strings.exposeElementDescription2}</li>
                                <li>{strings.exposeElementDescription3}</li>
                                <li>{strings.exposeElementDescription4}</li>
                                <li>{strings.exposeElementDescription5}</li>
                            </ul>
                        )}
                        withAsteriskOnTitle
                    >
                        <TextArea
                            label={strings.riskDescriptionLabel}
                            name="exposed_element_and_vulnerability_factor"
                            onChange={setFieldValue}
                            value={value?.exposed_element_and_vulnerability_factor}
                            error={error?.exposed_element_and_vulnerability_factor}
                            disabled={disabled}
                            readOnly={readOnly}
                            maxLength={charLimits.exposed_element_and_vulnerability_factor}
                        />
                        <MultiImageWithCaptionInput
                            name="exposed_element_and_vulnerability_factor_images"
                            url="/api/v2/eap-file/multiple/"
                            value={value?.exposed_element_and_vulnerability_factor_images}
                            onChange={setFieldValue}
                            error={getErrorObject(error?.hazard_selection_images)}
                            fileIdToUrlMap={fileIdToUrlMap}
                            setFileIdToUrlMap={setFileIdToUrlMap}
                            label={strings.attachFilesSelectImagesLabel}
                            disabled={disabled}
                            readOnly={readOnly}
                            description={strings.riskAnalysisImagesCountLabel}
                        />
                    </InputSection>
                    <InputSection
                        title={strings.prioritisedImpactTitle}
                        headerActions={(
                            <ExplanatoryNote
                                title={strings.prioritisedImpactTitle}
                                heading={strings.prioritisedImpactTitle}
                                ariaLabel={strings.prioritisedImpactTitle}
                                content={(
                                    <ListView layout="block">
                                        <Label strong>
                                            {strings.riskExplanatoryNoteLabel}
                                        </Label>
                                        <Description>
                                            {strings.prioritisedImpactExplanatoryNote}
                                        </Description>
                                    </ListView>
                                )}
                            />
                        )}
                        description={strings.prioritisedImpactDescription}
                        withAsteriskOnTitle
                    >
                        <Container
                            heading={strings.prioritisedImpactsLabel}
                            headingLevel={6}
                            headerDescription={(
                                <NonFieldError
                                    error={getErrorObject(error?.prioritized_impacts)}
                                />
                            )}
                            withPadding
                            withBorder
                            empty={isNotDefined(value.prioritized_impacts)
                                || value.prioritized_impacts.length === 0}
                            emptyMessage={strings.prioritizedImpactsEmptyMessage}
                            withCompactMessage
                        >
                            <ListView layout="block">
                                {value?.prioritized_impacts?.map((impact, index) => (
                                    <PrioritisedImpactInput
                                        key={impact.client_id}
                                        index={index}
                                        value={impact}
                                        onChange={onPrioritizedChange}
                                        onRemove={onPrioritizedRemove}
                                        error={getErrorObject(error?.prioritized_impacts)}
                                        disabled={disabled}
                                        readOnly={readOnly}
                                    />
                                ))}
                            </ListView>
                        </Container>
                        <Button
                            name={undefined}
                            onClick={handlePrioritizedImpactAdd}
                            disabled={disabled || readOnly}
                            before={<AddLineIcon />}
                        >
                            {strings.addButtonLabel}
                        </Button>
                        <TextArea
                            label={strings.riskDescriptionLabel}
                            name="prioritized_impact"
                            onChange={setFieldValue}
                            value={value?.prioritized_impact}
                            error={error?.prioritized_impact}
                            disabled={disabled}
                            readOnly={readOnly}
                            maxLength={charLimits.prioritized_impact}
                        />
                        <MultiImageWithCaptionInput
                            name="prioritized_impact_images"
                            url="/api/v2/eap-file/multiple/"
                            value={value?.prioritized_impact_images}
                            onChange={setFieldValue}
                            error={getErrorObject(error?.hazard_selection_images)}
                            fileIdToUrlMap={fileIdToUrlMap}
                            setFileIdToUrlMap={setFileIdToUrlMap}
                            label={strings.attachFilesSelectImagesLabel}
                            disabled={disabled}
                            readOnly={readOnly}
                            description={strings.riskAnalysisImagesCountLabel}
                        />
                    </InputSection>
                    <InputSection
                        title={strings.attachFilesTitle}
                        description={strings.attachFilesDescription}
                    >
                        <GoMultiFileInput
                            name="risk_analysis_relevant_files"
                            accept=".pdf, .docx, .pptx, image/*"
                            fileIdToUrlMap={fileIdToUrlMap}
                            onChange={setFieldValue}
                            url="/api/v2/eap-file/multiple/"
                            value={value.risk_analysis_relevant_files}
                            error={getErrorString(error?.risk_analysis_relevant_files)}
                            setFileIdToUrlMap={setFileIdToUrlMap}
                            clearable
                            required
                            disabled={disabled}
                            readOnly={readOnly}
                            useCurrentLanguageForMutation
                        >
                            {strings.attachFilesUploadLabel}
                        </GoMultiFileInput>
                    </InputSection>
                    <InputSection
                        title={strings.sourceOfInformationTitle}
                        description={strings.sourceOfInformationDescription}
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
                                readOnly={readOnly}
                            />
                        ))}
                        <Button
                            name={undefined}
                            onClick={handleSourceInformationAdd}
                            disabled={disabled || readOnly}
                            before={<AddLineIcon />}
                        >
                            {strings.addButtonLabel}
                        </Button>
                    </InputSection>
                </ListView>
            </Container>
        </TabPage>
    );
}

export default RiskAnalysis;
