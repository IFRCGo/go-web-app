import {
    useCallback,
    useMemo,
} from 'react';
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

import Link from '#components/Link';
import PrintableContainer from '#components/printable/PrintableContainer';
import PrintableDataDisplay from '#components/printable/PrintableDataDisplay';
import PrintableDescription from '#components/printable/PrintableDescription';
import PrintablePage from '#components/printable/PrintablePage';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import {
    type GoApiResponse,
    useRequest,
} from '#utils/restRequest';

import i18n from './i18n.json';
import styles from './styles.module.css';

type Sector = NonNullable<
    NonNullable<
        GoApiResponse<'/api/v2/full-eap/{id}/'>['planned_operations']
    >[number]
>['sector'];

/** @knipignore */
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const { eapId } = useParams<{ eapId: string }>();

    const [searchParams] = useSearchParams();

    const strings = useTranslation(i18n);

    const version = searchParams.get('version') ?? undefined;
    const showDiff = searchParams.get('diff') ?? undefined;

    const { pending: eapRegistrationPending, response: eapRegistrationResponse } = useRequest({
        skip: isFalsyString(eapId),
        url: '/api/v2/eap-registration/{id}/',
        pathVariables: isTruthyString(eapId)
            ? {
                id: Number(eapId),
            }
            : undefined,
    });

    const selectedFullEap = eapRegistrationResponse?.full_eap_details?.find(
        (fullEap) => String(fullEap.version) === String(version),
    );

    const latestFullEapVersion = eapRegistrationResponse?.latest_full_eap;
    const latestFullEap = eapRegistrationResponse?.full_eap_details?.find(
        (fullEap) => fullEap.version === latestFullEapVersion,
    );

    const currentFullEap = selectedFullEap ?? latestFullEap;
    const currentFullEapId = currentFullEap?.id;

    const prevFullEapVersion = isDefined(currentFullEap?.version) && currentFullEap.version > 1
        ? currentFullEap.version - 1
        : undefined;

    const prevFullEap = eapRegistrationResponse?.full_eap_details.find(
        (fullEap) => fullEap.version === prevFullEapVersion,
    );

    const { pending: fullEapPending, response: fullEapResponse } = useRequest({
        skip: isNotDefined(currentFullEapId),
        url: '/api/v2/full-eap/{id}/',
        pathVariables: isDefined(currentFullEapId)
            ? {
                id: Number(currentFullEapId),
            }
            : undefined,
    });

    const { pending: prevFullEapPending, response: prevFullEapResponse } = useRequest({
        skip: isNotDefined(prevFullEap) || showDiff?.toLowerCase() !== 'true',
        url: '/api/v2/full-eap/{id}/',
        pathVariables: isDefined(prevFullEap)
            ? {
                id: Number(prevFullEap.id),
            }
            : undefined,
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

    const { disaster_type_details, country_details, approved_at } = eapRegistrationResponse ?? {};

    const {
        cover_image_file,
        objective,

        national_society_contact_name,
        national_society_contact_email,
        national_society_contact_title,
        national_society_contact_phone_number,

        partner_ns_name,
        partner_ns_email,
        partner_ns_title,
        partner_ns_phone_number,

        ifrc_delegation_focal_point_name,
        ifrc_delegation_focal_point_email,
        ifrc_delegation_focal_point_title,
        ifrc_delegation_focal_point_phone_number,

        ifrc_head_of_delegation_name,
        ifrc_head_of_delegation_email,
        ifrc_head_of_delegation_title,
        ifrc_head_of_delegation_phone_number,

        dref_focal_point_name,
        dref_focal_point_email,
        dref_focal_point_title,
        dref_focal_point_phone_number,

        ifrc_regional_focal_point_name,
        ifrc_regional_focal_point_email,
        ifrc_regional_focal_point_title,
        ifrc_regional_focal_point_phone_number,

        ifrc_regional_ops_manager_name,
        ifrc_regional_ops_manager_email,
        ifrc_regional_ops_manager_title,
        ifrc_regional_ops_manager_phone_number,

        ifrc_regional_head_dcc_name,
        ifrc_regional_head_dcc_email,
        ifrc_regional_head_dcc_title,
        ifrc_regional_head_dcc_phone_number,

        ifrc_global_ops_coordinator_name,
        ifrc_global_ops_coordinator_email,
        ifrc_global_ops_coordinator_title,
        ifrc_global_ops_coordinator_phone_number,

        admin2_details,
        is_worked_with_government,
        worked_with_government_description,
        key_actors,
        is_technical_working_groups,
        technically_working_group_title,
        technical_working_groups_in_place_description,

        hazard_selection,
        hazard_selection_images,
        exposed_element_and_vulnerability_factor,
        exposed_element_and_vulnerability_factor_images,
        prioritized_impact,
        prioritized_impact_images,
        prioritized_impacts,
        risk_analysis_source_of_information,

        trigger_statement,
        trigger_statement_source_of_information,
        lead_time,
        forecast_selection,
        forecast_selection_images,
        forecast_table_file_details,
        definition_and_justification_impact_level,
        definition_and_justification_impact_level_images,
        identification_of_the_intervention_area,
        identification_of_the_intervention_area_images,
        trigger_model_source_of_information,

        early_actions,
        early_action_selection_process,
        early_action_selection_process_images,
        theory_of_change_table_file_details,
        evidence_base,
        evidence_base_source_of_information,

        planned_operations,
        enable_approaches,
        usefulness_of_actions,
        feasibility,

        early_action_implementation_process,
        early_action_implementation_images,
        trigger_activation_system,
        trigger_activation_system_images,
        people_targeted,
        selection_of_target_population,
        stop_mechanism,
        activation_process_source_of_information,

        meal,

        operational_administrative_capacity,
        strategies_and_plans,
        advance_financial_capacity,

        total_budget,
        budget_description,
        budget_file_details,
        readiness_budget,
        readiness_cost_description,
        pre_positioning_budget,
        prepositioning_cost_description,
        early_action_budget,
        early_action_cost_description,
        eap_endorsement,
    } = fullEapResponse ?? {};

    const {
        objective: prev_objective,

        national_society_contact_name: prev_national_society_contact_name,
        national_society_contact_email: prev_national_society_contact_email,
        national_society_contact_title: prev_national_society_contact_title,
        national_society_contact_phone_number:
        prev_national_society_contact_phone_number,

        partner_ns_name: prev_partner_ns_name,
        partner_ns_email: prev_partner_ns_email,
        partner_ns_title: prev_partner_ns_title,
        partner_ns_phone_number: prev_partner_ns_phone_number,

        ifrc_delegation_focal_point_name: prev_ifrc_delegation_focal_point_name,
        ifrc_delegation_focal_point_email: prev_ifrc_delegation_focal_point_email,
        ifrc_delegation_focal_point_title: prev_ifrc_delegation_focal_point_title,
        ifrc_delegation_focal_point_phone_number:
        prev_ifrc_delegation_focal_point_phone_number,

        ifrc_head_of_delegation_name: prev_ifrc_head_of_delegation_name,
        ifrc_head_of_delegation_email: prev_ifrc_head_of_delegation_email,
        ifrc_head_of_delegation_title: prev_ifrc_head_of_delegation_title,
        ifrc_head_of_delegation_phone_number:
        prev_ifrc_head_of_delegation_phone_number,

        dref_focal_point_name: prev_dref_focal_point_name,
        dref_focal_point_email: prev_dref_focal_point_email,
        dref_focal_point_title: prev_dref_focal_point_title,
        dref_focal_point_phone_number: prev_dref_focal_point_phone_number,

        ifrc_regional_focal_point_name: prev_ifrc_regional_focal_point_name,
        ifrc_regional_focal_point_email: prev_ifrc_regional_focal_point_email,
        ifrc_regional_focal_point_title: prev_ifrc_regional_focal_point_title,
        ifrc_regional_focal_point_phone_number:
        prev_ifrc_regional_focal_point_phone_number,

        ifrc_regional_ops_manager_name: prev_ifrc_regional_ops_manager_name,
        ifrc_regional_ops_manager_email: prev_ifrc_regional_ops_manager_email,
        ifrc_regional_ops_manager_title: prev_ifrc_regional_ops_manager_title,
        ifrc_regional_ops_manager_phone_number:
        prev_ifrc_regional_ops_manager_phone_number,

        ifrc_regional_head_dcc_name: prev_ifrc_regional_head_dcc_name,
        ifrc_regional_head_dcc_email: prev_ifrc_regional_head_dcc_email,
        ifrc_regional_head_dcc_title: prev_ifrc_regional_head_dcc_title,
        ifrc_regional_head_dcc_phone_number:
        prev_ifrc_regional_head_dcc_phone_number,

        ifrc_global_ops_coordinator_name: prev_ifrc_global_ops_coordinator_name,
        ifrc_global_ops_coordinator_email: prev_ifrc_global_ops_coordinator_email,
        ifrc_global_ops_coordinator_title: prev_ifrc_global_ops_coordinator_title,
        ifrc_global_ops_coordinator_phone_number:
        prev_ifrc_global_ops_coordinator_phone_number,

        is_worked_with_government: prev_is_worked_with_government,
        worked_with_government_description: prev_worked_with_government_description,
        key_actors: prev_key_actors,
        is_technical_working_groups: prev_is_technical_working_groups,
        technically_working_group_title: prev_technically_working_group_title,
        technical_working_groups_in_place_description:
        prev_technical_working_groups_in_place_description,

        hazard_selection: prev_hazard_selection,
        exposed_element_and_vulnerability_factor:
        prev_exposed_element_and_vulnerability_factor,
        prioritized_impact: prev_prioritized_impact,
        prioritized_impacts: prev_prioritized_impacts,
        risk_analysis_source_of_information:
        prev_risk_analysis_source_of_information,

        trigger_statement: prev_trigger_statement,
        trigger_statement_source_of_information:
        prev_trigger_statement_source_of_information,
        lead_time: prev_lead_time,
        forecast_selection: prev_forecast_selection,
        definition_and_justification_impact_level:
        prev_definition_and_justification_impact_level,
        identification_of_the_intervention_area:
        prev_identification_of_the_intervention_area,
        trigger_model_source_of_information:
        prev_trigger_model_source_of_information,

        early_actions: prev_early_actions,
        early_action_selection_process: prev_early_action_selection_process,
        evidence_base: prev_evidence_base,
        evidence_base_source_of_information:
        prev_evidence_base_source_of_information,

        planned_operations: prev_planned_operations,
        enable_approaches: prev_enable_approaches,
        usefulness_of_actions: prev_usefulness_of_actions,
        feasibility: prev_feasibility,

        early_action_implementation_process:
        prev_early_action_implementation_process,
        trigger_activation_system: prev_trigger_activation_system,
        people_targeted: prev_people_targeted,
        selection_of_target_population: prev_selection_of_target_population,
        stop_mechanism: prev_stop_mechanism,
        activation_process_source_of_information:
        prev_activation_process_source_of_information,

        meal: prev_meal,

        operational_administrative_capacity:
        prev_operational_administrative_capacity,
        strategies_and_plans: prev_strategies_and_plans,
        advance_financial_capacity: prev_advance_financial_capacity,

        total_budget: prev_total_budget,
        budget_description: prev_budget_description,
        readiness_budget: prev_readiness_budget,
        readiness_cost_description: prev_readiness_cost_description,
        pre_positioning_budget: prev_pre_positioning_budget,
        prepositioning_cost_description: prev_prepositioning_cost_description,
        early_action_budget: prev_early_action_budget,
        early_action_cost_description: prev_early_action_cost_description,
        eap_endorsement: prev_eap_endorsement,
    } = prevFullEapResponse ?? {};

    const eapTitle = [
        country_details?.name,
        admin2_details?.map(({ name }) => name).join(', '),
        disaster_type_details?.name,
    ]
        .filter(isTruthyString)
        .join(' | ');

    const prevKeyActorsMapping = useMemo(
        () => listToMap(prev_key_actors ?? [], (actor) => actor.national_society),
        [prev_key_actors],
    );

    const prevRiskSourceInformationMapping = useMemo(
        () => listToMap(
            prev_risk_analysis_source_of_information ?? [],
            (actor) => actor.id!,
        ),
        [prev_risk_analysis_source_of_information],
    );

    const prevTriggerStatementSourceInformationMapping = useMemo(
        () => listToMap(
            prev_trigger_statement_source_of_information ?? [],
            (actor) => actor.id!,
        ),
        [prev_trigger_statement_source_of_information],
    );

    const prevTriggerModelSourceInformationMapping = useMemo(
        () => listToMap(
            prev_trigger_model_source_of_information ?? [],
            (actor) => actor.id!,
        ),
        [prev_trigger_model_source_of_information],
    );

    const prevEvidenceBaseSourceInformationMapping = useMemo(
        () => listToMap(
            prev_evidence_base_source_of_information ?? [],
            (actor) => actor.id!,
        ),
        [prev_evidence_base_source_of_information],
    );

    const prevPlannedOperationsMapping = useMemo(
        () => listToMap(prev_planned_operations ?? [], (actor) => actor.sector!),
        [prev_planned_operations],
    );

    const prevPlannedIndicatorsMapping = useCallback(
        (sector: Sector) => listToMap(
            prevPlannedOperationsMapping[sector]?.indicators ?? [],
            (activity) => activity.id!,
        ),
        [prevPlannedOperationsMapping],
    );

    const prevPlannedReadinessMapping = useCallback(
        (sector: Sector) => listToMap(
            prevPlannedOperationsMapping[sector]?.readiness_activities ?? [],
            (activity) => activity.id!,
        ),
        [prevPlannedOperationsMapping],
    );

    const prevPlannedPrepositioningMapping = useCallback(
        (sector: Sector) => listToMap(
            prevPlannedOperationsMapping[sector]?.prepositioning_activities ?? [],
            (activity) => activity.id!,
        ),
        [prevPlannedOperationsMapping],
    );

    const prevPlannedEarlyActionMapping = useCallback(
        (sector: Sector) => listToMap(
            prevPlannedOperationsMapping[sector]?.early_action_activities ?? [],
            (activity) => activity.id!,
        ),
        [prevPlannedOperationsMapping],
    );

    const prevEnableApproachesMapping = useMemo(
        () => listToMap(prev_enable_approaches ?? [], (approach) => approach.id!),
        [prev_enable_approaches],
    );

    const prevEnableIndicatorsMapping = useCallback(
        (id: number) => listToMap(
            prevEnableApproachesMapping[id]?.indicators ?? [],
            (activity) => activity.id!,
        ),
        [prevEnableApproachesMapping],
    );

    const prevEnableReadinessMapping = useCallback(
        (id: number) => listToMap(
            prevEnableApproachesMapping[id]?.readiness_activities ?? [],
            (activity) => activity.id!,
        ),
        [prevEnableApproachesMapping],
    );

    const prevEnablePrepositioningMapping = useCallback(
        (id: number) => listToMap(
            prevEnableApproachesMapping[id]?.prepositioning_activities ?? [],
            (activity) => activity.id!,
        ),
        [prevEnableApproachesMapping],
    );

    const prevEnableEarlyActionsMapping = useCallback(
        (id: number) => listToMap(
            prevEnableApproachesMapping[id]?.early_action_activities ?? [],
            (activity) => activity.id!,
        ),
        [prevEnableApproachesMapping],
    );

    const prevActivationSourceInformationMapping = useMemo(
        () => listToMap(
            prev_activation_process_source_of_information ?? [],
            (actor) => actor.id!,
        ),
        [prev_activation_process_source_of_information],
    );

    const prevPrioritizedImpactsMapping = useMemo(
        () => listToMap(prev_prioritized_impacts ?? [], (impact) => impact.id!),
        [prev_prioritized_impacts],
    );

    const prevEarlyActionsMapping = useMemo(
        () => listToMap(prev_early_actions ?? [], (action) => action.id!),
        [prev_early_actions],
    );

    const previewReady = !eapRegistrationPending && !fullEapPending && !prevFullEapPending;

    return (
        <PrintablePage
            heading={(
                <>
                    {strings.pageTitleFullText}
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
                        alt={cover_image_file.caption ?? '--'}
                        caption={cover_image_file.caption}
                    />
                </PrintableContainer>
            )}
            <PrintableContainer>
                <div className={styles.metaItems}>
                    <div className={styles.metaChildrenItems}>
                        <PrintableDataDisplay
                            label={strings.eapNoLabel}
                            value={1234}
                            valueType="number"
                            strongValue
                            variant="block"
                            withPadding
                            withBackground
                        />
                        <PrintableDataDisplay
                            label={strings.eapTimeframeLabel}
                            value="5 years"
                            valueType="text"
                            strongValue
                            variant="block"
                            withPadding
                            withBackground
                        />
                        <PrintableDataDisplay
                            label={strings.eapApprovedLabel}
                            value={approved_at}
                            valueType="text"
                            strongValue
                            variant="block"
                            withPadding
                            withBackground
                        />
                    </div>
                    <PrintableDataDisplay
                        label={strings.objectiveLabel}
                        value={objective}
                        prevValue={prev_objective}
                        valueType="text"
                        strongValue
                        variant="block"
                        withPadding
                        withBackground
                    />
                </div>
            </PrintableContainer>
            <PrintableContainer
                heading={strings.contactInformationHeading}
                headingLevel={2}
            >
                <PrintableContainer headingLevel={5}>
                    <Label strong textSize="sm">
                        {strings.contactInformationDescription}
                    </Label>
                </PrintableContainer>
                <PrintableContainer>
                    <Label strong textSize="sm">
                        {strings.nationalLabel}
                    </Label>
                    <PrintableDataDisplay
                        label={strings.nationalSocietyContactLabel}
                        value={[
                            national_society_contact_name,
                            national_society_contact_title,
                            national_society_contact_email,
                            national_society_contact_phone_number,
                        ]
                            .filter(isTruthyString)
                            .join(', ')}
                        prevValue={[
                            prev_national_society_contact_name,
                            prev_national_society_contact_title,
                            prev_national_society_contact_email,
                            prev_national_society_contact_phone_number,
                        ]
                            .filter(isTruthyString)
                            .join(', ')}
                        variant="inline"
                        strongLabel
                    />
                    <PrintableDataDisplay
                        label={strings.partnerNationalSocietyContactLabel}
                        value={[
                            partner_ns_name,
                            partner_ns_email,
                            partner_ns_title,
                            partner_ns_phone_number,
                        ]
                            .filter(isTruthyString)
                            .join(', ')}
                        prevValue={[
                            prev_partner_ns_name,
                            prev_partner_ns_email,
                            prev_partner_ns_title,
                            prev_partner_ns_phone_number,
                        ]
                            .filter(isTruthyString)
                            .join(', ')}
                        variant="inline"
                        strongLabel
                    />
                </PrintableContainer>
                <PrintableContainer>
                    <Label strong textSize="sm">
                        {strings.delegationLabel}
                        Delegation
                    </Label>
                    <PrintableDataDisplay
                        label={strings.delegationFocalLabel}
                        value={[
                            ifrc_delegation_focal_point_name,
                            ifrc_delegation_focal_point_email,
                            ifrc_delegation_focal_point_title,
                            ifrc_delegation_focal_point_phone_number,
                        ]
                            .filter(isTruthyString)
                            .join(', ')}
                        prevValue={[
                            prev_ifrc_delegation_focal_point_name,
                            prev_ifrc_delegation_focal_point_email,
                            prev_ifrc_delegation_focal_point_title,
                            prev_ifrc_delegation_focal_point_phone_number,
                        ]
                            .filter(isTruthyString)
                            .join(', ')}
                        variant="inline"
                        strongLabel
                    />
                    <PrintableDataDisplay
                        label={strings.delegationHeadLabel}
                        value={[
                            ifrc_head_of_delegation_name,
                            ifrc_head_of_delegation_title,
                            ifrc_head_of_delegation_email,
                            ifrc_head_of_delegation_phone_number,
                        ]
                            .filter(isTruthyString)
                            .join(', ')}
                        prevValue={[
                            prev_ifrc_head_of_delegation_name,
                            prev_ifrc_head_of_delegation_title,
                            prev_ifrc_head_of_delegation_email,
                            prev_ifrc_head_of_delegation_phone_number,
                        ]
                            .filter(isTruthyString)
                            .join(', ')}
                        variant="inline"
                        strongLabel
                    />
                </PrintableContainer>
                <PrintableContainer>
                    <Label strong textSize="sm">
                        {strings.regionalGlobalLabel}
                    </Label>
                    <PrintableDataDisplay
                        label={strings.drefFocalLabel}
                        value={[
                            dref_focal_point_name,
                            dref_focal_point_email,
                            dref_focal_point_title,
                            dref_focal_point_phone_number,
                        ]
                            .filter(isTruthyString)
                            .join(', ')}
                        prevValue={[
                            prev_dref_focal_point_name,
                            prev_dref_focal_point_email,
                            prev_dref_focal_point_title,
                            prev_dref_focal_point_phone_number,
                        ]
                            .filter(isTruthyString)
                            .join(', ')}
                        variant="inline"
                        strongLabel
                    />
                    <PrintableDataDisplay
                        label={strings.regionalFocalLabel}
                        value={[
                            ifrc_regional_focal_point_name,
                            ifrc_regional_focal_point_email,
                            ifrc_regional_focal_point_title,
                            ifrc_regional_focal_point_phone_number,
                        ]
                            .filter(isTruthyString)
                            .join(', ')}
                        prevValue={[
                            prev_ifrc_regional_focal_point_name,
                            prev_ifrc_regional_focal_point_email,
                            prev_ifrc_regional_focal_point_title,
                            prev_ifrc_regional_focal_point_phone_number,
                        ]
                            .filter(isTruthyString)
                            .join(', ')}
                        variant="inline"
                        strongLabel
                    />
                    <PrintableDataDisplay
                        label={strings.regionalOpsLabel}
                        value={[
                            ifrc_regional_ops_manager_name,
                            ifrc_regional_ops_manager_email,
                            ifrc_regional_ops_manager_title,
                            ifrc_regional_ops_manager_phone_number,
                        ]
                            .filter(isTruthyString)
                            .join(', ')}
                        prevValue={[
                            prev_ifrc_regional_ops_manager_name,
                            prev_ifrc_regional_ops_manager_email,
                            prev_ifrc_regional_ops_manager_title,
                            prev_ifrc_regional_ops_manager_phone_number,
                        ]
                            .filter(isTruthyString)
                            .join(', ')}
                        variant="inline"
                        strongLabel
                    />
                    <PrintableDataDisplay
                        label={strings.regionalHeadLabel}
                        value={[
                            ifrc_regional_head_dcc_name,
                            ifrc_regional_head_dcc_email,
                            ifrc_regional_head_dcc_title,
                            ifrc_regional_head_dcc_phone_number,
                        ]
                            .filter(isTruthyString)
                            .join(', ')}
                        prevValue={[
                            prev_ifrc_regional_head_dcc_name,
                            prev_ifrc_regional_head_dcc_email,
                            prev_ifrc_regional_head_dcc_title,
                            prev_ifrc_regional_head_dcc_phone_number,
                        ]
                            .filter(isTruthyString)
                            .join(', ')}
                        variant="inline"
                        strongLabel
                    />
                    <PrintableDataDisplay
                        label={strings.globalOpsLabel}
                        value={[
                            ifrc_global_ops_coordinator_name,
                            ifrc_global_ops_coordinator_email,
                            ifrc_global_ops_coordinator_title,
                            ifrc_global_ops_coordinator_phone_number,
                        ]
                            .filter(isTruthyString)
                            .join(', ')}
                        prevValue={[
                            prev_ifrc_global_ops_coordinator_name,
                            prev_ifrc_global_ops_coordinator_email,
                            prev_ifrc_global_ops_coordinator_title,
                            prev_ifrc_global_ops_coordinator_phone_number,
                        ]
                            .filter(isTruthyString)
                            .join(', ')}
                        variant="inline"
                        strongLabel
                    />
                </PrintableContainer>
            </PrintableContainer>
            <PrintableContainer
                heading={strings.stakeholdersHeading}
                headingLevel={2}
            >
                <PrintableContainer>
                    <PrintableDataDisplay
                        label={strings.workWithGovernmentLabel}
                        value={is_worked_with_government}
                        prevValue={prev_is_worked_with_government}
                        valueType="boolean"
                        variant="inline"
                        strongLabel
                    />
                </PrintableContainer>
                <PrintableContainer>
                    <PrintableDataDisplay
                        label={strings.workWithGovernmentDescription}
                        value={worked_with_government_description}
                        prevValue={prev_worked_with_government_description}
                        valueType="text"
                        withoutLabelColon
                        variant="block"
                        strongLabel
                    />
                </PrintableContainer>
                <PrintableContainer heading={strings.keyActorsHeading} headingLevel={6}>
                    {key_actors?.map((actor) => (
                        <>
                            <PrintableDataDisplay
                                label={strings.partnerLabel}
                                value={actor.national_society_details.name}
                                prevValue={
                                    prevKeyActorsMapping[actor.national_society]
                                        ?.national_society_details.society_name
                                }
                                valueType="text"
                                variant="inline"
                                strongLabel
                            />
                            <PrintableDataDisplay
                                label={strings.descriptionLabel}
                                value={actor.description}
                                prevValue={
                                    prevKeyActorsMapping[actor.national_society]?.description
                                }
                                valueType="text"
                                variant="inline"
                                strongLabel
                            />
                        </>
                    ))}
                </PrintableContainer>
                <PrintableContainer
                    heading={strings.technicalWorkingHeading}
                    headingLevel={6}
                >
                    <PrintableContainer>
                        <PrintableDataDisplay
                            label={strings.isTechnicalLabel}
                            value={is_technical_working_groups}
                            prevValue={prev_is_technical_working_groups}
                            valueType="boolean"
                            variant="inline"
                            strongLabel
                        />
                    </PrintableContainer>
                    <PrintableContainer>
                        <PrintableDataDisplay
                            label={strings.titleLabel}
                            value={technically_working_group_title}
                            prevValue={prev_technically_working_group_title}
                            valueType="text"
                            withoutLabelColon
                            variant="inline"
                            strongLabel
                        />
                    </PrintableContainer>
                    <PrintableContainer>
                        <PrintableDataDisplay
                            label={strings.workingDescriptionLabel}
                            value={technical_working_groups_in_place_description}
                            prevValue={prev_technical_working_groups_in_place_description}
                            valueType="text"
                            withoutLabelColon
                            variant="block"
                            strongLabel
                        />
                    </PrintableContainer>
                </PrintableContainer>
            </PrintableContainer>
            <PrintableContainer
                heading={strings.riskAnalysisHeading}
                headingLevel={2}
            >
                <PrintableContainer>
                    <PrintableDataDisplay
                        label={strings.hazardSelectionHeading}
                        value={hazard_selection}
                        prevValue={prev_hazard_selection}
                        valueType="text"
                        withoutLabelColon
                        variant="block"
                        strongLabel
                    />
                </PrintableContainer>
                <PrintableContainer>
                    {hazard_selection_images?.map((hazard) => (
                        <Image src={hazard.file} caption={hazard.caption} />
                    ))}
                </PrintableContainer>
                <PrintableContainer>
                    <PrintableDataDisplay
                        label={strings.exposedElementsLabel}
                        value={exposed_element_and_vulnerability_factor}
                        prevValue={prev_exposed_element_and_vulnerability_factor}
                        valueType="text"
                        withoutLabelColon
                        variant="block"
                        strongLabel
                    />
                </PrintableContainer>
                <PrintableContainer>
                    <div className={styles.imageItems}>
                        {exposed_element_and_vulnerability_factor_images?.map((element) => (
                            <Image src={element.file} caption={element.caption} />
                        ))}
                    </div>
                </PrintableContainer>
                <PrintableContainer
                    heading={strings.prioritizedImpactHeading}
                    headingLevel={6}
                >
                    <PrintableContainer>
                        <Label strong textSize="sm">
                            {strings.listPrioritizedImpactLabel}
                        </Label>
                        <ol>
                            {prioritized_impacts?.map((impact) => (
                                <li key={impact.id}>
                                    <PrintableDescription
                                        value={impact.impact}
                                        prevValue={
                                            prevPrioritizedImpactsMapping[impact.id!]?.impact
                                        }
                                    />
                                </li>
                            ))}
                        </ol>
                    </PrintableContainer>
                </PrintableContainer>
                <PrintableContainer>
                    <PrintableDataDisplay
                        label={strings.descriptionLabel}
                        value={prioritized_impact}
                        prevValue={prev_prioritized_impact}
                        valueType="text"
                        withoutLabelColon
                        variant="block"
                        strongLabel
                    />
                </PrintableContainer>
                <PrintableContainer>
                    <div className={styles.imageItems}>
                        {prioritized_impact_images?.map((element) => (
                            <Image src={element.file} caption={element.caption} />
                        ))}
                    </div>
                </PrintableContainer>
                <PrintableContainer>
                    <Label strong textSize="sm">
                        {strings.sourceInformationLabel}
                    </Label>
                    <div className={styles.sources}>
                        {risk_analysis_source_of_information?.map((source) => (
                            <>
                                <PrintableDataDisplay
                                    label={strings.nameLabel}
                                    value={source.source_name}
                                    prevValue={
                                        prevRiskSourceInformationMapping[source.id!]?.source_name
                                    }
                                    valueType="text"
                                    variant="inline"
                                    strongLabel
                                />
                                <PrintableDataDisplay
                                    label={strings.linkLabel}
                                    value={source.source_link}
                                    prevValue={
                                        prevRiskSourceInformationMapping[source.id!]?.source_link
                                    }
                                    valueType="text"
                                    variant="inline"
                                    strongLabel
                                />
                            </>
                        ))}
                    </div>
                </PrintableContainer>
            </PrintableContainer>
            <PrintableContainer
                heading={strings.triggerModelHeading}
                headingLevel={2}
            >
                <PrintableContainer>
                    <PrintableDataDisplay
                        label={strings.triggerStatementLabel}
                        value={trigger_statement}
                        prevValue={prev_trigger_statement}
                        valueType="text"
                        withoutLabelColon
                        variant="block"
                        strongLabel
                    />
                </PrintableContainer>
                <PrintableContainer>
                    <PrintableDataDisplay
                        label={strings.leadTimeLabel}
                        value={lead_time}
                        prevValue={prev_lead_time}
                        valueType="number"
                        variant="inline"
                        strongLabel
                    />
                </PrintableContainer>
                <PrintableContainer>
                    <Label strong textSize="sm">
                        {strings.sourceForecastLabel}
                    </Label>
                    <div className={styles.sources}>
                        {trigger_statement_source_of_information?.map((trigger) => (
                            <>
                                <PrintableDataDisplay
                                    label={strings.nameLabel}
                                    value={trigger.source_name}
                                    prevValue={
                                        prevTriggerStatementSourceInformationMapping[trigger.id!]
                                            ?.source_name
                                    }
                                    valueType="text"
                                    variant="inline"
                                    strongLabel
                                />
                                <PrintableDataDisplay
                                    label={strings.linkLabel}
                                    value={trigger.source_link}
                                    prevValue={
                                        prevTriggerStatementSourceInformationMapping[trigger.id!]
                                            ?.source_link
                                    }
                                    valueType="text"
                                    variant="inline"
                                    strongLabel
                                />
                            </>
                        ))}
                    </div>
                </PrintableContainer>
                <PrintableContainer>
                    <PrintableDataDisplay
                        label={strings.forecastSelectionLabel}
                        value={forecast_selection}
                        prevValue={prev_forecast_selection}
                        valueType="text"
                        withoutLabelColon
                        variant="block"
                        strongLabel
                    />
                </PrintableContainer>
                <PrintableContainer>
                    <div className={styles.imageItems}>
                        {forecast_selection_images?.map((element) => (
                            <Image src={element.file} caption={element.caption} />
                        ))}
                    </div>
                </PrintableContainer>
                <PrintableContainer>
                    <Link href={forecast_table_file_details?.file} external withUnderline>
                        {strings.downloadForecastTableLabel}
                    </Link>
                </PrintableContainer>
                <PrintableContainer>
                    <PrintableDataDisplay
                        label={strings.definitionJustificationLabel}
                        value={definition_and_justification_impact_level}
                        prevValue={prev_definition_and_justification_impact_level}
                        valueType="text"
                        withoutLabelColon
                        variant="block"
                        strongLabel
                    />
                </PrintableContainer>
                <PrintableContainer>
                    <div className={styles.imageItems}>
                        {definition_and_justification_impact_level_images?.map(
                            (element) => (
                                <Image src={element.file} caption={element.caption} />
                            ),
                        )}
                    </div>
                </PrintableContainer>
                <PrintableContainer>
                    <PrintableDataDisplay
                        label={strings.identificationInterventionLabel}
                        value={identification_of_the_intervention_area}
                        prevValue={prev_identification_of_the_intervention_area}
                        valueType="text"
                        withoutLabelColon
                        variant="block"
                        strongLabel
                    />
                </PrintableContainer>
                <PrintableContainer>
                    <div className={styles.imageItems}>
                        {identification_of_the_intervention_area_images?.map((element) => (
                            <Image src={element.file} caption={element.caption} />
                        ))}
                    </div>
                </PrintableContainer>
                <PrintableContainer>
                    <Label strong textSize="sm">
                        {strings.sourceInformationLabel}
                    </Label>
                    <div className={styles.sources}>
                        {trigger_model_source_of_information?.map((trigger) => (
                            <>
                                <PrintableDataDisplay
                                    label={strings.nameLabel}
                                    value={trigger.source_name}
                                    prevValue={
                                        prevTriggerModelSourceInformationMapping[trigger.id!]
                                            ?.source_name
                                    }
                                    valueType="text"
                                    variant="inline"
                                    strongLabel
                                />
                                <PrintableDataDisplay
                                    label={strings.linkLabel}
                                    value={trigger.source_link}
                                    prevValue={
                                        prevTriggerModelSourceInformationMapping[trigger.id!]
                                            ?.source_link
                                    }
                                    valueType="text"
                                    variant="inline"
                                    strongLabel
                                />
                            </>
                        ))}
                    </div>
                </PrintableContainer>
            </PrintableContainer>
            <PrintableContainer
                heading={strings.selectionOfActionHeading}
                headingLevel={2}
            >
                <PrintableContainer
                    heading={strings.selectionOfActionHeading}
                    headingLevel={6}
                >
                    <Label strong textSize="sm">
                        {strings.listEarlyActionsLabel}
                    </Label>
                    <ol>
                        {early_actions?.map((action) => (
                            <li key={action.id}>
                                <PrintableDescription
                                    value={action.action}
                                    prevValue={prevEarlyActionsMapping[action.id!]?.action}
                                />
                            </li>
                        ))}
                    </ol>
                </PrintableContainer>
                <PrintableContainer>
                    <PrintableDataDisplay
                        label={strings.earlySelectionLabel}
                        value={early_action_selection_process}
                        prevValue={prev_early_action_selection_process}
                        valueType="text"
                        withoutLabelColon
                        variant="block"
                        strongLabel
                    />
                </PrintableContainer>
                <PrintableContainer>
                    <div className={styles.imageItems}>
                        {early_action_selection_process_images?.map((element) => (
                            <Image src={element.file} caption={element.caption} />
                        ))}
                    </div>
                </PrintableContainer>
                <PrintableContainer>
                    <Link
                        href={theory_of_change_table_file_details?.file}
                        external
                        withUnderline
                    >
                        {strings.downloadTheoryChangeTableLabel}
                    </Link>
                </PrintableContainer>
                <PrintableContainer>
                    <PrintableDataDisplay
                        label={strings.evidenceBaseLabel}
                        value={evidence_base}
                        prevValue={prev_evidence_base}
                        valueType="text"
                        withoutLabelColon
                        variant="block"
                        strongLabel
                    />
                </PrintableContainer>
                <PrintableContainer>
                    <Label strong textSize="sm">
                        {strings.sourceInformationLabel}
                    </Label>
                    <div className={styles.sources}>
                        {evidence_base_source_of_information?.map((trigger) => (
                            <>
                                <PrintableDataDisplay
                                    label={strings.nameLabel}
                                    value={trigger.source_name}
                                    prevValue={
                                        prevEvidenceBaseSourceInformationMapping[trigger.id!]
                                            ?.source_name
                                    }
                                    valueType="text"
                                    variant="inline"
                                    strongLabel
                                />
                                <PrintableDataDisplay
                                    label={strings.linkLabel}
                                    value={trigger.source_link}
                                    prevValue={
                                        prevEvidenceBaseSourceInformationMapping[trigger.id!]
                                            ?.source_link
                                    }
                                    valueType="text"
                                    variant="inline"
                                    strongLabel
                                />
                            </>
                        ))}
                    </div>
                </PrintableContainer>
                <PrintableContainer>
                    <PrintableDataDisplay
                        label={strings.usefullnessActionsLabel}
                        value={usefulness_of_actions}
                        prevValue={prev_usefulness_of_actions}
                        valueType="text"
                        withoutLabelColon
                        variant="block"
                        strongLabel
                    />
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
                                    prevValue={
                                        prevPlannedOperationsMapping[operation.sector]
                                            ?.budget_per_sector
                                    }
                                    valueType="number"
                                    prefix="CHF "
                                    strongLabel
                                />
                                <PrintableDataDisplay
                                    label={strings.operationPeopleTargetedLabel}
                                    value={operation.people_targeted}
                                    prevValue={
                                        prevPlannedOperationsMapping[operation.sector]
                                            ?.people_targeted
                                    }
                                    valueType="number"
                                    strongLabel
                                />
                                <PrintableDataDisplay
                                    label="AP Code"
                                    value={operation.ap_code}
                                    prevValue={
                                        prevPlannedOperationsMapping[operation.sector]?.ap_code
                                    }
                                    valueType="number"
                                    strongLabel
                                />
                            </PrintableContainer>
                            <PrintableContainer
                                heading={strings.indicatorsHeading}
                                headingLevel={4}
                            >
                                <div className={styles.indicatorItems}>
                                    <Label textSize="sm" strong>
                                        {strings.indicatorTitleLabel}
                                    </Label>
                                    <Label textSize="sm" strong>
                                        {strings.indicatorTargetLabel}
                                    </Label>
                                    {operation.indicators.map((indicator) => (
                                        <PrintableDataDisplay
                                            key={indicator.id}
                                            label={indicator.title}
                                            value={indicator.target}
                                            prevValue={
                                                prevPlannedIndicatorsMapping(operation.sector)[
                                                    indicator.id!
                                                ]?.target
                                            }
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
                                <div className={styles.indicatorItems}>
                                    {operation.readiness_activities.map((activity, index) => (
                                        <PrintableDataDisplay
                                            key={activity.id}
                                            label={`${index + 1}. ${activity.activity}`}
                                            value={`${activity.time_value} ${activity.timeframe_display}`}
                                            prevValue={`${prevPlannedReadinessMapping(operation.sector)[activity.id!]?.time_value} ${prevPlannedReadinessMapping(operation.sector)[activity.id!]?.timeframe_display}`}
                                            valueType="text"
                                            variant="contents"
                                            withBackground
                                            withPadding
                                            withoutLabelColon
                                        />
                                    ))}
                                </div>
                            </PrintableContainer>
                            <PrintableContainer
                                heading={strings.prepositioningActivitiesHeading}
                                headingLevel={4}
                            >
                                <div className={styles.indicatorItems}>
                                    {operation.prepositioning_activities.map(
                                        (activity, index) => (
                                            <PrintableDataDisplay
                                                key={activity.id}
                                                label={`${index + 1}. ${activity.activity}`}
                                                value={`${activity.time_value} ${activity.timeframe_display}`}
                                                prevValue={`${prevPlannedPrepositioningMapping(operation.sector)[activity.id!]?.time_value} ${prevPlannedPrepositioningMapping(operation.sector)[activity.id!]?.timeframe_display}`}
                                                valueType="text"
                                                variant="contents"
                                                withBackground
                                                withPadding
                                                withoutLabelColon
                                            />
                                        ),
                                    )}
                                </div>
                            </PrintableContainer>
                            <PrintableContainer
                                heading={strings.earlyActionActivitiesHeading}
                                headingLevel={4}
                            >
                                <div className={styles.indicatorItems}>
                                    {operation.early_action_activities.map((activity, index) => (
                                        <PrintableDataDisplay
                                            key={activity.id}
                                            label={`${index + 1}. ${activity.activity}`}
                                            value={`${activity.time_value} ${activity.timeframe_display}`}
                                            prevValue={`${prevPlannedEarlyActionMapping(operation.sector)[activity.id!]?.time_value} ${prevPlannedEarlyActionMapping(operation.sector)[activity.id!]?.timeframe_display}`}
                                            valueType="text"
                                            variant="contents"
                                            withBackground
                                            withPadding
                                            withoutLabelColon
                                        />
                                    ))}
                                </div>
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
                                    prevValue={
                                        prevEnableApproachesMapping[approach.id!]
                                            ?.budget_per_approach
                                    }
                                    valueType="number"
                                    prefix="CHF "
                                    strongLabel
                                />
                            </PrintableContainer>
                            <PrintableDataDisplay
                                label="AP Code"
                                value={approach.ap_code}
                                prevValue={prevEnableApproachesMapping[approach.id!]?.ap_code}
                                valueType="number"
                                strongLabel
                            />
                            <PrintableContainer
                                heading={strings.indicatorsHeading}
                                headingLevel={4}
                            >
                                <div className={styles.indicatorItems}>
                                    <Label textSize="sm" strong>
                                        {strings.indicatorTitleLabel}
                                    </Label>
                                    <Label textSize="sm" strong>
                                        {strings.indicatorTargetLabel}
                                    </Label>
                                    {approach.indicators.map((indicator) => (
                                        <PrintableDataDisplay
                                            key={indicator.id}
                                            label={indicator.title}
                                            value={indicator.target}
                                            prevValue={prevEnableIndicatorsMapping(approach
                                                .id!)[indicator.id!]?.target}
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
                                <div className={styles.indicatorItems}>
                                    {approach.readiness_activities.map((activity, index) => (
                                        <PrintableDataDisplay
                                            key={activity.id}
                                            label={`${index + 1}. ${activity.activity}`}
                                            value={`${activity.time_value} ${activity.timeframe_display}`}
                                            prevValue={`${prevEnableReadinessMapping(activity.id!)[activity.id!]?.time_value} ${prevEnableReadinessMapping(activity.id!)[activity.id!]?.timeframe_display}`}
                                            valueType="text"
                                            variant="contents"
                                            withBackground
                                            withPadding
                                            withoutLabelColon
                                        />
                                    ))}
                                </div>
                            </PrintableContainer>
                            <PrintableContainer
                                heading={strings.prepositioningActivitiesHeading}
                                headingLevel={4}
                            >
                                <div className={styles.indicatorItems}>
                                    {approach.prepositioning_activities.map((activity, index) => (
                                        <PrintableDataDisplay
                                            key={activity.id}
                                            label={`${index + 1}. ${activity.activity}`}
                                            value={`${activity.time_value} ${activity.timeframe_display}`}
                                            prevValue={`${prevEnablePrepositioningMapping(activity.id!)[activity.id!]?.time_value} ${prevEnablePrepositioningMapping(activity.id!)[activity.id!]?.timeframe_display}`}
                                            valueType="text"
                                            variant="contents"
                                            withBackground
                                            withPadding
                                            withoutLabelColon
                                        />
                                    ))}
                                </div>
                            </PrintableContainer>
                            <PrintableContainer
                                heading={strings.earlyActionActivitiesHeading}
                                headingLevel={4}
                            >
                                <div className={styles.indicatorItems}>
                                    {approach.early_action_activities.map((activity, index) => (
                                        <PrintableDataDisplay
                                            key={activity.id}
                                            label={`${index + 1}. ${activity.activity}`}
                                            value={`${activity.time_value} ${activity.timeframe_display}`}
                                            prevValue={`${prevEnableEarlyActionsMapping(activity.id!)[activity.id!]?.time_value} ${prevEnableEarlyActionsMapping(activity.id!)[activity.id!]?.timeframe_display}`}
                                            valueType="text"
                                            variant="contents"
                                            withBackground
                                            withPadding
                                            withoutLabelColon
                                        />
                                    ))}
                                </div>
                            </PrintableContainer>
                        </PrintableContainer>
                    ))}
                </PrintableContainer>
                <PrintableContainer>
                    <PrintableDataDisplay
                        label={strings.feasibilityLabel}
                        value={feasibility}
                        prevValue={prev_feasibility}
                        valueType="text"
                        withoutLabelColon
                        variant="block"
                        strongLabel
                    />
                </PrintableContainer>
            </PrintableContainer>
            <PrintableContainer
                heading={strings.activationProcessHeading}
                headingLevel={2}
            >
                <PrintableContainer>
                    <PrintableDataDisplay
                        label={strings.actionProcessLabel}
                        value={early_action_implementation_process}
                        prevValue={prev_early_action_implementation_process}
                        valueType="text"
                        withoutLabelColon
                        variant="block"
                        strongLabel
                    />
                </PrintableContainer>
                <PrintableContainer>
                    <div className={styles.imageItems}>
                        {early_action_implementation_images?.map((element) => (
                            <Image src={element.file} caption={element.caption} />
                        ))}
                    </div>
                </PrintableContainer>
                <PrintableContainer>
                    <PrintableDataDisplay
                        label={strings.triggerActivationLabel}
                        value={trigger_activation_system}
                        prevValue={prev_trigger_activation_system}
                        valueType="text"
                        withoutLabelColon
                        variant="block"
                        strongLabel
                    />
                </PrintableContainer>
                <PrintableContainer>
                    <div className={styles.imageItems}>
                        {trigger_activation_system_images?.map((element) => (
                            <Image src={element.file} caption={element.caption} />
                        ))}
                    </div>
                </PrintableContainer>
                <PrintableContainer>
                    <PrintableDataDisplay
                        label={strings.peopleTargetLabel}
                        value={people_targeted}
                        prevValue={prev_people_targeted}
                        valueType="number"
                        variant="inline"
                        strongLabel
                    />
                </PrintableContainer>
                <PrintableContainer>
                    <PrintableDataDisplay
                        label={strings.selectionTargetLabel}
                        value={selection_of_target_population}
                        prevValue={prev_selection_of_target_population}
                        valueType="text"
                        withoutLabelColon
                        variant="block"
                        strongLabel
                    />
                </PrintableContainer>
                <PrintableContainer>
                    <PrintableDataDisplay
                        label={strings.stopMechanismLabel}
                        value={stop_mechanism}
                        prevValue={prev_stop_mechanism}
                        valueType="text"
                        withoutLabelColon
                        variant="block"
                        strongLabel
                    />
                </PrintableContainer>
                <PrintableContainer>
                    <Label strong textSize="sm">
                        {strings.sourceInformationLabel}
                    </Label>
                    <div className={styles.sources}>
                        {activation_process_source_of_information?.map((source) => (
                            <>
                                <PrintableDataDisplay
                                    label={strings.nameLabel}
                                    value={source.source_name}
                                    prevValue={
                                        prevActivationSourceInformationMapping[source.id!]
                                            ?.source_name
                                    }
                                    valueType="text"
                                    variant="inline"
                                    strongLabel
                                />
                                <PrintableDataDisplay
                                    label={strings.linkLabel}
                                    value={source.source_link}
                                    prevValue={
                                        prevActivationSourceInformationMapping[source.id!]
                                            ?.source_link
                                    }
                                    valueType="text"
                                    variant="inline"
                                    strongLabel
                                />
                            </>
                        ))}
                    </div>
                </PrintableContainer>
            </PrintableContainer>
            <PrintableContainer heading={strings.mealHeading} headingLevel={2}>
                <PrintableContainer>
                    <PrintableDataDisplay
                        label={strings.mealLabel}
                        value={meal}
                        prevValue={prev_meal}
                        valueType="text"
                        withoutLabelColon
                        variant="block"
                        strongLabel
                    />
                </PrintableContainer>
            </PrintableContainer>
            <PrintableContainer
                heading={strings.nationalSocietyHeading}
                headingLevel={2}
            >
                <PrintableContainer>
                    <PrintableDataDisplay
                        label={strings.operationalThematicLabel}
                        value={operational_administrative_capacity}
                        prevValue={prev_operational_administrative_capacity}
                        valueType="text"
                        withoutLabelColon
                        variant="block"
                        strongLabel
                    />
                </PrintableContainer>
                <PrintableContainer>
                    <PrintableDataDisplay
                        label={strings.strategiesPlanLabel}
                        value={strategies_and_plans}
                        prevValue={prev_strategies_and_plans}
                        valueType="text"
                        withoutLabelColon
                        variant="block"
                        strongLabel
                    />
                </PrintableContainer>
                <PrintableContainer>
                    <PrintableDataDisplay
                        label={strings.financialCapacityLabel}
                        value={advance_financial_capacity}
                        prevValue={prev_advance_financial_capacity}
                        valueType="text"
                        withoutLabelColon
                        variant="block"
                        strongLabel
                    />
                </PrintableContainer>
            </PrintableContainer>
            <PrintableContainer
                heading={strings.financeLogisticsHeading}
                headingLevel={2}
            >
                <PrintableContainer>
                    <PrintableDataDisplay
                        label={strings.totalBudgetLabel}
                        value={total_budget}
                        prevValue={prev_total_budget}
                        valueType="number"
                        variant="inline"
                        strongLabel
                    />
                </PrintableContainer>
                <PrintableContainer>
                    <PrintableDataDisplay
                        label={strings.budgetDescriptionLabel}
                        value={budget_description}
                        prevValue={prev_budget_description}
                        valueType="text"
                        withoutLabelColon
                        variant="block"
                        strongLabel
                    />
                </PrintableContainer>
                <PrintableContainer>
                    <Link href={budget_file_details?.file} external withUnderline>
                        Download Full Budget Template
                    </Link>
                </PrintableContainer>
                <PrintableContainer>
                    <PrintableDataDisplay
                        label={strings.totalReadinessLabel}
                        value={readiness_budget}
                        prevValue={prev_readiness_budget}
                        valueType="number"
                        variant="inline"
                        strongLabel
                    />
                </PrintableContainer>
                <PrintableContainer>
                    <PrintableDataDisplay
                        label={strings.readinessBudgetDescriptionLabel}
                        value={readiness_cost_description}
                        prevValue={prev_readiness_cost_description}
                        valueType="text"
                        withoutLabelColon
                        variant="block"
                        strongLabel
                    />
                </PrintableContainer>
                <PrintableContainer>
                    <PrintableDataDisplay
                        label={strings.totalPrepositioningLabel}
                        value={pre_positioning_budget}
                        prevValue={prev_pre_positioning_budget}
                        valueType="number"
                        variant="inline"
                        strongLabel
                    />
                </PrintableContainer>
                <PrintableContainer>
                    <PrintableDataDisplay
                        label={strings.prepositioningBudgetDescriptionLabel}
                        value={prepositioning_cost_description}
                        prevValue={prev_prepositioning_cost_description}
                        valueType="text"
                        withoutLabelColon
                        variant="block"
                        strongLabel
                    />
                </PrintableContainer>
                <PrintableContainer>
                    <PrintableDataDisplay
                        label={strings.totalEarlyActionsLabel}
                        value={early_action_budget}
                        prevValue={prev_early_action_budget}
                        valueType="number"
                        variant="inline"
                        strongLabel
                    />
                </PrintableContainer>
                <PrintableContainer>
                    <PrintableDataDisplay
                        label={strings.earlyActionsBudgetDescriptionLabel}
                        value={early_action_cost_description}
                        prevValue={prev_early_action_cost_description}
                        valueType="text"
                        withoutLabelColon
                        variant="block"
                        strongLabel
                    />
                </PrintableContainer>
                <PrintableContainer>
                    <PrintableDataDisplay
                        label={strings.eapEndorsementLabel}
                        value={eap_endorsement}
                        prevValue={prev_eap_endorsement}
                        valueType="text"
                        withoutLabelColon
                        variant="block"
                        strongLabel
                    />
                </PrintableContainer>
            </PrintableContainer>
        </PrintablePage>
    );
}

Component.displayName = 'EapFullExport';
