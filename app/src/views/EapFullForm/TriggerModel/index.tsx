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
    SelectInput,
    TextArea,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { stringValueSelector } from '@ifrc-go/ui/utils';
import {
    isDefined,
    randomString,
} from '@togglecorp/fujs';
import {
    type EntriesAsList,
    type Error,
    getErrorObject,
    getErrorString,
    useFormArray,
} from '@togglecorp/toggle-form';

import Admin2Input from '#components/domain/Admin2Input';
import GoMultiFileInput from '#components/domain/GoMultiFileInput';
import GoSingleFileInput from '#components/domain/GoSingleFileInput';
import MultiImageWithCaptionInput from '#components/domain/MultiImageWithCaptionInput';
import ExplanatoryNote from '#components/ExplanatoryNote';
import Link from '#components/Link';
import NonFieldError from '#components/NonFieldError';
import TabPage from '#components/TabPage';
import { type components } from '#generated/types';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import {
    type GoApiResponse,
    useRequest,
} from '#utils/restRequest';

import { charLimits } from '../common';
import EAPSourceInformationInput, { type SourceInformationFormFields } from '../EAPSourceInformationInput';
import { type PartialEapFullFormType } from '../schema';
import SectionQualityCriteria from '../SectionQualityCriteria';

import i18n from './i18n.json';

type TimeframeOption = components['schemas']['EapTimeframeEnum'];

function timeframeKeySelector(option: TimeframeOption) {
    return option.key;
}

interface Props {
    value: PartialEapFullFormType;
    setFieldValue: (...entries: EntriesAsList<PartialEapFullFormType>) => void;
    error: Error<PartialEapFullFormType> | undefined;
    disabled?: boolean;
    fileIdToUrlMap: Record<number, string>;
    setFileIdToUrlMap?: React.Dispatch<
        React.SetStateAction<Record<number, string>>
    >;
    eapRegistrationDetail?: GoApiResponse<'/api/v2/eap-registration/{id}/'>;
    readOnly?: boolean;
}

function TriggerModel(props: Props) {
    const {
        value,
        setFieldValue,
        error: formError,
        disabled,
        fileIdToUrlMap,
        setFileIdToUrlMap,
        eapRegistrationDetail,
        readOnly,
    } = props;

    const error = getErrorObject(formError);
    const strings = useTranslation(i18n);

    const { eap_timeframe } = useGlobalEnums();

    const { response: templateUrl } = useRequest({
        url: '/api/v2/eap/global-files/{template_type}/',
        pathVariables: {
            template_type: 'forecast_table',
        },
    });

    const {
        setValue: onSourcesForecastChange,
        removeValue: onSourcesForecastRemove,
    } = useFormArray<
        'trigger_statement_source_of_information',
        SourceInformationFormFields
    >('trigger_statement_source_of_information', setFieldValue);

    const handleSourcesForecastAdd = useCallback(() => {
        const newSourceInformationItem: SourceInformationFormFields = {
            client_id: randomString(),
        };

        setFieldValue(
            (oldValue: SourceInformationFormFields[] | undefined) => [
                ...(oldValue ?? []),
                newSourceInformationItem,
            ],
            'trigger_statement_source_of_information' as const,
        );
    }, [setFieldValue]);

    const {
        setValue: onSourceInformationChange,
        removeValue: onSourceInformationRemove,
    } = useFormArray<
        'trigger_model_source_of_information',
        SourceInformationFormFields
    >('trigger_model_source_of_information', setFieldValue);

    const handleSourceInformationAdd = useCallback(() => {
        const newSourceInformationItem: SourceInformationFormFields = {
            client_id: randomString(),
        };

        setFieldValue(
            (oldValue: SourceInformationFormFields[] | undefined) => [
                ...(oldValue ?? []),
                newSourceInformationItem,
            ],
            'trigger_model_source_of_information' as const,
        );
    }, [setFieldValue]);

    return (
        <TabPage
            headerAction={(
                <SectionQualityCriteria
                    heading={strings.triggerSectionHeading}
                    content={(
                        <ListView withSpacingOpticalCorrection layout="block">
                            <Label strong>
                                {strings.triggerSectionCriteriaIntroduction1}
                            </Label>
                            <ListView spacing="xs" layout="block" withSpacingOpticalCorrection>
                                <Description>
                                    {strings.triggerSectionCriteriaComment11}
                                </Description>
                                <Description>
                                    {strings.triggerSectionCriteriaComment12}
                                </Description>
                                <Description>
                                    {strings.triggerSectionCriteriaComment13}
                                </Description>
                                <Description>
                                    {strings.triggerSectionCriteriaComment14}
                                </Description>
                            </ListView>
                            <Label strong>
                                {strings.triggerSectionCriteriaIntroduction2}
                            </Label>
                            <ListView spacing="xs" layout="block" withSpacingOpticalCorrection>
                                <Description>
                                    {strings.triggerSectionCriteriaComment21}
                                </Description>
                                <Description>
                                    {strings.triggerSectionCriteriaComment22}
                                </Description>
                            </ListView>
                            <Label strong>
                                {strings.triggerSectionCriteriaIntroduction3}
                            </Label>
                            <ListView spacing="xs" layout="block" withSpacingOpticalCorrection>
                                <Description>
                                    {strings.triggerSectionCriteriaComment31}
                                </Description>
                                <Description>
                                    {strings.triggerSectionCriteriaComment32}
                                </Description>
                            </ListView>
                            <Label strong>
                                {strings.triggerSectionCriteriaIntroduction4}
                            </Label>
                            <ListView spacing="xs" layout="block" withSpacingOpticalCorrection>
                                <Description>
                                    {strings.triggerSectionCriteriaComment41}
                                </Description>
                                <Description>
                                    {strings.triggerSectionCriteriaComment42}
                                </Description>
                            </ListView>
                            <Label strong>
                                {strings.triggerSectionCriteriaIntroduction5}
                            </Label>
                            <Description>
                                {strings.triggerSectionCriteriaComment5}
                            </Description>
                            <ListView spacing="xs" layout="block" withSpacingOpticalCorrection>
                                <Label strong>
                                    {strings.triggerSectionCriteriaIntroduction6}
                                </Label>
                                <Description>
                                    <ol>
                                        <li>{strings.triggerSectionCriteriaIntroduction61}</li>
                                        <li>{strings.triggerSectionCriteriaIntroduction62}</li>
                                        <li>{strings.triggerSectionCriteriaIntroduction63}</li>
                                    </ol>
                                </Description>
                            </ListView>
                            <ListView spacing="xs" layout="block" withSpacingOpticalCorrection>
                                <Description>
                                    {strings.triggerSectionCriteriaComment61}
                                </Description>
                                <Description>
                                    {strings.triggerSectionCriteriaComment62}
                                </Description>
                                <Description>
                                    {strings.triggerSectionCriteriaComment63}
                                </Description>
                                <Description>
                                    {strings.triggerSectionCriteriaComment64}
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
                        {strings.triggerModelHeading}
                        <ExplanatoryNote
                            heading={strings.triggerModelHeading}
                            title={strings.triggerModelHeading}
                            ariaLabel={strings.triggerModelHeading}
                            content={(
                                <Description>
                                    {strings.triggerModelTooltipDescription}
                                </Description>
                            )}
                        />
                    </ListView>
                )}
                variant="form"
            >
                <ListView layout="block" spacing="sm">
                    <InputSection
                        title={strings.triggerStatementTitle}
                        headerActions={(
                            <ExplanatoryNote
                                heading={strings.triggerStatementTitle}
                                ariaLabel={strings.triggerStatementTitle}
                                title={strings.triggerStatementTitle}
                                content={(
                                    <ListView spacing="xs" layout="block" withSpacingOpticalCorrection>
                                        <Label strong>
                                            {strings.triggerExplanatoryNoteLabel}
                                        </Label>
                                        <Description>
                                            {strings.triggerStatementExplanatoryNote}
                                        </Description>
                                    </ListView>
                                )}
                            />
                        )}
                        description={strings.triggerStatementDescription}
                        withAsteriskOnTitle
                    >
                        <TextArea
                            label={strings.triggerModelDescriptionLabel}
                            name="trigger_statement"
                            value={value?.trigger_statement}
                            error={error?.trigger_statement}
                            onChange={setFieldValue}
                            disabled={disabled}
                            readOnly={readOnly}
                            maxLength={charLimits.trigger_statement}
                        />
                    </InputSection>
                    <InputSection
                        title={strings.triggerLeadTimeTitle}
                        withAsteriskOnTitle
                        numPreferredColumns={2}
                    >
                        <NumberInput
                            required
                            name="lead_time"
                            value={value?.lead_time}
                            error={error?.lead_time}
                            onChange={setFieldValue}
                            disabled={disabled}
                            readOnly={readOnly}
                        />
                        <SelectInput
                            required
                            name="lead_timeframe_unit"
                            value={value?.lead_timeframe_unit}
                            error={error?.lead_timeframe_unit}
                            onChange={setFieldValue}
                            options={eap_timeframe}
                            keySelector={timeframeKeySelector}
                            labelSelector={stringValueSelector}
                            disabled={disabled}
                            readOnly
                        />
                    </InputSection>
                    <InputSection
                        title={strings.sourcesForecastTitle}
                        description={strings.sourcesForecastDescription}
                    >
                        <NonFieldError
                            error={getErrorObject(
                                error?.trigger_statement_source_of_information,
                            )}
                        />
                        {value?.trigger_statement_source_of_information?.map(
                            (source, index) => (
                                <EAPSourceInformationInput
                                    key={source.client_id}
                                    index={index}
                                    value={source}
                                    onChange={onSourcesForecastChange}
                                    onRemove={onSourcesForecastRemove}
                                    error={getErrorObject(
                                        error?.risk_analysis_source_of_information,
                                    )}
                                    disabled={disabled}
                                    readOnly={readOnly}
                                />
                            ),
                        )}
                        <Button
                            name={undefined}
                            onClick={handleSourcesForecastAdd}
                            disabled={disabled || readOnly}
                            before={<AddLineIcon />}
                        >
                            {strings.addNewTriggerButtonLabel}
                        </Button>
                    </InputSection>
                    <InputSection
                        title={strings.forecastSelectionTitle}
                        headerActions={(
                            <ExplanatoryNote
                                heading={strings.forecastSelectionTitle}
                                ariaLabel={strings.forecastSelectionTitle}
                                title={strings.forecastSelectionTitle}
                                content={(
                                    <ListView layout="block">
                                        <ListView spacing="xs" layout="block" withSpacingOpticalCorrection>
                                            <Label strong>
                                                {strings.triggerExplanatoryNoteLabel}
                                            </Label>
                                            <Description>
                                                {strings.forecastExplanatoryNote}
                                            </Description>
                                        </ListView>
                                        <ListView spacing="xs" layout="block" withSpacingOpticalCorrection>
                                            <Label strong>
                                                {strings.triggerRequiredPointsLabel}
                                            </Label>
                                            <Description>
                                                <ul>
                                                    <li>{strings.forecastRequiredPoint1}</li>
                                                    <li>{strings.forecastRequiredPoint2}</li>
                                                </ul>
                                            </Description>
                                        </ListView>
                                    </ListView>
                                )}
                            />
                        )}
                        description={strings.forecastSelectionDescription}
                        withAsteriskOnTitle
                    >
                        <TextArea
                            label={strings.triggerModelDescriptionLabel}
                            name="forecast_selection"
                            value={value?.forecast_selection}
                            error={error?.forecast_selection}
                            onChange={setFieldValue}
                            disabled={disabled}
                            readOnly={readOnly}
                            maxLength={charLimits.forecast_selection}
                        />
                        <MultiImageWithCaptionInput
                            name="forecast_selection_images"
                            url="/api/v2/eap-file/multiple/"
                            value={value?.forecast_selection_images}
                            onChange={setFieldValue}
                            error={getErrorObject(error?.forecast_selection_images)}
                            fileIdToUrlMap={fileIdToUrlMap}
                            setFileIdToUrlMap={setFileIdToUrlMap}
                            label={strings.triggerSelectImagesLabel}
                            disabled={disabled}
                            readOnly={readOnly}
                            description={strings.triggerModelImagesCountLabel}
                        />
                    </InputSection>
                    <InputSection
                        title={strings.forecastTableDetails}
                        description={(
                            <Link
                                external
                                href={templateUrl?.url}
                                withUnderline
                                withLinkIcon
                            >
                                {strings.downloadForecastTableLabel}
                            </Link>
                        )}
                        withAsteriskOnTitle
                    >
                        <GoSingleFileInput
                            name="forecast_table_file"
                            accept=".docx"
                            fileIdToUrlMap={fileIdToUrlMap}
                            onChange={setFieldValue}
                            url="/api/v2/eap-file/"
                            value={value.forecast_table_file}
                            error={getErrorString(error?.forecast_table_file)}
                            setFileIdToUrlMap={setFileIdToUrlMap}
                            required
                            clearable
                            disabled={disabled}
                            readOnly={readOnly}
                            useCurrentLanguageForMutation
                            label={strings.attachRelevantFilesUploadLabel}
                        >
                            {strings.triggerUploadTableLabel}
                        </GoSingleFileInput>
                    </InputSection>
                    <InputSection
                        title={strings.definitionJustificationTitle}
                        headerActions={(
                            <ExplanatoryNote
                                heading={strings.definitionJustificationTitle}
                                ariaLabel={strings.definitionJustificationTitle}
                                title={strings.definitionJustificationTitle}
                                content={(
                                    <ListView layout="block">
                                        <ListView spacing="xs" layout="block" withSpacingOpticalCorrection>
                                            <Label strong>
                                                {strings.triggerExplanatoryNoteLabel}
                                            </Label>
                                            <Description>
                                                {strings.definitionJustificationExplanatoryNote}
                                            </Description>
                                        </ListView>
                                        <ListView spacing="xs" layout="block" withSpacingOpticalCorrection>
                                            <Label strong>
                                                {strings.triggerRequiredPointsLabel}
                                            </Label>
                                            <Description>
                                                <ul>
                                                    <li>{strings.definitionRequiredPoint1}</li>
                                                    <li>{strings.definitionRequiredPoint2}</li>
                                                    <li>{strings.definitionRequiredPoint3}</li>
                                                    <li>{strings.definitionRequiredPoint4}</li>
                                                </ul>
                                            </Description>
                                        </ListView>
                                    </ListView>
                                )}
                            />
                        )}
                        description={(
                            <ul>
                                <li>{strings.definitionJustificationDescription1}</li>
                                <li>{strings.definitionJustificationDescription2}</li>
                                <li>{strings.definitionJustificationDescription3}</li>
                                <li>{strings.definitionJustificationDescription4}</li>
                                <li>{strings.definitionJustificationDescription5}</li>
                            </ul>
                        )}
                        withAsteriskOnTitle
                    >
                        <TextArea
                            label={strings.triggerModelDescriptionLabel}
                            name="definition_and_justification_impact_level"
                            value={value?.definition_and_justification_impact_level}
                            error={error?.definition_and_justification_impact_level}
                            onChange={setFieldValue}
                            disabled={disabled}
                            readOnly={readOnly}
                            maxLength={charLimits.definition_and_justification_impact_level}
                        />
                        <MultiImageWithCaptionInput
                            name="definition_and_justification_impact_level_images"
                            url="/api/v2/eap-file/multiple/"
                            value={value?.definition_and_justification_impact_level_images}
                            onChange={setFieldValue}
                            error={getErrorObject(
                                error?.definition_and_justification_impact_level_images,
                            )}
                            fileIdToUrlMap={fileIdToUrlMap}
                            setFileIdToUrlMap={setFileIdToUrlMap}
                            label={strings.triggerSelectImagesLabel}
                            disabled={disabled}
                            readOnly={readOnly}
                            description={strings.triggerModelImagesCountLabel}
                        />
                    </InputSection>
                    <InputSection
                        title={strings.identificationInterventionTitle}
                        headerActions={(
                            <ExplanatoryNote
                                heading={strings.identificationInterventionTitle}
                                ariaLabel={strings.identificationInterventionTitle}
                                title={strings.identificationInterventionTitle}
                                content={(
                                    <ListView layout="block">
                                        <ListView spacing="xs" layout="block" withSpacingOpticalCorrection>
                                            <Label strong>
                                                {strings.triggerExplanatoryNoteLabel}
                                            </Label>
                                            <Description>
                                                {strings.identificationInterventionExplanatoryNote}
                                            </Description>
                                        </ListView>
                                        <ListView spacing="xs" layout="block" withSpacingOpticalCorrection>
                                            <Label strong>
                                                {strings.triggerRequiredPointsLabel}
                                            </Label>
                                            <Description>
                                                <ul>
                                                    <li>
                                                        {strings.identificationRequiredPoint1}
                                                    </li>
                                                    <li>
                                                        {strings.identificationRequiredPoint2}
                                                    </li>
                                                    <li>
                                                        {strings.identificationRequiredPoint3}
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
                                <li>{strings.identificationInterventionDescription1}</li>
                                <li>{strings.identificationInterventionDescription2}</li>
                                <li>{strings.identificationInterventionDescription3}</li>
                            </ul>
                        )}
                        withAsteriskOnTitle
                    >
                        <TextArea
                            label={strings.triggerModelDescriptionLabel}
                            name="identification_of_the_intervention_area"
                            value={value?.identification_of_the_intervention_area}
                            error={error?.identification_of_the_intervention_area}
                            onChange={setFieldValue}
                            disabled={disabled}
                            readOnly={readOnly}
                            maxLength={charLimits.identification_of_the_intervention_area}
                        />
                        <MultiImageWithCaptionInput
                            name="identification_of_the_intervention_area_images"
                            url="/api/v2/eap-file/multiple/"
                            value={value?.identification_of_the_intervention_area_images}
                            onChange={setFieldValue}
                            error={getErrorObject(
                                error?.identification_of_the_intervention_area_images,
                            )}
                            fileIdToUrlMap={fileIdToUrlMap}
                            setFileIdToUrlMap={setFileIdToUrlMap}
                            label={strings.triggerSelectImagesLabel}
                            disabled={disabled}
                            readOnly={readOnly}
                            description={strings.triggerModelImagesCountLabel}
                        />
                    </InputSection>
                    <InputSection
                        title={strings.selectRegionTitle}
                        description={strings.selectRegionDescription}
                        withAsteriskOnTitle
                    >
                        {isDefined(eapRegistrationDetail?.country) && (
                            <Admin2Input
                                name="admin2"
                                onChange={setFieldValue}
                                value={value?.admin2}
                                countryId={eapRegistrationDetail.country}
                                error={getErrorString(error?.admin2)}
                                readOnly={readOnly}
                            />
                        )}
                    </InputSection>
                    <InputSection
                        title={strings.attachRelevantFilesTitle}
                        description={strings.attachRelevantFilesDescription}
                    >
                        <GoMultiFileInput
                            name="trigger_model_relevant_files"
                            accept=".pdf, .docx, .pptx, image/*"
                            fileIdToUrlMap={fileIdToUrlMap}
                            onChange={setFieldValue}
                            url="/api/v2/eap-file/multiple/"
                            value={value?.trigger_model_relevant_files}
                            error={getErrorString(error?.trigger_model_relevant_files)}
                            setFileIdToUrlMap={setFileIdToUrlMap}
                            clearable
                            disabled={disabled}
                            useCurrentLanguageForMutation
                            readOnly={readOnly}
                        >
                            {strings.attachRelevantFilesUploadLabel}
                        </GoMultiFileInput>
                    </InputSection>
                    <InputSection
                        title={strings.sourceInformationTitle}
                        description={strings.sourceInformationDescription}
                    >
                        <NonFieldError
                            error={getErrorObject(error?.trigger_model_source_of_information)}
                        />
                        {value?.trigger_model_source_of_information?.map((source, index) => (
                            <EAPSourceInformationInput
                                key={source.client_id}
                                index={index}
                                value={source}
                                onChange={onSourceInformationChange}
                                onRemove={onSourceInformationRemove}
                                error={getErrorObject(error?.trigger_model_source_of_information)}
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
                            {strings.addNewTriggerButtonLabel}
                        </Button>
                    </InputSection>
                </ListView>
            </Container>
        </TabPage>
    );
}

export default TriggerModel;
