import {
    Fragment,
    useMemo,
    useState,
} from 'react';
import { useParams } from 'react-router-dom';
import {
    DateOutput,
    NumberOutput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    Container,
    DescriptionText,
    Heading,
    Image,
    TextOutput,
} from '@ifrc-go/ui/printable';
import {
    DEFAULT_PRINT_DATE_FORMAT,
    sumSafe,
} from '@ifrc-go/ui/utils';
import {
    isDefined,
    isFalsyString,
    isNotDefined,
    isTruthyString,
    listToGroupList,
    mapToList,
} from '@togglecorp/fujs';

import earlyActionsIcon from '#assets/icons/early_actions.svg';
import earlyResponseIcon from '#assets/icons/early_response.svg';
import ifrcLogo from '#assets/icons/ifrc-square.png';
import Link from '#components/printable/Link';
import SelectOutput from '#components/SelectOutput';
import usePrimarySector, { type PrimarySector } from '#hooks/domain/usePrimarySector';
import useUrlSearchState from '#hooks/useUrlSearchState';
import {
    DISASTER_CATEGORY_ORANGE,
    DISASTER_CATEGORY_RED,
    DISASTER_CATEGORY_YELLOW,
    type DisasterCategory,
    DREF_TYPE_ASSESSMENT,
    DREF_TYPE_IMMINENT,
    DREF_TYPE_LOAN,
    DREF_TYPE_RESPONSE,
    ONSET_SLOW,
} from '#utils/constants';
import {
    identifiedNeedsAndGapsOrder,
    nsActionsOrder,
    plannedInterventionOrder,
} from '#utils/domain/dref';
import { useRequest } from '#utils/restRequest';
import {
    calculateProposedActionsCost,
    EARLY_ACTION,
    EARLY_RESPONSE,
    TYPE_IMMINENT,
} from '#views/DrefApplicationForm/common';

import PgaExport, { BlockTextOutput } from './PgaExport';

import i18n from './i18n.json';
import styles from './styles.module.css';

const colorMap: Record<DisasterCategory, string | undefined> = {
    [DISASTER_CATEGORY_YELLOW]: styles.yellow,
    [DISASTER_CATEGORY_ORANGE]: styles.orange,
    [DISASTER_CATEGORY_RED]: styles.red,
};

function primarySectoryLabelSelector(option: PrimarySector) {
    return option.label;
}

function primarySectoryKeySelector(option: PrimarySector) {
    return option.key;
}

/** @knipignore */
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const { drefId } = useParams<{ drefId: string }>();
    const [previewReady, setPreviewReady] = useState(false);
    const strings = useTranslation(i18n);
    const primarySectorOptions = usePrimarySector();

    const {
        response: drefResponse,
    } = useRequest({
        skip: isFalsyString(drefId),
        url: '/api/v2/dref/{id}/',
        pathVariables: isDefined(drefId) ? {
            id: drefId,
        } : undefined,
        onSuccess: () => {
            // FIXME: create common function / hook for this
            async function waitForImages() {
                const images = document.querySelectorAll('img');
                if (images.length === 0) {
                    setPreviewReady(true);
                    return;
                }

                const promises = Array.from(images).map(
                    (image) => {
                        if (image.complete) {
                            return undefined;
                        }

                        return new Promise((accept) => {
                            image.addEventListener('load', () => {
                                accept(true);
                            });
                        });
                    },
                ).filter(isDefined);

                await Promise.all(promises);
                setPreviewReady(true);
            }

            waitForImages();
        },
        onFailure: () => {
            setPreviewReady(true);
        },
    });

    const plannedInterventions = useMemo(
        () => {
            if (isNotDefined(drefResponse) || isNotDefined(drefResponse.planned_interventions)) {
                return undefined;
            }

            const { planned_interventions } = drefResponse;

            return planned_interventions.map(
                (intervention) => {
                    if (isNotDefined(intervention.title)) {
                        return undefined;
                    }
                    return { ...intervention, title: intervention.title };
                },
            ).filter(isDefined).sort(
                (a, b) => plannedInterventionOrder[a.title] - plannedInterventionOrder[b.title],
            );
        },
        [drefResponse],
    );

    const needsIdentified = useMemo(
        () => {
            if (isNotDefined(drefResponse) || isNotDefined(drefResponse.needs_identified)) {
                return undefined;
            }

            const { needs_identified } = drefResponse;

            return needs_identified.map(
                (need) => {
                    if (isNotDefined(need.title)) {
                        return undefined;
                    }

                    return {
                        ...need,
                        title: need.title,
                    };
                },
            ).filter(isDefined).sort((a, b) => (
                identifiedNeedsAndGapsOrder[a.title] - identifiedNeedsAndGapsOrder[b.title]
            ));
        },
        [drefResponse],
    );

    const nsActions = useMemo(
        () => {
            if (isNotDefined(drefResponse) || isNotDefined(drefResponse.national_society_actions)) {
                return undefined;
            }

            const { national_society_actions } = drefResponse;

            return national_society_actions.map((nsAction) => {
                if (isNotDefined(nsAction.title)) {
                    return undefined;
                }
                return { ...nsAction, title: nsAction.title };
            }).filter(isDefined).sort((a, b) => (
                nsActionsOrder[a.title] - nsActionsOrder[b.title]
            ));
        },
        [drefResponse],
    );

    const groupedProposedActions = useMemo(() => {
        if (isNotDefined(drefResponse) || isNotDefined(drefResponse.proposed_action)) {
            return [];
        }

        const typeGroupedActions = listToGroupList(
            drefResponse.proposed_action.map((action) => {
                const {
                    proposed_type,
                    activities,
                    ...other
                } = action;

                if (isNotDefined(proposed_type)
                    || isNotDefined(activities)
                    || activities.length === 0
                ) {
                    return undefined;
                }

                return {
                    ...other,
                    activities,
                    proposed_type,
                };
            }).filter(isDefined),
            ({ proposed_type }) => proposed_type,
        );

        const proposedActivityIconMap: Record<string, string> = {
            [EARLY_ACTION]: earlyActionsIcon,
            [EARLY_RESPONSE]: earlyResponseIcon,
        };

        return mapToList(
            typeGroupedActions,
            (list, key) => {
                const numActivities = sumSafe(
                    list.map(({ activities }) => activities.length),
                );

                return {
                    key,
                    title: list[0]?.proposed_type_display,
                    numActivities,
                    actions: list,
                    icon: proposedActivityIconMap[key],
                };
            },
        );
    }, [drefResponse]);

    const [pgaExport] = useUrlSearchState<boolean | undefined>(
        'is_pga',
        (value) => {
            if (value === 'true') {
                return true;
            }
            return undefined;
        },
        (is_pga) => is_pga,
    );

    if (isNotDefined(drefResponse)) {
        return (
            <div className={styles.drefApplicationExport}>
                Loading...
            </div>
        );
    }

    const {
        addressed_humanitarian_impacts,
        amount_requested,
        appeal_code,
        assessment_report_details,
        boys,
        budget_file_details,
        budget_file_preview,
        child_safeguarding_risk_level,
        communication,
        complete_child_safeguarding_risk,
        contingency_plans_supporting_document_details,
        country_details,
        cover_image_file,
        date_of_approval,
        did_it_affect_same_area,
        did_it_affect_same_population,
        did_ns_request_fund,
        did_ns_respond,
        disability_people_per,
        disaster_category,
        disaster_category_analysis_details,
        disaster_category_display,
        disaster_type_details,
        district_details,
        dref_recurrent_text,
        end_date,
        event_date,
        event_description,
        event_map_file,
        event_scope,
        girls,
        glide_code,
        government_requested_assistance,
        has_anti_fraud_corruption_policy,
        has_anti_sexual_harassment_policy,
        has_child_protection_policy,
        has_child_safeguarding_risk_analysis_assessment,
        has_sexual_abuse_policy,
        has_whistleblower_protection_policy,
        hazard_date,
        hazard_date_and_location,
        hazard_vulnerabilities_and_risks,
        human_resource,
        icrc,
        identified_gaps,
        ifrc,
        ifrc_appeal_manager_email,
        ifrc_appeal_manager_name,
        ifrc_appeal_manager_phone_number,
        ifrc_appeal_manager_title,
        ifrc_emergency_email,
        ifrc_emergency_name,
        ifrc_emergency_phone_number,
        ifrc_emergency_title,
        ifrc_project_manager_email,
        ifrc_project_manager_name,
        ifrc_project_manager_phone_number,
        ifrc_project_manager_title,
        images_file,
        indirect_cost,
        is_dref_imminent_v2,
        is_surge_personnel_deployed,
        is_volunteer_team_diverse,
        lessons_learned,
        logistic_capacity_of_ns,
        major_coordination_mechanism,
        media_contact_email,
        media_contact_name,
        media_contact_phone_number,
        media_contact_title,
        men,
        national_authorities,
        national_society_contact_email,
        national_society_contact_name,
        national_society_contact_phone_number,
        national_society_contact_title,
        national_society_hotline_phone_number,
        national_society_integrity_contact_email,
        national_society_integrity_contact_name,
        national_society_integrity_contact_phone_number,
        national_society_integrity_contact_title,
        needs_identified,
        ns_request_text,
        ns_respond_date,
        num_affected,
        operation_objective,
        operation_timeframe,
        operation_timeframe_imminent,
        partner_national_society,
        people_assisted,
        people_per_local,
        people_per_urban,
        // planned_interventions,
        pmer,
        publishing_date,
        response_strategy,
        risk_security,
        risk_security_concern,
        scenario_analysis_supporting_document,
        selection_criteria,
        source_information,
        sub_total_cost,
        supporting_document_details,
        surge_deployment_cost,
        surge_personnel_deployed,
        targeting_strategy_support_file_details,
        title,
        total_cost,
        total_targeted_population,
        type_of_dref,
        type_of_dref_display,
        type_of_onset,
        type_of_onset_display,
        un_or_other_actor,
        women,
        event_text,
    } = drefResponse;

    const eventTextDefined = type_of_dref === DREF_TYPE_IMMINENT
        && !is_dref_imminent_v2
        && isTruthyString(event_text?.trim());

    const eventDescriptionDefined = (type_of_dref !== DREF_TYPE_IMMINENT || !is_dref_imminent_v2)
        && isTruthyString(event_description?.trim());
    const eventScopeDefined = type_of_dref === DREF_TYPE_RESPONSE
        && isTruthyString(event_scope?.trim());
    const sourceInformationDefined = isDefined(source_information)
        && source_information.length > 0;
    const imagesFileDefined = (type_of_dref !== DREF_TYPE_IMMINENT || !is_dref_imminent_v2)
        && isDefined(images_file)
        && images_file.length > 0;
    const eventDateDefined = type_of_dref !== DREF_TYPE_IMMINENT
        && isDefined(event_date);
    const scenarioAnalysisSupportingDocumentDefined = (
        type_of_dref === DREF_TYPE_IMMINENT
        && isDefined(scenario_analysis_supporting_document)
    );
    const anticipatoryActionsDefined = drefResponse?.type_of_dref === DREF_TYPE_IMMINENT
        && isTruthyString(drefResponse?.anticipatory_actions?.trim());

    const showEventDescriptionSection = eventDescriptionDefined
        || eventScopeDefined
        || imagesFileDefined
        || eventDateDefined
        || sourceInformationDefined
        || scenarioAnalysisSupportingDocumentDefined
        || eventTextDefined
        || anticipatoryActionsDefined
        || isDefined(event_map_file?.file);

    const hazardDateAndLocationDefined = type_of_dref === DREF_TYPE_IMMINENT
        && isDefined(hazard_date_and_location);
    const hazardRiskDefined = type_of_dref === DREF_TYPE_IMMINENT
        && hazard_vulnerabilities_and_risks;

    const riskRegions = district_details.map(
        (district) => district.name,
    ).filter(isDefined).join(', ');

    const drefAllocated = calculateProposedActionsCost(drefResponse);

    // FIXME: sourceInformationDefined has overlapping conditions
    const showScenarioAnalysis = hazardDateAndLocationDefined
        || hazardRiskDefined
        || sourceInformationDefined;

    const lessonsLearnedDefined = isTruthyString(lessons_learned?.trim());
    const childSafeguardingRiskLevelDefined = isTruthyString(
        child_safeguarding_risk_level?.trim(),
    );
    const showPreviousOperations = type_of_dref === DREF_TYPE_RESPONSE && (
        isDefined(did_it_affect_same_area)
        || isDefined(did_it_affect_same_population)
        || isDefined(did_ns_respond)
        || isDefined(did_ns_request_fund)
        || isTruthyString(ns_request_text?.trim())
        || isTruthyString(dref_recurrent_text?.trim())
        || lessonsLearnedDefined
    );

    const ifrcActionsDefined = isTruthyString(ifrc?.trim());
    const partnerNsActionsDefined = isTruthyString(partner_national_society?.trim());
    const showMovementPartnersActionsSection = (
        type_of_dref !== DREF_TYPE_IMMINENT || !is_dref_imminent_v2
    ) && (ifrcActionsDefined || partnerNsActionsDefined);

    const showProposedActions = groupedProposedActions.length > 0 && (
        type_of_dref !== DREF_TYPE_IMMINENT || !!is_dref_imminent_v2
    );

    const showNsAction = (type_of_dref !== DREF_TYPE_IMMINENT || !is_dref_imminent_v2)
        && isDefined(nsActions)
        && nsActions.length > 0;

    const icrcActionsDefined = (type_of_dref !== DREF_TYPE_IMMINENT || !is_dref_imminent_v2)
        && isTruthyString(icrc?.trim());

    const governmentRequestedAssistanceDefined = isDefined(
        government_requested_assistance,
    );
    const nationalAuthoritiesDefined = isDefined(national_authorities?.trim());
    const unOrOtherActorDefined = isDefined(un_or_other_actor?.trim());
    const majorCoordinationMechanismDefined = isDefined(
        major_coordination_mechanism?.trim(),
    );
    const showOtherActorsActionsSection = (
        type_of_dref !== DREF_TYPE_IMMINENT || !is_dref_imminent_v2
    ) && (
        governmentRequestedAssistanceDefined
            || nationalAuthoritiesDefined
            || unOrOtherActorDefined
            || majorCoordinationMechanismDefined
    );

    const identifiedGapsDefined = type_of_dref !== DREF_TYPE_IMMINENT
        && isTruthyString(identified_gaps?.trim());
    const needsIdentifiedDefined = isDefined(needs_identified)
        && needs_identified.length > 0
        && isDefined(needsIdentified);

    const assessmentReportDefined = isDefined(assessment_report_details)
        && isDefined(assessment_report_details.file);

    const showNeedsIdentifiedSection = type_of_dref !== DREF_TYPE_ASSESSMENT
        && (type_of_dref !== DREF_TYPE_IMMINENT || !is_dref_imminent_v2)
        && (identifiedGapsDefined || needsIdentifiedDefined || assessmentReportDefined);

    const operationObjectiveDefined = isTruthyString(operation_objective?.trim());
    const responseStrategyDefined = isTruthyString(response_strategy?.trim());
    const showOperationStrategySection = (
        type_of_dref !== DREF_TYPE_IMMINENT || !is_dref_imminent_v2
    ) && (operationObjectiveDefined || responseStrategyDefined);

    const peopleAssistedDefined = isTruthyString(people_assisted?.trim());
    const selectionCriteriaDefined = isTruthyString(selection_criteria?.trim());
    const targetingStrategySupportingDocumentDefined = isDefined(
        targeting_strategy_support_file_details,
    );
    const showTargetingStrategySection = (
        type_of_dref !== DREF_TYPE_IMMINENT || !is_dref_imminent_v2
    ) && type_of_dref !== DREF_TYPE_LOAN && (
        peopleAssistedDefined
            || selectionCriteriaDefined
            || targetingStrategySupportingDocumentDefined
    );

    const riskSecurityDefined = (type_of_dref !== DREF_TYPE_IMMINENT || !is_dref_imminent_v2)
        && isDefined(risk_security)
        && risk_security.length > 0;

    const riskSecurityConcernDefined = (type_of_dref !== DREF_TYPE_IMMINENT || !is_dref_imminent_v2)
        && isTruthyString(risk_security_concern?.trim());

    const hasAntiFraudPolicy = isDefined(has_anti_fraud_corruption_policy);
    const hasSexualAbusePolicy = isDefined(has_sexual_abuse_policy);
    const hasChildProtectionPolicy = isDefined(has_child_protection_policy);
    const hasWhistleblowerProtectionPolicy = isDefined(
        has_whistleblower_protection_policy,
    );
    const hasAntiSexualHarassmentPolicy = isDefined(
        has_anti_sexual_harassment_policy,
    );

    const hasChildrenSafeguardingDefined = (
        type_of_dref !== DREF_TYPE_IMMINENT || !is_dref_imminent_v2
    ) && isDefined(has_child_safeguarding_risk_analysis_assessment);

    const hasRiskAndSecurityPoliciesDefined = hasAntiFraudPolicy
        || hasSexualAbusePolicy
        || hasChildProtectionPolicy
        || hasWhistleblowerProtectionPolicy
        || hasAntiSexualHarassmentPolicy;

    const showRiskAndSecuritySection = riskSecurityDefined
        || riskSecurityConcernDefined
        || hasAntiFraudPolicy
        || hasSexualAbusePolicy
        || hasChildProtectionPolicy
        || hasWhistleblowerProtectionPolicy
        || hasRiskAndSecurityPoliciesDefined
        || hasAntiSexualHarassmentPolicy;

    const plannedInterventionDefined = (type_of_dref !== DREF_TYPE_IMMINENT || !is_dref_imminent_v2)
        && isDefined(plannedInterventions)
        && plannedInterventions.length > 0;

    const humanResourceDefined = (type_of_dref !== DREF_TYPE_IMMINENT || !is_dref_imminent_v2)
        && isTruthyString(human_resource?.trim());

    const isVolunteerTeamDiverseDefined = isTruthyString(
        is_volunteer_team_diverse?.trim(),
    );
    const surgePersonnelDeployedDefined = isTruthyString(
        surge_personnel_deployed?.trim(),
    );
    const humanitarianImpactsDefined = (type_of_dref === DREF_TYPE_IMMINENT && is_dref_imminent_v2)
        && isTruthyString(addressed_humanitarian_impacts?.trim());
    const contingencyPlanDocument = (type_of_dref === DREF_TYPE_IMMINENT && is_dref_imminent_v2)
        && isTruthyString(
            contingency_plans_supporting_document_details?.file,
        );
    const logisticCapacityOfNsDefined = (
        type_of_dref !== DREF_TYPE_IMMINENT || !is_dref_imminent_v2
    ) && isTruthyString(logistic_capacity_of_ns?.trim());
    const pmerDefined = (type_of_dref !== DREF_TYPE_IMMINENT || !is_dref_imminent_v2)
        && isTruthyString(pmer?.trim());
    const communicationDefined = (type_of_dref !== DREF_TYPE_IMMINENT || !is_dref_imminent_v2)
        && isTruthyString(communication?.trim());

    const showAboutSupportServicesSection = humanResourceDefined
        || isVolunteerTeamDiverseDefined
        || surgePersonnelDeployedDefined
        || humanitarianImpactsDefined
        || contingencyPlanDocument
        || logisticCapacityOfNsDefined
        || pmerDefined
        || communicationDefined;

    const showBudgetOverview = (type_of_dref !== DREF_TYPE_IMMINENT || !is_dref_imminent_v2)
        && isTruthyString(budget_file_details?.file);

    const nsContactText = [
        national_society_contact_name,
        national_society_contact_title,
        national_society_contact_email,
        national_society_contact_phone_number,
    ].filter(isTruthyString).join(', ');
    const nsContactDefined = isTruthyString(nsContactText);
    const appealManagerContactText = [
        ifrc_appeal_manager_name,
        ifrc_appeal_manager_title,
        ifrc_appeal_manager_email,
        ifrc_appeal_manager_phone_number,
    ].filter(isTruthyString).join(', ');
    const appealManagerContactDefined = isTruthyString(appealManagerContactText);
    const projectManagerContactText = [
        ifrc_project_manager_name,
        ifrc_project_manager_title,
        ifrc_project_manager_email,
        ifrc_project_manager_phone_number,
    ].filter(isTruthyString).join(', ');
    const projectManagerContactDefined = isTruthyString(projectManagerContactText);
    const focalPointContactText = [
        ifrc_emergency_name,
        ifrc_emergency_title,
        ifrc_emergency_email,
        ifrc_emergency_phone_number,
    ].filter(isTruthyString).join(', ');
    const focalPointContactDefined = isTruthyString(focalPointContactText);
    const mediaContactText = [
        media_contact_name,
        media_contact_title,
        media_contact_email,
        media_contact_phone_number,
    ].filter(isTruthyString).join(', ');
    const mediaContactDefined = isTruthyString(mediaContactText);
    const nationalSocietyIntegrityContactText = [
        national_society_integrity_contact_name,
        national_society_integrity_contact_title,
        national_society_integrity_contact_email,
        national_society_integrity_contact_phone_number,
    ].filter(isTruthyString).join(', ');
    const nationalSocietyIntegrityContactDefined = isTruthyString(
        nationalSocietyIntegrityContactText,
    );
    const nationalSocietyHotlineDefined = isTruthyString(
        national_society_hotline_phone_number,
    );

    const showContactsSection = nsContactDefined
        || appealManagerContactDefined
        || projectManagerContactDefined
        || focalPointContactDefined
        || mediaContactDefined
        || nationalSocietyIntegrityContactDefined
        || nationalSocietyHotlineDefined;

    return (
        <div className={styles.drefApplicationExport}>
            <Container childrenContainerClassName={styles.pageTitleSection}>
                <img
                    className={styles.ifrcLogo}
                    src={ifrcLogo}
                    alt={strings.imageLogoIFRCAlt}
                />
                <div>
                    {is_dref_imminent_v2 && type_of_dref === DREF_TYPE_IMMINENT ? (
                        <Heading level={1}>
                            {strings.exportDrefImminentTitle}
                        </Heading>
                    ) : (
                        <Heading level={1}>
                            {strings.exportTitle}
                        </Heading>
                    )}
                    <div className={styles.drefContentTitle}>
                        {title}
                    </div>
                </div>
            </Container>
            {isDefined(cover_image_file?.file)
                && (
                    <Container>
                        <Image
                            src={cover_image_file.file}
                            alt={title ?? ''}
                            caption={cover_image_file.caption}
                        />
                    </Container>
                )}
            <Container childrenContainerClassName={styles.metaSection}>
                <TextOutput
                    className={styles.metaItem}
                    label={strings.appealLabel}
                    value={appeal_code}
                    strongValue
                />
                {type_of_dref === TYPE_IMMINENT && is_dref_imminent_v2 && (
                    <TextOutput
                        className={styles.metaItem}
                        label={strings.drefAllocatedLabel}
                        value={drefAllocated?.total_cost}
                        prefix={strings.chfPrefix}
                        valueType="number"
                        strongValue
                    />
                )}
                <TextOutput
                    className={styles.metaItem}
                    label={strings.hazardLabel}
                    value={disaster_type_details?.name}
                    strongValue
                />
                <TextOutput
                    className={styles.metaItem}
                    label={strings.countryLabel}
                    value={country_details?.name}
                    strongValue
                />
                {type_of_dref === TYPE_IMMINENT && is_dref_imminent_v2 && (
                    <>
                        <TextOutput
                            className={styles.metaItem}
                            label={strings.drefFormRiskPeopleLabel}
                            value={num_affected}
                            strongValue
                            valueType="number"
                        />
                        <TextOutput
                            className={styles.metaItem}
                            label={strings.operationStartDateLabel}
                            value={date_of_approval}
                            valueType="date"
                            strongValue
                        />
                        <TextOutput
                            className={styles.metaItem}
                            label={strings.operationEndDateLabel}
                            value={end_date}
                            valueType="date"
                            strongValue
                        />
                        <div className={styles.metaActionsItem} />
                    </>
                )}
                {(type_of_dref !== TYPE_IMMINENT || !is_dref_imminent_v2) && (
                    <>
                        <TextOutput
                            className={styles.metaItem}
                            label={strings.typeOfDrefLabel}
                            value={type_of_dref_display}
                            strongValue
                        />
                        <TextOutput
                            className={styles.metaItem}
                            label={strings.crisisCategoryLabel}
                            value={disaster_category_display}
                            valueClassName={(
                                isDefined(disaster_category)
                                    ? colorMap[disaster_category]
                                    : undefined
                            )}
                            strongValue
                        />
                    </>
                )}
                <TextOutput
                    className={styles.metaItem}
                    label={strings.eventOnsetLabel}
                    value={type_of_onset_display}
                    strongValue
                />
                {type_of_dref === DREF_TYPE_IMMINENT && is_dref_imminent_v2 && (
                    <>
                        <TextOutput
                            className={styles.metaItem}
                            label={strings.drefApplicationExportForecastedLabel}
                            value={hazard_date}
                            strongValue
                        />
                        <TextOutput
                            className={styles.metaItem}
                            label={strings.operationTimeframeLabel}
                            value={operation_timeframe_imminent}
                            valueType="number"
                            suffix={strings.daysSuffix}
                            strongValue
                        />
                        <div className={styles.metaActionsItem} />
                    </>
                )}
                {(type_of_dref !== DREF_TYPE_IMMINENT || !is_dref_imminent_v2) && (
                    <>
                        <TextOutput
                            className={styles.budget}
                            label={strings.drefAllocationLabel}
                            value={amount_requested}
                            valueType="number"
                            prefix={strings.chfPrefix}
                            strongValue
                        />
                        <TextOutput
                            className={styles.metaItem}
                            label={strings.glideNumberLabel}
                            value={glide_code}
                            strongValue
                        />
                        <TextOutput
                            className={styles.metaItem}
                            label={type_of_dref === DREF_TYPE_RESPONSE
                                ? strings.peopleAffectedLabel
                                : strings.peopleAtRiskLabel}
                            value={num_affected}
                            valueType="number"
                            suffix={strings.peopleSuffix}
                            strongValue
                        />
                        <TextOutput
                            className={styles.budget}
                            label={strings.peopleTargetedLabel}
                            value={total_targeted_population}
                            suffix={strings.peopleSuffix}
                            valueType="number"
                            strongValue
                        />
                        <TextOutput
                            className={styles.metaItem}
                            label={strings.operationStartDateLabel}
                            value={date_of_approval}
                            valueType="date"
                            strongValue
                        />
                        <TextOutput
                            className={styles.metaItem}
                            label={strings.operationTimeframeLabel}
                            value={operation_timeframe}
                            valueType="number"
                            suffix={strings.monthsSuffix}
                            strongValue
                        />
                        <TextOutput
                            className={styles.metaItem}
                            label={strings.operationEndDateLabel}
                            value={end_date}
                            valueType="date"
                            strongValue
                        />
                        <TextOutput
                            className={styles.metaItem}
                            label={strings.drefPublishedLabel}
                            value={publishing_date}
                            valueType="date"
                            strongValue
                        />
                    </>
                )}
                <TextOutput
                    className={styles.targetedAreas}
                    label={strings.targetedAreasLabel}
                    value={district_details?.map(
                        (district) => district.name,
                    ).join(', ')}
                    strongValue
                />
            </Container>
            <div className={styles.pageBreak} />
            {showScenarioAnalysis && (
                <>
                    <Heading level={2}>
                        {(type_of_dref === DREF_TYPE_IMMINENT && is_dref_imminent_v2)
                            ? strings.scenarioAnalysis
                            : strings.eventDescriptionSectionHeading}
                    </Heading>
                    {hazardDateAndLocationDefined && (
                        <Container heading={strings.hazardDate}>
                            <DescriptionText>
                                {hazard_date_and_location}
                            </DescriptionText>
                            <DescriptionText>
                                {riskRegions}
                            </DescriptionText>
                        </Container>
                    )}
                    {hazardRiskDefined && (
                        <Container heading={strings.hazardRisk}>
                            <DescriptionText>
                                {hazard_vulnerabilities_and_risks}
                            </DescriptionText>
                        </Container>
                    )}
                </>
            )}
            {/* FIXME: merge scenario analysis and event description section */}
            {showEventDescriptionSection && (
                <>
                    {disaster_category_analysis_details?.file
                        && (type_of_dref !== DREF_TYPE_IMMINENT || !is_dref_imminent_v2) && (
                        <Container>
                            <Link href={disaster_category_analysis_details?.file}>
                                {strings.crisisCategorySupportingDocumentLabel}
                            </Link>
                        </Container>
                    )}
                    {eventTextDefined && (
                        <Container heading={strings.approximateDateOfImpactHeading}>
                            <DescriptionText>
                                {drefResponse?.event_text}
                            </DescriptionText>
                        </Container>
                    )}
                    {eventDateDefined && (
                        <Container
                            heading={type_of_onset === ONSET_SLOW
                                ? strings.dateWhenTriggerWasMetHeading
                                : strings.dateOfEventSlowHeading}
                        >
                            <DateOutput
                                value={event_date}
                                format={DEFAULT_PRINT_DATE_FORMAT}
                            />
                        </Container>
                    )}
                    {isTruthyString(event_map_file?.file)
                        && (type_of_dref !== DREF_TYPE_IMMINENT || !is_dref_imminent_v2) && (
                        <Container>
                            <Image
                                src={event_map_file?.file}
                                caption={event_map_file?.caption}
                            />
                        </Container>
                    )}
                    {eventDescriptionDefined && (
                        <Container
                            heading={(type_of_dref === DREF_TYPE_IMMINENT && !is_dref_imminent_v2)
                                ? strings.situationUpdateSectionHeading
                                : strings.whatWhereWhenSectionHeading}
                        >
                            <DescriptionText>
                                {event_description}
                            </DescriptionText>
                        </Container>
                    )}
                    {imagesFileDefined && (
                        <Container childrenContainerClassName={styles.eventImages}>
                            {images_file?.map(
                                (imageFile) => (
                                    <Image
                                        key={imageFile.id}
                                        src={imageFile.file}
                                        caption={imageFile.caption}
                                    />
                                ),
                            )}
                        </Container>
                    )}
                    {anticipatoryActionsDefined && (
                        <Container
                            heading={strings.anticipatoryActionsHeading}
                        >
                            <DescriptionText>
                                {drefResponse?.anticipatory_actions}
                            </DescriptionText>
                        </Container>
                    )}
                    {eventScopeDefined && (
                        <Container
                            heading={strings.scopeAndScaleSectionHeading}
                        >
                            <DescriptionText>
                                {event_scope}
                            </DescriptionText>
                        </Container>
                    )}
                    {supporting_document_details?.file && (
                        <Container>
                            <Link href={supporting_document_details?.file}>
                                {strings.drefApplicationSupportingDocumentation}
                            </Link>
                        </Container>
                    )}
                    {sourceInformationDefined && (
                        <Container
                            heading={type_of_dref === DREF_TYPE_IMMINENT
                                && !is_dref_imminent_v2
                                && strings.sourceInformationSectionHeading}
                            headingLevel={3}
                            childrenContainerClassName={styles.sourceInformationList}
                        >
                            <div className={styles.nameTitle}>
                                {strings.sourceInformationSourceNameTitle}
                            </div>
                            <div className={styles.linkTitle}>
                                {strings.sourceInformationSourceLinkTitle}
                            </div>
                            {source_information?.map(
                                (source, index) => (
                                    <Fragment key={source.id}>
                                        <DescriptionText className={styles.name}>
                                            <div className={styles.nameList}>
                                                {`${index + 1}. ${source.source_name}`}
                                            </div>
                                        </DescriptionText>
                                        <DescriptionText className={styles.link}>
                                            <Link href={source.source_link}>
                                                {source?.source_link}
                                            </Link>
                                        </DescriptionText>
                                    </Fragment>
                                ),
                            )}
                        </Container>
                    )}
                    {scenarioAnalysisSupportingDocumentDefined && (
                        <Container>
                            <Link href={drefResponse
                                ?.scenario_analysis_supporting_document_details?.file}
                            >
                                {strings.drefApplicationSupportingDocumentation}
                            </Link>
                        </Container>
                    )}
                </>
            )}
            {showPreviousOperations && (
                <Container
                    heading={strings.previousOperationsSectionHeading}
                    childrenContainerClassName={styles.previousOperationsContent}
                    headingLevel={2}
                >
                    <BlockTextOutput
                        label={strings.sameAreaAffectedLabel}
                        value={did_it_affect_same_area}
                        valueType="boolean"
                        strongValue
                    />
                    <BlockTextOutput
                        label={strings.samePopulationAffectedLabel}
                        value={did_it_affect_same_population}
                        valueType="boolean"
                        strongValue
                    />
                    <BlockTextOutput
                        label={strings.didNsRespondLabel}
                        value={did_ns_respond}
                        valueType="boolean"
                        strongValue
                    />
                    <BlockTextOutput
                        label={strings.didNsRequestFundLabel}
                        value={did_ns_request_fund}
                        valueType="boolean"
                        strongValue
                    />
                    <BlockTextOutput
                        label={strings.nsOperationLabel}
                        value={ns_request_text}
                        valueType="text"
                    />
                    <TextOutput
                        className={styles.recurrentEventJustification}
                        label={strings.recurrentEventJustificationLabel}
                        value={dref_recurrent_text}
                        strongLabel
                        valueType="text"
                    />
                    {lessonsLearnedDefined && (
                        <TextOutput
                            className={styles.lessonsLearned}
                            label={strings.lessonsLearnedLabel}
                            value={lessons_learned}
                            valueType="text"
                            strongLabel
                        />
                    )}
                    <BlockTextOutput
                        label={strings.completeChildSafeguardingRiskLabel}
                        value={complete_child_safeguarding_risk}
                        valueType="boolean"
                        strongValue
                    />
                    {childSafeguardingRiskLevelDefined && (
                        <TextOutput
                            className={styles.childSafeguardingRiskLevel}
                            label={strings.childSafeguardingRiskLevelLabel}
                            value={child_safeguarding_risk_level}
                            valueType="text"
                            strongValue
                            variant="contents"
                        />
                    )}
                </Container>
            )}
            {showNsAction && (
                <>
                    <Heading level={2}>
                        {strings.currentNationalSocietyActionsHeading}
                    </Heading>
                    {ns_respond_date && (
                        <Container
                            heading={(type_of_dref === DREF_TYPE_IMMINENT && is_dref_imminent_v2)
                                ? strings.nationalSocietyActionsHeading
                                : strings.drefFormNsResponseStarted}
                        >
                            <DateOutput
                                value={ns_respond_date}
                                format={DEFAULT_PRINT_DATE_FORMAT}
                            />
                        </Container>
                    )}
                    <Container
                        childrenContainerClassName={styles.nsActionsContent}
                    >
                        {nsActions?.map(
                            (nsAction) => (
                                <BlockTextOutput
                                    key={nsAction.id}
                                    label={nsAction.title_display}
                                    value={nsAction.description}
                                    valueType="text"
                                    strongLabel
                                />
                            ),
                        )}
                    </Container>
                </>
            )}
            {showMovementPartnersActionsSection && (
                <Container
                    heading={strings.movementPartnersActionsHeading}
                    childrenContainerClassName={styles.movementPartnersActionsContent}
                    headingLevel={2}
                >
                    {ifrcActionsDefined && (
                        <BlockTextOutput
                            label={strings.secretariatLabel}
                            value={ifrc}
                            valueType="text"
                            strongLabel
                        />
                    )}
                    {partnerNsActionsDefined && (
                        <BlockTextOutput
                            label={strings.participatingNsLabel}
                            value={partner_national_society}
                            valueType="text"
                            strongLabel
                        />
                    )}
                </Container>
            )}
            {icrcActionsDefined && (
                <Container
                    heading={strings.icrcActionsHeading}
                    childrenContainerClassName={styles.icrcActionsContent}
                    headingLevel={2}
                >
                    <DescriptionText>
                        {icrc}
                    </DescriptionText>
                </Container>
            )}
            {showOtherActorsActionsSection && (
                <Container
                    heading={strings.otherActionsHeading}
                    childrenContainerClassName={styles.otherActionsContent}
                    headingLevel={2}
                >
                    {governmentRequestedAssistanceDefined && (
                        <BlockTextOutput
                            label={strings.governmentRequestedAssistanceLabel}
                            value={government_requested_assistance}
                            valueType="boolean"
                            strongLabel
                        />
                    )}
                    {nationalAuthoritiesDefined && (
                        <BlockTextOutput
                            label={strings.nationalAuthoritiesLabel}
                            value={national_authorities}
                            valueType="text"
                            strongLabel
                        />
                    )}
                    {unOrOtherActorDefined && (
                        <BlockTextOutput
                            label={strings.unOrOtherActorsLabel}
                            value={un_or_other_actor}
                            valueType="text"
                            strongLabel
                        />
                    )}
                    {majorCoordinationMechanismDefined && (
                        <TextOutput
                            className={styles.otherActionsMajorCoordinationMechanism}
                            label={strings.majorCoordinationMechanismLabel}
                            value={major_coordination_mechanism}
                            valueType="text"
                            strongLabel
                            withoutLabelColon
                        />
                    )}
                </Container>
            )}
            {showNeedsIdentifiedSection && (
                <>
                    <Heading level={2}>
                        {strings.needsIdentifiedSectionHeading}
                    </Heading>
                    {needsIdentifiedDefined && needsIdentified?.map(
                        (identifiedNeed) => (
                            <Fragment key={identifiedNeed.id}>
                                <Heading className={styles.needsIdentifiedHeading}>
                                    <img
                                        className={styles.icon}
                                        src={identifiedNeed.image_url}
                                        alt=""
                                    />
                                    {identifiedNeed.title_display}
                                </Heading>
                                <DescriptionText className={styles.needsIdentifiedDescription}>
                                    {identifiedNeed.description}
                                </DescriptionText>
                            </Fragment>
                        ),
                    )}
                    {identifiedGapsDefined && (
                        <Container heading={strings.identifiedGapsHeading}>
                            <DescriptionText>
                                {identified_gaps}
                            </DescriptionText>
                        </Container>
                    )}
                    {assessmentReportDefined && (
                        <Container>
                            <Link href={assessment_report_details?.file}>
                                {strings.drefAssessmentReportLink}
                            </Link>
                        </Container>
                    )}
                </>
            )}
            {showOperationStrategySection && (
                <>
                    <Heading level={2}>
                        {strings.operationalStrategySectionHeading}
                    </Heading>
                    {operationObjectiveDefined && (
                        <Container
                            heading={strings.overallObjectiveHeading}
                        >
                            <DescriptionText>
                                {operation_objective}
                            </DescriptionText>
                        </Container>
                    )}
                    {responseStrategyDefined && (
                        <Container
                            heading={strings.operationStrategyHeading}
                        >
                            <DescriptionText>
                                {response_strategy}
                            </DescriptionText>
                        </Container>
                    )}
                </>
            )}
            {showTargetingStrategySection && (
                <>
                    <Heading level={2}>
                        {strings.targetingStrategySectionHeading}
                    </Heading>
                    {targetingStrategySupportingDocumentDefined && (
                        <Container>
                            <Link
                                href={targeting_strategy_support_file_details?.file}
                            >
                                {strings.targetingStrategySupportingDocument}
                            </Link>
                        </Container>
                    )}
                    {peopleAssistedDefined && (
                        <Container
                            heading={strings.peopleAssistedHeading}
                        >
                            <DescriptionText>
                                {people_assisted}
                            </DescriptionText>
                        </Container>
                    )}
                    {selectionCriteriaDefined && (
                        <Container
                            heading={strings.selectionCriteriaHeading}
                        >
                            <DescriptionText>
                                {selection_criteria}
                            </DescriptionText>
                        </Container>
                    )}
                </>
            )}
            {(type_of_dref !== DREF_TYPE_IMMINENT || !is_dref_imminent_v2) && (
                <Container
                    heading={strings.targetPopulationSectionHeading}
                    headingLevel={2}
                    childrenContainerClassName={styles.targetPopulationContent}
                >
                    {type_of_dref !== DREF_TYPE_ASSESSMENT && (
                        <BlockTextOutput
                            label={strings.womenLabel}
                            value={women}
                            valueType="number"
                            strongValue
                        />
                    )}
                    <BlockTextOutput
                        label={strings.ruralLabel}
                        value={people_per_local}
                        valueType="number"
                        suffix="%"
                        strongValue
                    />
                    {type_of_dref !== DREF_TYPE_ASSESSMENT && (
                        <BlockTextOutput
                            label={strings.girlsLabel}
                            value={girls}
                            valueType="number"
                            strongValue
                        />
                    )}
                    <BlockTextOutput
                        label={strings.urbanLabel}
                        value={people_per_urban}
                        suffix="%"
                        valueType="number"
                        strongValue
                    />
                    {type_of_dref !== DREF_TYPE_ASSESSMENT && (
                        <BlockTextOutput
                            label={strings.menLabel}
                            value={men}
                            valueType="number"
                            strongValue
                        />
                    )}
                    <BlockTextOutput
                        className={styles.disabilitiesPopulation}
                        label={strings.peopleWithDisabilitiesLabel}
                        value={disability_people_per}
                        suffix="%"
                        valueType="number"
                        strongValue
                    />
                    {type_of_dref !== DREF_TYPE_ASSESSMENT && (
                        <BlockTextOutput
                            label={strings.boysLabel}
                            value={boys}
                            valueType="number"
                            strongValue
                        />
                    )}
                    <div className={styles.emptyBlock} />
                    <BlockTextOutput
                        label={strings.targetedPopulationLabel}
                        value={total_targeted_population}
                        valueClassName={styles.totalTargetedPopulationValue}
                        valueType="number"
                        strongValue
                    />
                </Container>
            )}
            {showRiskAndSecuritySection && (
                <Container
                    childrenContainerClassName={styles.riskAndSecuritySection}
                    heading={strings.riskAndSecuritySectionHeading}
                    headingLevel={2}
                >
                    {hasAntiFraudPolicy && (
                        <BlockTextOutput
                            label={strings.hasAntiFraudPolicy}
                            value={has_anti_fraud_corruption_policy}
                            valueType="boolean"
                            strongValue
                        />
                    )}
                    {hasSexualAbusePolicy && (
                        <BlockTextOutput
                            label={strings.hasSexualAbusePolicy}
                            value={has_sexual_abuse_policy}
                            valueType="boolean"
                            strongValue
                        />
                    )}
                    {hasChildProtectionPolicy && (
                        <BlockTextOutput
                            label={strings.hasChildProtectionPolicy}
                            value={has_child_protection_policy}
                            valueType="boolean"
                            strongValue
                        />
                    )}
                    {hasWhistleblowerProtectionPolicy && (
                        <BlockTextOutput
                            label={strings.hasWhistleblowerProtectionPolicy}
                            value={has_whistleblower_protection_policy}
                            valueType="boolean"
                            strongValue
                        />
                    )}
                    {hasAntiSexualHarassmentPolicy && (
                        <BlockTextOutput
                            label={strings.hasAntiSexualHarassmentPolicy}
                            value={has_anti_sexual_harassment_policy}
                            valueType="boolean"
                            strongValue
                        />
                    )}
                    {riskSecurityDefined && (
                        <>
                            <div className={styles.potentialRisksHeading}>
                                {strings.riskSecurityHeading}
                            </div>
                            <div className={styles.riskTitle}>
                                {strings.drefApplicationExportRisk}
                            </div>
                            <div className={styles.mitigationTitle}>
                                {strings.drefApplicationExportMitigation}
                            </div>
                            {risk_security?.map(
                                (riskSecurity) => (
                                    <Fragment key={riskSecurity.id}>
                                        <DescriptionText className={styles.risk}>
                                            {riskSecurity.risk}
                                        </DescriptionText>
                                        <DescriptionText className={styles.mitigation}>
                                            {riskSecurity.mitigation}
                                        </DescriptionText>
                                    </Fragment>
                                ),
                            )}
                        </>
                    )}
                    {riskSecurityConcernDefined && (
                        <TextOutput
                            className={styles.riskSecurityConcern}
                            label={strings.safetyConcernHeading}
                            value={risk_security_concern}
                            valueType="text"
                            strongLabel
                        />
                    )}
                    {hasChildrenSafeguardingDefined && (
                        <BlockTextOutput
                            label={strings.hasChildRiskCompleted}
                            value={has_child_safeguarding_risk_analysis_assessment}
                            valueType="boolean"
                            strongValue
                        />
                    )}
                </Container>
            )}
            {plannedInterventionDefined && (
                <>
                    <Heading level={2}>
                        {strings.plannedInterventionSectionHeading}
                    </Heading>
                    {plannedInterventions?.map((plannedIntervention) => (
                        <Fragment key={plannedIntervention.id}>
                            <Heading className={styles.plannedInterventionHeading}>
                                <img
                                    className={styles.icon}
                                    src={plannedIntervention.image_url}
                                    alt={strings.plannedInterventionAltText}
                                />
                                {plannedIntervention.title_display}
                            </Heading>
                            <Container>
                                <TextOutput
                                    label={strings.budgetLabel}
                                    value={plannedIntervention.budget}
                                    valueType="number"
                                    prefix={strings.chfPrefix}
                                    strongLabel
                                />
                                <TextOutput
                                    label={strings.targetedPersonsLabel}
                                    value={plannedIntervention.person_targeted}
                                    valueType="number"
                                    strongLabel
                                />
                            </Container>
                            <Container
                                heading={strings.indicatorsHeading}
                                headingLevel={5}
                                childrenContainerClassName={
                                    styles.plannedInterventionIndicators
                                }
                            >
                                <div className={styles.titleLabel}>
                                    {strings.indicatorTitleLabel}
                                </div>
                                <div className={styles.targetLabel}>
                                    {strings.indicatorTargetLabel}
                                </div>
                                {plannedIntervention.indicators?.map(
                                    (indicator) => (
                                        <BlockTextOutput
                                            key={indicator.id}
                                            label={indicator.title}
                                            value={indicator.target}
                                            valueType="number"
                                        />
                                    ),
                                )}
                            </Container>
                            <Container
                                heading={strings.priorityActionsHeading}
                                headingLevel={5}
                            >
                                <DescriptionText>
                                    {plannedIntervention.description}
                                </DescriptionText>
                            </Container>
                        </Fragment>
                    ))}
                </>
            )}
            {showAboutSupportServicesSection && (
                <>
                    <Heading level={2}>
                        {(type_of_dref === DREF_TYPE_IMMINENT && is_dref_imminent_v2)
                            ? strings.plan
                            : strings.aboutSupportServicesSectionHeading}
                    </Heading>
                    {humanResourceDefined && (
                        <Container heading={strings.humanResourcesHeading}>
                            <DescriptionText>
                                {human_resource}
                            </DescriptionText>
                        </Container>
                    )}
                    {isVolunteerTeamDiverseDefined && (
                        <Container heading={strings.isVolunteerTeamDiverseHeading}>
                            <DescriptionText>
                                {is_volunteer_team_diverse}
                            </DescriptionText>
                        </Container>
                    )}
                    {surgePersonnelDeployedDefined && (
                        <Container heading={strings.surgePersonnelDeployedHeading}>
                            <DescriptionText>
                                {is_surge_personnel_deployed
                                    ? strings.yes : strings.no}
                            </DescriptionText>
                            <DescriptionText>
                                {surge_personnel_deployed}
                            </DescriptionText>
                        </Container>
                    )}
                    {humanitarianImpactsDefined && (
                        <Container heading={strings.humanitarianImpactsHeading}>
                            <DescriptionText>
                                {addressed_humanitarian_impacts}
                            </DescriptionText>
                        </Container>
                    )}
                    {contingencyPlanDocument && (
                        <Container>
                            <Link href={contingency_plans_supporting_document_details?.file}>
                                {strings.contingencyPlanDocument}
                            </Link>
                        </Container>
                    )}
                    {logisticCapacityOfNsDefined && (
                        <Container heading={strings.logisticCapacityHeading}>
                            <DescriptionText>
                                {logistic_capacity_of_ns}
                            </DescriptionText>
                        </Container>
                    )}
                    {pmerDefined && (
                        <Container heading={strings.pmerHeading}>
                            <DescriptionText>
                                {pmer}
                            </DescriptionText>
                        </Container>
                    )}
                    {communicationDefined && (
                        <Container heading={strings.communicationHeading}>
                            <DescriptionText>
                                {communication}
                            </DescriptionText>
                        </Container>
                    )}
                </>
            )}
            {showProposedActions && (
                <Container
                    heading={strings.proposedActions}
                    headingLevel={3}
                    childrenContainerClassName={styles.proposedActions}
                >
                    <div className={styles.actionTitleLabel} />
                    <div className={styles.actionTitleLabel}>
                        {strings.proposedActionsSector}
                    </div>
                    <div className={styles.actionTitleLabel}>
                        {strings.proposedActionsActivities}
                    </div>
                    <div className={styles.actionTitleLabel}>
                        {strings.priorityActionsBudget}
                    </div>
                    {groupedProposedActions.map((proposedAction) => (
                        <Fragment key={proposedAction.key}>
                            <div
                                className={styles.proposedAction}
                                style={{
                                    gridRow: `span ${proposedAction.numActivities}`,
                                }}
                            >
                                <img
                                    className={styles.icon}
                                    src={proposedAction.icon}
                                    alt=""
                                />
                                <div className={styles.title}>
                                    {proposedAction.title}
                                </div>
                            </div>
                            {proposedAction.actions.map((action) => (
                                <Fragment key={action.id}>
                                    {action.activities.map((activity, i) => (
                                        <Fragment key={activity.id}>
                                            <SelectOutput
                                                className={styles.sector}
                                                options={primarySectorOptions}
                                                label={undefined}
                                                labelSelector={primarySectoryLabelSelector}
                                                keySelector={primarySectoryKeySelector}
                                                value={activity.sector}
                                            />
                                            <div className={styles.activity}>
                                                {activity.activity}
                                            </div>
                                            {i === 0 && (
                                                <div
                                                    className={styles.budget}
                                                    style={{ gridRow: `span ${action.activities.length}` }}
                                                >
                                                    <NumberOutput
                                                        value={action.total_budget}
                                                        prefix={strings.chfPrefix}
                                                    />
                                                </div>
                                            )}
                                        </Fragment>
                                    ))}
                                </Fragment>
                            ))}
                        </Fragment>
                    ))}
                    <div className={styles.costLabel}>
                        {strings.priorityActionsSubTotal}
                    </div>
                    <NumberOutput
                        className={styles.costValue}
                        value={sub_total_cost}
                        prefix={strings.chfPrefix}
                    />
                    {isDefined(surge_deployment_cost) && (
                        <>
                            <div className={styles.costLabel}>
                                {strings.priorityActionsSurgeDeployment}
                            </div>
                            <NumberOutput
                                className={styles.costValue}
                                value={surge_deployment_cost}
                                prefix={strings.chfPrefix}
                            />
                        </>
                    )}
                    <div className={styles.costLabel}>
                        {strings.priorityActionsIndirectCost}
                    </div>
                    <NumberOutput
                        className={styles.costValue}
                        value={indirect_cost}
                        prefix={strings.chfPrefix}
                    />
                    <div className={styles.costLabel}>
                        {strings.priorityActionsTotal}
                    </div>
                    <NumberOutput
                        className={styles.costValue}
                        value={total_cost}
                        prefix={strings.chfPrefix}
                    />
                </Container>
            )}
            {showBudgetOverview && (
                <>
                    <div className={styles.pageBreak} />
                    <Container
                        heading={strings.budgetOverSectionHeading}
                        headingLevel={2}
                    >
                        <Image
                            imgElementClassName={styles.budgetFilePreview}
                            src={budget_file_preview}
                        />
                    </Container>
                    <Container>
                        <Link href={budget_file_details?.file}>
                            {strings.drefExportDownloadBudget}
                        </Link>
                    </Container>
                </>
            )}
            {showContactsSection && (
                <>
                    <div className={styles.pageBreak} />
                    <Heading level={2}>
                        {strings.contactInformationSectionHeading}
                    </Heading>
                    <Container>
                        {strings.contactInformationSectionDescription}
                    </Container>
                    <Container childrenContainerClassName={styles.contactList}>
                        {nsContactDefined && (
                            <TextOutput
                                labelClassName={styles.contactPersonLabel}
                                label={strings.nsContactHeading}
                                value={nsContactText}
                                strongLabel
                            />
                        )}
                        {appealManagerContactDefined && (
                            <TextOutput
                                labelClassName={styles.contactPersonLabel}
                                label={strings.appealManagerContactHeading}
                                value={appealManagerContactText}
                                strongLabel
                            />
                        )}
                        {projectManagerContactDefined && (
                            <TextOutput
                                labelClassName={styles.contactPersonLabel}
                                label={strings.projectManagerContactHeading}
                                value={projectManagerContactText}
                                strongLabel
                            />
                        )}
                        {focalPointContactDefined && (
                            <TextOutput
                                labelClassName={styles.contactPersonLabel}
                                label={strings.focalPointContactHeading}
                                value={focalPointContactText}
                                strongLabel
                            />
                        )}
                        {mediaContactDefined && (
                            <TextOutput
                                labelClassName={styles.contactPersonLabel}
                                label={strings.mediaContactHeading}
                                value={mediaContactText}
                                strongLabel
                            />
                        )}
                        {nationalSocietyIntegrityContactDefined && (
                            <TextOutput
                                labelClassName={styles.contactPersonLabel}
                                label={strings.nationalSocietyIntegrityHeading}
                                value={nationalSocietyIntegrityContactText}
                                strongLabel
                            />
                        )}
                        {nationalSocietyHotlineDefined && (
                            <TextOutput
                                labelClassName={styles.contactPersonLabel}
                                label={strings.nationalSocietyHotlineHeading}
                                value={national_society_hotline_phone_number}
                                strongLabel
                            />
                        )}
                    </Container>
                    <Link href="/emergencies">
                        {strings.drefExportReference}
                    </Link>
                </>
            )}
            {pgaExport && (
                <>
                    <div className={styles.pageBreak} />
                    <PgaExport />
                </>
            )}
            {previewReady && <div id="pdf-preview-ready" />}
        </div>
    );
}

Component.displayName = 'DrefApplicationExport';
