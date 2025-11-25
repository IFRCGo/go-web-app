import {
    useParams,
    useSearchParams,
} from 'react-router-dom';
import { Label } from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { Image } from '@ifrc-go/ui/printable';
import {
    isDefined,
    isFalsyString,
    isNotDefined,
    isTruthyString,
    listToMap,
} from '@togglecorp/fujs';

import PrintableContainer from '#components/printable/PrintableContainer';
import PrintableDataDisplay from '#components/printable/PrintableDataDisplay';
import PrintableDescription from '#components/printable/PrintableDescription';
import PrintablePage from '#components/printable/PrintablePage';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import { useRequest } from '#utils/restRequest';

import i18n from './i18n.json';
import styles from './styles.module.css';

/** @knipignore */
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const { eapId } = useParams<{ eapId: string }>();
    const [searchParams] = useSearchParams();

    const version = searchParams.get('version') ?? undefined;
    const showDiff = searchParams.get('diff') ?? undefined;

    const strings = useTranslation(i18n);

    const {
        pending: eapRegistrationPending,
        response: eapRegistrationResponse,
    } = useRequest({
        skip: isFalsyString(eapId),
        url: '/api/v2/eap-registration/{id}/',
        pathVariables: isTruthyString(eapId) ? {
            id: Number(eapId),
        } : undefined,
    });

    const selectedSimplifiedEap = eapRegistrationResponse?.simplified_eap_details?.find(
        (simplifiedEap) => String(simplifiedEap.version) === String(version),
    );

    const latestSimplifiedEapVersion = eapRegistrationResponse?.latest_simplified_eap;
    const latestSimplifiedEap = eapRegistrationResponse?.simplified_eap_details?.find(
        (simplifiedEap) => simplifiedEap.version === latestSimplifiedEapVersion,
    );

    const currentSimplifiedEap = selectedSimplifiedEap ?? latestSimplifiedEap;
    const currentSimplifiedEapId = currentSimplifiedEap?.id;

    const prevSimplifiedEapVersion = isDefined(currentSimplifiedEap?.version)
        && currentSimplifiedEap.version > 1
        ? currentSimplifiedEap.version - 1
        : undefined;
    const prevSimplifiedEap = eapRegistrationResponse?.simplified_eap_details.find(
        (simplifiedEap) => simplifiedEap.version === prevSimplifiedEapVersion,
    );

    const {
        pending: simplifiedEapPending,
        response: simplifiedEapResponse,
    } = useRequest({
        skip: isNotDefined(currentSimplifiedEapId),
        url: '/api/v2/simplified-eap/{id}/',
        pathVariables: isDefined(currentSimplifiedEapId) ? {
            id: Number(currentSimplifiedEapId),
        } : undefined,
    });

    const {
        pending: prevSimplifiedEapPending,
        response: prevSimplifiedEapResponse,
    } = useRequest({
        skip: isNotDefined(prevSimplifiedEap) || showDiff?.toLowerCase() !== 'true',
        url: '/api/v2/simplified-eap/{id}/',
        pathVariables: isDefined(prevSimplifiedEap) ? {
            id: Number(prevSimplifiedEap.id),
        } : undefined,
    });

    const { eap_sector, eap_approach } = useGlobalEnums();

    const eapSectorTitleMap = listToMap(
        eap_sector,
        ({ key }) => key,
        ({ value }) => value,
    );

    const eapApproachTitleMap = listToMap(
        eap_approach,
        ({ key }) => key,
        ({ value }) => value,
    );

    const {
        disaster_type_details,
        country_details,
    } = eapRegistrationResponse ?? {};

    const {
        cover_image_file,
        admin2_details,

        total_budget,
        readiness_budget,
        pre_positioning_budget,
        early_action_budget,
        people_targeted,
        seap_timeframe,
        seap_lead_time,
        operational_timeframe,

        prioritized_hazard_and_impact,
        risks_selected_protocols,

        overall_objective_intervention,
        potential_geographical_high_risk_areas,
        assisted_through_operation,
        trigger_statement,
        trigger_threshold_justification,
        next_step_towards_full_eap,
        planned_operations,
        enable_approaches,

        early_action_capability,
        rcrc_movement_involvement,

        national_society_contact_name,
        national_society_contact_email,
        national_society_contact_title,
        national_society_contact_phone_number,
    } = simplifiedEapResponse ?? {};

    const {
        prioritized_hazard_and_impact: prev_prioritized_hazard_and_impact,
        risks_selected_protocols: prev_risks_selected_protocols,
        overall_objective_intervention: prev_overall_objective_intervention,
        potential_geographical_high_risk_areas: prev_potential_geographical_high_risk_areas,
        assisted_through_operation: prev_assisted_through_operation,
        trigger_statement: prev_trigger_statement,
        trigger_threshold_justification: prev_trigger_threshold_justification,
        next_step_towards_full_eap: prev_next_step_towards_full_eap,
        early_action_capability: prev_early_action_capability,
        rcrc_movement_involvement: prev_rcrc_movement_involvement,
    } = prevSimplifiedEapResponse ?? {};

    const eapTitle = [
        country_details?.name,
        admin2_details?.map(({ name }) => name).join(', '),
        disaster_type_details?.name,
    ].filter(isTruthyString).join(' | ');

    const previewReady = !eapRegistrationPending
        && !simplifiedEapPending
        && !prevSimplifiedEapPending;

    return (
        <PrintablePage
            heading={(
                <>
                    {strings.pageTitleSimplifiedText}
                    <br />
                    {strings.pageTitleEapText}
                </>
            )}
            description={eapTitle ?? '--'}
            dataReady={previewReady}
        >
            {isDefined(cover_image_file?.file) && (
                <PrintableContainer>
                    <Image
                        src={cover_image_file.file}
                        alt=""
                        caption={cover_image_file.caption}
                    />
                </PrintableContainer>
            )}
            <PrintableContainer>
                <div className={styles.metaItems}>
                    <PrintableDataDisplay
                        label={strings.sEapNoLabel}
                        value="--"
                        strongValue
                        variant="block"
                        withPadding
                        withBackground
                    />
                    <PrintableDataDisplay
                        label={strings.totalBudgetLabel}
                        value={total_budget}
                        valueType="number"
                        strongValue
                        variant="block"
                        withPadding
                        withBackground
                    />
                    <PrintableDataDisplay
                        label={strings.readinessLabel}
                        value={readiness_budget}
                        valueType="number"
                        strongValue
                        variant="block"
                        withPadding
                        withBackground
                    />
                    <PrintableDataDisplay
                        label={strings.prepositioningLabel}
                        value={pre_positioning_budget}
                        valueType="number"
                        strongValue
                        variant="block"
                        withPadding
                        withBackground
                    />
                    <PrintableDataDisplay
                        label={strings.earlyActionLabel}
                        value={early_action_budget}
                        valueType="number"
                        strongValue
                        variant="block"
                        withPadding
                        withBackground
                    />
                    <PrintableDataDisplay
                        label={strings.peopleTargetedLabel}
                        value={people_targeted}
                        valueType="number"
                        strongValue
                        variant="block"
                        withPadding
                        withBackground
                    />
                    <PrintableDataDisplay
                        label={strings.sEapTimeframeLabel}
                        value={seap_timeframe}
                        valueType="number"
                        strongValue
                        variant="block"
                        withPadding
                        withBackground
                    />
                    <PrintableDataDisplay
                        label={strings.sEapLeadTimeLabel}
                        value={seap_lead_time}
                        valueType="number"
                        strongValue
                        variant="block"
                        withPadding
                        withBackground
                    />
                    <PrintableDataDisplay
                        label={strings.operationalTimeframeLabel}
                        value={operational_timeframe}
                        valueType="number"
                        strongValue
                        variant="block"
                        withPadding
                        withBackground
                    />
                </div>
            </PrintableContainer>
            <PrintableContainer
                heading={strings.riskAnalysisHeading}
                headingLevel={2}
                breakBefore
            >
                <PrintableContainer
                    heading={strings.prioritizedHazardAndImpactHeading}
                    headingLevel={3}
                >
                    <PrintableDescription
                        value={prioritized_hazard_and_impact}
                        prevValue={prev_prioritized_hazard_and_impact}
                    />
                </PrintableContainer>
                <PrintableContainer
                    heading={strings.riskSelectedProtocolsHeading}
                    headingLevel={3}
                >
                    <PrintableDescription
                        value={risks_selected_protocols}
                        prevValue={prev_risks_selected_protocols}
                    />
                </PrintableContainer>
            </PrintableContainer>
            <PrintableContainer
                heading={strings.earlyActionInterventionHeading}
                headingLevel={2}
            >
                <PrintableContainer
                    heading={strings.overallObjectiveInterventionHeading}
                    headingLevel={3}
                >
                    <PrintableDescription
                        value={overall_objective_intervention}
                        prevValue={prev_overall_objective_intervention}
                    />
                </PrintableContainer>
                <PrintableContainer
                    heading={strings.potentialGeographicalHighRiskAreasHeading}
                    headingLevel={3}
                >
                    <PrintableDescription
                        value={potential_geographical_high_risk_areas}
                        prevValue={prev_potential_geographical_high_risk_areas}
                    />
                </PrintableContainer>
                <PrintableContainer
                    heading={strings.assistedThroughOperationHeading}
                    headingLevel={3}
                >
                    <PrintableDescription
                        value={assisted_through_operation}
                        prevValue={prev_assisted_through_operation}
                    />
                </PrintableContainer>
                <PrintableContainer
                    heading={strings.triggerStatementHeading}
                    headingLevel={3}
                >
                    <PrintableDescription
                        value={trigger_statement}
                        prevValue={prev_trigger_statement}
                    />
                </PrintableContainer>
                <PrintableContainer
                    heading={strings.triggerThresholdJustificationHeading}
                    headingLevel={3}
                >
                    <PrintableDescription
                        value={trigger_threshold_justification}
                        prevValue={prev_trigger_threshold_justification}
                    />
                </PrintableContainer>
                <PrintableContainer
                    heading={strings.nextStepsTowardsFullEapHeading}
                    headingLevel={3}
                >
                    <PrintableDescription
                        value={next_step_towards_full_eap}
                        prevValue={prev_next_step_towards_full_eap}
                    />
                </PrintableContainer>
            </PrintableContainer>
            <PrintableContainer
                heading={strings.plannedOperationsHeading}
                headingLevel={2}
            >
                {planned_operations?.map((operation) => (
                    <PrintableContainer
                        key={operation.id}
                        heading={eapSectorTitleMap?.[operation.sector]}
                        headingLevel={3}
                    >
                        <PrintableContainer headingLevel={4}>
                            <PrintableDataDisplay
                                label={strings.operationBudgetLabel}
                                value={operation.budget_per_sector}
                                valueType="number"
                                prefix="CHF "
                                strongLabel
                            />
                            <PrintableDataDisplay
                                label={strings.operationPeopleTargetedLabel}
                                value={operation.people_targeted}
                                valueType="number"
                                strongLabel
                            />
                        </PrintableContainer>
                        <PrintableContainer
                            heading={strings.indicatorsHeading}
                            headingLevel={4}
                        >
                            <div className={styles.indicatorItems}>
                                <Label
                                    // FIXME: create and use printable labels
                                    textSize="sm"
                                    strong
                                >
                                    {strings.indicatorTitleLabel}
                                </Label>
                                <Label
                                    textSize="sm"
                                    strong
                                >
                                    {strings.indicatorTargetLabel}
                                </Label>
                                {operation.indicators.map((indicator) => (
                                    <PrintableDataDisplay
                                        key={indicator.id}
                                        label={indicator.title}
                                        value={indicator.target}
                                        valueType="number"
                                        variant="contents"
                                        withBackground
                                        withPadding
                                        withoutLabelColon
                                    />
                                ))}
                            </div>
                        </PrintableContainer>
                        <PrintableContainer
                            heading={strings.readinessActivitiesHeading}
                            headingLevel={4}
                        >
                            <ol>
                                {operation.readiness_activities.map((activity) => (
                                    <li key={activity.id}>
                                        {activity.activity}
                                    </li>
                                ))}
                            </ol>
                        </PrintableContainer>
                        <PrintableContainer
                            heading={strings.prepositioningActivitiesHeading}
                            headingLevel={4}
                        >
                            <ol>
                                {operation.prepositioning_activities.map((activity) => (
                                    <li key={activity.id}>
                                        {activity.activity}
                                    </li>
                                ))}
                            </ol>
                        </PrintableContainer>
                        <PrintableContainer
                            heading={strings.earlyActionActivitiesHeading}
                            headingLevel={4}
                        >
                            <ol>
                                {operation.early_action_activities.map((activity) => (
                                    <li key={activity.id}>
                                        {activity.activity}
                                    </li>
                                ))}
                            </ol>
                        </PrintableContainer>
                    </PrintableContainer>
                ))}
            </PrintableContainer>
            <PrintableContainer
                heading={strings.enablingApproachesLabel}
                headingLevel={2}
            >
                {enable_approaches?.map((approach) => (
                    <PrintableContainer
                        key={approach.id}
                        heading={eapApproachTitleMap?.[approach.approach]}
                        headingLevel={3}
                    >
                        <PrintableContainer>
                            <PrintableDataDisplay
                                label={strings.operationBudgetLabel}
                                value={approach.budget_per_approach}
                                valueType="number"
                                prefix="CHF "
                                strongLabel
                            />
                        </PrintableContainer>
                        <PrintableContainer
                            heading={strings.indicatorsHeading}
                            headingLevel={4}
                        >
                            <div className={styles.indicatorItems}>
                                <Label
                                    // FIXME: create and use printable labels
                                    textSize="sm"
                                    strong
                                >
                                    {strings.indicatorTitleLabel}
                                </Label>
                                <Label
                                    textSize="sm"
                                    strong
                                >
                                    {strings.indicatorTargetLabel}
                                </Label>
                                {approach.indicators.map((indicator) => (
                                    <PrintableDataDisplay
                                        key={indicator.id}
                                        label={indicator.title}
                                        value={indicator.target}
                                        valueType="number"
                                        variant="contents"
                                        withBackground
                                        withPadding
                                        withoutLabelColon
                                    />
                                ))}
                            </div>
                        </PrintableContainer>
                        <PrintableContainer
                            heading={strings.readinessActivitiesHeading}
                            headingLevel={4}
                        >
                            <ol>
                                {approach.readiness_activities.map((activity) => (
                                    <li key={activity.id}>
                                        {activity.activity}
                                    </li>
                                ))}
                            </ol>
                        </PrintableContainer>
                        <PrintableContainer
                            heading={strings.prepositioningActivitiesHeading}
                            headingLevel={4}
                        >
                            <ol>
                                {approach.prepositioning_activities.map((activity) => (
                                    <li key={activity.id}>
                                        {activity.activity}
                                    </li>
                                ))}
                            </ol>
                        </PrintableContainer>
                        <PrintableContainer
                            heading={strings.earlyActionActivitiesHeading}
                            headingLevel={4}
                        >
                            <ol>
                                {approach.early_action_activities.map((activity) => (
                                    <li key={activity.id}>
                                        {activity.activity}
                                    </li>
                                ))}
                            </ol>
                        </PrintableContainer>
                    </PrintableContainer>
                ))}
            </PrintableContainer>
            <PrintableContainer
                heading={strings.conditionsToDeliverHeading}
                headingLevel={2}
            >
                <PrintableContainer
                    heading={strings.earlyActionCapacityHeading}
                    headingLevel={3}
                >
                    <PrintableDescription
                        value={early_action_capability}
                        prevValue={prev_early_action_capability}
                    />
                </PrintableContainer>
                <PrintableContainer
                    heading={strings.rcrcMovementInvolvementHeading}
                    headingLevel={3}
                >
                    <PrintableDescription
                        value={rcrc_movement_involvement}
                        prevValue={prev_rcrc_movement_involvement}
                    />
                </PrintableContainer>
            </PrintableContainer>
            {/*
            <PrintableContainer
                heading={strings.budgetHeading}
                headingLevel={2}
                // FIXME: add budget details
            >
                <PrintableDescription
                    value="Budget details"
                />
            </PrintableContainer>
            */}
            <PrintableContainer
                heading={strings.contactInformationHeading}
                headingLevel={2}
                // FIXME: add proper contact information
            >
                <PrintableContainer headingLevel={5}>
                    <Label
                        strong
                        textSize="sm"
                    >
                        {strings.contactInformationDescription}
                    </Label>
                </PrintableContainer>
                <PrintableContainer>
                    <PrintableDataDisplay
                        label="National Society Contact"
                        value={[
                            national_society_contact_name,
                            national_society_contact_title,
                            national_society_contact_email,
                            national_society_contact_phone_number,
                        ].filter(isTruthyString).join(', ')}
                        variant="block"
                        strongLabel
                    />
                </PrintableContainer>
            </PrintableContainer>
        </PrintablePage>
    );
}

Component.displayName = 'SimplifiedEapExport';
