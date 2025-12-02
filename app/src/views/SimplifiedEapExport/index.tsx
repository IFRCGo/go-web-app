import { useParams } from 'react-router-dom';
import { Label } from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    DescriptionText,
    Image,
} from '@ifrc-go/ui/printable';
import {
    isDefined,
    isFalsyString,
    isNotDefined,
    isTruthyString,
    listToMap,
} from '@togglecorp/fujs';

import PrintableContainer from '#components/printable/PrintableContainer';
import PrintableDataDisplay from '#components/printable/PrintableDataDisplay';
import PrintablePage from '#components/printable/PrintablePage';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import { useRequest } from '#utils/restRequest';

import i18n from './i18n.json';
import styles from './styles.module.css';

// FIXME: indicators should come from the server (for each sector)
const sampleIndicators = [
    {
        id: 1,
        title: '# households would have improved access to drinking water in case of Karnali flooding.',
        target: 420,
    },
    {
        id: 2,
        title: '# households would have improved access to drinking water in case of Babai flooding.',
        target: 640,
    },
    {
        id: 3,
        title: '# households would have improved access to drinking water in case of West Rapti Flooding',
        target: 440,
    },
];

/** @knipignore */
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const { eapId } = useParams<{ eapId: string }>();

    const strings = useTranslation(i18n);

    const { response: eapRegistrationResponse } = useRequest({
        skip: isFalsyString(eapId),
        url: '/api/v2/eap-registration/{id}/',
        pathVariables: isTruthyString(eapId) ? {
            id: Number(eapId),
        } : undefined,
    });

    const latestSimplifiedEap = eapRegistrationResponse?.simplified_eap_details[0];

    const { response: simplifiedEapResponse } = useRequest({
        skip: isNotDefined(latestSimplifiedEap?.id),
        url: '/api/v2/simplified-eap/{id}/',
        pathVariables: isDefined(latestSimplifiedEap?.id) ? {
            id: Number(latestSimplifiedEap.id),
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
        cover_image_details,

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

    return (
        <PrintablePage
            heading={(
                <>
                    Simplified
                    <br />
                    Early Action Protocol
                </>
            )}
            description="Nepal, Western Terai | Flood"
        >
            {isDefined(cover_image_details?.file) && (
                <PrintableContainer>
                    <Image
                        src={cover_image_details.file}
                        alt=""
                        caption={cover_image_details.caption}
                    />
                </PrintableContainer>
            )}
            <PrintableContainer>
                <div className={styles.metaItems}>
                    <PrintableDataDisplay
                        label={strings.sEapNoLabel}
                        value="sEAP2024NP01"
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
                    <DescriptionText>
                        {prioritized_hazard_and_impact}
                    </DescriptionText>
                </PrintableContainer>
                <PrintableContainer
                    heading={strings.riskSelectedProtocolsHeading}
                    headingLevel={3}
                >
                    <DescriptionText>
                        {risks_selected_protocols}
                    </DescriptionText>
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
                    <DescriptionText>
                        {overall_objective_intervention}
                    </DescriptionText>
                </PrintableContainer>
                <PrintableContainer
                    heading={strings.potentialGeographicalHighRiskAreasHeading}
                    headingLevel={3}
                >
                    <DescriptionText>
                        {potential_geographical_high_risk_areas}
                    </DescriptionText>
                </PrintableContainer>
                <PrintableContainer
                    heading={strings.assistedThroughOperationHeading}
                    headingLevel={3}
                >
                    <DescriptionText>
                        {assisted_through_operation}
                    </DescriptionText>
                </PrintableContainer>
                <PrintableContainer
                    heading={strings.triggerStatementHeading}
                    headingLevel={3}
                >
                    <DescriptionText>
                        {trigger_statement}
                    </DescriptionText>
                </PrintableContainer>
                <PrintableContainer
                    heading={strings.triggerThresholdJustificationHeading}
                    headingLevel={3}
                >
                    <DescriptionText>
                        {trigger_threshold_justification}
                    </DescriptionText>
                </PrintableContainer>
                <PrintableContainer
                    heading={strings.nextStepsTowardsFullEapHeading}
                    headingLevel={3}
                >
                    <DescriptionText>
                        {next_step_towards_full_eap}
                    </DescriptionText>
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
                                {sampleIndicators.map((indicator) => (
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
                            <PrintableDataDisplay
                                label={strings.operationPeopleTargetedLabel}
                                value={approach.indicator_target}
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
                                {sampleIndicators.map((indicator) => (
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
                    <DescriptionText>
                        {early_action_capability}
                    </DescriptionText>
                </PrintableContainer>
                <PrintableContainer
                    heading={strings.rcrcMovementInvolvementHeading}
                    headingLevel={3}
                >
                    <DescriptionText>
                        {rcrc_movement_involvement}
                    </DescriptionText>
                </PrintableContainer>
            </PrintableContainer>
            <PrintableContainer
                heading={strings.budgetHeading}
                headingLevel={2}
            >
                Budget details
            </PrintableContainer>
            <PrintableContainer
                heading={strings.contactInformationHeading}
                headingLevel={2}
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
                        ].join(', ')}
                        variant="block"
                        strongLabel
                    />
                </PrintableContainer>
            </PrintableContainer>
        </PrintablePage>
    );
}

Component.displayName = 'SimplifiedEapExport';
