import { useCallback } from 'react';
import {
    Button,
    Container,
    InputSection,
    ListView,
    NumberInput,
    TextArea,
    TextOutput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
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
import NonFieldError from '#components/NonFieldError';
import TabPage from '#components/TabPage';
import { type GoApiResponse } from '#utils/restRequest';

import { type PartialEapFullFormType } from '../schema';
import SourceInformationInput from './SourceInformationInput';
import SourcesForecastInput from './SourcesForecastInput';

import i18n from './i18n.json';

type SourcesForecastFormFields = NonNullable<
    PartialEapFullFormType['trigger_statement_source_of_information']
>[number];
type SourceInformationFormFields = NonNullable<
    PartialEapFullFormType['trigger_model_source_of_information']
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
    eapRegistrationDetail?: GoApiResponse<'/api/v2/eap-registration/{id}/'>;
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
    } = props;

    const error = getErrorObject(formError);
    const strings = useTranslation(i18n);

    const {
        setValue: onSourcesForecastChange,
        removeValue: onSourcesForecastRemove,
    } = useFormArray<
        'trigger_statement_source_of_information',
        SourcesForecastFormFields
    >('trigger_statement_source_of_information', setFieldValue);

    const handleSourcesForecastAdd = useCallback(() => {
        const newSourceInformationItem: SourcesForecastFormFields = {
            client_id: randomString(),
        };

        setFieldValue(
            (oldValue: SourcesForecastFormFields[] | undefined) => [
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
        <TabPage>
            <Container>
                <ListView layout="block" spacing="sm">
                    <InputSection
                        title={strings.eapFullFormTriggerStatementTitle}
                        description={strings.eapFullFormTriggerStatementDescription}
                        withAsteriskOnTitle
                    >
                        <TextArea
                            label={strings.eapFullFormTriggerModelDescriptionLabel}
                            name="trigger_statement"
                            value={value?.trigger_statement}
                            error={error?.trigger_statement}
                            onChange={setFieldValue}
                            disabled={disabled}
                        />
                    </InputSection>
                    <InputSection title="Lead Time" withAsteriskOnTitle>
                        <NumberInput
                            name="lead_time"
                            value={value?.lead_time}
                            error={error?.lead_time}
                            onChange={setFieldValue}
                            disabled={disabled}
                        />
                    </InputSection>
                    <InputSection
                        title={strings.eapFullFormSourcesForecastTitle}
                        description={strings.eapFullFormSourcesForecastDescription}
                    >
                        <NonFieldError
                            error={getErrorObject(
                                error?.trigger_statement_source_of_information,
                            )}
                        />
                        {value?.trigger_statement_source_of_information?.map(
                            (source, index) => (
                                <SourcesForecastInput
                                    key={source.client_id}
                                    index={index}
                                    value={source}
                                    onChange={onSourcesForecastChange}
                                    onRemove={onSourcesForecastRemove}
                                    error={getErrorObject(
                                        error?.risk_analysis_source_of_information,
                                    )}
                                    disabled={disabled}
                                />
                            ),
                        )}
                        <Button
                            name={undefined}
                            onClick={handleSourcesForecastAdd}
                            disabled={disabled}
                        >
                            {strings.eapFullFormAddNewSourcesForecastLabel}
                        </Button>
                    </InputSection>
                    <InputSection
                        title={strings.eapFullFormForecastSelectionTitle}
                        description={strings.eapFullFormForecastSelectionDescription}
                        withAsteriskOnTitle
                    >
                        <TextArea
                            label={strings.eapFullFormTriggerModelDescriptionLabel}
                            name="forecast_selection"
                            value={value?.forecast_selection}
                            error={error?.forecast_selection}
                            onChange={setFieldValue}
                            disabled={disabled}
                        />
                        <MultiImageWithCaptionInput
                            name="forecast_selection_images"
                            url="/api/v2/eap-file/multiple/"
                            value={value?.forecast_selection_images}
                            onChange={setFieldValue}
                            error={getErrorObject(error?.forecast_selection_images)}
                            fileIdToUrlMap={fileIdToUrlMap}
                            setFileIdToUrlMap={setFileIdToUrlMap}
                            label={strings.eapFullFormTriggerSelectImagesLabel}
                            disabled={disabled}
                        />
                        <TextOutput
                            withLightText
                            value={strings.eapFullFormForecastTableLabel}
                        />
                        <GoSingleFileInput
                            accept=".pdf"
                            name="forecast_table_file"
                            value={value.forecast_table_file}
                            url="/api/v2/eap-file/"
                            error={error?.forecast_table_file}
                            disabled={disabled}
                            label={strings.eapFullFormAttachRelevantFilesUploadLabel}
                            fileIdToUrlMap={fileIdToUrlMap}
                            setFileIdToUrlMap={setFileIdToUrlMap}
                            onChange={setFieldValue}
                        >
                            {strings.eapFullFormTriggerUploadTableLabel}
                        </GoSingleFileInput>
                    </InputSection>
                    <InputSection
                        title={strings.eapFullFormDefinitionJustificationTitle}
                        description={(
                            <ul>
                                <li>
                                    {strings.eapFullFormDefinitionJustificationDescription1}
                                </li>
                                <li>
                                    {strings.eapFullFormDefinitionJustificationDescription2}
                                </li>
                                <li>
                                    {strings.eapFullFormDefinitionJustificationDescription3}
                                </li>
                                <li>
                                    {strings.eapFullFormDefinitionJustificationDescription4}
                                </li>
                                <li>
                                    {strings.eapFullFormDefinitionJustificationDescription5}
                                </li>
                            </ul>
                        )}
                        withAsteriskOnTitle
                    >
                        <TextArea
                            label={strings.eapFullFormTriggerModelDescriptionLabel}
                            name="definition_and_justification_impact_level"
                            value={value?.definition_and_justification_impact_level}
                            error={error?.definition_and_justification_impact_level}
                            onChange={setFieldValue}
                            disabled={disabled}
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
                            label={strings.eapFullFormTriggerSelectImagesLabel}
                            disabled={disabled}
                        />
                    </InputSection>
                    <InputSection
                        title={strings.eapFullFormIdentificationInterventionTitle}
                        description={(
                            <ul>
                                <li>
                                    {strings.eapFullFormIdentificationInterventionDescription1}
                                </li>
                                <li>
                                    {strings.eapFullFormIdentificationInterventionDescription2}
                                </li>
                                <li>
                                    {strings.eapFullFormIdentificationInterventionDescription3}
                                </li>
                            </ul>
                        )}
                        withAsteriskOnTitle
                    >
                        <TextArea
                            label={strings.eapFullFormTriggerModelDescriptionLabel}
                            name="identification_of_the_intervention_area"
                            value={value?.identification_of_the_intervention_area}
                            error={error?.identification_of_the_intervention_area}
                            onChange={setFieldValue}
                            disabled={disabled}
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
                            label={strings.eapFullFormTriggerSelectImagesLabel}
                            disabled={disabled}
                        />
                    </InputSection>
                    <InputSection
                        title={strings.eapFullFormSelectRegionTitle}
                        description={strings.eapFullFormSelectRegionDescription}
                        withAsteriskOnTitle
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
                        title={strings.eapFullFormAttachRelevantFilesTitle}
                        description={strings.eapFullFormAttachRelevantFilesDescription}
                        withAsteriskOnTitle
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
                        >
                            {strings.eapFullFormAttachRelevantFilesUploadLabel}
                        </GoMultiFileInput>
                    </InputSection>
                    <InputSection
                        title={strings.eapFullFormSourceInformationTitle}
                        description={strings.eapFullFormSourceInformationDescription}
                    >
                        <NonFieldError
                            error={getErrorObject(error?.trigger_model_source_of_information)}
                        />
                        {value?.trigger_model_source_of_information?.map(
                            (source, index) => (
                                <SourceInformationInput
                                    key={source.client_id}
                                    index={index}
                                    value={source}
                                    onChange={onSourceInformationChange}
                                    onRemove={onSourceInformationRemove}
                                    error={getErrorObject(
                                        error?.trigger_model_source_of_information,
                                    )}
                                    disabled={disabled}
                                />
                            ),
                        )}
                        <Button
                            name={undefined}
                            onClick={handleSourceInformationAdd}
                            disabled={disabled}
                        >
                            {strings.eapFullFormAddNewSourceInformationLabel}
                        </Button>
                    </InputSection>
                </ListView>
            </Container>
        </TabPage>
    );
}

export default TriggerModel;
