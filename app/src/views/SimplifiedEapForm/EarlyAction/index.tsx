import {
    Container,
    InputSection,
    NumberInput,
    TextArea,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    type EntriesAsList,
    type Error,
    getErrorObject,
} from '@togglecorp/toggle-form';

import { type PartialSimplifiedEapType } from '../schema';

import i18n from './i18n.json';

interface Props {
    value: PartialSimplifiedEapType;
    setFieldValue: (...entries: EntriesAsList<PartialSimplifiedEapType>) => void;
    error: Error<PartialSimplifiedEapType> | undefined;
    disabled?: boolean;
}

function EarlyAction(props: Props) {
    const {
        value,
        setFieldValue,
        error: formError,
        disabled,
    } = props;

    const strings = useTranslation(i18n);
    const error = getErrorObject(formError);

    return (
        <Container
            heading={strings.simplifiedEapActionHeading}
        >
            <InputSection
                title={strings.simplifiedEapIntervention}
                description={strings.simplifiedEapInterventionDescription}
                withAsteriskOnTitle
            >
                <TextArea
                    label={strings.simplifiedEapActionDescription}
                    name="overall_objective_intervention"
                    value={value?.overall_objective_intervention}
                    onChange={setFieldValue}
                    error={error?.overall_objective_intervention}
                    disabled={disabled}
                />
            </InputSection>
            {/* TODO: Add new component */}
            <InputSection
                title={strings.simplifiedEapActionPeopleTargeted}
                description={strings.simplifiedEapActionPeopleTargetedDescription}
                withAsteriskOnTitle
                numPreferredColumns={2}
            >
                <NumberInput
                    label={strings.simplifiedEapActionDescription}
                    name="people_targeted"
                    value={value?.people_targeted}
                    onChange={setFieldValue}
                    error={error?.people_targeted}
                    disabled={disabled}
                />
            </InputSection>
            <InputSection
                title={strings.simplifiedEapActionOperation}
                description={strings.simplifiedEapActionOperationDescription}
                withAsteriskOnTitle
            >
                <TextArea
                    label={strings.simplifiedEapActionDescription}
                    name="assisted_through_operation"
                    value={value?.assisted_through_operation}
                    onChange={setFieldValue}
                    error={error?.assisted_through_operation}
                    disabled={disabled}
                />
            </InputSection>
            <InputSection
                description={strings.simplifiedEapActionCriteria}
                withAsteriskOnTitle
            >
                <TextArea
                    label={strings.simplifiedEapActionDescription}
                    name="selection_criteria"
                    value={value?.selection_criteria}
                    onChange={setFieldValue}
                    error={error?.selection_criteria}
                    disabled={disabled}
                />
            </InputSection>
            <InputSection
                title={strings.simplifiedEapActionsStatement}
                description={strings.simplifiedEapActionsStatementDescription}
                withAsteriskOnTitle
            >
                <TextArea
                    label={strings.simplifiedEapActionDescription}
                    name="trigger_statement"
                    value={value?.trigger_statement}
                    onChange={setFieldValue}
                    error={error?.trigger_statement}
                    disabled={disabled}
                />
            </InputSection>
            <InputSection
                title={strings.simplifiedEapActionsLeadTime}
                description={strings.simplifiedEapActionsLeadTimeDescription}
                withAsteriskOnTitle
                numPreferredColumns={2}
            >
                <NumberInput
                    label={strings.simplifiedEapActionDescription}
                    name="seap_lead_time"
                    value={value?.seap_lead_time}
                    onChange={setFieldValue}
                    error={error?.seap_lead_time}
                    disabled={disabled}
                />
            </InputSection>
            <InputSection
                title={strings.simplifiedEapActionsOperational}
                description={strings.simplifiedEapActionsOperationalDescription}
                withAsteriskOnTitle
                numPreferredColumns={2}
            >
                <NumberInput
                    label={strings.simplifiedEapActionDescription}
                    name="operational_timeframe"
                    value={value?.operational_timeframe}
                    onChange={setFieldValue}
                    error={error?.operational_timeframe}
                    disabled={disabled}
                />
            </InputSection>
            <InputSection
                title={strings.simplifiedEapJustification}
                description={strings.simplifiedEapJustificationDescription}
                withAsteriskOnTitle
            >
                <TextArea
                    label={strings.simplifiedEapActionDescription}
                    name="trigger_threshold_justification"
                    value={value?.trigger_threshold_justification}
                    onChange={setFieldValue}
                    error={error?.trigger_threshold_justification}
                    disabled={disabled}
                />
            </InputSection>
            <InputSection
                title={strings.simplifiedEapFullEap}
                description={strings.simplifiedEapFullEapDescription}
                withAsteriskOnTitle
            >
                <TextArea
                    label={strings.simplifiedEapActionDescription}
                    name="next_step_towards_full_eap"
                    value={value?.next_step_towards_full_eap}
                    onChange={setFieldValue}
                    error={error?.next_step_towards_full_eap}
                    disabled={disabled}
                />
            </InputSection>
        </Container>
    );
}

export default EarlyAction;
