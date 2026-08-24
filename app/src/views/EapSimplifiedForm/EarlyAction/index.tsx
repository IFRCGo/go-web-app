import { useCallback } from 'react';
import {
    Container,
    Description,
    Heading,
    InlineLayout,
    InputSection,
    Label,
    ListView,
    NumberInput,
    SelectInput,
    TextArea,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    resolveToComponent,
    stringValueSelector,
} from '@ifrc-go/ui/utils';
import { isDefined } from '@togglecorp/fujs';
import {
    type EntriesAsList,
    type Error,
    getErrorObject,
    getErrorString,
} from '@togglecorp/toggle-form';

import Admin1Input from '#components/domain/Admin1Input';
import Admin2Input from '#components/domain/Admin2Input';
import ExplanatoryNote from '#components/ExplanatoryNote';
import Link from '#components/Link';
import TabPage from '#components/TabPage';
import useCountryHasAdmin2 from '#hooks/domain/useCountryHasAdmin2';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import { TIMEFRAME_YEAR } from '#utils/constants';
import { type GoApiResponse } from '#utils/restRequest';

import { wordLimits } from '../common';
import GuidanceSeap from '../GuidanceSeap';
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
    readOnly?: boolean;
}

function EarlyAction(props: Props) {
    const {
        value,
        setFieldValue,
        error: formError,
        disabled,
        eapRegistrationDetail,
        readOnly,
    } = props;

    const strings = useTranslation(i18n);
    const error = getErrorObject(formError);

    const {
        eap_timeframe,
    } = useGlobalEnums();

    const eapTimeframeOption = eap_timeframe?.filter(
        (item) => item.key !== TIMEFRAME_YEAR,
    );

    const { hasAdmin2 } = useCountryHasAdmin2(eapRegistrationDetail?.country);
    const showAdmin1 = (value?.districts?.length ?? 0) > 0 || hasAdmin2 === false;
    const showAdmin2 = (value?.admin2?.length ?? 0) > 0 || hasAdmin2 === true;

    const handleLeadTimeframeUnitChange = useCallback(
        (newValue: TimeframeOption['key'] | undefined) => {
            setFieldValue(newValue, 'seap_lead_timeframe_unit' as const);

            setFieldValue(
                (oldValue: PartialSimplifiedEapType['planned_operations']) => (
                    oldValue?.map((operation) => ({
                        ...operation,
                        early_action_activities: operation.early_action_activities?.map(
                            (activity) => (
                                activity.timeframe === newValue
                                    ? activity
                                    : {
                                        ...activity,
                                        timeframe: newValue,
                                        time_value: undefined,
                                    }
                            ),
                        ),
                    }))
                ),
                'planned_operations' as const,
            );
        },
        [setFieldValue],
    );

    return (
        <TabPage
            headerAction={(
                <GuidanceSeap
                    heading={strings.earlySectionHeading}
                    content={(
                        <ListView layout="block" withSpacingOpticalCorrection>
                            <Heading level={5}>
                                {strings.triggerModelSectionHeading}
                            </Heading>
                            <Label strong>
                                {strings.earlySectionCriteriaIntroduction1}
                            </Label>
                            <ListView spacing="xs" layout="block" withSpacingOpticalCorrection>
                                <Description>
                                    {strings.earlySectionCriteriaComment11}
                                </Description>
                                <Description>
                                    {strings.earlySectionCriteriaComment12}
                                </Description>
                                <Description>
                                    {strings.earlySectionCriteriaComment13}
                                </Description>
                                <Description>
                                    {strings.earlySectionCriteriaComment14}
                                </Description>
                            </ListView>
                            <Heading level={5}>
                                {strings.eapActivationSectionCriteriaHeading}
                            </Heading>
                            <Label strong>
                                {strings.earlySectionCriteriaIntroduction2}
                            </Label>
                            <ListView spacing="xs" layout="block" withSpacingOpticalCorrection>
                                <Description>
                                    {strings.earlySectionCriteriaComment21}
                                </Description>
                                <Description>
                                    {strings.earlySectionCriteriaComment22}
                                </Description>
                            </ListView>
                            <Label strong>
                                {strings.earlySectionCriteriaIntroduction3}
                            </Label>
                            <ListView spacing="xs" layout="block" withSpacingOpticalCorrection>
                                <Description>
                                    {strings.earlySectionCriteriaComment31}
                                </Description>
                                <Description>
                                    {strings.earlySectionCriteriaComment32}
                                </Description>
                                <Description>
                                    {strings.earlySectionCriteriaComment33}
                                </Description>
                            </ListView>
                        </ListView>
                    )}
                />
            )}
        >
            <Container
                heading={strings.actionHeading}
                variant="form"
            >
                <ListView
                    layout="block"
                    spacing="sm"
                >
                    <InputSection
                        title={strings.intervention}
                        description={strings.interventionDescription}
                        headerActions={(
                            <ExplanatoryNote
                                heading={strings.intervention}
                                ariaLabel={strings.intervention}
                                title={strings.intervention}
                                content={(
                                    <ListView spacing="xs" layout="block" withSpacingOpticalCorrection>
                                        <Description>
                                            {strings.interventionTooltipDescription}
                                        </Description>
                                        <Description>
                                            <ul>
                                                <li>
                                                    {strings.interventionTooltipDescription1}
                                                </li>
                                                <li>
                                                    {strings.interventionTooltipDescription2}
                                                </li>
                                                <li>
                                                    {strings.interventionTooltipDescription3}
                                                </li>
                                            </ul>
                                        </Description>
                                    </ListView>
                                )}
                            />
                        )}
                        withAsteriskOnTitle
                    >
                        <TextArea
                            label={strings.actionDescription}
                            name="overall_objective_intervention"
                            value={value?.overall_objective_intervention}
                            onChange={setFieldValue}
                            error={error?.overall_objective_intervention}
                            disabled={disabled}
                            readOnly={readOnly}
                            maxWords={wordLimits.overall_objective_intervention}
                        />
                    </InputSection>
                    <InputSection
                        title={strings.geographicalRiskArea}
                        description={strings.geographicalRiskAreaDescription}
                        headerActions={(
                            <ExplanatoryNote
                                heading={strings.geographicalRiskArea}
                                ariaLabel={strings.geographicalRiskArea}
                                title={strings.geographicalRiskArea}
                                content={(
                                    <Description>
                                        {resolveToComponent(
                                            strings.geographicalRiskAreaTooltip,
                                            {
                                                practitionersManualLink: (
                                                    <Link
                                                        href="https://manual.forecast-based-financing.org/en/chapter/set-the-trigger/"
                                                        styleVariant="action"
                                                        external
                                                        withLinkIcon
                                                    >
                                                        {strings.practitionersManualLink}
                                                    </Link>
                                                ),
                                            },
                                        )}
                                    </Description>
                                )}
                            />
                        )}
                        withAsteriskOnTitle
                    >
                        {isDefined(eapRegistrationDetail?.country) && showAdmin2 && (
                            <Admin2Input
                                name="admin2"
                                onChange={setFieldValue}
                                value={value?.admin2}
                                countryId={eapRegistrationDetail.country}
                                error={getErrorString(error?.admin2)}
                                readOnly={readOnly}
                            />
                        )}
                        {isDefined(eapRegistrationDetail?.country) && showAdmin1 && (
                            <Admin1Input
                                name="districts"
                                onChange={setFieldValue}
                                value={value?.districts}
                                countryId={eapRegistrationDetail.country}
                                error={getErrorObject(error?.districts)}
                                maxWords={wordLimits.districts}
                                disabled={disabled}
                                readOnly={readOnly}
                            />
                        )}
                        <TextArea
                            label={strings.actionDescription}
                            name="potential_geographical_high_risk_areas"
                            value={value?.potential_geographical_high_risk_areas}
                            onChange={setFieldValue}
                            error={error?.potential_geographical_high_risk_areas}
                            disabled={disabled}
                            readOnly={readOnly}
                            maxWords={wordLimits.potential_geographical_high_risk_areas}
                        />
                    </InputSection>
                    <InputSection
                        title={strings.actionPeopleTargeted}
                        description={strings.actionPeopleTargetedDescription}
                        headerActions={(
                            <ExplanatoryNote
                                heading={strings.actionPeopleTargeted}
                                ariaLabel={strings.actionPeopleTargeted}
                                title={strings.actionPeopleTargeted}
                                content={(
                                    <Description>
                                        {strings.actionPeopleTargetedTooltip}
                                    </Description>
                                )}
                            />
                        )}
                        withAsteriskOnTitle
                        numPreferredColumns={2}
                    >
                        <NumberInput
                            name="total_people_targeted"
                            value={value?.total_people_targeted}
                            onChange={setFieldValue}
                            error={error?.total_people_targeted}
                            disabled={disabled}
                            readOnly={readOnly}
                        />
                    </InputSection>
                    <ListView
                        layout="block"
                        spacing="none"
                        withBackground
                    >
                        <InputSection
                            title={strings.actionOperation}
                            description={strings.actionOperationDescription}
                            headerActions={(
                                <ExplanatoryNote
                                    heading={strings.actionOperation}
                                    ariaLabel={strings.actionOperation}
                                    title={strings.actionOperation}
                                    content={(
                                        <Description>
                                            {strings.actionOperationTooltip}
                                        </Description>
                                    )}
                                />
                            )}
                            withAsteriskOnTitle
                            withoutBackground
                        >
                            <TextArea
                                label={strings.actionDescription}
                                name="assisted_through_operation"
                                value={value?.assisted_through_operation}
                                onChange={setFieldValue}
                                error={error?.assisted_through_operation}
                                disabled={disabled}
                                readOnly={readOnly}
                                maxWords={wordLimits.assisted_through_operation}
                            />
                        </InputSection>
                        <InputSection
                            description={(
                                <InlineLayout
                                    after={(
                                        <ExplanatoryNote
                                            heading={strings.actionCriteria}
                                            ariaLabel={strings.actionCriteria}
                                            title={strings.actionCriteria}
                                            content={(
                                                <Description>
                                                    {strings.actionCriteriaTooltip}
                                                </Description>
                                            )}
                                        />
                                    )}
                                >
                                    {strings.actionCriteria}
                                </InlineLayout>
                            )}
                            withoutBackground
                        >
                            <TextArea
                                label={strings.actionDescription}
                                name="selection_criteria"
                                value={value?.selection_criteria}
                                onChange={setFieldValue}
                                error={error?.selection_criteria}
                                disabled={disabled}
                                readOnly={readOnly}
                                maxWords={wordLimits.selection_criteria}
                            />
                        </InputSection>
                    </ListView>
                    <InputSection
                        title={strings.actionsStatement}
                        description={strings.actionsStatementDescription}
                        headerActions={(
                            <ExplanatoryNote
                                heading={strings.actionsStatement}
                                ariaLabel={strings.actionsStatement}
                                title={strings.actionsStatement}
                                content={(
                                    <ListView layout="block">
                                        <Description>
                                            {strings.actionsStatementTooltipDescriptionOne}
                                        </Description>
                                        <ListView spacing="xs" layout="block" withSpacingOpticalCorrection>
                                            <Label strong>
                                                {strings.actionsStatementTooltipDescriptionTwo}
                                            </Label>
                                            <Description>
                                                {strings.actionsStatementTooltipDescriptionThree}
                                            </Description>
                                            <Description>
                                                <ul>
                                                    <li>
                                                        {strings.actionsStatementTooltipListOne}
                                                    </li>
                                                    <li>
                                                        {strings.actionsStatementTooltipListTwo}
                                                    </li>
                                                    <li>
                                                        {strings.actionsStatementTooltipListThree}
                                                    </li>
                                                    <li>
                                                        {strings.actionsStatementTooltipListFour}
                                                    </li>
                                                </ul>
                                            </Description>
                                        </ListView>
                                        <ListView spacing="xs" layout="block" withSpacingOpticalCorrection>
                                            <Label strong>
                                                {strings.actionsStatementTooltipDescriptionFour}
                                            </Label>
                                            <Description>
                                                {strings.actionsStatementTooltipDescriptionFive}
                                            </Description>
                                            <Description>
                                                {strings.actionsStatementTooltipDescriptionSix}
                                            </Description>
                                            <Description>
                                                {resolveToComponent(
                                                    strings.actionsStatementTooltipDescriptionSeven,
                                                    {
                                                        triggerDatabaseLink: (
                                                            <Link
                                                                href="https://www.anticipation-hub.org/experience/triggers/trigger-database/trigger-list"
                                                                styleVariant="action"
                                                                external
                                                                withLinkIcon
                                                            >
                                                                {strings.triggerDatabaseLink}
                                                            </Link>
                                                        ),
                                                    },
                                                )}
                                            </Description>
                                        </ListView>
                                    </ListView>
                                )}
                            />
                        )}
                        withAsteriskOnTitle
                    >
                        <TextArea
                            label={strings.actionDescription}
                            name="trigger_statement"
                            value={value?.trigger_statement}
                            onChange={setFieldValue}
                            error={error?.trigger_statement}
                            disabled={disabled}
                            readOnly={readOnly}
                            maxWords={wordLimits.trigger_statement}
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
                            readOnly={readOnly}
                        />
                        <SelectInput
                            label={strings.operationTimeFrame}
                            name="seap_lead_timeframe_unit"
                            value={value.seap_lead_timeframe_unit}
                            onChange={handleLeadTimeframeUnitChange}
                            keySelector={timeframeKeySelector}
                            labelSelector={stringValueSelector}
                            options={eapTimeframeOption}
                            disabled={disabled}
                            error={error?.seap_lead_timeframe_unit}
                            readOnly={readOnly}
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
                            name="activation_timeframe"
                            value={value?.activation_timeframe}
                            onChange={setFieldValue}
                            error={error?.activation_timeframe}
                            disabled={disabled}
                            readOnly={readOnly}
                        />
                        <SelectInput
                            label={strings.operationTimeFrame}
                            name="activation_timeframe_unit"
                            value={value.activation_timeframe_unit}
                            onChange={setFieldValue}
                            keySelector={timeframeKeySelector}
                            labelSelector={stringValueSelector}
                            options={eapTimeframeOption}
                            error={error?.activation_timeframe_unit}
                            disabled={disabled}
                            readOnly
                        />
                    </InputSection>
                    <InputSection
                        title={strings.justification}
                        description={strings.justificationDescription}
                        headerActions={(
                            <ExplanatoryNote
                                heading={strings.justification}
                                ariaLabel={strings.justification}
                                title={strings.justification}
                                content={(
                                    <ListView layout="block">
                                        <Description>
                                            {strings.justificationTooltipDescriptionOne}
                                        </Description>
                                        <ListView spacing="xs" layout="block" withSpacingOpticalCorrection>
                                            <Label strong>
                                                {strings.justificationTooltipDescriptionTwo}
                                            </Label>
                                            <Description>
                                                {strings.justificationTooltipDescriptionThree}
                                            </Description>
                                        </ListView>
                                    </ListView>
                                )}
                            />
                        )}
                        withAsteriskOnTitle
                    >
                        <TextArea
                            label={strings.actionDescription}
                            name="trigger_threshold_justification"
                            value={value?.trigger_threshold_justification}
                            onChange={setFieldValue}
                            error={error?.trigger_threshold_justification}
                            disabled={disabled}
                            readOnly={readOnly}
                            maxWords={wordLimits.trigger_threshold_justification}
                        />
                    </InputSection>
                    <InputSection
                        title={strings.fullEap}
                        description={strings.fullEapDescription}
                    >
                        <TextArea
                            label={strings.actionDescription}
                            name="next_step_towards_full_eap"
                            value={value?.next_step_towards_full_eap}
                            onChange={setFieldValue}
                            error={error?.next_step_towards_full_eap}
                            disabled={disabled}
                            readOnly={readOnly}
                            maxWords={wordLimits.next_step_towards_full_eap}
                        />
                    </InputSection>
                </ListView>
            </Container>
        </TabPage>
    );
}

export default EarlyAction;
