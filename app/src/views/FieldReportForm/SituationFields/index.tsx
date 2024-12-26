import { useMemo } from 'react';
import {
    Container,
    DateInput,
    InputSection,
    NumberInput,
    SelectInput,
    TextArea,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    type EntriesAsList,
    type Error,
    getErrorObject,
} from '@togglecorp/toggle-form';

import RichTextArea from '#components/RichTextArea';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import { type ReportType } from '#utils/constants';

import { type PartialFormValue } from '../common';

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

    const sectionHeading = strings.fieldReportFormNumericDetails;

    if (reportType === 'COVID') {
        return (
            <Container
                className={styles.situationFields}
                heading={sectionHeading}
                headingDescription={(
                    strings.fieldsStep2HeaderDescription
                )}
                childrenContainerClassName={styles.content}
            >
                <div className={styles.numericDetails}>
                    <NumberInput
                        label={strings.fieldsStep2SituationFieldsEPICasesLabel}
                        hint={strings.fieldsStep2SituationFieldsEPICasesDescription}
                        placeholder={strings.fieldsStep2SituationFieldsEstimation}
                        name="epi_cases"
                        value={value.epi_cases}
                        onChange={onValueChange}
                        error={error?.epi_cases}
                        disabled={disabled}
                    />
                    <NumberInput
                        label={strings.fieldsStep2SituationFieldsEPIDeadLabel}
                        hint={strings.fieldsStep2SituationFieldsEPIDeadDescription}
                        placeholder={strings.fieldsStep2SituationFieldsEstimation}
                        name="epi_num_dead"
                        value={value.epi_num_dead}
                        onChange={onValueChange}
                        error={error?.epi_num_dead}
                        disabled={disabled}
                    />
                    <NumberInput
                        label={strings.fieldReportCasesSince}
                        hint={strings.fieldsStep2SituationFieldsEPICasesSinceDescription}
                        placeholder={strings.fieldsStep2SituationFieldsEstimation}
                        name="epi_cases_since_last_fr"
                        value={value.epi_cases_since_last_fr}
                        onChange={onValueChange}
                        error={error?.epi_cases_since_last_fr}
                        disabled={disabled}
                    />
                    <NumberInput
                        label={strings.fieldReportDeathsSince}
                        hint={strings.fieldsStep2SituationFieldsEPIDeathsSinceDescription}
                        placeholder={strings.fieldsStep2SituationFieldsEstimation}
                        name="epi_deaths_since_last_fr"
                        value={value.epi_deaths_since_last_fr}
                        onChange={onValueChange}
                        error={error?.epi_deaths_since_last_fr}
                        disabled={disabled}
                    />
                </div>
                <div className={styles.otherDetails}>
                    <InputSection
                        title={strings.fieldsStep2SourceOfFiguresLabel}
                        numPreferredColumns={2}
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
                        numPreferredColumns={2}
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
                childrenContainerClassName={styles.content}
            >
                <InputSection
                    title={sectionHeading}
                    numPreferredColumns={2}
                >
                    <NumberInput
                        label={strings.fieldsStep2SituationFieldsEPICasesLabel}
                        hint={strings.fieldsStep2SituationFieldsEPICasesDescription}
                        placeholder={strings.fieldsStep2SituationFieldsEstimation}
                        name="epi_cases"
                        value={value.epi_cases}
                        onChange={onValueChange}
                        error={error?.epi_cases}
                        disabled={disabled}
                    />
                    <NumberInput
                        label={strings.fieldsStep2SituationFieldsEPISuspectedCasesLabel}
                        hint={strings.fieldsStep2SituationFieldsEPISuspectedCasesDescription}
                        placeholder={strings.fieldsStep2SituationFieldsEstimation}
                        name="epi_suspected_cases"
                        value={value.epi_suspected_cases}
                        onChange={onValueChange}
                        error={error?.epi_suspected_cases}
                        disabled={disabled}
                    />
                    <NumberInput
                        label={strings.fieldsStep2SituationFieldsEPIProbableCasesLabel}
                        hint={strings.fieldsStep2SituationFieldsEPIProbableCasesDescription}
                        placeholder={strings.fieldsStep2SituationFieldsEstimation}
                        name="epi_probable_cases"
                        value={value.epi_probable_cases}
                        onChange={onValueChange}
                        error={error?.epi_probable_cases}
                        disabled={disabled}
                    />
                    <NumberInput
                        label={strings.fieldsStep2SituationFieldsEPIConfirmedCasesLabel}
                        hint={strings.fieldsStep2SituationFieldsEPIConfirmedCasesDescription}
                        placeholder={strings.fieldsStep2SituationFieldsEstimation}
                        name="epi_confirmed_cases"
                        value={value.epi_confirmed_cases}
                        onChange={onValueChange}
                        error={error?.epi_confirmed_cases}
                        disabled={disabled}
                    />
                    <NumberInput
                        label={strings.fieldsStep2SituationFieldsEPIDeadLabel}
                        hint={strings.fieldsStep2SituationFieldsEPIDeadDescription}
                        placeholder={strings.fieldsStep2SituationFieldsEstimation}
                        name="epi_num_dead"
                        value={value.epi_num_dead}
                        onChange={onValueChange}
                        error={error?.epi_num_dead}
                        disabled={disabled}
                    />
                </InputSection>
                <div className={styles.otherDetails}>
                    <InputSection
                        title={strings.fieldsStep2SourceOfFiguresLabel}
                        numPreferredColumns={2}
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
                        numPreferredColumns={2}
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
                </div>
            </Container>
        );
    }

    return (
        <Container
            className={styles.situationFields}
            heading={sectionHeading}
            childrenContainerClassName={styles.content}
        >
            <InputSection
                title={strings.fieldsStep2SituationFieldsEVTInjuredLabel}
                description={strings.fieldsStep2SituationFieldsEVTInjuredDescription}
                numPreferredColumns={3}
            >
                <NumberInput
                    label={strings.fieldsStep2SituationFieldsRCRC}
                    placeholder={strings.fieldsStep2SituationFieldsEstimation}
                    name="num_injured"
                    value={value.num_injured}
                    onChange={onValueChange}
                    error={error?.num_injured}
                    disabled={disabled}
                />
                <NumberInput
                    label={strings.fieldsStep2SituationFieldsGov}
                    placeholder={strings.fieldsStep2SituationFieldsEstimation}
                    name="gov_num_injured"
                    value={value.gov_num_injured}
                    onChange={onValueChange}
                    error={error?.gov_num_injured}
                    disabled={disabled}
                />
                <NumberInput
                    label={strings.fieldsStep2SituationFieldsOther}
                    placeholder={strings.fieldsStep2SituationFieldsEstimation}
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
                numPreferredColumns={3}
            >
                <NumberInput
                    label={strings.fieldsStep2SituationFieldsRCRC}
                    placeholder={strings.fieldsStep2SituationFieldsEstimation}
                    name="num_dead"
                    value={value.num_dead}
                    onChange={onValueChange}
                    error={error?.num_dead}
                    disabled={disabled}
                />
                <NumberInput
                    label={strings.fieldsStep2SituationFieldsGov}
                    placeholder={strings.fieldsStep2SituationFieldsEstimation}
                    name="gov_num_dead"
                    value={value.gov_num_dead}
                    onChange={onValueChange}
                    error={error?.gov_num_dead}
                    disabled={disabled}
                />
                <NumberInput
                    label={strings.fieldsStep2SituationFieldsOther}
                    placeholder={strings.fieldsStep2SituationFieldsEstimation}
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
                numPreferredColumns={3}
            >
                <NumberInput
                    label={strings.fieldsStep2SituationFieldsRCRC}
                    placeholder={strings.fieldsStep2SituationFieldsEstimation}
                    name="num_missing"
                    value={value.num_missing}
                    onChange={onValueChange}
                    error={error?.num_missing}
                    disabled={disabled}
                />
                <NumberInput
                    label={strings.fieldsStep2SituationFieldsGov}
                    placeholder={strings.fieldsStep2SituationFieldsEstimation}
                    name="gov_num_missing"
                    value={value.gov_num_missing}
                    onChange={onValueChange}
                    error={error?.gov_num_missing}
                    disabled={disabled}
                />
                <NumberInput
                    label={strings.fieldsStep2SituationFieldsOther}
                    placeholder={strings.fieldsStep2SituationFieldsEstimation}
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
                numPreferredColumns={3}
            >
                <NumberInput
                    label={strings.fieldsStep2SituationFieldsRCRC}
                    placeholder={strings.fieldsStep2SituationFieldsEstimation}
                    name="num_affected"
                    value={value.num_affected}
                    onChange={onValueChange}
                    error={error?.num_affected}
                    disabled={disabled}
                />
                <NumberInput
                    label={strings.fieldsStep2SituationFieldsGov}
                    placeholder={strings.fieldsStep2SituationFieldsEstimation}
                    name="gov_num_affected"
                    value={value.gov_num_affected}
                    onChange={onValueChange}
                    error={error?.gov_num_affected}
                    disabled={disabled}
                />
                <NumberInput
                    label={strings.fieldsStep2SituationFieldsOther}
                    placeholder={strings.fieldsStep2SituationFieldsEstimation}
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
                numPreferredColumns={3}
            >
                <NumberInput
                    label={strings.fieldsStep2SituationFieldsRCRC}
                    placeholder={strings.fieldsStep2SituationFieldsEstimation}
                    name="num_displaced"
                    value={value.num_displaced}
                    onChange={onValueChange}
                    error={error?.num_displaced}
                    disabled={disabled}
                />
                <NumberInput
                    label={strings.fieldsStep2SituationFieldsGov}
                    placeholder={strings.fieldsStep2SituationFieldsEstimation}
                    name="gov_num_displaced"
                    value={value.gov_num_displaced}
                    onChange={onValueChange}
                    error={error?.gov_num_displaced}
                    disabled={disabled}
                />
                <NumberInput
                    label={strings.fieldsStep2SituationFieldsOther}
                    placeholder={strings.fieldsStep2SituationFieldsEstimation}
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
