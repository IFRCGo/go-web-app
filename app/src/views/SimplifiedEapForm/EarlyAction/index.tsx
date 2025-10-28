import { useState } from 'react';
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
import {
    type EntriesAsList,
    type Error,
    getErrorObject,
    getErrorString,
} from '@togglecorp/toggle-form';

import { type DistrictItem } from '#components/domain/DistrictSearchMultiSelectInput';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import { TIMEFRAME_YEAR } from '#utils/constants';
import { type GoApiResponse } from '#utils/restRequest';

import { type PartialSimplifiedEapType } from '../schema';
import DistrictMap from './DistrictMap';

import i18n from './i18n.json';

type GetDistrictResponse = GoApiResponse<'/api/v2/district/'>;

export type Admin2item = Pick<NonNullable<GetDistrictResponse['results']>[number], 'id' | 'name'>;
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

interface AdminTwo {
    id: number;
    name: string;
    district_id: number;
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

    const [districtOptions, setDistrictOptions] = useState<
        DistrictItem[] | undefined | null
    >([]);

    const [admin2Options, setAdmin2Options] = useState<
    AdminTwo[] | undefined | null
    >([]);

    const {
        eap_timeframe,
    } = useGlobalEnums();

    const [districts, setDistricts] = useState<number[] | undefined>();

    const eapTimeframeOption = eap_timeframe?.filter(
        (item) => item.key !== TIMEFRAME_YEAR,
    );

    return (
        <Container
            heading={strings.simplifiedEapActionHeading}
        >
            <ListView
                layout="block"
                spacing="sm"
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
                <InputSection
                    title={strings.simplifiedGeographicalRiskArea}
                    description={strings.simplifiedGeographicalRiskAreaDescription}
                    withAsteriskOnTitle
                >
                    <TextArea
                        label={strings.simplifiedEapActionDescription}
                        name="potential_geographical_high_risk_areas"
                        value={value?.potential_geographical_high_risk_areas}
                        onChange={setFieldValue}
                        error={error?.potential_geographical_high_risk_areas}
                        disabled={disabled}
                    />
                    <DistrictMap
                        districtsName="district"
                        districtsValue={districts}
                        admin2Name="admin2"
                        admin2Value={value?.admin2}
                        onDistrictsChange={setDistricts}
                        districtOptions={districtOptions}
                        onDistrictsOptionsChange={setDistrictOptions}
                        onAdmin2Change={setFieldValue}
                        admin2Options={admin2Options}
                        onAdmin2OptionsChange={setAdmin2Options}
                        countryId={eapRegistrationDetail?.country}
                        disabled={disabled}
                        districtsError={getErrorString(error?.admin2)}
                        admin2Error={getErrorString(error?.admin2)}
                    />
                </InputSection>
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
                        label={strings.simplifiedEapActionValue}
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
                    title={strings.simplifiedEapActionsOperational}
                    description={strings.simplifiedEapActionsOperationalDescription}
                    withAsteriskOnTitle
                    numPreferredColumns={2}
                >
                    <NumberInput
                        label={strings.simplifiedEapActionValue}
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
            </ListView>
        </Container>
    );
}

export default EarlyAction;
