import { useRef } from 'react';
import {
    useParams,
    useSearchParams,
} from 'react-router-dom';
import {
    Label,
    ListView,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { Image } from '@ifrc-go/ui/printable';
import {
    isDefined,
    isFalsyString,
    isNotDefined,
    isTruthyString,
    listToMap,
} from '@togglecorp/fujs';

import PrintableActivityOutput from '#components/domain/PrintableActivityOutput';
import PrintableContainer from '#components/printable/PrintableContainer';
import PrintableDataDisplay from '#components/printable/PrintableDataDisplay';
import PrintableDescription from '#components/printable/PrintableDescription';
import PrintableLabel from '#components/printable/PrintableLabel';
import PrintablePage from '#components/printable/PrintablePage';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import { useRequest } from '#utils/restRequest';

import PrintableContactOutput from './PrintableContactOutput';

import i18n from './i18n.json';
import styles from './styles.module.css';

/** @knipignore */
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const { eapId } = useParams<{ eapId: string }>();

    const { pending: eapRegistrationPending, response: eapRegistrationResponse } = useRequest({
        skip: isFalsyString(eapId),
        url: '/api/v2/eap-registration/{id}/',
        pathVariables: isTruthyString(eapId)
            ? {
                id: Number(eapId),
            }
            : undefined,
    });

    const mainRef = useRef<HTMLDivElement>(null);
    const [searchParams] = useSearchParams();

    const version = searchParams.get('version') ?? undefined;
    const withDiff = searchParams.get('diff')?.toLowerCase() === 'true';

    const strings = useTranslation(i18n);

    const selectedSimplifiedEap = eapRegistrationResponse?.simplified_eap_details?.find(
        (simplifiedEap) => String(simplifiedEap.version) === String(version),
    );

    const latestSimplifiedEapId = eapRegistrationResponse?.latest_simplified_eap ?? undefined;
    const latestSimplifiedEap = eapRegistrationResponse?.simplified_eap_details?.find(
        (simplifiedEap) => simplifiedEap.id === latestSimplifiedEapId,
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

    const { pending: simplifiedEapPending, response: simplifiedEapResponse } = useRequest({
        skip: isNotDefined(currentSimplifiedEapId),
        url: '/api/v2/simplified-eap/{id}/',
        pathVariables: isDefined(currentSimplifiedEapId)
            ? {
                id: Number(currentSimplifiedEapId),
            }
            : undefined,
    });

    const {
        pending: prevSimplifiedEapPending,
        response: prevSimplifiedEapResponse,
    } = useRequest({
        skip: isNotDefined(prevSimplifiedEap) || !withDiff,
        url: '/api/v2/simplified-eap/{id}/',
        pathVariables: isDefined(prevSimplifiedEap)
            ? {
                id: Number(prevSimplifiedEap.id),
            }
            : undefined,
    });

    const { response: apCodeOptions } = useRequest({
        url: '/api/v2/eap/options/',
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

    const { disaster_type_details, country_details } = eapRegistrationResponse ?? {};

    const {
        cover_image_file,
        admin2_details,

        partner_contacts,

        total_budget,
        readiness_budget,
        pre_positioning_budget,
        seap_timeframe,
        early_action_budget,

        prioritized_hazard_and_impact,
        risks_selected_protocols,

        selected_early_actions,
        overall_objective_intervention,
        potential_geographical_high_risk_areas,
        assisted_through_operation,
        trigger_statement,
        trigger_threshold_justification,
        next_step_towards_full_eap,
        planned_operations,
        enabling_approaches,

        early_action_capability,
        rcrc_movement_involvement,

        people_targeted,
        seap_lead_time,
        seap_lead_timeframe_unit,
    } = simplifiedEapResponse ?? {};

    const {
        // FIXME: implement diff
        // cover_image_file: prev_cover_image_file,
        // FIXME: implement diff
        // admin2_details: prev_admin2_details,

        partner_contacts: prev_partner_contacts,

        total_budget: prev_total_budget,
        readiness_budget: prev_readiness_budget,
        pre_positioning_budget: prev_pre_positioning_budget,
        early_action_budget: prev_early_action_budget,
        seap_timeframe: prev_seap_timeframe,

        prioritized_hazard_and_impact: prev_prioritized_hazard_and_impact,
        risks_selected_protocols: prev_risks_selected_protocols,

        selected_early_actions: prev_selected_early_actions,
        overall_objective_intervention: prev_overall_objective_intervention,
        potential_geographical_high_risk_areas:
        prev_potential_geographical_high_risk_areas,
        assisted_through_operation: prev_assisted_through_operation,
        trigger_statement: prev_trigger_statement,
        trigger_threshold_justification: prev_trigger_threshold_justification,
        next_step_towards_full_eap: prev_next_step_towards_full_eap,
        planned_operations: prev_planned_operations,
        enabling_approaches: prev_enabling_approaches,

        early_action_capability: prev_early_action_capability,
        rcrc_movement_involvement: prev_rcrc_movement_involvement,

        people_targeted: prev_people_targeted,
        seap_lead_time: prev_seap_lead_time,
        seap_lead_timeframe_unit: prev_seap_lead_timeframe_unit,
    } = prevSimplifiedEapResponse ?? {};

    const prevPartnerContactMap = listToMap(
        prev_partner_contacts,
        ({ id }) => id!,
    );

    const prevPlannedOperationMap = listToMap(
        prev_planned_operations,
        ({ sector }) => sector,
    );

    const prevEnablingApproachesMap = listToMap(
        prev_enabling_approaches,
        ({ approach }) => approach,
    );

    // FIXME: consider diff view
    const eapTitle = [
        country_details?.name,
        admin2_details?.map(({ name }) => name).join(', '),
        disaster_type_details?.name,
    ]
        .filter(isTruthyString)
        .join(' | ');

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
            mainRef={mainRef}
        >
            {/* FIXME: consider diff view */}
            {isDefined(cover_image_file?.file) && (
                <PrintableContainer>
                    <Image
                        src={cover_image_file.file}
                        alt={cover_image_file.caption ?? '--'}
                        caption={cover_image_file.caption}
                    />
                </PrintableContainer>
            )}
            <PrintableContainer>
                <ListView layout="grid" spacing="2xs">
                    <PrintableDataDisplay
                        label={strings.sEapNoLabel}
                        value="--"
                        prevValue="--"
                        strongValue
                        valueType="text"
                        variant="block"
                        withPadding
                        withBackground
                        withDiff={withDiff}
                    />
                    <PrintableDataDisplay
                        label={strings.sEapTimeframeLabel}
                        value={seap_timeframe}
                        prevValue={prev_seap_timeframe}
                        valueType="number"
                        strongValue
                        variant="block"
                        withPadding
                        withBackground
                        withDiff={withDiff}
                    />
                </ListView>
            </PrintableContainer>
            <PrintableContainer
                heading={strings.contactInformationHeading}
                headingLevel={3}
            >
                <PrintableContainer headingLevel={4}>
                    <PrintableDescription value={strings.contactInformationDescription} />
                </PrintableContainer>
                <PrintableContainer heading={strings.nationalHeading} headingLevel={4}>
                    <PrintableContactOutput
                        label={strings.nationalSocietyContactHeading}
                        namePrefix="national_society_contact"
                        data={simplifiedEapResponse}
                        prevData={prevSimplifiedEapResponse}
                        withDiff={withDiff}
                    />
                    <PrintableContainer
                        headingLevel={6}
                        heading={strings.partnerNationalSocietyContactHeading}
                    >
                        {partner_contacts?.map((partnerContact) => {
                            const prevPartnerContact = prevPartnerContactMap
                                ?.[partnerContact.previous_id!];
                            return (
                                <PrintableDescription
                                    key={partnerContact.id}
                                    value={[
                                        partnerContact.name,
                                        partnerContact.title,
                                        partnerContact.email,
                                        partnerContact.phone_number,
                                    ].filter(isTruthyString).join(', ')}
                                    prevValue={[
                                        prevPartnerContact?.name,
                                        prevPartnerContact?.title,
                                        prevPartnerContact?.email,
                                        prevPartnerContact?.phone_number,
                                    ].filter(isTruthyString).join(', ')}
                                    withDiff={withDiff}
                                />
                            );
                        })}
                    </PrintableContainer>
                </PrintableContainer>
                <PrintableContainer
                    heading={strings.delegationHeading}
                    headingLevel={4}
                >
                    <PrintableContactOutput
                        label={strings.delegationFocalPointLabel}
                        namePrefix="ifrc_delegation_focal_point"
                        data={simplifiedEapResponse}
                        prevData={prevSimplifiedEapResponse}
                        withDiff={withDiff}
                    />
                    <PrintableContactOutput
                        label={strings.delegationHeadLabel}
                        namePrefix="ifrc_head_of_delegation"
                        data={simplifiedEapResponse}
                        prevData={prevSimplifiedEapResponse}
                        withDiff={withDiff}
                    />
                </PrintableContainer>
                <PrintableContainer
                    heading={strings.regionalGlobalHeading}
                    headingLevel={4}
                >
                    <PrintableContactOutput
                        label={strings.drefFocalPointLabel}
                        namePrefix="dref_focal_point"
                        data={simplifiedEapResponse}
                        prevData={prevSimplifiedEapResponse}
                        withDiff={withDiff}
                    />
                    <PrintableContactOutput
                        label={strings.regionalFocalPointLabel}
                        namePrefix="ifrc_regional_focal_point"
                        data={simplifiedEapResponse}
                        prevData={prevSimplifiedEapResponse}
                        withDiff={withDiff}
                    />
                    <PrintableContactOutput
                        label={strings.regionalOpsManager}
                        namePrefix="ifrc_regional_ops_manager"
                        data={simplifiedEapResponse}
                        prevData={prevSimplifiedEapResponse}
                        withDiff={withDiff}
                    />
                    <PrintableContactOutput
                        label={strings.regionalHeadLabel}
                        namePrefix="ifrc_regional_head_dcc"
                        data={simplifiedEapResponse}
                        prevData={prevSimplifiedEapResponse}
                        withDiff={withDiff}
                    />
                    <PrintableContactOutput
                        label={strings.globalOpsCoordinator}
                        namePrefix="ifrc_global_ops_coordinator"
                        data={simplifiedEapResponse}
                        prevData={prevSimplifiedEapResponse}
                        withDiff={withDiff}
                    />
                </PrintableContainer>
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
                        withDiff={withDiff}
                    />
                </PrintableContainer>
                <PrintableContainer
                    heading={strings.riskSelectedProtocolsHeading}
                    headingLevel={3}
                >
                    <PrintableDescription
                        value={risks_selected_protocols}
                        prevValue={prev_risks_selected_protocols}
                        withDiff={withDiff}
                    />
                </PrintableContainer>
                <PrintableContainer
                    heading={strings.selectedEarlyActionsHeading}
                    headingLevel={3}
                >
                    <PrintableDescription
                        value={selected_early_actions}
                        prevValue={prev_selected_early_actions}
                        withDiff={withDiff}
                    />
                </PrintableContainer>
            </PrintableContainer>
            <PrintableContainer
                heading={strings.earlyActionInterventionHeading}
                headingLevel={2}
            >
                <PrintableContainer headingLevel={3}>
                    <ListView layout="grid" spacing="2xs" numPreferredGridColumns={3}>
                        <PrintableDataDisplay
                            label={strings.peopleTargetedHeading}
                            value={people_targeted}
                            prevValue={prev_people_targeted}
                            valueType="number"
                            withDiff={withDiff}
                            variant="block"
                            withBackground
                            withPadding
                            strongValue
                        />
                        <PrintableDataDisplay
                            label={strings.sleadTimeHeading}
                            value={seap_lead_time}
                            prevValue={prev_seap_lead_time}
                            valueType="number"
                            withDiff={withDiff}
                            variant="block"
                            withBackground
                            withPadding
                            strongValue
                        />
                        <PrintableDataDisplay
                            label={strings.operationTimeframeHeading}
                            value={seap_lead_timeframe_unit}
                            prevValue={prev_seap_lead_timeframe_unit}
                            valueType="number"
                            withDiff={withDiff}
                            variant="block"
                            withBackground
                            withPadding
                            strongValue
                        />
                    </ListView>
                </PrintableContainer>
                <PrintableContainer
                    heading={strings.overallObjectiveInterventionHeading}
                    headingLevel={3}
                >
                    <PrintableDescription
                        value={overall_objective_intervention}
                        prevValue={prev_overall_objective_intervention}
                        withDiff={withDiff}
                    />
                </PrintableContainer>
                <PrintableContainer
                    heading={strings.potentialGeographicalHighRiskAreasHeading}
                    headingLevel={3}
                >
                    <PrintableDescription
                        value={potential_geographical_high_risk_areas}
                        prevValue={prev_potential_geographical_high_risk_areas}
                        withDiff={withDiff}
                    />
                </PrintableContainer>
                <PrintableContainer
                    heading={strings.assistedThroughOperationHeading}
                    headingLevel={3}
                >
                    <PrintableDescription
                        value={assisted_through_operation}
                        prevValue={prev_assisted_through_operation}
                        withDiff={withDiff}
                    />
                </PrintableContainer>
                <PrintableContainer
                    heading={strings.triggerStatementHeading}
                    headingLevel={3}
                >
                    <PrintableDescription
                        value={trigger_statement}
                        prevValue={prev_trigger_statement}
                        withDiff={withDiff}
                    />
                </PrintableContainer>
                <PrintableContainer
                    heading={strings.triggerThresholdJustificationHeading}
                    headingLevel={3}
                >
                    <PrintableDescription
                        value={trigger_threshold_justification}
                        prevValue={prev_trigger_threshold_justification}
                        withDiff={withDiff}
                    />
                </PrintableContainer>
                <PrintableContainer
                    heading={strings.nextStepsTowardsFullEapHeading}
                    headingLevel={3}
                >
                    <PrintableDescription
                        value={next_step_towards_full_eap}
                        prevValue={prev_next_step_towards_full_eap}
                        withDiff={withDiff}
                    />
                </PrintableContainer>
            </PrintableContainer>
            <PrintableContainer
                heading={strings.plannedOperationsHeading}
                headingLevel={2}
            >
                {planned_operations?.map((operation) => {
                    const prevOperation = prevPlannedOperationMap?.[operation.sector];

                    const apCodeSectorValue = apCodeOptions?.sector_ap_codes
                        ?.[operation.sector]?.join(', ');

                    const prevApCodeSectorValue = isDefined(prevOperation)
                        ? apCodeOptions?.sector_ap_codes
                            ?.[prevOperation?.sector]?.join(', ')
                        : '-';

                    const prevOperationIndicatorMap = listToMap(
                        prevOperation?.indicators,
                        ({ id }) => id!,
                    );
                    const prevReadinessActivitiesMap = listToMap(
                        prevOperation?.readiness_activities,
                        ({ id }) => id!,
                    );
                    const prevPrepositioningActivitiesMap = listToMap(
                        prevOperation?.prepositioning_activities,
                        ({ id }) => id!,
                    );
                    const prevEarlyActionActivitiesMap = listToMap(
                        prevOperation?.early_action_activities,
                        ({ id }) => id!,
                    );

                    return (
                        <PrintableContainer
                            key={operation.sector}
                            heading={eapSectorTitleMap?.[operation.sector]}
                            headingLevel={3}
                        >
                            <PrintableContainer headingLevel={4}>
                                <ListView
                                    layout="grid"
                                    numPreferredGridColumns={3}
                                    spacing="2xs"
                                >
                                    <PrintableDataDisplay
                                        label={strings.operationBudgetLabel}
                                        value={operation.budget_per_sector}
                                        prevValue={prevOperation?.budget_per_sector}
                                        valueType="number"
                                        prefix="CHF "
                                        strongLabel
                                        withDiff={withDiff}
                                    />
                                    <PrintableDataDisplay
                                        label={strings.operationPeopleTargetedLabel}
                                        value={operation.people_targeted}
                                        prevValue={prevOperation?.people_targeted}
                                        valueType="number"
                                        strongLabel
                                        withDiff={withDiff}
                                    />
                                    <PrintableDataDisplay
                                        label={strings.apCodeLabel}
                                        value={apCodeSectorValue}
                                        prevValue={prevApCodeSectorValue}
                                        valueType="text"
                                        strongLabel
                                        withDiff={withDiff}
                                    />
                                </ListView>
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
                                    <Label textSize="sm" strong>
                                        {strings.indicatorTargetLabel}
                                    </Label>
                                    {operation.indicators.map((indicator) => {
                                        const prevIndicator = isDefined(indicator.previous_id)
                                            ? prevOperationIndicatorMap?.[indicator.previous_id]
                                            : undefined;

                                        return (
                                            <PrintableDataDisplay
                                                key={indicator.id}
                                                label={(
                                                    <PrintableLabel
                                                        value={indicator.title}
                                                        prevValue={prevIndicator?.title}
                                                        withDiff={withDiff}
                                                    />
                                                )}
                                                value={indicator.target}
                                                prevValue={prevIndicator?.target}
                                                valueType="number"
                                                variant="contents"
                                                withBackground
                                                withPadding
                                                withoutLabelColon
                                                withDiff={withDiff}
                                            />
                                        );
                                    })}
                                </div>
                            </PrintableContainer>
                            <PrintableContainer
                                heading={strings.readinessActivitiesHeading}
                                headingLevel={4}
                            >
                                <div className={styles.activityItems}>
                                    {operation.readiness_activities.map((activity, index) => {
                                        const prevActivity = prevReadinessActivitiesMap
                                            ?.[activity.previous_id!];
                                        return (
                                            <PrintableActivityOutput
                                                key={activity.id}
                                                activity={activity}
                                                prevActivity={prevActivity}
                                                index={index}
                                                withDiff={withDiff}
                                            />
                                        );
                                    })}
                                </div>
                            </PrintableContainer>
                            <PrintableContainer
                                heading={strings.prepositioningActivitiesHeading}
                                headingLevel={4}
                            >
                                <div className={styles.activityItems}>
                                    {operation.prepositioning_activities.map(
                                        (activity, index) => {
                                            const prevActivity = prevPrepositioningActivitiesMap
                                                ?.[activity.previous_id!];
                                            return (
                                                <PrintableActivityOutput
                                                    key={activity.id}
                                                    activity={activity}
                                                    prevActivity={prevActivity}
                                                    index={index}
                                                    withDiff={withDiff}
                                                />
                                            );
                                        },
                                    )}
                                </div>
                            </PrintableContainer>
                            <PrintableContainer
                                heading={strings.earlyActionActivitiesHeading}
                                headingLevel={4}
                            >
                                <div className={styles.activityItems}>
                                    {operation.early_action_activities.map((activity, index) => {
                                        const prevActivity = prevEarlyActionActivitiesMap
                                            ?.[activity.previous_id!];
                                        return (
                                            <PrintableActivityOutput
                                                key={activity.id}
                                                activity={activity}
                                                prevActivity={prevActivity}
                                                index={index}
                                                withDiff={withDiff}
                                            />
                                        );
                                    })}
                                </div>
                            </PrintableContainer>
                        </PrintableContainer>
                    );
                })}
            </PrintableContainer>
            <PrintableContainer
                heading={strings.enablingApproachesLabel}
                headingLevel={2}
            >
                {enabling_approaches?.map((approach) => {
                    const prevApproach = prevEnablingApproachesMap?.[approach.approach];

                    const apCodeApproachValue = apCodeOptions?.approach_ap_codes
                        ?.[approach.approach]?.join(', ');

                    const prevApCodeApproachValue = isDefined(prevApproach)
                        ? apCodeOptions?.approach_ap_codes
                            ?.[prevApproach.approach]?.join(', ')
                        : '-';

                    const prevApproachIndicatorMap = listToMap(
                        prevApproach?.indicators,
                        ({ id }) => id!,
                    );
                    const prevReadinessActivitiesMap = listToMap(
                        prevApproach?.readiness_activities,
                        ({ id }) => id!,
                    );
                    const prevPrepositioningActivitiesMap = listToMap(
                        prevApproach?.prepositioning_activities,
                        ({ id }) => id!,
                    );
                    const prevEarlyActionActivitiesMap = listToMap(
                        prevApproach?.early_action_activities,
                        ({ id }) => id!,
                    );

                    return (
                        <PrintableContainer
                            key={approach.id}
                            heading={eapApproachTitleMap?.[approach.approach]}
                            headingLevel={3}
                        >
                            <PrintableContainer headingLevel={4}>
                                <ListView
                                    layout="grid"
                                    numPreferredGridColumns={3}
                                    spacing="2xs"
                                >
                                    <PrintableDataDisplay
                                        label={strings.operationBudgetLabel}
                                        value={approach.budget_per_approach}
                                        prevValue={prevApproach?.budget_per_approach}
                                        valueType="number"
                                        prefix="CHF "
                                        strongLabel
                                        withDiff={withDiff}
                                    />
                                    <PrintableDataDisplay
                                        label={strings.apCodeLabel}
                                        value={apCodeApproachValue}
                                        prevValue={prevApCodeApproachValue}
                                        valueType="text"
                                        strongLabel
                                        withDiff={withDiff}
                                    />
                                </ListView>
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
                                    <Label textSize="sm" strong>
                                        {strings.indicatorTargetLabel}
                                    </Label>
                                    {approach.indicators.map((indicator) => {
                                        const prevIndicator = prevApproachIndicatorMap
                                            ?.[indicator.previous_id!];
                                        return (
                                            <PrintableDataDisplay
                                                key={indicator.id}
                                                label={(
                                                    <PrintableLabel
                                                        value={indicator.title}
                                                        prevValue={prevIndicator?.title}
                                                        withDiff={withDiff}
                                                    />
                                                )}
                                                value={indicator.target}
                                                prevValue={prevIndicator?.target}
                                                valueType="number"
                                                variant="contents"
                                                withBackground
                                                withPadding
                                                withoutLabelColon
                                                withDiff={withDiff}
                                            />
                                        );
                                    })}
                                </div>
                            </PrintableContainer>
                            <PrintableContainer
                                heading={strings.readinessActivitiesHeading}
                                headingLevel={4}
                            >
                                <div className={styles.activityItems}>
                                    {approach.readiness_activities.map((activity, index) => {
                                        const prevActivity = prevReadinessActivitiesMap
                                            ?.[activity.previous_id!];
                                        return (
                                            <PrintableActivityOutput
                                                key={activity.id}
                                                activity={activity}
                                                prevActivity={prevActivity}
                                                index={index}
                                                withDiff={withDiff}
                                            />
                                        );
                                    })}
                                </div>
                            </PrintableContainer>
                            <PrintableContainer
                                heading={strings.prepositioningActivitiesHeading}
                                headingLevel={4}
                            >
                                <div className={styles.activityItems}>
                                    {approach.prepositioning_activities.map((activity, index) => {
                                        const prevActivity = prevPrepositioningActivitiesMap
                                            ?.[activity.previous_id!];
                                        return (
                                            <PrintableActivityOutput
                                                key={activity.id}
                                                activity={activity}
                                                prevActivity={prevActivity}
                                                index={index}
                                                withDiff={withDiff}
                                            />
                                        );
                                    })}
                                </div>
                            </PrintableContainer>
                            <PrintableContainer
                                heading={strings.earlyActionActivitiesHeading}
                                headingLevel={4}
                            >
                                <div className={styles.activityItems}>
                                    {approach.early_action_activities.map((activity, index) => {
                                        const prevActivity = prevEarlyActionActivitiesMap
                                            ?.[activity.previous_id!];
                                        return (
                                            <PrintableActivityOutput
                                                key={activity.id}
                                                activity={activity}
                                                prevActivity={prevActivity}
                                                index={index}
                                                withDiff={withDiff}
                                            />
                                        );
                                    })}
                                </div>
                            </PrintableContainer>
                        </PrintableContainer>
                    );
                })}
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
                        withDiff={withDiff}
                    />
                </PrintableContainer>
                <PrintableContainer
                    heading={strings.rcrcMovementInvolvementHeading}
                    headingLevel={3}
                >
                    <PrintableDescription
                        value={rcrc_movement_involvement}
                        prevValue={prev_rcrc_movement_involvement}
                        withDiff={withDiff}
                    />
                </PrintableContainer>
            </PrintableContainer>
            <PrintableContainer heading={strings.budgetHeading} headingLevel={2}>
                <ListView
                    layout="grid"
                    numPreferredGridColumns={4}
                    minGridColumnSize="10rem"
                    spacing="2xs"
                >
                    <PrintableDataDisplay
                        label={strings.totalBudgetHeading}
                        value={total_budget}
                        prevValue={prev_total_budget}
                        valueType="number"
                        prefix="CHF "
                        strongLabel
                        variant="block"
                        withPadding
                        withBackground
                        withDiff={withDiff}
                    />
                    <PrintableDataDisplay
                        label={strings.readinessHeading}
                        value={readiness_budget}
                        prevValue={prev_readiness_budget}
                        valueType="number"
                        prefix="CHF "
                        strongLabel
                        variant="block"
                        withPadding
                        withBackground
                        withDiff={withDiff}
                    />
                    <PrintableDataDisplay
                        label={strings.prepositioningHeading}
                        value={pre_positioning_budget}
                        prevValue={prev_pre_positioning_budget}
                        valueType="number"
                        prefix="CHF "
                        strongLabel
                        variant="block"
                        withPadding
                        withBackground
                        withDiff={withDiff}
                    />
                    <PrintableDataDisplay
                        label={strings.earlyActionHeading}
                        value={early_action_budget}
                        prevValue={prev_early_action_budget}
                        valueType="number"
                        prefix="CHF "
                        strongLabel
                        variant="block"
                        withPadding
                        withBackground
                        withDiff={withDiff}
                    />
                </ListView>
            </PrintableContainer>
        </PrintablePage>
    );
}

Component.displayName = 'SimplifiedEapExport';
