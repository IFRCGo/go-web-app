import {
    Container,
    InputSection,
    ListView,
    NumberInput,
    SelectInput,
    TextArea,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { stringValueSelector } from '@ifrc-go/ui/utils';
import { isDefined } from '@togglecorp/fujs';
import {
    type EntriesAsList,
    type Error,
    getErrorObject,
    getErrorString,
} from '@togglecorp/toggle-form';

import Admin2Input from '#components/domain/Admin2Input';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import { TIMEFRAME_YEAR } from '#utils/constants';
import { type GoApiResponse } from '#utils/restRequest';

import { type PartialSimplifiedEapType } from '../schema';

import i18n from './i18n.json';

type GlobalEnumsResponse = GoApiResponse<'/api/v2/global-enums/'>;

type TimeframeOption = NonNullable<GlobalEnumsResponse['eap_timeframe']>[number];

function timeframeKeySelector(option: TimeframeOption) {
    return option.key;
}

interface Props {
    value: NonNullable<PartialSimplifiedEapType>;
    setFieldValue: (...entries: EntriesAsList<PartialSimplifiedEapType>) => void;
    error: Error<PartialSimplifiedEapType> | undefined;
    disabled?: boolean;
    eapRegistrationDetail?: GoApiResponse<'/api/v2/eap-registration/{id}/'>;
}

function EarlyAction(props: Props) {
    const {
        value,
        setFieldValue,
        error: formError,
        disabled,
        eapRegistrationDetail,
    } = props;

    const strings = useTranslation(i18n);
    const error = getErrorObject(formError);

    const {
        eap_timeframe,
    } = useGlobalEnums();

    const eapTimeframeOption = eap_timeframe?.filter(
        (item) => item.key !== TIMEFRAME_YEAR,
    );

    return (
        <Container heading={strings.actionHeading}>
            <ListView
                layout="block"
                spacing="sm"
            >
                <InputSection
                    title={strings.intervention}
                    description={strings.interventionDescription}
                    withAsteriskOnTitle
                >
                    <TextArea
                        label={strings.actionDescription}
                        name="overall_objective_intervention"
                        value={value?.overall_objective_intervention}
                        onChange={setFieldValue}
                        error={error?.overall_objective_intervention}
                        disabled={disabled}
                    />
                </InputSection>
                <InputSection
                    title={strings.geographicalRiskArea}
                    description={strings.geographicalRiskAreaDescription}
                    withAsteriskOnTitle
                >
                    <TextArea
                        label={strings.actionDescription}
                        name="potential_geographical_high_risk_areas"
                        value={value?.potential_geographical_high_risk_areas}
                        onChange={setFieldValue}
                        error={error?.potential_geographical_high_risk_areas}
                        disabled={disabled}
                    />
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
                    title={strings.actionPeopleTargeted}
                    description={strings.actionPeopleTargetedDescription}
                    withAsteriskOnTitle
                    numPreferredColumns={2}
                >
                    <NumberInput
                        label={strings.actionDescription}
                        name="people_targeted"
                        value={value?.people_targeted}
                        onChange={setFieldValue}
                        error={error?.people_targeted}
                        disabled={disabled}
                    />
                </InputSection>
                <InputSection
                    title={strings.actionOperation}
                    description={strings.actionOperationDescription}
                    withAsteriskOnTitle
                >
                    <TextArea
                        label={strings.actionDescription}
                        name="assisted_through_operation"
                        value={value?.assisted_through_operation}
                        onChange={setFieldValue}
                        error={error?.assisted_through_operation}
                        disabled={disabled}
                    />
                </InputSection>
                <InputSection
                    description={strings.actionCriteria}
                    withAsteriskOnTitle
                >
                    <TextArea
                        label={strings.actionDescription}
                        name="selection_criteria"
                        value={value?.selection_criteria}
                        onChange={setFieldValue}
                        error={error?.selection_criteria}
                        disabled={disabled}
                    />
                </InputSection>
                <InputSection
                    title={strings.actionsStatement}
                    description={strings.actionsStatementDescription}
                    withAsteriskOnTitle
                >
                    <TextArea
                        label={strings.actionDescription}
                        name="trigger_statement"
                        value={value?.trigger_statement}
                        onChange={setFieldValue}
                        error={error?.trigger_statement}
                        disabled={disabled}
                    />
                </InputSection>
                <InputSection
                    title={strings.actionsLeadTime}
                    description={strings.actionsLeadTimeDescription}
                    withAsteriskOnTitle
                    numPreferredColumns={2}
                >
                    <NumberInput
                        label={strings.actionValue}
                        name="seap_lead_time"
                        value={value?.seap_lead_time}
                        onChange={setFieldValue}
                        error={error?.seap_lead_time}
                        disabled={disabled}
                    />
                    <SelectInput
                        label={strings.operationTimeFrame}
                        name="seap_lead_timeframe_unit"
                        value={value.seap_lead_timeframe_unit}
                        onChange={setFieldValue}
                        keySelector={timeframeKeySelector}
                        labelSelector={stringValueSelector}
                        options={eapTimeframeOption}
                        disabled={disabled}
                        error={error?.seap_lead_timeframe_unit}
                    />
                </InputSection>
                <InputSection
                    title={strings.actionsOperational}
                    description={strings.actionsOperationalDescription}
                    withAsteriskOnTitle
                    numPreferredColumns={2}
                >
                    <NumberInput
                        label={strings.actionValue}
                        name="operational_timeframe"
                        value={value?.operational_timeframe}
                        onChange={setFieldValue}
                        error={error?.operational_timeframe}
                        disabled={disabled}
                    />
                    <SelectInput
                        label={strings.operationTimeFrame}
                        name="operational_timeframe_unit"
                        value={value.operational_timeframe_unit}
                        onChange={setFieldValue}
                        keySelector={timeframeKeySelector}
                        labelSelector={stringValueSelector}
                        options={eapTimeframeOption}
                        disabled={disabled}
                        error={error?.operational_timeframe_unit}
                    />
                </InputSection>
                <InputSection
                    title={strings.justification}
                    description={strings.justificationDescription}
                    withAsteriskOnTitle
                >
                    <TextArea
                        label={strings.actionDescription}
                        name="trigger_threshold_justification"
                        value={value?.trigger_threshold_justification}
                        onChange={setFieldValue}
                        error={error?.trigger_threshold_justification}
                        disabled={disabled}
                    />
                </InputSection>
                <InputSection
                    title={strings.fullEap}
                    description={strings.fullEapDescription}
                    withAsteriskOnTitle
                >
                    <TextArea
                        label={strings.actionDescription}
                        name="next_step_towards_full_eap"
                        value={value?.next_step_towards_full_eap}
                        onChange={setFieldValue}
                        error={error?.next_step_towards_full_eap}
                        disabled={disabled}
                    />
                </InputSection>
            </ListView>
        </Container>
    );
}

export default EarlyAction;
