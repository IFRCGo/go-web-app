import { useCallback } from 'react';
import {
    AddLineIcon,
    CheckboxMultipleBlankFillIcon,
} from '@ifrc-go/icons';
import {
    Button,
    Heading,
    InfoPopup,
    InlineLayout,
    InputSection,
    ListView,
    Modal,
    NumberInput,
    TextArea,
    TextOutput,
} from '@ifrc-go/ui';
import {
    useBooleanState,
    useTranslation,
} from '@ifrc-go/ui/hooks';
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
import Link from '#components/Link';
import NonFieldError from '#components/NonFieldError';
import TabPage from '#components/TabPage';
import {
    type GoApiResponse,
    useRequest,
} from '#utils/restRequest';

import EAPSourceInformationInput, { type SourceInformationFormFields } from '../EAPSourceInformationInput';
import { type PartialEapFullFormType } from '../schema';

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

    const [
        showQualityCriteria,
        {
            setTrue: setShowQualityCriteriaTrue,
            setFalse: setShowQualityCriteriaFalse,
        },
    ] = useBooleanState(false);

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
        <TabPage spacingOffset={-6}>
            <InlineLayout
                after={(
                    <Button
                        name={undefined}
                        onClick={setShowQualityCriteriaTrue}
                        after={(<CheckboxMultipleBlankFillIcon />)}
                    >
                        {strings.triggerSectionCriteriaButtonLabel}
                    </Button>
                )}
            />
            <Heading variant="form">
                <ListView spacing="sm">
                    {strings.triggerModelHeading}
                    <InfoPopup description={strings.triggerModelTooltipDescription} />
                </ListView>
            </Heading>
            <InputSection
                title={strings.triggerStatementTitle}
                tooltip={(
                    <TextOutput
                        label={strings.triggerExplanatoryNoteLabel}
                        strongLabel
                        value={strings.triggerStatementExplanatoryNote}
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
                />
            </InputSection>
            <InputSection title={strings.triggerLeadTimeTitle} withAsteriskOnTitle>
                <NumberInput
                    name="lead_time"
                    value={value?.lead_time}
                    error={error?.lead_time}
                    onChange={setFieldValue}
                    disabled={disabled}
                    readOnly={readOnly}
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
                tooltip={(
                    <ListView layout="block">
                        <TextOutput
                            label={strings.triggerExplanatoryNoteLabel}
                            strongLabel
                            value={strings.forecastExplanatoryNote}
                        />
                        <TextOutput
                            label={strings.triggerRequiredPointsLabel}
                            strongLabel
                            value={(
                                <ul>
                                    <li>{strings.forecastRequiredPoint1}</li>
                                    <li>{strings.forecastRequiredPoint2}</li>
                                </ul>
                            )}
                        />
                    </ListView>
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
            >
                <GoSingleFileInput
                    accept=".docx"
                    name="forecast_table_file"
                    value={value.forecast_table_file}
                    url="/api/v2/eap-file/"
                    error={error?.forecast_table_file}
                    disabled={disabled}
                    label={strings.attachRelevantFilesUploadLabel}
                    fileIdToUrlMap={fileIdToUrlMap}
                    setFileIdToUrlMap={setFileIdToUrlMap}
                    onChange={setFieldValue}
                    readOnly={readOnly}
                >
                    {strings.triggerUploadTableLabel}
                </GoSingleFileInput>
            </InputSection>
            <InputSection
                title={strings.definitionJustificationTitle}
                tooltip={(
                    <ListView layout="block">
                        <TextOutput
                            label={strings.triggerExplanatoryNoteLabel}
                            strongLabel
                            value={strings.definitionJustificationExplanatoryNote}
                        />
                        <TextOutput
                            label={strings.triggerRequiredPointsLabel}
                            strongLabel
                            value={(
                                <ul>
                                    <li>{strings.definitionJustificationRequiredPoint1}</li>
                                    <li>{strings.definitionJustificationRequiredPoint2}</li>
                                    <li>{strings.definitionJustificationRequiredPoint3}</li>
                                    <li>{strings.definitionJustificationRequiredPoint4}</li>
                                </ul>
                            )}
                        />
                    </ListView>
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
                tooltip={(
                    <ListView layout="block">
                        <TextOutput
                            label={strings.triggerExplanatoryNoteLabel}
                            strongLabel
                            value={strings.identificationInterventionExplanatoryNote}
                        />
                        <TextOutput
                            label={strings.triggerRequiredPointsLabel}
                            strongLabel
                            value={(
                                <ul>
                                    <li>{strings.identificationInterventionRequiredPoint1}</li>
                                    <li>{strings.identificationInterventionRequiredPoint2}</li>
                                    <li>{strings.identificationInterventionRequiredPoint3}</li>
                                </ul>
                            )}
                        />
                    </ListView>
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
            >
                {isDefined(eapRegistrationDetail?.country) && (
                    <Admin2Input
                        name="admin2"
                        onChange={setFieldValue}
                        value={value?.admin2}
                        countryId={eapRegistrationDetail.country}
                        error={getErrorString(error?.admin2)}
                    />
                )}
            </InputSection>
            <InputSection
                title={strings.attachRelevantFilesTitle}
                description={strings.attachRelevantFilesDescription}
            >
                <GoMultiFileInput
                    name="trigger_model_relevant_files"
                    accept=".pdf, .docx, .pptx"
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
            {showQualityCriteria && (
                <Modal
                    onClose={setShowQualityCriteriaFalse}
                    heading={strings.triggerStatementSectionHeading}
                >
                    <ListView layout="block">
                        <TextOutput
                            label={strings.triggerSectionCriteriaIntroduction1}
                            value={strings.triggerSectionCriteriaComment1}
                            strongLabel
                            valueType="text"
                            withoutLabelColon
                        />
                        <TextOutput
                            label={strings.triggerSectionCriteriaIntroduction2}
                            value={strings.triggerSectionCriteriaComment2}
                            strongLabel
                            valueType="text"
                            withoutLabelColon
                        />
                        <TextOutput
                            label={strings.triggerSectionCriteriaIntroduction3}
                            value={strings.triggerSectionCriteriaComment3}
                            strongLabel
                            valueType="text"
                            withoutLabelColon
                        />
                        <TextOutput
                            label={strings.triggerSectionCriteriaIntroduction4}
                            value={strings.triggerSectionCriteriaComment4}
                            strongLabel
                            valueType="text"
                            withoutLabelColon
                        />
                        <TextOutput
                            label={strings.triggerSectionCriteriaIntroduction5}
                            value={strings.triggerSectionCriteriaComment5}
                            strongLabel
                            valueType="text"
                            withoutLabelColon
                        />
                        <TextOutput
                            label={(
                                <>
                                    {strings.triggerSectionCriteriaIntroduction6}
                                    <ol>
                                        <li>{strings.triggerSectionCriteriaIntroduction61}</li>
                                        <li>{strings.triggerSectionCriteriaIntroduction62}</li>
                                        <li>{strings.triggerSectionCriteriaIntroduction63}</li>
                                    </ol>
                                </>
                            )}
                            value={strings.triggerSectionCriteriaComment6}
                            strongLabel
                            valueType="text"
                            withoutLabelColon
                        />
                    </ListView>
                </Modal>
            )}
        </TabPage>
    );
}

export default TriggerModel;
