import { useMemo } from 'react';
import {
    Error,
    EntriesAsList,
    getErrorObject,
} from '@togglecorp/toggle-form';

import Container from '#components/Container';
import InputSection from '#components/InputSection';
import NumberInput from '#components/NumberInput';
import TextArea from '#components/TextArea';
// FIXME: move this
import RichTextArea from '#components/parked/RichTextArea';
import DateInput from '#components/DateInput';
import SelectInput from '#components/SelectInput';
import useTranslation from '#hooks/useTranslation';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';

import {
    type PartialFormValue,
    type ReportType,
} from '../common';
import i18n from './i18n.json';
import styles from './styles.module.css';

interface Props {
    error: Error<PartialFormValue> | undefined;
    onValueChange: (...entries: EntriesAsList<PartialFormValue>) => void;
    value: PartialFormValue;
    disabled?: boolean;
    reportType: ReportType;
}

function SituationFields(props: Props) {
    const {
        error: formError,
        onValueChange,
        value,
        reportType,
        disabled,
    } = props;

    const strings = useTranslation(i18n);

    const {
        api_episource_choices,
    } = useGlobalEnums();

    const error = useMemo(
        () => getErrorObject(formError),
        [formError],
    );

    // FIXME: use translations
    const sectionHeading = 'Numeric Details (People)';

    if (reportType === 'COVID') {
        return (
            <Container
                className={styles.covidSituationFields}
                heading={sectionHeading}
                headingDescription={(
                    strings.fieldsStep2HeaderDescription
                )}
            >
                <div className={styles.inputSectionGroup}>
                    <InputSection
                        title={strings.fieldsStep2SituationFieldsEPICasesLabel}
                        description={strings.fieldsStep2SituationFieldsEPICasesDescription}
                    >
                        <NumberInput
                            label={strings.fieldsStep2SituationFieldsEstimation}
                            name="epi_cases"
                            value={value.epi_cases}
                            onChange={onValueChange}
                            error={error?.epi_cases}
                            disabled={disabled}
                        />
                    </InputSection>
                    <InputSection
                        title={strings.fieldsStep2SituationFieldsEPIDeadLabel}
                        description={strings.fieldsStep2SituationFieldsEPIDeadDescription}
                    >
                        <NumberInput
                            label={strings.fieldsStep2SituationFieldsEstimation}
                            name="epi_num_dead"
                            value={value.epi_num_dead}
                            onChange={onValueChange}
                            error={error?.epi_num_dead}
                            disabled={disabled}
                        />
                    </InputSection>
                </div>
                <div className={styles.inputSectionGroup}>
                    <InputSection
                        title={strings.fieldReportCasesSince}
                        description={strings.fieldsStep2SituationFieldsEPICasesSinceDesciption}
                    >
                        <NumberInput
                            label={strings.fieldsStep2SituationFieldsEstimation}
                            name="epi_cases_since_last_fr"
                            value={value.epi_cases_since_last_fr}
                            onChange={onValueChange}
                            error={error?.epi_cases_since_last_fr}
                            disabled={disabled}
                        />
                    </InputSection>
                    <InputSection
                        title={strings.fieldReportDeathsSince}
                        description={strings.fieldsStep2SituationFieldsEPIDeathsSinceDescription}
                    >
                        <NumberInput
                            label={strings.fieldsStep2SituationFieldsEstimation}
                            name="epi_deaths_since_last_fr"
                            value={value.epi_deaths_since_last_fr}
                            onChange={onValueChange}
                            error={error?.epi_deaths_since_last_fr}
                            disabled={disabled}
                        />
                    </InputSection>
                </div>
                <div className={styles.nonGroupedInputsSection}>
                    <InputSection
                        title={strings.fieldsStep2SourceOfFiguresLabel}
                    >
                        <SelectInput
                            name="epi_figures_source"
                            value={value.epi_figures_source}
                            onChange={onValueChange}
                            error={error?.epi_figures_source}
                            disabled={disabled}
                            options={api_episource_choices}
                            // FIXME: do not use inline functions
                            keySelector={(d) => d.key}
                            labelSelector={(d) => d.value}
                        />
                    </InputSection>
                    <InputSection
                        title={strings.fieldsStep2NotesLabel}
                        description={strings.fieldsStep2EPINotes}
                    >
                        <TextArea
                            name="epi_notes_since_last_fr"
                            value={value.epi_notes_since_last_fr}
                            onChange={onValueChange}
                            error={error?.epi_notes_since_last_fr}
                            disabled={disabled}
                        />
                    </InputSection>
                    <InputSection
                        title={strings.fieldsStep2SituationFieldsDateEPILabel}
                        description={strings.fieldsStep2SituationFieldsDateEPIDescription}
                    >
                        <DateInput
                            name="sit_fields_date"
                            value={value.sit_fields_date}
                            onChange={onValueChange}
                            error={error?.sit_fields_date}
                            disabled={disabled}
                        />
                    </InputSection>
                    <InputSection
                        title={strings.fieldReportFormSourceDetailsLabel}
                        description={strings.fieldReportFormSourceDetailsDescription}
                    >
                        <TextArea
                            name="other_sources"
                            value={value.other_sources}
                            onChange={onValueChange}
                            error={error?.other_sources}
                            disabled={disabled}
                            placeholder={strings.fieldReportFormSourceDetailsEPIPlaceholder}
                        />
                    </InputSection>
                    <InputSection
                        title={strings.fieldsStep2DescriptionEPILabel}
                        description={strings.fieldsStep2DescriptionEPICOVDescription}
                    >
                        <TextArea
                            name="description"
                            value={value.description}
                            onChange={onValueChange}
                            error={error?.description}
                            disabled={disabled}
                            placeholder={strings.fieldsStep2DescriptionCOVIDPlaceholder}
                        />
                    </InputSection>
                </div>
            </Container>
        );
    }

    if (reportType === 'EPI') {
        return (
            <Container
                className={styles.situationFields}
                heading={sectionHeading}
            >
                <InputSection
                    title={strings.fieldsStep2SituationFieldsEPICasesLabel}
                    description={strings.fieldsStep2SituationFieldsEPICasesDescription}
                >
                    <NumberInput
                        label={strings.fieldsStep2SituationFieldsEstimation}
                        name="epi_cases"
                        value={value.epi_cases}
                        onChange={onValueChange}
                        error={error?.epi_cases}
                        disabled={disabled}
                    />
                </InputSection>
                <InputSection
                    title={strings.fieldsStep2SituationFieldsEPISuspectedCasesLabel}
                    description={strings.fieldsStep2SituationFieldsEPISuspectedCasesDescription}
                >
                    <NumberInput
                        label={strings.fieldsStep2SituationFieldsEstimation}
                        name="epi_suspected_cases"
                        value={value.epi_suspected_cases}
                        onChange={onValueChange}
                        error={error?.epi_suspected_cases}
                        disabled={disabled}
                    />
                </InputSection>
                <InputSection
                    title={strings.fieldsStep2SituationFieldsEPIProbableCasesLabel}
                    description={strings.fieldsStep2SituationFieldsEPIProbableCasesDescription}
                >
                    <NumberInput
                        label={strings.fieldsStep2SituationFieldsEstimation}
                        name="epi_probable_cases"
                        value={value.epi_probable_cases}
                        onChange={onValueChange}
                        error={error?.epi_probable_cases}
                        disabled={disabled}
                    />
                </InputSection>
                <InputSection
                    title={strings.fieldsStep2SituationFieldsEPIConfirmedCasesLabel}
                    description={strings.fieldsStep2SituationFieldsEPIConfirmedCasesDescription}
                >
                    <NumberInput
                        label={strings.fieldsStep2SituationFieldsEstimation}
                        name="epi_confirmed_cases"
                        value={value.epi_confirmed_cases}
                        onChange={onValueChange}
                        error={error?.epi_confirmed_cases}
                        disabled={disabled}
                    />
                </InputSection>
                <InputSection
                    title={strings.fieldsStep2SituationFieldsEPIDeadLabel}
                    description={strings.fieldsStep2SituationFieldsEPIDeadDescription}
                >
                    <NumberInput
                        label={strings.fieldsStep2SituationFieldsEstimation}
                        name="epi_num_dead"
                        value={value.epi_num_dead}
                        onChange={onValueChange}
                        error={error?.epi_num_dead}
                        disabled={disabled}
                    />
                </InputSection>
                <InputSection
                    title={strings.fieldsStep2SourceOfFiguresLabel}
                >
                    <SelectInput
                        name="epi_figures_source"
                        value={value.epi_figures_source}
                        onChange={onValueChange}
                        error={error?.epi_figures_source}
                        disabled={disabled}
                        options={api_episource_choices}
                        // FIXME: do not use inline functions
                        keySelector={(d) => d.key}
                        labelSelector={(d) => d.value}
                    />
                </InputSection>
                <InputSection
                    title={strings.fieldsStep2NotesLabel}
                    description={strings.fieldsStep2EPINotes}
                >
                    <TextArea
                        name="epi_notes_since_last_fr"
                        value={value.epi_notes_since_last_fr}
                        onChange={onValueChange}
                        error={error?.epi_notes_since_last_fr}
                        disabled={disabled}
                    />
                </InputSection>
                <InputSection
                    title={strings.fieldsStep2SituationFieldsDateEPILabel}
                    description={strings.fieldsStep2SituationFieldsDateEPIDescription}
                >
                    <DateInput
                        name="sit_fields_date"
                        value={value.sit_fields_date}
                        onChange={onValueChange}
                        error={error?.sit_fields_date}
                        disabled={disabled}
                    />
                </InputSection>
                <InputSection
                    title={strings.fieldReportFormSourceDetailsLabel}
                    description={strings.fieldReportFormSourceDetailsDescription}
                >
                    <TextArea
                        name="other_sources"
                        value={value.other_sources}
                        onChange={onValueChange}
                        error={error?.other_sources}
                        disabled={disabled}
                        placeholder={strings.fieldReportFormSourceDetailsEPIPlaceholder}
                    />
                </InputSection>
                <InputSection
                    title={strings.fieldsStep2DescriptionEPILabel}
                    description={strings.fieldsStep2DescriptionEPIDescription}
                >
                    <TextArea
                        name="description"
                        value={value.description}
                        onChange={onValueChange}
                        error={error?.description}
                        disabled={disabled}
                        placeholder={strings.fieldsStep2DescriptionEPIPlaceholder}
                    />
                </InputSection>
            </Container>
        );
    }

    return (
        <Container
            className={styles.situationFields}
            heading={sectionHeading}
        >
            <InputSection
                title={strings.fieldsStep2SituationFieldsEVTInjuredLabel}
                description={strings.fieldsStep2SituationFieldsEVTInjuredDescription}
            >
                <NumberInput
                    label={strings.fieldsStep2SituationFieldsRCRCEstimation}
                    name="num_injured"
                    value={value.num_injured}
                    onChange={onValueChange}
                    error={error?.num_injured}
                    disabled={disabled}
                />
                <NumberInput
                    label={strings.fieldsStep2SituationFieldsGovEstimation}
                    name="gov_num_injured"
                    value={value.gov_num_injured}
                    onChange={onValueChange}
                    error={error?.gov_num_injured}
                    disabled={disabled}
                />
                <NumberInput
                    label={strings.fieldsStep2SituationFieldsOtherEstimation}
                    name="other_num_injured"
                    value={value.other_num_injured}
                    onChange={onValueChange}
                    error={error?.other_num_injured}
                    disabled={disabled}
                />
            </InputSection>
            <InputSection
                title={strings.fieldsStep2SituationFieldsEVTDeadLabel}
                description={strings.fieldsStep2SituationFieldsEVTDeadDescription}
            >
                <NumberInput
                    label={strings.fieldsStep2SituationFieldsRCRCEstimation}
                    name="num_dead"
                    value={value.num_dead}
                    onChange={onValueChange}
                    error={error?.num_dead}
                    disabled={disabled}
                />
                <NumberInput
                    label={strings.fieldsStep2SituationFieldsGovEstimation}
                    name="gov_num_dead"
                    value={value.gov_num_dead}
                    onChange={onValueChange}
                    error={error?.gov_num_dead}
                    disabled={disabled}
                />
                <NumberInput
                    label={strings.fieldsStep2SituationFieldsOtherEstimation}
                    name="other_num_dead"
                    value={value.other_num_dead}
                    onChange={onValueChange}
                    error={error?.other_num_dead}
                    disabled={disabled}
                />
            </InputSection>
            <InputSection
                title={strings.fieldsStep2SituationFieldsEVTMissingLabel}
                description={strings.fieldsStep2SituationFieldsEVTMissingDescription}
            >
                <NumberInput
                    label={strings.fieldsStep2SituationFieldsRCRCEstimation}
                    name="num_missing"
                    value={value.num_missing}
                    onChange={onValueChange}
                    error={error?.num_missing}
                    disabled={disabled}
                />
                <NumberInput
                    label={strings.fieldsStep2SituationFieldsGovEstimation}
                    name="gov_num_missing"
                    value={value.gov_num_missing}
                    onChange={onValueChange}
                    error={error?.gov_num_missing}
                    disabled={disabled}
                />
                <NumberInput
                    label={strings.fieldsStep2SituationFieldsOtherEstimation}
                    name="other_num_missing"
                    value={value.other_num_missing}
                    onChange={onValueChange}
                    error={error?.other_num_missing}
                    disabled={disabled}
                />
            </InputSection>
            <InputSection
                title={strings.fieldsStep2SituationFieldsEVTAffectedLabel}
                description={strings.fieldsStep2SituationFieldsEVTAffectedDescription}
            >
                <NumberInput
                    label={strings.fieldsStep2SituationFieldsRCRCEstimation}
                    name="num_affected"
                    value={value.num_affected}
                    onChange={onValueChange}
                    error={error?.num_affected}
                    disabled={disabled}
                />
                <NumberInput
                    label={strings.fieldsStep2SituationFieldsGovEstimation}
                    name="gov_num_affected"
                    value={value.gov_num_affected}
                    onChange={onValueChange}
                    error={error?.gov_num_affected}
                    disabled={disabled}
                />
                <NumberInput
                    label={strings.fieldsStep2SituationFieldsOtherEstimation}
                    name="other_num_affected"
                    value={value.other_num_affected}
                    onChange={onValueChange}
                    error={error?.other_num_affected}
                    disabled={disabled}
                />
            </InputSection>
            <InputSection
                title={strings.fieldsStep2SituationFieldsEVTDisplacedLabel}
                description={strings.fieldsStep2SituationFieldsEVTDisplacedDescription}
            >
                <NumberInput
                    label={strings.fieldsStep2SituationFieldsRCRCEstimation}
                    name="num_displaced"
                    value={value.num_displaced}
                    onChange={onValueChange}
                    error={error?.num_displaced}
                    disabled={disabled}
                />
                <NumberInput
                    label={strings.fieldsStep2SituationFieldsGovEstimation}
                    name="gov_num_displaced"
                    value={value.gov_num_displaced}
                    onChange={onValueChange}
                    error={error?.gov_num_displaced}
                    disabled={disabled}
                />
                <NumberInput
                    label={strings.fieldsStep2SituationFieldsOtherEstimation}
                    name="other_num_displaced"
                    value={value.other_num_displaced}
                    onChange={onValueChange}
                    error={error?.other_num_displaced}
                    disabled={disabled}
                />
            </InputSection>
            <InputSection
                title={strings.fieldReportFormSourceDetailsLabel}
                description={strings.fieldReportFormSourceDetailsDescription}
            >
                <TextArea
                    name="other_sources"
                    value={value.other_sources}
                    onChange={onValueChange}
                    error={error?.other_sources}
                    disabled={disabled}
                    placeholder={strings.fieldReportFormSourceDetailsPlaceholder}
                />
            </InputSection>
            <InputSection
                title={strings.fieldsStep2DescriptionEVTLabel}
                description={strings.fieldsStep2DescriptionEVTDescription}
            >
                <RichTextArea
                    name="description"
                    value={value.description}
                    onChange={onValueChange}
                    error={error?.description}
                    disabled={disabled}
                    placeholder={strings.fieldsStep2DescriptionEVTPlaceholder}
                />
            </InputSection>
        </Container>
    );
}

export default SituationFields;
