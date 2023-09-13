import { Fragment, useState } from 'react';
import { useParams } from 'react-router-dom';
import { DownloadLineIcon } from '@ifrc-go/icons';
import {
    isDefined,
    isFalsyString,
    isTruthyString,
} from '@togglecorp/fujs';

import Container from '#components/Container';
import Image from '#components/Image';
import Link from '#components/Link';
import Header from '#components/Header';
import TextOutput from '#components/TextOutput';
import NumberOutput from '#components/NumberOutput';
import DescriptionText from '#components/domain/DescriptionText';
import BlockTextOutput from '#components/domain/BlockTextOutput';
import useTranslation from '#hooks/useTranslation';
import { useRequest } from '#utils/restRequest';
import { DREF_TYPE_ASSESSMENT, DREF_TYPE_IMMINENT } from '#utils/constants';

import ifrcLogo from '#assets/icons/ifrc-square.png';

import i18n from './i18n.json';
import styles from './styles.module.css';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const { drefId } = useParams<{ drefId: string }>();
    const [previewReady, setPreviewReady] = useState(false);
    const strings = useTranslation(i18n);

    const {
        // pending: fetchingDref,
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

    const eventDescriptionDefined = isTruthyString(drefResponse?.event_description?.trim());
    const eventScopeDefined = drefResponse?.type_of_dref !== DREF_TYPE_ASSESSMENT
        && isTruthyString(drefResponse?.event_scope?.trim());
    const imagesFileDefined = isDefined(drefResponse)
        && isDefined(drefResponse.images_file)
        && drefResponse.images_file.length > 0;
    const anticipatoryActionsDefined = drefResponse?.type_of_dref === DREF_TYPE_IMMINENT
        && isTruthyString(drefResponse?.anticipatory_actions?.trim());
    const showEventDescriptionSection = eventDescriptionDefined
        || eventScopeDefined
        || imagesFileDefined
        || anticipatoryActionsDefined
        || isDefined(drefResponse?.event_map_file?.file);

    const lessonsLearnedDefined = isTruthyString(drefResponse?.lessons_learned?.trim());
    const showPreviousOperations = drefResponse?.type_of_dref !== DREF_TYPE_ASSESSMENT && (
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
    const showMovementPartnersActionsSection = ifrcActionsDefined || partnerNsActionsDefined;

    const showNsAction = isDefined(drefResponse)
        && isDefined(drefResponse.national_society_actions)
        && drefResponse.national_society_actions.length > 0;

    const icrcActionsDefined = isTruthyString(drefResponse?.icrc?.trim());

    const governmentRequestedAssistanceDefined = isDefined(
        drefResponse?.government_requested_assistance,
    );
    const nationalAuthoritiesDefined = isDefined(drefResponse?.national_authorities?.trim());
    const unOrOtherActorDefined = isDefined(drefResponse?.un_or_other_actor?.trim());
    const majorCoordinationMechanismDefined = isDefined(
        drefResponse?.major_coordination_mechanism?.trim(),
    );
    const showOtherActorsActionsSection = governmentRequestedAssistanceDefined
        || nationalAuthoritiesDefined
        || unOrOtherActorDefined
        || majorCoordinationMechanismDefined;

    const identifiedGapsDefined = drefResponse?.type_of_dref !== DREF_TYPE_IMMINENT
        && isTruthyString(drefResponse?.identified_gaps?.trim());
    const needsIdentifiedDefined = isDefined(drefResponse)
        && isDefined(drefResponse.needs_identified)
        && drefResponse.needs_identified.length > 0;
    const showNeedsIdentifiedSection = isDefined(drefResponse)
        && drefResponse.type_of_dref !== DREF_TYPE_ASSESSMENT
        && (identifiedGapsDefined || needsIdentifiedDefined);

    const operationObjectiveDefined = isTruthyString(drefResponse?.operation_objective?.trim());
    const responseStrategyDefined = isTruthyString(drefResponse?.response_strategy?.trim());
    const showOperationStrategySection = operationObjectiveDefined || responseStrategyDefined;

    const peopleAssistedDefined = isTruthyString(drefResponse?.people_assisted?.trim());
    const selectionCriteriaDefined = isTruthyString(drefResponse?.selection_criteria?.trim());
    const showTargetingStrategySection = peopleAssistedDefined || selectionCriteriaDefined;

    const riskSecurityDefined = isDefined(drefResponse)
        && isDefined(drefResponse.risk_security)
        && drefResponse.risk_security.length > 0;
    const riskSecurityConcernDefined = isTruthyString(drefResponse?.risk_security_concern?.trim());
    const showRiskAndSecuritySection = riskSecurityDefined || riskSecurityConcernDefined;

    const plannedInterventionDefined = isDefined(drefResponse)
        && isDefined(drefResponse.planned_interventions)
        && drefResponse.planned_interventions.length > 0;

    const humanResourceDefined = isTruthyString(drefResponse?.human_resource?.trim());
    const surgePersonnelDeployedDefined = isTruthyString(
        drefResponse?.surge_personnel_deployed?.trim(),
    );
    const logisticCapacityOfNsDefined = isTruthyString(
        drefResponse?.logistic_capacity_of_ns?.trim(),
    );
    const pmerDefined = isTruthyString(drefResponse?.pmer?.trim());
    const communicationDefined = isTruthyString(drefResponse?.communication?.trim());
    const showAboutSupportServicesSection = humanResourceDefined
        || surgePersonnelDeployedDefined
        || logisticCapacityOfNsDefined
        || pmerDefined
        || communicationDefined;

    const showBudgetOverview = isTruthyString(drefResponse?.budget_file_details?.file);

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
    const showContactsSection = nsContactDefined
        || appealManagerContactDefined
        || projectManagerContactDefined
        || focalPointContactDefined
        || mediaContactDefined;

    return (
        <div className={styles.drefApplicationExport}>
            <div className={styles.pageTitleSection}>
                <img
                    className={styles.ifrcLogo}
                    src={ifrcLogo}
                    alt="IFRC"
                />
                <Header
                    heading={strings.exportTitle}
                    headingLevel={1}
                    spacing="compact"
                >
                    <div className={styles.drefContentTitle}>
                        {drefResponse?.title}
                    </div>
                </Header>
            </div>
            <Image
                src={drefResponse?.cover_image_file?.file}
                caption={drefResponse?.cover_image_file?.caption}
            />
            <div className={styles.metaSection}>
                <TextOutput
                    className={styles.metaItem}
                    label={strings.appealLabel}
                    value={drefResponse?.appeal_code}
                    strongValue
                />
                <TextOutput
                    className={styles.metaItem}
                    label={strings.countryLabel}
                    value={drefResponse?.country_details?.name}
                    strongValue
                />
                <TextOutput
                    className={styles.metaItem}
                    label={strings.hazardLabel}
                    value={drefResponse?.disaster_type_details?.name}
                    strongValue
                />
                <TextOutput
                    className={styles.metaItem}
                    label={strings.typeOfDrefLabel}
                    value={drefResponse?.type_of_dref_display}
                    strongValue
                />
                <TextOutput
                    // TODO: add color according to category
                    className={styles.metaItem}
                    label={strings.crisisCategoryLabel}
                    value={drefResponse?.disaster_category_display}
                    strongValue
                />
                <TextOutput
                    className={styles.metaItem}
                    label={strings.eventOnsetLabel}
                    value={drefResponse?.type_of_onset_display}
                    strongValue
                />
                <TextOutput
                    className={styles.budget}
                    label={strings.drefAllocationLabel}
                    value={drefResponse?.amount_requested}
                    valueType="number"
                    prefix={strings.chfPrefix}
                    strongValue
                />
                <TextOutput
                    className={styles.glideCode}
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
                    className={styles.metaItem}
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
                <TextOutput
                    className={styles.targetedAreas}
                    label={strings.targetedAreasLabel}
                    value={drefResponse?.district_details?.map(
                        (district) => district.name,
                    ).join(', ')}
                    strongValue
                />
            </div>
            {showEventDescriptionSection && (
                <Container
                    heading={strings.eventDescriptionSectionHeading}
                    className={styles.eventDescriptionSection}
                    headingLevel={2}
                    childrenContainerClassName={styles.content}
                >
                    {/* TODO: approximate date of impact */}
                    <Image
                        src={drefResponse?.event_map_file?.file}
                        caption={drefResponse?.event_map_file?.caption}
                    />
                    {eventDescriptionDefined && (
                        <Container
                            heading={drefResponse?.type_of_dref === DREF_TYPE_IMMINENT
                                ? strings.situationUpdateSectionHeading
                                : strings.whatWhereWhenSectionHeading}
                            spacing="compact"
                        >
                            <DescriptionText>
                                {drefResponse?.event_description}
                            </DescriptionText>
                        </Container>
                    )}
                    {anticipatoryActionsDefined && (
                        <Container
                            heading={strings.anticipatoryActionsHeading}
                            spacing="compact"
                        >
                            <DescriptionText>
                                {drefResponse?.anticipatory_actions}
                            </DescriptionText>
                        </Container>
                    )}
                    {eventScopeDefined && (
                        <Container
                            heading={strings.scopeAndScaleSectionHeading}
                            spacing="compact"
                        >
                            <DescriptionText>
                                {drefResponse?.event_scope}
                            </DescriptionText>
                        </Container>
                    )}
                    {imagesFileDefined && drefResponse.images_file?.map(
                        (imageFile) => (
                            <Image
                                key={imageFile.id}
                                src={imageFile.file}
                                alt=""
                                caption={imageFile.caption}
                            />
                        ),
                    )}
                </Container>
            )}
            {showPreviousOperations && (
                <Container
                    heading={strings.previousOperationsSectionHeading}
                    className={styles.previousOperationSection}
                    childrenContainerClassName={styles.content}
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
                    <BlockTextOutput
                        label={strings.recurrentEventJustificationLabel}
                        value={drefResponse?.dref_recurrent_text}
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
                </Container>
            )}
            {showNsAction && (
                <Container
                    heading={strings.currentNationalSocietyActionsHeading}
                    className={styles.nsActionsSection}
                    childrenContainerClassName={styles.content}
                    headingLevel={2}
                >
                    {drefResponse?.national_society_actions?.map(
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
            )}
            {showMovementPartnersActionsSection && (
                <Container
                    heading={strings.movementPartnersActionsHeading}
                    className={styles.movementPartnersActionsSection}
                    childrenContainerClassName={styles.content}
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
                    className={styles.icrcActionsSection}
                    childrenContainerClassName={styles.content}
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
                    className={styles.otherActionsSection}
                    childrenContainerClassName={styles.content}
                    headingLevel={2}
                >
                    {governmentRequestedAssistanceDefined && (
                        <BlockTextOutput
                            label={strings.governmentRequestedAssistanceLabel}
                            value={drefResponse?.government_requested_assistance}
                            valueType="boolean"
                            strongValue
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
                        <BlockTextOutput
                            label={strings.majorCoordinationMechanismLabel}
                            value={drefResponse?.major_coordination_mechanism}
                            valueType="text"
                            strongLabel
                        />
                    )}
                </Container>
            )}
            {showNeedsIdentifiedSection && (
                <Container
                    heading={strings.needsIdentifiedSectionHeading}
                    headingLevel={2}
                    className={styles.needsIdentifiedSection}
                    childrenContainerClassName={styles.content}
                >
                    {needsIdentifiedDefined && drefResponse?.needs_identified?.map(
                        (identifiedNeed) => (
                            <Container
                                key={identifiedNeed.id}
                                heading={identifiedNeed.title_display}
                                spacing="compact"
                                icons={(
                                    <img
                                        className={styles.icon}
                                        src={identifiedNeed.image_url}
                                        alt=""
                                    />
                                )}
                            >
                                <DescriptionText>
                                    {identifiedNeed.description}
                                </DescriptionText>
                            </Container>
                        ),
                    )}
                    {identifiedGapsDefined && (
                        <Container
                            heading={strings.identifiedGapsHeading}
                            spacing="compact"
                        >
                            {drefResponse?.identified_gaps}
                        </Container>
                    )}
                </Container>
            )}
            {showOperationStrategySection && (
                <Container
                    heading={strings.operationalStrategySectionHeading}
                    headingLevel={2}
                    className={styles.operationalStrategySection}
                    childrenContainerClassName={styles.content}
                >
                    {operationObjectiveDefined && (
                        <Container
                            heading={strings.overallObjectiveHeading}
                            spacing="compact"
                        >
                            <DescriptionText>
                                {drefResponse?.operation_objective}
                            </DescriptionText>
                        </Container>
                    )}
                    {responseStrategyDefined && (
                        <Container
                            heading={strings.operationStragegyHeading}
                            spacing="compact"
                        >
                            <DescriptionText>
                                {drefResponse?.response_strategy}
                            </DescriptionText>
                        </Container>
                    )}
                </Container>
            )}
            {showTargetingStrategySection && (
                <Container
                    heading={strings.targetingStrategySectionHeading}
                    headingLevel={2}
                    className={styles.targetingStrategySection}
                    childrenContainerClassName={styles.content}
                >
                    {peopleAssistedDefined && (
                        <Container
                            heading={strings.peopleAssistedHeading}
                            spacing="compact"
                        >
                            <DescriptionText>
                                {drefResponse?.people_assisted}
                            </DescriptionText>
                        </Container>
                    )}
                    {selectionCriteriaDefined && (
                        <Container
                            heading={strings.selectionCriteriaHeading}
                            spacing="compact"
                        >
                            <DescriptionText>
                                {drefResponse?.selection_criteria}
                            </DescriptionText>
                        </Container>
                    )}
                </Container>
            )}
            <Container
                heading={strings.targetPopulationSectionHeading}
                headingLevel={2}
                className={styles.targetPopulationSection}
                childrenContainerClassName={styles.content}
            >
                {drefResponse?.type_of_dref !== DREF_TYPE_ASSESSMENT && (
                    <>
                        <BlockTextOutput
                            label={strings.womenLabel}
                            value={drefResponse?.women}
                            valueType="number"
                            strongValue
                        />
                        <BlockTextOutput
                            label={strings.girlsLabel}
                            value={drefResponse?.girls}
                            valueType="number"
                            strongValue
                        />
                        <BlockTextOutput
                            label={strings.menLabel}
                            value={drefResponse?.men}
                            valueType="number"
                            strongValue
                        />
                        <BlockTextOutput
                            label={strings.boysLabel}
                            value={drefResponse?.boys}
                            valueType="number"
                            strongValue
                        />
                        <BlockTextOutput
                            label={strings.targetedPopulationLabel}
                            value={drefResponse?.total_targeted_population}
                            labelClassName={styles.totalTargetedPopulationLabel}
                            valueClassName={styles.totalTargetedPopulationValue}
                            valueType="number"
                            strongValue
                        />
                    </>
                )}
                <BlockTextOutput
                    label={strings.ruralLabel}
                    value={drefResponse?.people_per_local}
                    valueType="number"
                    suffix="%"
                    strongValue
                />
                <BlockTextOutput
                    label={strings.urbanLabel}
                    value={drefResponse?.people_per_urban}
                    suffix="%"
                    valueType="number"
                    strongValue
                />
                <BlockTextOutput
                    label={strings.peopleWithDisabilitesLabel}
                    value={drefResponse?.disability_people_per}
                    labelClassName={styles.disabilityLabel}
                    valueClassName={styles.disabilityValue}
                    suffix="%"
                    valueType="number"
                    strongValue
                />
                {drefResponse?.type_of_dref === DREF_TYPE_ASSESSMENT && (
                    <BlockTextOutput
                        label={strings.targetedPopulationLabel}
                        value={drefResponse?.total_targeted_population}
                        labelClassName={styles.totalTargetedPopulationLabel}
                        valueClassName={styles.totalTargetedPopulationValue}
                        valueType="number"
                        strongValue
                    />
                )}
            </Container>
            {showRiskAndSecuritySection && (
                <Container
                    heading={strings.riskAndSecuritySectionHeading}
                    headingLevel={2}
                    className={styles.riskAndSecurityConsiderationsSection}
                    childrenContainerClassName={styles.content}
                >
                    {riskSecurityDefined && (
                        <Container
                            heading={strings.riskSecurityHeading}
                            spacing="compact"
                            childrenContainerClassName={styles.riskList}
                            headingLevel={4}
                        >
                            <div className={styles.riskTitle}>
                                Risk
                            </div>
                            <div className={styles.mitigationTitle}>
                                Mitigation
                            </div>
                            {drefResponse?.risk_security?.map(
                                (riskSecurity) => (
                                    <Fragment key={riskSecurity.id}>
                                        <div className={styles.risk}>
                                            {riskSecurity.risk}
                                        </div>
                                        <div className={styles.mitigation}>
                                            {riskSecurity.mitigation}
                                        </div>
                                    </Fragment>
                                ),
                            )}
                        </Container>
                    )}
                    {riskSecurityConcernDefined && (
                        <Container
                            heading={strings.safetyConcernHeading}
                            spacing="compact"
                            headingLevel={4}
                        >
                            <DescriptionText>
                                {drefResponse?.risk_security_concern}
                            </DescriptionText>
                        </Container>
                    )}
                </Container>
            )}
            {plannedInterventionDefined && (
                <Container
                    heading={strings.plannedInterventionSectionHeading}
                    headingLevel={2}
                    className={styles.plannedInterventionSection}
                    childrenContainerClassName={styles.content}
                >
                    {drefResponse?.planned_interventions?.map(
                        (plannedIntervention) => (
                            <Container
                                key={plannedIntervention.id}
                                className={styles.plannedIntervention}
                                icons={(
                                    <img
                                        className={styles.icon}
                                        src={plannedIntervention.image_url}
                                        alt=""
                                    />
                                )}
                                heading={plannedIntervention.title_display}
                                headerDescriptionContainerClassName={styles.metaDetails}
                                headerDescription={(
                                    <>
                                        <TextOutput
                                            label={strings.targetedPersonsLabel}
                                            value={plannedIntervention.person_targeted}
                                            valueType="number"
                                            strongLabel
                                        />
                                        <TextOutput
                                            label={strings.budgetLabel}
                                            value={plannedIntervention.budget}
                                            valueType="number"
                                            prefix={strings.chfPrefix}
                                            strongLabel
                                        />
                                    </>
                                )}
                                withInternalPadding
                                withHeaderBorder
                                childrenContainerClassName={styles.plannedInterventionContent}
                            >
                                <Container
                                    heading={strings.indicatorsHeading}
                                    headingLevel={4}
                                    spacing="compact"
                                    childrenContainerClassName={styles.indicatorsContent}
                                >
                                    <div className={styles.titleLabel}>
                                        {strings.indicatorTitleLabel}
                                    </div>
                                    <div className={styles.targetLabel}>
                                        {strings.indicatorTargetLabel}
                                    </div>
                                    {plannedIntervention.indicators?.map(
                                        (indicator) => (
                                            <Fragment key={indicator.id}>
                                                <div className={styles.title}>
                                                    {indicator.title}
                                                </div>
                                                <NumberOutput
                                                    className={styles.target}
                                                    value={indicator.target}
                                                />
                                            </Fragment>
                                        ),
                                    )}
                                </Container>
                                <Container
                                    heading={strings.priorityActionsHeading}
                                    headingLevel={4}
                                    spacing="compact"
                                >
                                    <DescriptionText>
                                        {plannedIntervention.description}
                                    </DescriptionText>
                                </Container>
                            </Container>
                        ),
                    )}
                </Container>
            )}
            {showAboutSupportServicesSection && (
                <Container
                    heading={strings.aboutSupportServicesSectionHeading}
                    headingLevel={2}
                    className={styles.aboutSupportServicesSection}
                    childrenContainerClassName={styles.content}
                >
                    {humanResourceDefined && (
                        <Container
                            heading={strings.humanResourcesHeading}
                            spacing="compact"
                        >
                            <DescriptionText>
                                {drefResponse?.human_resource}
                            </DescriptionText>
                        </Container>
                    )}
                    {surgePersonnelDeployedDefined && (
                        <Container
                            heading={strings.surgePersonnelDeployedHeading}
                            spacing="compact"
                        >
                            <DescriptionText>
                                {drefResponse?.surge_personnel_deployed}
                            </DescriptionText>
                        </Container>
                    )}
                    {logisticCapacityOfNsDefined && (
                        <Container
                            heading={strings.logisticCapacityHeading}
                            spacing="compact"
                        >
                            <DescriptionText>
                                {drefResponse?.logistic_capacity_of_ns}
                            </DescriptionText>
                        </Container>
                    )}
                    {pmerDefined && (
                        <Container
                            heading={strings.pmerHeading}
                            spacing="compact"
                        >
                            <DescriptionText>
                                {drefResponse?.pmer}
                            </DescriptionText>
                        </Container>
                    )}
                    {communicationDefined && (
                        <Container
                            heading={strings.communicationHeading}
                            spacing="compact"
                        >
                            <DescriptionText>
                                {drefResponse?.communication}
                            </DescriptionText>
                        </Container>
                    )}
                </Container>
            )}
            {showBudgetOverview && (
                <Container
                    heading={strings.budgetOverSectionHeading}
                    headingLevel={2}
                    className={styles.budgetOverviewSection}
                    childrenContainerClassName={styles.content}
                    actions={(
                        <Link
                            href={drefResponse?.budget_file_details?.file}
                            external
                        >
                            <DownloadLineIcon className={styles.downloadIcon} />
                        </Link>
                    )}
                >
                    <img
                        className={styles.budgetFilePreview}
                        src={drefResponse?.budget_file_preview}
                        alt=""
                    />
                </Container>
            )}
            {showContactsSection && (
                <Container
                    className={styles.contactInformationSection}
                    childrenContainerClassName={styles.content}
                    heading={strings.contactInformationSectionHeading}
                    headingLevel={2}
                    headerDescription={strings.contactInformationSectionDescription}
                >
                    {nsContactDefined && (
                        <Container
                            heading={strings.nsContactHeading}
                            headingLevel={4}
                            spacing="none"
                        >
                            {nsContactText}
                        </Container>
                    )}
                    {appealManagerContactDefined && (
                        <Container
                            heading={strings.appealManagerContactHeading}
                            headingLevel={4}
                            spacing="none"
                        >
                            {appealManagerContactText}
                        </Container>
                    )}
                    {projectManagerContactDefined && (
                        <Container
                            heading={strings.projectManagerContactHeading}
                            headingLevel={4}
                            spacing="none"
                        >
                            {projectManagerContactText}
                        </Container>
                    )}
                    {focalPointContactDefined && (
                        <Container
                            heading={strings.focalPointContactHeading}
                            headingLevel={4}
                            spacing="none"
                        >
                            {focalPointContactText}
                        </Container>
                    )}
                    {mediaContactDefined && (
                        <Container
                            heading={strings.mediaContactHeading}
                            headingLevel={4}
                            spacing="none"
                        >
                            {mediaContactText}
                        </Container>
                    )}
                    {/* FIXME: Add references */}
                </Container>
            )}
            {previewReady && <div id="pdf-preview-ready" />}
        </div>
    );
}

Component.displayName = 'DrefApplicationExport';
