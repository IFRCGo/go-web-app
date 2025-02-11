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
    _cs,
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

const colorMap: Record<DisasterCategory, string> = {
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
            if (isNotDefined(drefResponse) || isNotDefined(drefResponse.needs_identified)) {
                return undefined;
            }

            const { national_society_actions } = drefResponse;

            return national_society_actions?.map((nsAction) => {
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
                    title: list[0].proposed_type_display,
                    numActivities,
                    actions: list,
                    icon: proposedActivityIconMap[key],
                };
            },
        );
    }, [drefResponse]);

    const eventDescriptionDefined = isDefined(drefResponse)
        && drefResponse?.type_of_dref !== DREF_TYPE_IMMINENT
        && isTruthyString(drefResponse?.event_description?.trim());
    const eventScopeDefined = drefResponse?.type_of_dref === DREF_TYPE_RESPONSE
        && isTruthyString(drefResponse?.event_scope?.trim());
    const isDefinedSourceInformation = isDefined(drefResponse)
        && isDefined(drefResponse.source_information)
        && drefResponse.source_information.length > 0;
    const imagesFileDefined = isDefined(drefResponse)
        && drefResponse?.type_of_dref !== DREF_TYPE_IMMINENT
        && isDefined(drefResponse.images_file)
        && drefResponse.images_file.length > 0;
    const eventDateDefined = drefResponse?.type_of_dref !== DREF_TYPE_IMMINENT
        && isDefined(drefResponse?.event_date);
    const isDefinedScenarioAnalysisSupportingDocument = (
        drefResponse?.type_of_dref === DREF_TYPE_IMMINENT
        && isDefined(drefResponse.scenario_analysis_supporting_document)
    );
    const showEventDescriptionSection = eventDescriptionDefined
        || eventScopeDefined
        || imagesFileDefined
        || eventDateDefined
        || isDefinedSourceInformation
        || isDefinedScenarioAnalysisSupportingDocument
        || isDefined(drefResponse?.event_map_file?.file);

    const isDefinedHazardDate = drefResponse?.type_of_dref === DREF_TYPE_IMMINENT
        && isDefined(drefResponse?.hazard_date);
    const isDefinedHazardRisk = drefResponse?.type_of_dref === DREF_TYPE_IMMINENT
        && drefResponse.hazard_vulnerabilities_and_risks;

    const riskRegions = drefResponse?.district_details.map(
        (district) => district.name,
    ).filter(isDefined).join(', ');

    const drefAllocated = useMemo(() => {
        if (isNotDefined(drefResponse)) {
            return undefined;
        }
        return calculateProposedActionsCost(drefResponse);
    }, [drefResponse]);

    const showScenarioAnalysis = isDefinedHazardDate
        || isDefinedHazardRisk
        || isDefinedSourceInformation;

    const lessonsLearnedDefined = isTruthyString(drefResponse?.lessons_learned?.trim());
    const childSafeguardingRiskLevelDefined = isTruthyString(
        drefResponse?.child_safeguarding_risk_level?.trim(),
    );
    const showPreviousOperations = drefResponse?.type_of_dref === DREF_TYPE_RESPONSE && (
        isDefined(drefResponse?.did_it_affect_same_area)
        || isDefined(drefResponse?.did_it_affect_same_population)
        || isDefined(drefResponse?.did_ns_respond)
        || isDefined(drefResponse?.did_ns_request_fund)
        || isTruthyString(drefResponse?.ns_request_text?.trim())
        || isTruthyString(drefResponse?.dref_recurrent_text?.trim())
        || lessonsLearnedDefined
    );

    const ifrcActionsDefined = isTruthyString(drefResponse?.ifrc?.trim());
    const partnerNsActionsDefined = isTruthyString(drefResponse?.partner_national_society?.trim());
    const showMovementPartnersActionsSection = isDefined(drefResponse)
        && drefResponse?.type_of_dref !== DREF_TYPE_IMMINENT
        && (ifrcActionsDefined || partnerNsActionsDefined);

    const showProposedActions = groupedProposedActions.length > 0;

    const showNsAction = isDefined(drefResponse)
        && drefResponse?.type_of_dref !== DREF_TYPE_IMMINENT
        && isDefined(drefResponse.national_society_actions)
        && drefResponse.national_society_actions.length > 0
        && isDefined(nsActions);

    const icrcActionsDefined = isDefined(drefResponse)
        && drefResponse?.type_of_dref !== DREF_TYPE_IMMINENT
        && isTruthyString(drefResponse?.icrc?.trim());

    const governmentRequestedAssistanceDefined = isDefined(
        drefResponse?.government_requested_assistance,
    );
    const nationalAuthoritiesDefined = isDefined(drefResponse?.national_authorities?.trim());
    const unOrOtherActorDefined = isDefined(drefResponse?.un_or_other_actor?.trim());
    const majorCoordinationMechanismDefined = isDefined(
        drefResponse?.major_coordination_mechanism?.trim(),
    );
    const showOtherActorsActionsSection = (governmentRequestedAssistanceDefined
        && isDefined(drefResponse)
        && drefResponse?.type_of_dref !== DREF_TYPE_IMMINENT)
        && (
            nationalAuthoritiesDefined
            || unOrOtherActorDefined
            || majorCoordinationMechanismDefined
        );

    const identifiedGapsDefined = drefResponse?.type_of_dref !== DREF_TYPE_IMMINENT
        && isTruthyString(drefResponse?.identified_gaps?.trim());
    const needsIdentifiedDefined = isDefined(drefResponse)
        && isDefined(drefResponse.needs_identified)
        && drefResponse.needs_identified.length > 0
        && isDefined(needsIdentified);

    const assessmentReportDefined = isDefined(drefResponse)
        && isDefined(drefResponse.assessment_report_details)
        && isDefined(drefResponse.assessment_report_details.file);

    const showNeedsIdentifiedSection = isDefined(drefResponse)
        && drefResponse.type_of_dref !== DREF_TYPE_ASSESSMENT
        && drefResponse.type_of_dref !== DREF_TYPE_IMMINENT
        && (identifiedGapsDefined || needsIdentifiedDefined || assessmentReportDefined);

    const operationObjectiveDefined = isTruthyString(drefResponse?.operation_objective?.trim());
    const responseStrategyDefined = isTruthyString(drefResponse?.response_strategy?.trim());
    const showOperationStrategySection = isDefined(drefResponse)
        && drefResponse.type_of_dref !== DREF_TYPE_IMMINENT
        && (operationObjectiveDefined || responseStrategyDefined);

    const peopleAssistedDefined = isTruthyString(drefResponse?.people_assisted?.trim());
    const selectionCriteriaDefined = isTruthyString(drefResponse?.selection_criteria?.trim());
    const targetingStrategySupportingDocumentDefined = isDefined(
        drefResponse?.targeting_strategy_support_file_details,
    );
    const showTargetingStrategySection = (isDefined(drefResponse)
        && drefResponse.type_of_dref !== DREF_TYPE_IMMINENT
        && drefResponse.type_of_dref !== DREF_TYPE_LOAN
    ) && (
        peopleAssistedDefined
        || selectionCriteriaDefined
        || targetingStrategySupportingDocumentDefined
    );

    const riskSecurityDefined = isDefined(drefResponse)
        && drefResponse.type_of_dref !== DREF_TYPE_IMMINENT
        && isDefined(drefResponse.risk_security)
        && drefResponse.risk_security.length > 0;
    const riskSecurityConcernDefined = isDefined(drefResponse)
        && drefResponse.type_of_dref !== DREF_TYPE_IMMINENT
        && isTruthyString(drefResponse?.risk_security_concern?.trim());
    const hasAntiFraudPolicy = isDefined(drefResponse?.has_anti_fraud_corruption_policy);
    const hasSexualAbusePolicy = isDefined(drefResponse?.has_sexual_abuse_policy);
    const hasChildProtectionPolicy = isDefined(drefResponse?.has_child_protection_policy);
    const hasWhistleblowerProtectionPolicy = isDefined(
        drefResponse?.has_whistleblower_protection_policy,
    );
    const hasAntiSexualHarassmentPolicy = isDefined(
        drefResponse?.has_anti_sexual_harassment_policy,
    );

    const hasChildrenSafeguardingDefined = isDefined(drefResponse)
        && drefResponse.type_of_dref !== DREF_TYPE_IMMINENT
        && isDefined(
            drefResponse?.has_child_safeguarding_risk_analysis_assessment,
        );

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

    const plannedInterventionDefined = isDefined(drefResponse)
        && drefResponse.type_of_dref !== DREF_TYPE_IMMINENT
        && isDefined(drefResponse.planned_interventions)
        && drefResponse.planned_interventions.length > 0
        && isDefined(plannedInterventions);

    const humanResourceDefined = isDefined(drefResponse)
        && drefResponse.type_of_dref !== DREF_TYPE_IMMINENT
        && isTruthyString(drefResponse?.human_resource?.trim());
    const isVolunteerTeamDiverseDefined = isTruthyString(
        drefResponse?.is_volunteer_team_diverse?.trim(),
    );
    const surgePersonnelDeployedDefined = isTruthyString(
        drefResponse?.surge_personnel_deployed?.trim(),
    );
    const humanitarianImpactsDefined = isDefined(drefResponse)
        && drefResponse.type_of_dref === DREF_TYPE_IMMINENT
        && isTruthyString(drefResponse?.addressed_humanitarian_impacts?.trim());
    const logisticCapacityOfNsDefined = isDefined(drefResponse)
        && drefResponse.type_of_dref !== DREF_TYPE_IMMINENT
        && isTruthyString(
            drefResponse?.logistic_capacity_of_ns?.trim(),
        );
    const pmerDefined = isDefined(drefResponse)
        && drefResponse.type_of_dref !== DREF_TYPE_IMMINENT
        && isTruthyString(drefResponse?.pmer?.trim());
    const communicationDefined = isDefined(drefResponse)
        && drefResponse.type_of_dref !== DREF_TYPE_IMMINENT
        && isTruthyString(drefResponse?.communication?.trim());
    const contingencyPlanDocument = isDefined(drefResponse)
        && drefResponse.type_of_dref === DREF_TYPE_IMMINENT
        && isTruthyString(
            drefResponse?.contingency_plans_supporting_document_details?.file,
        );

    const showAboutSupportServicesSection = humanResourceDefined
        || surgePersonnelDeployedDefined
        || logisticCapacityOfNsDefined
        || pmerDefined
        || communicationDefined
        || humanitarianImpactsDefined
        || showProposedActions
        || contingencyPlanDocument;

    const showBudgetOverview = isDefined(drefResponse)
        && drefResponse.type_of_dref !== DREF_TYPE_IMMINENT
        && isTruthyString(drefResponse?.budget_file_details?.file);

    const nsContactText = [
        drefResponse?.national_society_contact_name,
        drefResponse?.national_society_contact_title,
        drefResponse?.national_society_contact_email,
        drefResponse?.national_society_contact_phone_number,
    ].filter(isTruthyString).join(', ');
    const nsContactDefined = isTruthyString(nsContactText);
    const appealManagerContactText = [
        drefResponse?.ifrc_appeal_manager_name,
        drefResponse?.ifrc_appeal_manager_title,
        drefResponse?.ifrc_appeal_manager_email,
        drefResponse?.ifrc_appeal_manager_phone_number,
    ].filter(isTruthyString).join(', ');
    const appealManagerContactDefined = isTruthyString(appealManagerContactText);
    const projectManagerContactText = [
        drefResponse?.ifrc_project_manager_name,
        drefResponse?.ifrc_project_manager_title,
        drefResponse?.ifrc_project_manager_email,
        drefResponse?.ifrc_project_manager_phone_number,
    ].filter(isTruthyString).join(', ');
    const projectManagerContactDefined = isTruthyString(projectManagerContactText);
    const focalPointContactText = [
        drefResponse?.ifrc_emergency_name,
        drefResponse?.ifrc_emergency_title,
        drefResponse?.ifrc_emergency_email,
        drefResponse?.ifrc_emergency_phone_number,
    ].filter(isTruthyString).join(', ');
    const focalPointContactDefined = isTruthyString(focalPointContactText);
    const mediaContactText = [
        drefResponse?.media_contact_name,
        drefResponse?.media_contact_title,
        drefResponse?.media_contact_email,
        drefResponse?.media_contact_phone_number,
    ].filter(isTruthyString).join(', ');
    const mediaContactDefined = isTruthyString(mediaContactText);
    const nationalSocietyIntegrityContactText = [
        drefResponse?.national_society_integrity_contact_name,
        drefResponse?.national_society_integrity_contact_title,
        drefResponse?.national_society_integrity_contact_email,
        drefResponse?.national_society_integrity_contact_phone_number,
    ].filter(isTruthyString).join(', ');
    const nationalSocietyIntegrityContactDefined = isTruthyString(
        nationalSocietyIntegrityContactText,
    );
    const nationalSocietyHotlineDefined = isTruthyString(
        drefResponse?.national_society_hotline_phone_number,
    );

    const showContactsSection = nsContactDefined
        || appealManagerContactDefined
        || projectManagerContactDefined
        || focalPointContactDefined
        || mediaContactDefined
        || nationalSocietyIntegrityContactDefined
        || nationalSocietyHotlineDefined;

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

    return (
        <div className={styles.drefApplicationExport}>
            <Container childrenContainerClassName={styles.pageTitleSection}>
                <img
                    className={styles.ifrcLogo}
                    src={ifrcLogo}
                    alt={strings.imageLogoIFRCAlt}
                />
                <div>
                    {drefResponse?.type_of_dref === DREF_TYPE_IMMINENT ? (
                        <Heading level={1}>
                            {strings.exportDrefImminentTitle}
                        </Heading>
                    ) : (
                        <Heading level={1}>
                            {strings.exportTitle}
                        </Heading>
                    )}
                    <div className={styles.drefContentTitle}>
                        {drefResponse?.title}
                    </div>
                </div>
            </Container>
            {isDefined(drefResponse)
                && isDefined(drefResponse.cover_image_file)
                && isDefined(drefResponse.cover_image_file.file)
                && (
                    <Container>
                        <Image
                            src={drefResponse.cover_image_file.file}
                            alt={drefResponse.title ?? ''}
                            caption={drefResponse.cover_image_file.caption}
                        />
                    </Container>
                )}
            <Container childrenContainerClassName={styles.metaSection}>
                <TextOutput
                    className={styles.metaItem}
                    label={strings.appealLabel}
                    value={drefResponse?.appeal_code}
                    strongValue
                />
                {drefResponse?.type_of_dref === TYPE_IMMINENT && (
                    <TextOutput
                        className={styles.metaItem}
                        label={strings.drefAllocatedLabel}
                        value={drefAllocated?.total_cost}
                        prefix={strings.chfPrefix}
                        valueType="number"
                        strongValue
                    />
                )}
                {drefResponse?.type_of_dref !== TYPE_IMMINENT && (
                    <TextOutput
                        className={styles.metaItem}
                        label={strings.countryLabel}
                        value={drefResponse?.country_details?.name}
                        strongValue
                    />
                )}
                <TextOutput
                    className={styles.metaItem}
                    label={strings.hazardLabel}
                    value={drefResponse?.disaster_type_details?.name}
                    strongValue
                />
                {drefResponse?.type_of_dref === TYPE_IMMINENT && (
                    <>
                        <TextOutput
                            className={styles.metaItem}
                            label={strings.countryLabel}
                            value={drefResponse?.country_details?.name}
                            strongValue
                        />
                        <TextOutput
                            className={styles.metaItem}
                            label={strings.drefFormRiskPeopleLabel}
                            value={drefResponse?.num_affected}
                            strongValue
                            valueType="number"
                        />
                        <TextOutput
                            className={styles.metaItem}
                            label={strings.operationStartDateLabel}
                            value={drefResponse?.date_of_approval}
                            valueType="date"
                            strongValue
                        />
                        <TextOutput
                            className={styles.metaItem}
                            label={strings.operationEndDateLabel}
                            value={drefResponse?.end_date}
                            valueType="date"
                            strongValue
                        />
                        <div className={styles.metaActionsItem} />
                    </>
                )}
                {drefResponse?.type_of_dref !== TYPE_IMMINENT && (
                    <>
                        <TextOutput
                            className={styles.metaItem}
                            label={strings.typeOfDrefLabel}
                            value={drefResponse?.type_of_dref_display}
                            strongValue
                        />
                        <TextOutput
                            className={styles.metaItem}
                            label={strings.crisisCategoryLabel}
                            value={drefResponse?.disaster_category_display}
                            valueClassName={_cs(
                                isDefined(drefResponse)
                                && isDefined(drefResponse.disaster_category)
                                && colorMap[drefResponse.disaster_category],
                            )}
                            strongValue
                        />
                    </>
                )}
                <TextOutput
                    className={styles.metaItem}
                    label={strings.eventOnsetLabel}
                    value={drefResponse?.type_of_onset_display}
                    strongValue
                />
                {drefResponse?.type_of_dref === DREF_TYPE_IMMINENT && (
                    <>
                        <TextOutput
                            className={styles.metaItem}
                            label={strings.drefApplicationExportForecastedLabel}
                            value={drefResponse?.hazard_date}
                            strongValue
                        />
                        <TextOutput
                            className={styles.metaItem}
                            label={strings.operationTimeframeLabel}
                            value={drefResponse?.operation_timeframe_imminent}
                            valueType="number"
                            suffix={strings.daysSuffix}
                            strongValue
                        />
                        <div className={styles.metaActionsItem} />
                    </>
                )}
                {drefResponse?.type_of_dref !== DREF_TYPE_IMMINENT && (
                    <TextOutput
                        className={styles.budget}
                        label={strings.drefAllocationLabel}
                        value={drefResponse?.amount_requested}
                        valueType="number"
                        prefix={strings.chfPrefix}
                        strongValue
                    />
                )}
                {drefResponse?.type_of_dref !== DREF_TYPE_IMMINENT && (
                    <>
                        <TextOutput
                            className={styles.metaItem}
                            label={strings.glideNumberLabel}
                            value={drefResponse?.glide_code}
                            strongValue
                        />
                        <TextOutput
                            className={styles.metaItem}
                            label={strings.peopleAffectedLabel}
                            value={drefResponse?.num_affected}
                            valueType="number"
                            suffix={strings.peopleSuffix}
                            strongValue
                        />
                        <TextOutput
                            className={styles.budget}
                            label={strings.peopleTargetedLabel}
                            value={drefResponse?.total_targeted_population}
                            suffix={strings.peopleSuffix}
                            valueType="number"
                            strongValue
                        />
                        <TextOutput
                            className={styles.metaItem}
                            label={strings.operationStartDateLabel}
                            value={drefResponse?.date_of_approval}
                            valueType="date"
                            strongValue
                        />
                        <TextOutput
                            className={styles.metaItem}
                            label={strings.operationTimeframeLabel}
                            value={drefResponse?.operation_timeframe}
                            valueType="number"
                            suffix={strings.monthsSuffix}
                            strongValue
                        />
                        <TextOutput
                            className={styles.metaItem}
                            label={strings.operationEndDateLabel}
                            value={drefResponse?.end_date}
                            valueType="date"
                            strongValue
                        />
                        <TextOutput
                            className={styles.metaItem}
                            label={strings.drefPublishedLabel}
                            value={drefResponse?.publishing_date}
                            valueType="date"
                            strongValue
                        />
                    </>
                )}
                <TextOutput
                    className={styles.targetedAreas}
                    label={strings.targetedAreasLabel}
                    value={drefResponse?.district_details?.map(
                        (district) => district.name,
                    ).join(', ')}
                    strongValue
                />
            </Container>
            <div className={styles.pageBreak} />
            {showScenarioAnalysis && (
                <>
                    <Heading level={2}>
                        {drefResponse.type_of_dref !== DREF_TYPE_IMMINENT
                            ? strings.eventDescriptionSectionHeading
                            : strings.scenarioAnalysis}
                    </Heading>
                    {isDefinedHazardDate && (
                        <Container
                            heading={strings.hazardDate}
                        >
                            <DescriptionText>
                                {drefResponse?.hazard_date}
                            </DescriptionText>
                            <DescriptionText>
                                {riskRegions}
                            </DescriptionText>
                        </Container>
                    )}
                    {isDefinedHazardRisk && (
                        <Container
                            heading={strings.hazardRisk}
                        >
                            <DescriptionText>
                                {drefResponse?.hazard_vulnerabilities_and_risks}
                            </DescriptionText>
                        </Container>
                    )}
                </>
            )}
            {showEventDescriptionSection && (
                <>
                    {drefResponse?.disaster_category_analysis_details?.file
                        && drefResponse.type_of_dref !== DREF_TYPE_IMMINENT && (
                        <Container>
                            <Link href={drefResponse?.disaster_category_analysis_details?.file}>
                                {strings.crisisCategorySupportingDocumentLabel}
                            </Link>
                        </Container>
                    )}
                    {eventDateDefined && (
                        <Container
                            heading={drefResponse?.type_of_onset === ONSET_SLOW
                                ? strings.dateWhenTriggerWasMetHeading
                                : strings.dateOfEventSlowHeading}
                        >
                            <DateOutput
                                value={drefResponse?.event_date}
                                format={DEFAULT_PRINT_DATE_FORMAT}
                            />
                        </Container>
                    )}
                    {isTruthyString(drefResponse?.event_map_file?.file)
                        && drefResponse?.type_of_dref !== DREF_TYPE_IMMINENT && (
                        <Container>
                            <Image
                                src={drefResponse?.event_map_file?.file}
                                caption={drefResponse?.event_map_file?.caption}
                            />
                        </Container>
                    )}
                    {eventDescriptionDefined && (
                        <Container
                            heading={strings.whatWhereWhenSectionHeading}
                        >
                            <DescriptionText>
                                {drefResponse?.event_description}
                            </DescriptionText>
                        </Container>
                    )}
                    {imagesFileDefined && (
                        <Container childrenContainerClassName={styles.eventImages}>
                            {drefResponse.images_file?.map(
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
                    {eventScopeDefined && (
                        <Container
                            heading={strings.scopeAndScaleSectionHeading}
                        >
                            <DescriptionText>
                                {drefResponse?.event_scope}
                            </DescriptionText>
                        </Container>
                    )}
                    {drefResponse?.supporting_document_details?.file && (
                        <Container>
                            <Link href={drefResponse?.supporting_document_details?.file}>
                                {strings.drefApplicationSupportingDocumentation}
                            </Link>
                        </Container>
                    )}
                    {isDefinedSourceInformation && (
                        <Container
                            childrenContainerClassName={styles.sourceInformationList}
                        >
                            <div className={styles.nameTitle}>
                                {strings.sourceInformationSourceNameTitle}
                            </div>
                            <div className={styles.linkTitle}>
                                {strings.sourceInformationSourceLinkTitle}
                            </div>
                            {drefResponse?.source_information?.map(
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
                    {isDefinedScenarioAnalysisSupportingDocument && (
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
            {showAboutSupportServicesSection && (
                <>
                    <Heading level={2}>
                        {drefResponse?.type_of_dref !== DREF_TYPE_IMMINENT
                            ? strings.aboutSupportServicesSectionHeading
                            : strings.plan}
                    </Heading>
                    {humanResourceDefined && (
                        <Container
                            heading={strings.humanResourcesHeading}
                        >
                            <DescriptionText>
                                {drefResponse?.human_resource}
                            </DescriptionText>
                        </Container>
                    )}
                    {isVolunteerTeamDiverseDefined && (
                        <Container
                            heading={strings.isVolunteerTeamDiverseHeading}
                        >
                            <DescriptionText>
                                {drefResponse?.is_volunteer_team_diverse}
                            </DescriptionText>
                        </Container>
                    )}
                    {surgePersonnelDeployedDefined && (
                        <Container
                            heading={strings.surgePersonnelDeployedHeading}
                        >
                            <DescriptionText>
                                {drefResponse?.is_surge_personnel_deployed
                                    ? strings.yes : strings.no}
                            </DescriptionText>
                            <DescriptionText>
                                {drefResponse?.surge_personnel_deployed}
                            </DescriptionText>
                        </Container>
                    )}
                    {humanitarianImpactsDefined && (
                        <Container
                            heading={strings.humanitarianImpactsHeading}
                        >
                            <DescriptionText>
                                {drefResponse?.addressed_humanitarian_impacts}
                            </DescriptionText>
                        </Container>
                    )}
                    {contingencyPlanDocument && (
                        <Container>
                            <Link href={
                                drefResponse?.contingency_plans_supporting_document_details?.file
                            }
                            >
                                {strings.contingencyPlanDocument}
                            </Link>
                        </Container>
                    )}
                    {logisticCapacityOfNsDefined && (
                        <Container
                            heading={strings.logisticCapacityHeading}
                        >
                            <DescriptionText>
                                {drefResponse?.logistic_capacity_of_ns}
                            </DescriptionText>
                        </Container>
                    )}
                    {pmerDefined && (
                        <Container
                            heading={strings.pmerHeading}
                        >
                            <DescriptionText>
                                {drefResponse?.pmer}
                            </DescriptionText>
                        </Container>
                    )}
                    {communicationDefined && (
                        <Container
                            heading={strings.communicationHeading}
                        >
                            <DescriptionText>
                                {drefResponse?.communication}
                            </DescriptionText>
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
                        value={drefResponse?.did_it_affect_same_area}
                        valueType="boolean"
                        strongValue
                    />
                    <BlockTextOutput
                        label={strings.samePopulationAffectedLabel}
                        value={drefResponse?.did_it_affect_same_population}
                        valueType="boolean"
                        strongValue
                    />
                    <BlockTextOutput
                        label={strings.didNsRespondLabel}
                        value={drefResponse?.did_ns_respond}
                        valueType="boolean"
                        strongValue
                    />
                    <BlockTextOutput
                        label={strings.didNsRequestFundLabel}
                        value={drefResponse?.did_ns_request_fund}
                        valueType="boolean"
                        strongValue
                    />
                    <BlockTextOutput
                        label={strings.nsOperationLabel}
                        value={drefResponse?.ns_request_text}
                        valueType="text"
                    />
                    <TextOutput
                        className={styles.recurrentEventJustification}
                        label={strings.recurrentEventJustificationLabel}
                        value={drefResponse?.dref_recurrent_text}
                        strongLabel
                        valueType="text"
                    />
                    {lessonsLearnedDefined && (
                        <TextOutput
                            className={styles.lessonsLearned}
                            label={strings.lessonsLearnedLabel}
                            value={drefResponse?.lessons_learned}
                            valueType="text"
                            strongLabel
                        />
                    )}
                    <BlockTextOutput
                        label={strings.completeChildSafeguardingRiskLabel}
                        value={drefResponse?.complete_child_safeguarding_risk}
                        valueType="boolean"
                        strongValue
                    />
                    {childSafeguardingRiskLevelDefined && (
                        <TextOutput
                            className={styles.childSafeguardingRiskLevel}
                            label={strings.childSafeguardingRiskLevelLabel}
                            value={drefResponse?.child_safeguarding_risk_level}
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
                    {drefResponse?.ns_respond_date && (
                        <Container
                            heading={strings.drefFormNsResponseStarted}
                        >
                            <DateOutput
                                value={drefResponse?.ns_respond_date}
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
                            value={drefResponse?.ifrc}
                            valueType="text"
                            strongLabel
                        />
                    )}
                    {partnerNsActionsDefined && (
                        <BlockTextOutput
                            label={strings.participatingNsLabel}
                            value={drefResponse?.partner_national_society}
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
                        {drefResponse?.icrc}
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
                            value={drefResponse?.government_requested_assistance}
                            valueType="boolean"
                            strongLabel
                        />
                    )}
                    {nationalAuthoritiesDefined && (
                        <BlockTextOutput
                            label={strings.nationalAuthoritiesLabel}
                            value={drefResponse?.national_authorities}
                            valueType="text"
                            strongLabel
                        />
                    )}
                    {unOrOtherActorDefined && (
                        <BlockTextOutput
                            label={strings.unOrOtherActorsLabel}
                            value={drefResponse?.un_or_other_actor}
                            valueType="text"
                            strongLabel
                        />
                    )}
                    {majorCoordinationMechanismDefined && (
                        <TextOutput
                            className={styles.otherActionsMajorCoordinationMechanism}
                            label={strings.majorCoordinationMechanismLabel}
                            value={drefResponse?.major_coordination_mechanism}
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
                                {drefResponse?.identified_gaps}
                            </DescriptionText>
                        </Container>
                    )}
                    {assessmentReportDefined && (
                        <Container>
                            <Link href={drefResponse?.assessment_report_details?.file}>
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
                                {drefResponse?.operation_objective}
                            </DescriptionText>
                        </Container>
                    )}
                    {responseStrategyDefined && (
                        <Container
                            heading={strings.operationStrategyHeading}
                        >
                            <DescriptionText>
                                {drefResponse?.response_strategy}
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
                                href={drefResponse?.targeting_strategy_support_file_details?.file}
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
                                {drefResponse?.people_assisted}
                            </DescriptionText>
                        </Container>
                    )}
                    {selectionCriteriaDefined && (
                        <Container
                            heading={strings.selectionCriteriaHeading}
                        >
                            <DescriptionText>
                                {drefResponse?.selection_criteria}
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
                        value={drefResponse?.sub_total_cost}
                        prefix={strings.chfPrefix}
                    />
                    {isDefined(drefResponse?.surge_deployment_cost) && (
                        <>
                            <div className={styles.costLabel}>
                                {strings.priorityActionsSurgeDeployment}
                            </div>
                            <NumberOutput
                                className={styles.costValue}
                                value={drefResponse.surge_deployment_cost}
                                prefix={strings.chfPrefix}
                            />
                        </>
                    )}
                    <div className={styles.costLabel}>
                        {strings.priorityActionsIndirectCost}
                    </div>
                    <NumberOutput
                        className={styles.costValue}
                        value={drefResponse?.indirect_cost}
                        prefix={strings.chfPrefix}
                    />
                    <div className={styles.costLabel}>
                        {strings.priorityActionsTotal}
                    </div>
                    <NumberOutput
                        className={styles.costValue}
                        value={drefResponse?.total_cost}
                        prefix={strings.chfPrefix}
                    />
                </Container>
            )}
            {drefResponse?.type_of_dref !== DREF_TYPE_IMMINENT && (
                <Container
                    heading={strings.targetPopulationSectionHeading}
                    headingLevel={2}
                    childrenContainerClassName={styles.targetPopulationContent}
                >
                    {drefResponse?.type_of_dref !== DREF_TYPE_ASSESSMENT && (
                        <BlockTextOutput
                            label={strings.womenLabel}
                            value={drefResponse?.women}
                            valueType="number"
                            strongValue
                        />
                    )}
                    <BlockTextOutput
                        label={strings.ruralLabel}
                        value={drefResponse?.people_per_local}
                        valueType="number"
                        suffix="%"
                        strongValue
                    />
                    {drefResponse?.type_of_dref !== DREF_TYPE_ASSESSMENT && (
                        <BlockTextOutput
                            label={strings.girlsLabel}
                            value={drefResponse?.girls}
                            valueType="number"
                            strongValue
                        />
                    )}
                    <BlockTextOutput
                        label={strings.urbanLabel}
                        value={drefResponse?.people_per_urban}
                        suffix="%"
                        valueType="number"
                        strongValue
                    />
                    {drefResponse?.type_of_dref !== DREF_TYPE_ASSESSMENT && (
                        <BlockTextOutput
                            label={strings.menLabel}
                            value={drefResponse?.men}
                            valueType="number"
                            strongValue
                        />
                    )}
                    <BlockTextOutput
                        className={styles.disabilitiesPopulation}
                        label={strings.peopleWithDisabilitiesLabel}
                        value={drefResponse?.disability_people_per}
                        suffix="%"
                        valueType="number"
                        strongValue
                    />
                    {drefResponse?.type_of_dref !== DREF_TYPE_ASSESSMENT && (
                        <BlockTextOutput
                            label={strings.boysLabel}
                            value={drefResponse?.boys}
                            valueType="number"
                            strongValue
                        />
                    )}
                    <div className={styles.emptyBlock} />
                    <BlockTextOutput
                        label={strings.targetedPopulationLabel}
                        value={drefResponse?.total_targeted_population}
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
                            value={drefResponse?.has_anti_fraud_corruption_policy}
                            valueType="boolean"
                            strongValue
                        />
                    )}
                    {hasSexualAbusePolicy && (
                        <BlockTextOutput
                            label={strings.hasSexualAbusePolicy}
                            value={drefResponse?.has_sexual_abuse_policy}
                            valueType="boolean"
                            strongValue
                        />
                    )}
                    {hasChildProtectionPolicy && (
                        <BlockTextOutput
                            label={strings.hasChildProtectionPolicy}
                            value={drefResponse?.has_child_protection_policy}
                            valueType="boolean"
                            strongValue
                        />
                    )}
                    {hasWhistleblowerProtectionPolicy && (
                        <BlockTextOutput
                            label={strings.hasWhistleblowerProtectionPolicy}
                            value={drefResponse?.has_whistleblower_protection_policy}
                            valueType="boolean"
                            strongValue
                        />
                    )}
                    {hasAntiSexualHarassmentPolicy && (
                        <BlockTextOutput
                            label={strings.hasAntiSexualHarassmentPolicy}
                            value={drefResponse?.has_anti_sexual_harassment_policy}
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
                            {drefResponse?.risk_security?.map(
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
                            value={drefResponse?.risk_security_concern}
                            valueType="text"
                            strongLabel
                        />
                    )}
                    {hasChildrenSafeguardingDefined && (
                        <BlockTextOutput
                            label={strings.hasChildRiskCompleted}
                            value={drefResponse?.has_child_safeguarding_risk_analysis_assessment}
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
            {showBudgetOverview && (
                <>
                    <div className={styles.pageBreak} />
                    <Container
                        heading={strings.budgetOverSectionHeading}
                        headingLevel={2}
                    >
                        <Image
                            imgElementClassName={styles.budgetFilePreview}
                            src={drefResponse?.budget_file_preview}
                        />
                    </Container>
                    <Container>
                        <Link href={drefResponse?.budget_file_details?.file}>
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
                                value={drefResponse?.national_society_hotline_phone_number}
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
