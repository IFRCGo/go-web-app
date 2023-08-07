import React from 'react';
import {
    PartialForm,
    Error,
    EntriesAsList,
    getErrorObject,
} from '@togglecorp/toggle-form';

import Container from '#components/Container';
import InputSection from '#components/InputSection';
import TextInput from '#components/TextInput';
import NumberInput from '#components/NumberInput';
import TextArea from '#components/TextArea';
import RadioInput from '#components/RadioInput';
import LanguageContext from '#root/languageContext';

import {
    FormType,
    StringValueOption,
    stringOptionKeySelector,
    optionLabelSelector,
} from '../common';

import styles from './styles.module.scss';

type Value = PartialForm<FormType>;
interface Props {
    error: Error<Value> | undefined;
    onValueChange: (...entries: EntriesAsList<Value>) => void;
    value: Value;
    sourceOptions: StringValueOption[]
}

function RiskAnalysisFields(props: Props) {
    const {
        error: formError,
        onValueChange,
        value,
        sourceOptions,
    } = props;

    const { strings } = React.useContext(LanguageContext);
    const error = React.useMemo(
        () => getErrorObject(formError),
        [formError]
    );

    return (
        // FIXME: use translations
        <Container
            heading="Numeric Details (People)"
            className={styles.riskAnalysisFields}
        >
            <InputSection
                title={strings.fieldsStep2SituationFieldsEWPotentiallyAffectedLabel}
                description={strings.fieldsStep2SituationFieldsEWPotentiallyAffectedDescription}
            >
                <NumberInput
                    label={strings.fieldsStep2SituationFieldsEstimation}
                    name="num_potentially_affected"
                    value={value.num_potentially_affected}
                    onChange={onValueChange}
                    error={error?.num_potentially_affected}
                />
                <RadioInput
                    label={strings.cmpSourceLabel}
                    listContainerClassName={styles.sourceRadioListContainer}
                    error={error?.num_potentially_affected_source}
                    name={"num_potentially_affected_source" as const}
                    onChange={onValueChange}
                    options={sourceOptions}
                    keySelector={stringOptionKeySelector}
                    labelSelector={optionLabelSelector}
                    value={value.num_potentially_affected_source}
                    clearable
                />
            </InputSection>
            <InputSection
                title={strings.fieldsStep2SituationFieldsEWHighestRiskLabel}
                description={strings.fieldsStep2SituationFieldsEWHighestRiskDescription}
            >
                <NumberInput
                    label={strings.fieldsStep2SituationFieldsEstimation}
                    name="num_highest_risk"
                    value={value.num_highest_risk}
                    onChange={onValueChange}
                    error={error?.num_highest_risk}
                />
                <RadioInput
                    label={strings.cmpSourceLabel}
                    listContainerClassName={styles.sourceRadioListContainer}
                    error={error?.num_highest_risk_source}
                    name={"num_highest_risk_source" as const}
                    onChange={onValueChange}
                    options={sourceOptions}
                    keySelector={stringOptionKeySelector}
                    labelSelector={optionLabelSelector}
                    value={value.num_highest_risk_source}
                    clearable
                />
            </InputSection>
            <InputSection
                title={strings.fieldsStep2SituationFieldsEWAffectedPopCenteresLabel}
                description={strings.fieldsStep2SituationFieldsEWAffectedPopCenteresDescription}
            >
                <TextInput
                    label={strings.fieldsStep2SituationFieldsEstimation}
                    name="affected_pop_centres"
                    value={value.affected_pop_centres}
                    onChange={onValueChange}
                    error={error?.affected_pop_centres}
                />
                <RadioInput
                    label={strings.cmpSourceLabel}
                    listContainerClassName={styles.sourceRadioListContainer}
                    error={error?.affected_pop_centres_source}
                    name={"affected_pop_centres_source" as const}
                    onChange={onValueChange}
                    options={sourceOptions}
                    keySelector={stringOptionKeySelector}
                    labelSelector={optionLabelSelector}
                    value={value.affected_pop_centres_source}
                    clearable
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
                    placeholder={strings.fieldsStep2DescriptionEWPlaceholder}
                />
            </InputSection>
        </Container>
    );
}

export default RiskAnalysisFields;
