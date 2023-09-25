import React from 'react';
import {
    type Error,
    type EntriesAsList,
    getErrorObject,
} from '@togglecorp/toggle-form';

import Container from '#components/Container';
import InputSection from '#components/InputSection';
import TextInput from '#components/TextInput';
import NumberInput from '#components/NumberInput';
import TextArea from '#components/TextArea';
import useTranslation from '#hooks/useTranslation';

import { type PartialFormValue } from '../common';
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
            heading={strings.fieldReportNumericDetails}
            className={styles.riskAnalysisFields}
            childrenContainerClassName={styles.content}
        >
            <InputSection
                title={strings.situationFieldsEWPotentiallyAffectedLabel}
                description={strings.situationFieldsEWPotentiallyAffectedDescription}
                numPreferredColumns={3}
            >
                <NumberInput
                    label={strings.situationFieldsRCRC}
                    placeholder={strings.riskAnalysisEstimationPlaceholder}
                    name="num_potentially_affected"
                    value={value.num_potentially_affected}
                    onChange={onValueChange}
                    error={error?.num_potentially_affected}
                    disabled={disabled}
                />
                <NumberInput
                    label={strings.situationFieldsGov}
                    placeholder={strings.riskAnalysisEstimationPlaceholder}
                    name="gov_num_potentially_affected"
                    value={value.gov_num_potentially_affected}
                    onChange={onValueChange}
                    error={error?.gov_num_potentially_affected}
                    disabled={disabled}
                />
                <NumberInput
                    label={strings.situationFieldsOther}
                    placeholder={strings.riskAnalysisEstimationPlaceholder}
                    name="other_num_potentially_affected"
                    value={value.other_num_potentially_affected}
                    onChange={onValueChange}
                    error={error?.other_num_potentially_affected}
                    disabled={disabled}
                />
            </InputSection>
            <InputSection
                title={strings.situationFieldsEWHighestRiskLabel}
                description={strings.situationFieldsEWHighestRiskDescription}
                numPreferredColumns={3}
            >
                <NumberInput
                    label={strings.situationFieldsRCRC}
                    placeholder={strings.riskAnalysisEstimationPlaceholder}
                    name="num_highest_risk"
                    value={value.num_highest_risk}
                    onChange={onValueChange}
                    error={error?.num_highest_risk}
                    disabled={disabled}
                />
                <NumberInput
                    label={strings.situationFieldsGov}
                    placeholder={strings.riskAnalysisEstimationPlaceholder}
                    name="gov_num_highest_risk"
                    value={value.gov_num_highest_risk}
                    onChange={onValueChange}
                    error={error?.gov_num_highest_risk}
                    disabled={disabled}
                />
                <NumberInput
                    label={strings.situationFieldsOther}
                    placeholder={strings.riskAnalysisEstimationPlaceholder}
                    name="other_num_highest_risk"
                    value={value.other_num_highest_risk}
                    onChange={onValueChange}
                    error={error?.other_num_highest_risk}
                    disabled={disabled}
                />
            </InputSection>
            <InputSection
                title={strings.situationFieldsEWAffectedPopCenteresLabel}
                description={strings.situationFieldsEWAffectedPopCenteresDescription}
                numPreferredColumns={3}
            >
                <TextInput
                    label={strings.situationFieldsRCRC}
                    placeholder={strings.riskAnalysisEstimationPlaceholder}
                    name="affected_pop_centres"
                    value={value.affected_pop_centres}
                    onChange={onValueChange}
                    error={error?.affected_pop_centres}
                    disabled={disabled}
                />
                <TextInput
                    label={strings.situationFieldsGov}
                    placeholder={strings.riskAnalysisEstimationPlaceholder}
                    name="gov_affected_pop_centres"
                    value={value.gov_affected_pop_centres}
                    onChange={onValueChange}
                    error={error?.gov_affected_pop_centres}
                    disabled={disabled}
                />
                <TextInput
                    label={strings.situationFieldsOther}
                    placeholder={strings.riskAnalysisEstimationPlaceholder}
                    name="other_affected_pop_centres"
                    value={value.other_affected_pop_centres}
                    onChange={onValueChange}
                    error={error?.other_affected_pop_centres}
                    disabled={disabled}
                />
            </InputSection>
            <InputSection
                title={strings.sourceDetailsLabel}
                description={strings.sourceDetailsDescription}
            >
                <TextArea
                    name="other_sources"
                    value={value.other_sources}
                    onChange={onValueChange}
                    error={error?.other_sources}
                    disabled={disabled}
                    placeholder={strings.sourceDetailsPlaceholder}
                />
            </InputSection>
            <InputSection
                title={strings.descriptionEWLabel}
                description={strings.descriptionEWDescription}
            >
                <TextArea
                    name="description"
                    value={value.description}
                    onChange={onValueChange}
                    error={error?.description}
                    disabled={disabled}
                    placeholder={strings.descriptionEWPlaceholder}
                />
            </InputSection>
        </Container>
    );
}

export default RiskAnalysisFields;
