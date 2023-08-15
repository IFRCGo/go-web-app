import React from 'react';
import {
    Error,
    EntriesAsList,
    getErrorObject,
} from '@togglecorp/toggle-form';

import Container from '#components/Container';
import InputSection from '#components/InputSection';
import TextInput from '#components/TextInput';
import NumberInput from '#components/NumberInput';
import TextArea from '#components/TextArea';
import useTranslation from '#hooks/useTranslation';

import {
    type PartialFormValue,
} from '../common';
import i18n from './i18n.json';
import styles from './styles.module.css';

interface Props {
    error: Error<PartialFormValue> | undefined;
    onValueChange: (...entries: EntriesAsList<PartialFormValue>) => void;
    value: PartialFormValue;
    disabled?: boolean;
}

function RiskAnalysisFields(props: Props) {
    const {
        error: formError,
        onValueChange,
        value,
        disabled,
    } = props;

    const strings = useTranslation(i18n);

    const error = React.useMemo(
        () => getErrorObject(formError),
        [formError],
    );

    return (
        <Container
            // FIXME: use translations
            heading="Numeric Details (People)"
            className={styles.riskAnalysisFields}
            childrenContainerClassName={styles.content}
        >
            <InputSection
                title={strings.fieldsStep2SituationFieldsEWPotentiallyAffectedLabel}
                description={strings.fieldsStep2SituationFieldsEWPotentiallyAffectedDescription}
                threeColumn
            >
                <NumberInput
                    label={strings.fieldsStep2SituationFieldsRCRC}
                    placeholder={strings.riskAnalysisEstimationPlaceholder}
                    name="num_potentially_affected"
                    value={value.num_potentially_affected}
                    onChange={onValueChange}
                    error={error?.num_potentially_affected}
                    disabled={disabled}
                />
                <NumberInput
                    label={strings.fieldsStep2SituationFieldsGov}
                    placeholder={strings.riskAnalysisEstimationPlaceholder}
                    name="gov_num_potentially_affected"
                    value={value.gov_num_potentially_affected}
                    onChange={onValueChange}
                    error={error?.gov_num_potentially_affected}
                    disabled={disabled}
                />
                <NumberInput
                    label={strings.fieldsStep2SituationFieldsOther}
                    placeholder={strings.riskAnalysisEstimationPlaceholder}
                    name="other_num_potentially_affected"
                    value={value.other_num_potentially_affected}
                    onChange={onValueChange}
                    error={error?.other_num_potentially_affected}
                    disabled={disabled}
                />
            </InputSection>
            <InputSection
                title={strings.fieldsStep2SituationFieldsEWHighestRiskLabel}
                description={strings.fieldsStep2SituationFieldsEWHighestRiskDescription}
                threeColumn
            >
                <NumberInput
                    label={strings.fieldsStep2SituationFieldsRCRC}
                    placeholder={strings.riskAnalysisEstimationPlaceholder}
                    name="num_highest_risk"
                    value={value.num_highest_risk}
                    onChange={onValueChange}
                    error={error?.num_highest_risk}
                    disabled={disabled}
                />
                <NumberInput
                    label={strings.fieldsStep2SituationFieldsGov}
                    placeholder={strings.riskAnalysisEstimationPlaceholder}
                    name="gov_num_highest_risk"
                    value={value.gov_num_highest_risk}
                    onChange={onValueChange}
                    error={error?.gov_num_highest_risk}
                    disabled={disabled}
                />
                <NumberInput
                    label={strings.fieldsStep2SituationFieldsOther}
                    placeholder={strings.riskAnalysisEstimationPlaceholder}
                    name="other_num_highest_risk"
                    value={value.other_num_highest_risk}
                    onChange={onValueChange}
                    error={error?.other_num_highest_risk}
                    disabled={disabled}
                />
            </InputSection>
            <InputSection
                title={strings.fieldsStep2SituationFieldsEWAffectedPopCenteresLabel}
                description={strings.fieldsStep2SituationFieldsEWAffectedPopCenteresDescription}
                threeColumn
            >
                <TextInput
                    label={strings.fieldsStep2SituationFieldsRCRC}
                    placeholder={strings.riskAnalysisEstimationPlaceholder}
                    name="affected_pop_centres"
                    value={value.affected_pop_centres}
                    onChange={onValueChange}
                    error={error?.affected_pop_centres}
                    disabled={disabled}
                />
                <TextInput
                    label={strings.fieldsStep2SituationFieldsGov}
                    placeholder={strings.riskAnalysisEstimationPlaceholder}
                    name="gov_affected_pop_centres"
                    value={value.gov_affected_pop_centres}
                    onChange={onValueChange}
                    error={error?.gov_affected_pop_centres}
                    disabled={disabled}
                />
                <TextInput
                    label={strings.fieldsStep2SituationFieldsOther}
                    placeholder={strings.riskAnalysisEstimationPlaceholder}
                    name="other_affected_pop_centres"
                    value={value.other_affected_pop_centres}
                    onChange={onValueChange}
                    error={error?.other_affected_pop_centres}
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
                title={strings.fieldsStep2DescriptionEWLabel}
                description={strings.fieldsStep2DescriptionEWDescription}
            >
                <TextArea
                    name="description"
                    value={value.description}
                    onChange={onValueChange}
                    error={error?.description}
                    disabled={disabled}
                    placeholder={strings.fieldsStep2DescriptionEWPlaceholder}
                />
            </InputSection>
        </Container>
    );
}

export default RiskAnalysisFields;
