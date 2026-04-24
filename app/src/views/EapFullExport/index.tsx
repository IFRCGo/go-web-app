import {
    useMemo,
    useRef,
} from 'react';
import {
    useParams,
    useSearchParams,
} from 'react-router-dom';
import { ListView } from '@ifrc-go/ui';
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
import Link from '#components/printable/Link';
import PrintableContainer from '#components/printable/PrintableContainer';
import PrintableDataDisplay from '#components/printable/PrintableDataDisplay';
import PrintableDescription from '#components/printable/PrintableDescription';
import PrintableLabel from '#components/printable/PrintableLabel';
import PrintablePage from '#components/printable/PrintablePage';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import useDebouncedValue from '#hooks/useDebouncedValue';
import { useRequest } from '#utils/restRequest';

import PrintableContactOutput from './PrintableContactOutput';
import TableOfContents from './TableOfContents';

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

    const strings = useTranslation(i18n);

    const version = searchParams.get('version') ?? undefined;
    const withDiff = searchParams.get('diff')?.toLowerCase() === 'true';

    const selectedFullEap = eapRegistrationResponse?.full_eap_details?.find(
        (fullEap) => String(fullEap.version) === String(version),
    );

    const latestFullEapId = eapRegistrationResponse?.latest_full_eap;
    const latestFullEap = eapRegistrationResponse?.full_eap_details?.find(
        (fullEap) => fullEap.id === latestFullEapId,
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
        skip: isNotDefined(prevFullEap) || !withDiff,
        url: '/api/v2/full-eap/{id}/',
        pathVariables: isDefined(prevFullEap)
            ? {
                id: Number(prevFullEap.id),
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

    const {
        disaster_type_details,
        country_details,
        approved_at,
    } = eapRegistrationResponse ?? {};

    const {
        cover_image_file,
        objective,

        partner_contacts,

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
        enabling_approaches,
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

        partner_contacts: prev_partner_contacts,

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
        enabling_approaches: prev_enabling_approaches,
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

    const prevPartnerContactsMapping = useMemo(
        () => listToMap(prev_partner_contacts ?? [], (partner) => partner.id!),
        [prev_partner_contacts],
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

    const prevEnableApproachesMapping = useMemo(
        () => listToMap(prev_enabling_approaches ?? [], (approach) => approach.approach!),
        [prev_enabling_approaches],
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

    // NOTE: We render Table of Content after preview is ready so adding additional delay
    const dataReady = useDebouncedValue(previewReady);

    return (
        <PrintablePage
            mainRef={mainRef}
            heading={(
                <>
                    {strings.pageTitleFullText}
                    <br />
                    {strings.pageTitleEapText}
                </>
            )}
            description={eapTitle ?? '--'}
            dataReady={dataReady}
        >
            <PrintableContainer
                heading={strings.summaryPageTitle}
                breakAfter
            >
                <div className={styles.summary}>
                    <PrintableDataDisplay
                        label={strings.hazardLabel}
                        value={disaster_type_details?.name}
                        valueType="text"
                        strongLabel
                        variant="contents"
                        withPadding
                        withBackground
                        withDiff={false}
                    />
                    <PrintableDataDisplay
                        label={strings.objectiveLabel}
                        value={(
                            <PrintableDescription
                                value={objective}
                                prevValue={prev_objective}
                                withDiff={withDiff}
                            />
                        )}
                        strongLabel
                        variant="contents"
                        withPadding
                        withBackground
                        withDiff={false}
                    />
                    <PrintableDataDisplay
                        label={strings.prioritizedImpactsSummaryLabel}
                        value={(
                            <ol>
                                {prioritized_impacts?.map((impact) => (
                                    <li key={impact.id}>
                                        <PrintableDescription
                                            value={impact.impact}
                                            prevValue={
                                                prevPrioritizedImpactsMapping[impact.previous_id!]
                                                    ?.impact
                                            }
                                            withDiff={withDiff}
                                        />
                                    </li>
                                ))}
                            </ol>
                        )}
                        strongLabel
                        variant="contents"
                        withPadding
                        withBackground
                        withDiff={false}
                    />
                    <PrintableDataDisplay
                        label={strings.earlyActionsSummaryLabel}
                        value={(
                            <ol>
                                {early_actions?.map((action) => (
                                    <li key={action.previous_id}>
                                        <PrintableDescription
                                            value={action.action}
                                            prevValue={prevEarlyActionsMapping[action.previous_id!]
                                                ?.action}
                                            withDiff={withDiff}
                                        />
                                    </li>
                                ))}
                            </ol>
                        )}
                        strongLabel
                        variant="contents"
                        withPadding
                        withBackground
                        withDiff={false}
                    />
                    <PrintableDataDisplay
                        label={strings.houseHoldsSummaryLabel}
                        value="--"
                        prevValue="--"
                        strongLabel
                        valueType="text"
                        variant="contents"
                        withPadding
                        withBackground
                        withDiff={withDiff}
                    />
                    <PrintableDataDisplay
                        label={strings.eapBudgetSummaryLabel}
                        value={total_budget}
                        prevValue={prev_total_budget}
                        strongLabel
                        valueType="number"
                        variant="contents"
                        withPadding
                        withBackground
                        withDiff={withDiff}
                    />
                    <PrintableDataDisplay
                        label={strings.sourceForecastLabel}
                        value={trigger_statement_source_of_information?.map((trigger) => (
                            <PrintableLabel
                                key={trigger.previous_id}
                                value={trigger.source_name}
                                prevValue={prevTriggerStatementSourceInformationMapping[
                                    trigger.previous_id!]?.source_name}
                                withDiff={withDiff}
                            />
                        ))}
                        variant="contents"
                        withPadding
                        withBackground
                        strongLabel
                        withDiff={false}
                    />
                    <PrintableDataDisplay
                        label={strings.triggerStatementLabel}
                        value={(
                            <PrintableDescription
                                value={trigger_statement}
                                prevValue={prev_trigger_statement}
                                withDiff={withDiff}
                            />
                        )}
                        strongLabel
                        variant="contents"
                        withPadding
                        withBackground
                        withDiff={false}
                    />
                </div>
            </PrintableContainer>
            {previewReady && (
                <PrintableContainer breakAfter>
                    <TableOfContents mainRef={mainRef} />
                </PrintableContainer>
            )}
            <PrintableContainer
                heading={strings.overviewHeading}
                headingLevel={2}
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
                <PrintableContainer headingLevel={3}>
                    <ListView
                        layout="block"
                        spacing="4xs"
                    >
                        <ListView
                            layout="grid"
                            spacing="4xs"
                            numPreferredGridColumns={3}
                        >
                            <PrintableDataDisplay
                                label={strings.eapNoLabel}
                                value={undefined}
                                prevValue={undefined}
                                valueType="number"
                                strongValue
                                variant="block"
                                withPadding
                                withBackground
                                withDiff={withDiff}
                            />
                            <PrintableDataDisplay
                                label={strings.eapTimeframeLabel}
                                value="5 years"
                                valueType="text"
                                strongValue
                                variant="block"
                                withPadding
                                withBackground
                                withDiff={false}
                            />
                            <PrintableDataDisplay
                                label={strings.eapApprovedLabel}
                                value={approved_at}
                                valueType="text"
                                strongValue
                                variant="block"
                                withPadding
                                withBackground
                                withDiff={false}
                            />
                        </ListView>
                        <PrintableDataDisplay
                            label={strings.objectiveLabel}
                            value={(
                                <PrintableDescription
                                    value={objective}
                                    prevValue={prev_objective}
                                    withDiff={withDiff}
                                />
                            )}
                            strongValue
                            variant="block"
                            withPadding
                            withBackground
                            withDiff={false}
                        />
                    </ListView>
                </PrintableContainer>
                <PrintableContainer
                    heading={strings.contactInformationHeading}
                    headingLevel={3}
                >
                    <PrintableContainer headingLevel={4}>
                        <PrintableDescription
                            value={strings.contactInformationDescription}
                        />
                    </PrintableContainer>
                    <PrintableContainer
                        heading={strings.nationalLabel}
                        headingLevel={4}
                    >
                        <PrintableContactOutput
                            label={strings.nationalSocietyContactLabel}
                            namePrefix="national_society_contact"
                            data={fullEapResponse}
                            prevData={prevFullEapResponse}
                            withDiff={withDiff}
                        />
                        <PrintableContainer
                            heading={strings.partnerNationalSocietyContactLabel}
                            headingLevel={6}
                        >
                            {partner_contacts?.map((partner) => {
                                const prevPartner = prevPartnerContactsMapping[partner
                                    .previous_id!];
                                return (
                                    <PrintableDescription
                                        key={partner.id}
                                        withDiff={withDiff}
                                        value={[
                                            partner.name,
                                            partner.title,
                                            partner.email,
                                            partner.phone_number,
                                        ]
                                            .filter(isTruthyString)
                                            .join(', ')}
                                        prevValue={[
                                            prevPartner?.name,
                                            prevPartner?.title,
                                            prevPartner?.email,
                                            prevPartner?.phone_number,
                                        ]
                                            .filter(isTruthyString)
                                            .join(', ')}
                                    />
                                );
                            })}
                        </PrintableContainer>
                    </PrintableContainer>
                    <PrintableContainer
                        heading={strings.delegationLabel}
                        headingLevel={4}
                    >
                        <PrintableContactOutput
                            label={strings.delegationFocalLabel}
                            namePrefix="ifrc_delegation_focal_point"
                            data={fullEapResponse}
                            prevData={prevFullEapResponse}
                            withDiff={withDiff}
                        />
                        <PrintableContactOutput
                            label={strings.delegationHeadLabel}
                            namePrefix="ifrc_head_of_delegation"
                            data={fullEapResponse}
                            prevData={prevFullEapResponse}
                            withDiff={withDiff}
                        />
                    </PrintableContainer>
                    <PrintableContainer
                        heading={strings.regionalGlobalLabel}
                        headingLevel={4}
                    >
                        <PrintableContactOutput
                            label={strings.drefFocalLabel}
                            namePrefix="dref_focal_point"
                            data={fullEapResponse}
                            prevData={prevFullEapResponse}
                            withDiff={withDiff}
                        />
                        <PrintableContactOutput
                            label={strings.regionalFocalLabel}
                            namePrefix="ifrc_regional_focal_point"
                            data={fullEapResponse}
                            prevData={prevFullEapResponse}
                            withDiff={withDiff}
                        />
                        <PrintableContactOutput
                            label={strings.regionalOpsLabel}
                            namePrefix="ifrc_regional_ops_manager"
                            data={fullEapResponse}
                            prevData={prevFullEapResponse}
                            withDiff={withDiff}
                        />
                        <PrintableContactOutput
                            label={strings.regionalHeadLabel}
                            namePrefix="ifrc_regional_head_dcc"
                            data={fullEapResponse}
                            prevData={prevFullEapResponse}
                            withDiff={withDiff}
                        />
                        <PrintableContactOutput
                            label={strings.globalOpsLabel}
                            namePrefix="ifrc_global_ops_coordinator"
                            data={fullEapResponse}
                            prevData={prevFullEapResponse}
                            withDiff={withDiff}
                        />
                    </PrintableContainer>
                </PrintableContainer>
            </PrintableContainer>
            <PrintableContainer
                heading={strings.stakeholdersHeading}
                headingLevel={2}
                breakBefore
            >
                <PrintableContainer headingLevel={3}>
                    <PrintableDataDisplay
                        label={strings.workWithGovernmentLabel}
                        value={is_worked_with_government}
                        prevValue={prev_is_worked_with_government}
                        valueType="boolean"
                        variant="block"
                        withPadding
                        withBackground
                        strongLabel
                        withDiff={withDiff}
                    />
                </PrintableContainer>
                <PrintableContainer
                    headingLevel={4}
                    heading={strings.workWithGovernmentDescription}
                >
                    <PrintableDescription
                        value={worked_with_government_description}
                        prevValue={prev_worked_with_government_description}
                        withDiff={withDiff}
                    />
                </PrintableContainer>
                <PrintableContainer
                    heading={strings.keyActorsHeading}
                    headingLevel={3}
                >
                    {key_actors?.map((actor) => (
                        <PrintableContainer
                            key={actor.id}
                            headingLevel={4}
                            heading={(
                                <PrintableLabel
                                    value={actor.national_society_details.society_name}
                                    prevValue={
                                        prevKeyActorsMapping[actor.national_society]
                                            ?.national_society_details.society_name
                                    }
                                    withDiff={withDiff}
                                />
                            )}
                        >
                            <PrintableDescription
                                value={actor.description}
                                prevValue={
                                    prevKeyActorsMapping[actor.national_society]
                                        ?.description
                                }
                                withDiff={withDiff}
                            />
                        </PrintableContainer>
                    ))}
                </PrintableContainer>
                <PrintableContainer
                    heading={strings.technicalWorkingHeading}
                    headingLevel={3}
                >
                    <PrintableContainer headingLevel={4}>
                        <PrintableDataDisplay
                            label={strings.isTechnicalLabel}
                            value={is_technical_working_groups}
                            prevValue={prev_is_technical_working_groups}
                            valueType="boolean"
                            variant="block"
                            strongLabel
                            withDiff={withDiff}
                        />
                    </PrintableContainer>
                    <PrintableContainer
                        headingLevel={4}
                        heading={strings.titleLabel}
                    >
                        <PrintableDescription
                            value={technically_working_group_title}
                            prevValue={prev_technically_working_group_title}
                            withDiff={withDiff}
                        />
                    </PrintableContainer>
                    <PrintableContainer
                        headingLevel={4}
                        heading={strings.workingDescriptionLabel}
                    >
                        <PrintableDescription
                            value={technical_working_groups_in_place_description}
                            prevValue={
                                prev_technical_working_groups_in_place_description
                            }
                            withDiff={withDiff}
                        />
                    </PrintableContainer>
                </PrintableContainer>
            </PrintableContainer>
            <PrintableContainer
                heading={strings.riskAnalysisHeading}
                headingLevel={2}
                breakBefore
            >
                <PrintableContainer
                    heading={strings.hazardSelectionHeading}
                    headingLevel={3}
                >
                    <PrintableDescription
                        value={hazard_selection}
                        prevValue={prev_hazard_selection}
                        withDiff={withDiff}
                    />
                </PrintableContainer>
                <PrintableContainer headingLevel={3}>
                    {hazard_selection_images?.map((hazard) => (
                        <Image key={hazard.id} src={hazard.file} caption={hazard.caption} />
                    ))}
                </PrintableContainer>
                <PrintableContainer
                    heading={strings.exposedElementsLabel}
                    headingLevel={3}
                >
                    <PrintableDescription
                        value={exposed_element_and_vulnerability_factor}
                        prevValue={prev_exposed_element_and_vulnerability_factor}
                        withDiff={withDiff}
                    />
                </PrintableContainer>
                <PrintableContainer headingLevel={3}>
                    <div className={styles.imageItems}>
                        {exposed_element_and_vulnerability_factor_images?.map((element) => (
                            <Image
                                key={element.id}
                                src={element.file}
                                caption={element.caption}
                            />
                        ))}
                    </div>
                </PrintableContainer>
                <PrintableContainer
                    heading={strings.prioritizedImpactHeading}
                    headingLevel={3}
                >
                    <PrintableContainer
                        heading={strings.listPrioritizedImpactLabel}
                        headingLevel={6}
                    >
                        <ol>
                            {prioritized_impacts?.map((impact) => (
                                <li key={impact.id}>
                                    <PrintableDescription
                                        value={impact.impact}
                                        prevValue={
                                            prevPrioritizedImpactsMapping[impact.previous_id!]
                                                ?.impact
                                        }
                                        withDiff={withDiff}
                                    />
                                </li>
                            ))}
                        </ol>
                    </PrintableContainer>
                </PrintableContainer>
                <PrintableContainer
                    heading={strings.descriptionLabel}
                    headingLevel={6}
                >
                    <PrintableDescription
                        value={prioritized_impact}
                        prevValue={prev_prioritized_impact}
                        withDiff={withDiff}
                    />
                </PrintableContainer>
                <PrintableContainer>
                    <div className={styles.imageItems}>
                        {prioritized_impact_images?.map((element) => (
                            <Image
                                key={element.id}
                                src={element.file}
                                caption={element.caption}
                            />
                        ))}
                    </div>
                </PrintableContainer>
                <PrintableContainer
                    heading={strings.sourceInformationLabel}
                    headingLevel={3}
                >
                    <ListView
                        layout="block"
                        spacing="xs"
                    >
                        {risk_analysis_source_of_information?.map((source) => (
                            <ListView
                                key={source.id}
                                layout="grid"
                                spacing="2xs"
                            >
                                <PrintableDataDisplay
                                    label={strings.nameLabel}
                                    value={(
                                        <PrintableDescription
                                            value={source.source_name}
                                            prevValue={
                                                prevRiskSourceInformationMapping[source
                                                    .previous_id!]?.source_name
                                            }
                                            withDiff={withDiff}
                                        />
                                    )}
                                    variant="inline"
                                    withPadding
                                    withBackground
                                    strongLabel
                                    withDiff={false}
                                />
                                <PrintableDataDisplay
                                    label={strings.linkLabel}
                                    value={(
                                        <PrintableDescription
                                            value={source.source_link}
                                            prevValue={
                                                prevRiskSourceInformationMapping[source
                                                    .previous_id!]?.source_link
                                            }
                                            withDiff={withDiff}
                                        />
                                    )}
                                    withPadding
                                    withBackground
                                    variant="inline"
                                    strongLabel
                                    withDiff={false}
                                />
                            </ListView>
                        ))}
                    </ListView>
                </PrintableContainer>
            </PrintableContainer>
            <PrintableContainer
                heading={strings.triggerModelHeading}
                headingLevel={2}
            >
                <PrintableContainer
                    heading={strings.triggerStatementLabel}
                    headingLevel={3}
                >
                    <PrintableDescription
                        value={trigger_statement}
                        prevValue={prev_trigger_statement}
                        withDiff={withDiff}
                    />
                </PrintableContainer>
                <PrintableContainer headingLevel={3}>
                    <ListView layout="grid">
                        <PrintableDataDisplay
                            label={strings.leadTimeLabel}
                            value={lead_time}
                            prevValue={prev_lead_time}
                            valueType="number"
                            variant="block"
                            withBackground
                            withPadding
                            strongLabel
                            withDiff={withDiff}
                        />
                    </ListView>
                </PrintableContainer>
                <PrintableContainer
                    heading={strings.sourceForecastLabel}
                    headingLevel={3}
                >
                    <ListView layout="block" spacing="xs">
                        {trigger_statement_source_of_information?.map((trigger) => (
                            <ListView key={trigger.id} layout="grid" spacing="2xs">
                                <PrintableDataDisplay
                                    label={strings.nameLabel}
                                    value={(
                                        <PrintableDescription
                                            value={trigger.source_name}
                                            prevValue={prevTriggerStatementSourceInformationMapping[
                                                trigger.previous_id!]?.source_name}
                                            withDiff={withDiff}
                                        />
                                    )}
                                    variant="inline"
                                    withPadding
                                    withBackground
                                    strongLabel
                                    withDiff={false}
                                />
                                <PrintableDataDisplay
                                    label={strings.linkLabel}
                                    value={(
                                        <PrintableDescription
                                            value={trigger.source_link}
                                            prevValue={prevTriggerStatementSourceInformationMapping[
                                                trigger.previous_id!]?.source_link}
                                            withDiff={withDiff}
                                        />
                                    )}
                                    withPadding
                                    withBackground
                                    variant="inline"
                                    strongLabel
                                    withDiff={false}
                                />
                            </ListView>
                        ))}
                    </ListView>
                </PrintableContainer>
                <PrintableContainer
                    heading={strings.forecastSelectionLabel}
                    headingLevel={3}
                >
                    <PrintableDescription
                        value={forecast_selection}
                        prevValue={prev_forecast_selection}
                        withDiff={withDiff}
                    />
                </PrintableContainer>
                <PrintableContainer>
                    <div className={styles.imageItems}>
                        {forecast_selection_images?.map((element) => (
                            <Image
                                key={element.id}
                                src={element.file}
                                caption={element.caption}
                            />
                        ))}
                    </div>
                </PrintableContainer>
                <PrintableContainer>
                    <Link href={forecast_table_file_details?.file}>
                        {strings.downloadForecastTableLabel}
                    </Link>
                </PrintableContainer>
                <PrintableContainer
                    heading={strings.definitionJustificationLabel}
                    headingLevel={3}
                >
                    <PrintableDescription
                        value={definition_and_justification_impact_level}
                        prevValue={prev_definition_and_justification_impact_level}
                        withDiff={withDiff}
                    />
                </PrintableContainer>
                <PrintableContainer>
                    <div className={styles.imageItems}>
                        {definition_and_justification_impact_level_images?.map(
                            (element) => (
                                <Image
                                    key={element.id}
                                    src={element.file}
                                    caption={element.caption}
                                />
                            ),
                        )}
                    </div>
                </PrintableContainer>
                <PrintableContainer
                    heading={strings.identificationInterventionLabel}
                    headingLevel={3}
                >
                    <PrintableDescription
                        value={identification_of_the_intervention_area}
                        prevValue={prev_identification_of_the_intervention_area}
                        withDiff={withDiff}
                    />
                </PrintableContainer>
                <PrintableContainer>
                    <div className={styles.imageItems}>
                        {identification_of_the_intervention_area_images?.map((element) => (
                            <Image
                                key={element.id}
                                src={element.file}
                                caption={element.caption}
                            />
                        ))}
                    </div>
                </PrintableContainer>
                <PrintableContainer
                    heading={strings.sourceInformationLabel}
                    headingLevel={3}
                >
                    <ListView layout="block" spacing="xs">
                        {trigger_model_source_of_information?.map((trigger) => (
                            <ListView
                                key={trigger.id}
                                layout="grid"
                                spacing="2xs"
                            >
                                <PrintableDataDisplay
                                    label={strings.nameLabel}
                                    value={(
                                        <PrintableDescription
                                            value={trigger.source_name}
                                            prevValue={prevTriggerModelSourceInformationMapping[
                                                trigger.previous_id!]?.source_name}
                                            withDiff={withDiff}
                                        />
                                    )}
                                    variant="inline"
                                    withPadding
                                    withBackground
                                    strongLabel
                                    withDiff={false}
                                />
                                <PrintableDataDisplay
                                    label={strings.linkLabel}
                                    value={(
                                        <PrintableDescription
                                            value={trigger.source_link}
                                            prevValue={prevTriggerModelSourceInformationMapping[
                                                trigger.previous_id!]?.source_link}
                                            withDiff={withDiff}
                                        />
                                    )}
                                    withPadding
                                    withBackground
                                    variant="inline"
                                    strongLabel
                                    withDiff={false}
                                />
                            </ListView>
                        ))}
                    </ListView>
                </PrintableContainer>
            </PrintableContainer>
            <PrintableContainer
                heading={strings.selectionOfActionHeading}
                headingLevel={2}
            >
                <PrintableContainer
                    heading={strings.selectionOfActionHeading}
                    headingLevel={3}
                >
                    <PrintableContainer
                        heading={strings.listEarlyActionsLabel}
                        headingLevel={6}
                    >
                        <ol>
                            {early_actions?.map((action) => (
                                <li key={action.previous_id}>
                                    <PrintableDescription
                                        value={action.action}
                                        prevValue={prevEarlyActionsMapping[action.previous_id!]
                                            ?.action}
                                        withDiff={withDiff}
                                    />
                                </li>
                            ))}
                        </ol>
                    </PrintableContainer>
                </PrintableContainer>
                <PrintableContainer
                    heading={strings.earlySelectionLabel}
                    headingLevel={3}
                >
                    <PrintableDataDisplay
                        value={(
                            <PrintableDescription
                                value={early_action_selection_process}
                                prevValue={prev_early_action_selection_process}
                                withDiff={withDiff}
                            />
                        )}
                        withoutLabelColon
                        variant="block"
                        strongLabel
                        withDiff={false}
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
                    <Link href={theory_of_change_table_file_details?.file}>
                        {strings.downloadTheoryChangeTableLabel}
                    </Link>
                </PrintableContainer>
                <PrintableContainer
                    heading={strings.evidenceBaseLabel}
                    headingLevel={3}
                >
                    <PrintableDataDisplay
                        value={(
                            <PrintableDescription
                                value={evidence_base}
                                prevValue={prev_evidence_base}
                                withDiff={withDiff}
                            />
                        )}
                        withoutLabelColon
                        variant="block"
                        strongLabel
                        withDiff={false}
                    />
                </PrintableContainer>
                <PrintableContainer
                    heading={strings.sourceInformationLabel}
                    headingLevel={3}
                >
                    <ListView layout="block" spacing="xs">
                        {evidence_base_source_of_information?.map((trigger) => (
                            <ListView layout="grid" spacing="2xs">
                                <PrintableDataDisplay
                                    label={strings.nameLabel}
                                    value={(
                                        <PrintableDescription
                                            value={trigger.source_name}
                                            prevValue={prevEvidenceBaseSourceInformationMapping[
                                                trigger.previous_id!]?.source_name}
                                            withDiff={withDiff}
                                        />
                                    )}
                                    variant="inline"
                                    withPadding
                                    withBackground
                                    strongLabel
                                    withDiff={false}
                                />
                                <PrintableDataDisplay
                                    label={strings.linkLabel}
                                    value={(
                                        <PrintableDescription
                                            value={trigger.source_link}
                                            prevValue={prevEvidenceBaseSourceInformationMapping[
                                                trigger.previous_id!]?.source_link}
                                            withDiff={withDiff}
                                        />
                                    )}
                                    withPadding
                                    withBackground
                                    variant="inline"
                                    strongLabel
                                    withDiff={false}
                                />
                            </ListView>
                        ))}
                    </ListView>
                </PrintableContainer>
                <PrintableContainer
                    heading={strings.usefulnessActionsLabel}
                    headingLevel={3}
                >
                    <PrintableDataDisplay
                        value={(
                            <PrintableDescription
                                value={usefulness_of_actions}
                                prevValue={prev_usefulness_of_actions}
                                withDiff={withDiff}
                            />
                        )}
                        withoutLabelColon
                        variant="block"
                        strongLabel
                        withDiff={false}
                    />
                </PrintableContainer>
                <PrintableContainer
                    heading={strings.feasibilityLabel}
                    headingLevel={3}
                >
                    <PrintableDataDisplay
                        value={(
                            <PrintableDescription
                                value={feasibility}
                                prevValue={prev_feasibility}
                                withDiff={withDiff}
                            />
                        )}
                        withoutLabelColon
                        variant="block"
                        strongLabel
                        withDiff={false}
                    />
                </PrintableContainer>
            </PrintableContainer>
            <PrintableContainer
                heading={strings.plannedOperationsHeading}
                headingLevel={2}
            >
                {planned_operations?.map((operation) => {
                    const prevOperation = prevPlannedOperationsMapping?.[operation.sector];

                    const apCodeSectorValue = apCodeOptions?.sector_ap_codes
                        ?.[operation.sector]?.join(', ');

                    const prevApCodeSectorValue = apCodeOptions?.sector_ap_codes
                        ?.[prevOperation?.sector]?.join(', ');

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
                            key={operation.id}
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
                                    <PrintableLabel
                                        value={strings.indicatorTitleLabel}
                                    />
                                    <PrintableLabel
                                        value={strings.indicatorTargetLabel}
                                    />
                                    {operation.indicators.map((indicator) => {
                                        const prevIndicator = prevOperationIndicatorMap
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
                    const prevApproach = prevEnableApproachesMapping?.[approach.approach];

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
                                    <PrintableLabel
                                        value={strings.indicatorTitleLabel}
                                    />
                                    <PrintableLabel
                                        value={strings.indicatorTargetLabel}
                                    />
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
                heading={strings.activationProcessHeading}
                headingLevel={2}
            >
                <PrintableContainer
                    heading={strings.actionProcessLabel}
                    headingLevel={3}
                >
                    <PrintableDataDisplay
                        value={(
                            <PrintableDescription
                                value={early_action_implementation_process}
                                prevValue={prev_early_action_implementation_process}
                                withDiff={withDiff}
                            />
                        )}
                        withoutLabelColon
                        variant="block"
                        strongLabel
                        withDiff={false}
                    />
                </PrintableContainer>
                <PrintableContainer>
                    <div className={styles.imageItems}>
                        {early_action_implementation_images?.map((element) => (
                            <Image src={element.file} caption={element.caption} />
                        ))}
                    </div>
                </PrintableContainer>
                <PrintableContainer
                    heading={strings.triggerActivationLabel}
                    headingLevel={3}
                >
                    <PrintableDataDisplay
                        value={(
                            <PrintableDescription
                                value={trigger_activation_system}
                                prevValue={prev_trigger_activation_system}
                                withDiff={withDiff}
                            />
                        )}
                        withoutLabelColon
                        variant="block"
                        strongLabel
                        withDiff={false}
                    />
                </PrintableContainer>
                <PrintableContainer headingLevel={3}>
                    <div className={styles.imageItems}>
                        {trigger_activation_system_images?.map((element) => (
                            <Image src={element.file} caption={element.caption} />
                        ))}
                    </div>
                </PrintableContainer>
                <PrintableContainer headingLevel={3}>
                    <ListView layout="grid">
                        <PrintableDataDisplay
                            label={strings.peopleTargetLabel}
                            value={people_targeted}
                            prevValue={prev_people_targeted}
                            valueType="number"
                            variant="block"
                            withBackground
                            withPadding
                            strongLabel
                            withDiff={withDiff}
                        />
                    </ListView>
                </PrintableContainer>
                <PrintableContainer
                    heading={strings.selectionTargetLabel}
                    headingLevel={3}
                >
                    <PrintableDataDisplay
                        value={(
                            <PrintableDescription
                                value={selection_of_target_population}
                                prevValue={prev_selection_of_target_population}
                                withDiff={withDiff}
                            />
                        )}
                        withoutLabelColon
                        variant="block"
                        strongLabel
                        withDiff={false}
                    />
                </PrintableContainer>
                <PrintableContainer
                    heading={strings.stopMechanismLabel}
                    headingLevel={3}
                >
                    <PrintableDataDisplay
                        value={(
                            <PrintableDescription
                                value={stop_mechanism}
                                prevValue={prev_stop_mechanism}
                                withDiff={withDiff}
                            />
                        )}
                        withoutLabelColon
                        variant="block"
                        strongLabel
                        withDiff={false}
                    />
                </PrintableContainer>
                <PrintableContainer
                    heading={strings.sourceInformationLabel}
                    headingLevel={3}
                >
                    <ListView layout="block" spacing="xs">
                        {activation_process_source_of_information?.map((source) => (
                            <ListView layout="grid" spacing="2xs">
                                <PrintableDataDisplay
                                    label={strings.nameLabel}
                                    value={(
                                        <PrintableDescription
                                            value={source.source_name}
                                            prevValue={prevActivationSourceInformationMapping[
                                                source.previous_id!]?.source_name}
                                            withDiff={withDiff}
                                        />
                                    )}
                                    variant="inline"
                                    withPadding
                                    withBackground
                                    strongLabel
                                    withDiff={false}
                                />
                                <PrintableDataDisplay
                                    label={strings.linkLabel}
                                    value={(
                                        <PrintableDescription
                                            value={source.source_link}
                                            prevValue={prevActivationSourceInformationMapping[
                                                source.previous_id!]?.source_link}
                                            withDiff={withDiff}
                                        />
                                    )}
                                    withPadding
                                    withBackground
                                    variant="inline"
                                    strongLabel
                                    withDiff={false}
                                />
                            </ListView>
                        ))}
                    </ListView>
                </PrintableContainer>
            </PrintableContainer>
            <PrintableContainer heading={strings.mealHeading} headingLevel={2}>
                <PrintableContainer
                    heading={strings.mealLabel}
                    headingLevel={3}
                >
                    <PrintableDataDisplay
                        value={(
                            <PrintableDescription
                                value={meal}
                                prevValue={prev_meal}
                                withDiff={withDiff}
                            />
                        )}
                        withoutLabelColon
                        variant="block"
                        strongLabel
                        withDiff={false}
                    />
                </PrintableContainer>
            </PrintableContainer>
            <PrintableContainer
                heading={strings.nationalSocietyHeading}
                headingLevel={2}
            >
                <PrintableContainer
                    heading={strings.operationalThematicLabel}
                    headingLevel={3}
                >
                    <PrintableDataDisplay
                        value={(
                            <PrintableDescription
                                value={operational_administrative_capacity}
                                prevValue={prev_operational_administrative_capacity}
                                withDiff={withDiff}
                            />
                        )}
                        withoutLabelColon
                        variant="block"
                        strongLabel
                        withDiff={false}
                    />
                </PrintableContainer>
                <PrintableContainer
                    heading={strings.strategiesPlanLabel}
                    headingLevel={3}
                >
                    <PrintableDataDisplay
                        value={(
                            <PrintableDescription
                                value={strategies_and_plans}
                                prevValue={prev_strategies_and_plans}
                                withDiff={withDiff}
                            />
                        )}
                        withoutLabelColon
                        variant="block"
                        strongLabel
                        withDiff={false}
                    />
                </PrintableContainer>
                <PrintableContainer
                    heading={strings.financialCapacityLabel}
                    headingLevel={3}
                >
                    <PrintableDataDisplay
                        value={(
                            <PrintableDescription
                                value={advance_financial_capacity}
                                prevValue={prev_advance_financial_capacity}
                                withDiff={withDiff}
                            />
                        )}
                        withoutLabelColon
                        variant="block"
                        strongLabel
                        withDiff={false}
                    />
                </PrintableContainer>
            </PrintableContainer>
            <PrintableContainer
                heading={strings.financeLogisticsHeading}
                headingLevel={2}
            >
                <PrintableContainer>
                    <ListView
                        layout="grid"
                        spacing="4xs"
                        numPreferredGridColumns={4}
                        minGridColumnSize="10rem"
                    >
                        <PrintableDataDisplay
                            label={strings.totalBudgetLabel}
                            value={total_budget}
                            prevValue={prev_total_budget}
                            valueType="number"
                            variant="block"
                            strongLabel
                            withPadding
                            withBackground
                            withDiff={withDiff}
                        />
                        <PrintableDataDisplay
                            label={strings.totalReadinessLabel}
                            value={readiness_budget}
                            prevValue={prev_readiness_budget}
                            valueType="number"
                            variant="block"
                            strongLabel
                            withPadding
                            withBackground
                            withDiff={withDiff}
                        />
                        <PrintableDataDisplay
                            label={strings.totalPrepositioningLabel}
                            value={pre_positioning_budget}
                            prevValue={prev_pre_positioning_budget}
                            valueType="number"
                            variant="block"
                            strongLabel
                            withPadding
                            withBackground
                            withDiff={withDiff}
                        />
                        <PrintableDataDisplay
                            label={strings.totalEarlyActionsLabel}
                            value={early_action_budget}
                            prevValue={prev_early_action_budget}
                            valueType="number"
                            variant="block"
                            strongLabel
                            withPadding
                            withBackground
                            withDiff={withDiff}
                        />
                    </ListView>
                </PrintableContainer>
                <PrintableContainer
                    heading={strings.budgetDescriptionLabel}
                    headingLevel={3}
                >
                    <PrintableDescription
                        value={budget_description}
                        prevValue={prev_budget_description}
                        withDiff={withDiff}
                    />
                </PrintableContainer>
                <PrintableContainer headingLevel={3}>
                    <Link href={budget_file_details?.file}>
                        {strings.downloadBudgetLabel}
                    </Link>
                </PrintableContainer>
                <PrintableContainer
                    heading={strings.readinessBudgetDescriptionLabel}
                    headingLevel={3}
                >
                    <PrintableDescription
                        value={readiness_cost_description}
                        prevValue={prev_readiness_cost_description}
                        withDiff={withDiff}
                    />
                </PrintableContainer>
                <PrintableContainer
                    heading={strings.prepositioningBudgetDescriptionLabel}
                    headingLevel={3}
                >
                    <PrintableDescription
                        value={prepositioning_cost_description}
                        prevValue={prev_prepositioning_cost_description}
                        withDiff={withDiff}
                    />
                </PrintableContainer>
                <PrintableContainer
                    heading={strings.earlyActionsBudgetDescriptionLabel}
                    headingLevel={3}
                >
                    <PrintableDescription
                        value={early_action_cost_description}
                        prevValue={prev_early_action_cost_description}
                        withDiff={withDiff}
                    />
                </PrintableContainer>
            </PrintableContainer>
            <PrintableContainer
                heading={strings.eapEndorsementLabel}
                headingLevel={2}
            >
                <PrintableDescription
                    value={eap_endorsement}
                    prevValue={prev_eap_endorsement}
                    withDiff={withDiff}
                />
            </PrintableContainer>
        </PrintablePage>
    );
}

Component.displayName = 'EapFullExport';
