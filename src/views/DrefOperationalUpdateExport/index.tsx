import { Fragment, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
    _cs,
    isDefined,
    isFalsyString,
    isTruthyString,
} from '@togglecorp/fujs';

import Container from '#components/Container';
import Image from '#components/Image';
import Header from '#components/Header';
import Link from '#components/Link';
import TextOutput from '#components/TextOutput';
import DescriptionText from '#components/domain/DescriptionText';
import BlockTextOutput from '#components/domain/BlockTextOutput';
import NumberOutput from '#components/NumberOutput';
import useTranslation from '#hooks/useTranslation';
import { useRequest } from '#utils/restRequest';
import { DREF_TYPE_ASSESSMENT, DREF_TYPE_IMMINENT } from '#utils/constants';

import ifrcLogo from '#assets/icons/ifrc-square.png';

import i18n from './i18n.json';
import styles from './styles.module.css';

const colorMap: Record<string, string | undefined> = {
    Yellow: styles.yellow,
    Orange: styles.orange,
    Red: styles.red,
    Text: undefined,
};

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const { opsUpdateId } = useParams<{ opsUpdateId: string }>();
    const [previewReady, setPreviewReady] = useState(false);
    const strings = useTranslation(i18n);

    const {
        // pending: fetchingDref,
        response: drefResponse,
    } = useRequest({
        skip: isFalsyString(opsUpdateId),
        url: '/api/v2/dref-op-update/{id}/',
        pathVariables: isDefined(opsUpdateId) ? {
            id: opsUpdateId,
        } : undefined,
        onSuccess: () => {
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
                );

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

    const ifrcActionsDefined = isTruthyString(drefResponse?.ifrc?.trim());
    const partnerNsActionsDefined = isTruthyString(drefResponse?.partner_national_society?.trim());
    const showMovementPartnersActionsSection = ifrcActionsDefined || partnerNsActionsDefined;

    const summaryOfChangeDefined = isTruthyString(drefResponse?.summary_of_change?.trim());
    const specifiedTriggerMetDefined = drefResponse?.type_of_dref === DREF_TYPE_IMMINENT
        && isTruthyString(drefResponse?.specified_trigger_met?.trim());
    const showSummaryOfChangesSection = summaryOfChangeDefined
        || specifiedTriggerMetDefined
        || isDefined(drefResponse?.changing_timeframe_operation)
        || isDefined(drefResponse?.changing_geographic_location)
        || isDefined(drefResponse?.changing_budget)
        || isDefined(drefResponse?.changing_operation_strategy)
        || isDefined(drefResponse?.changing_target_population_of_operation)
        || isDefined(drefResponse?.request_for_second_allocation)
        || isDefined(drefResponse?.has_forecasted_event_materialize);

    const nsActionImagesDefined = isDefined(drefResponse)
        && drefResponse.photos_file
        && drefResponse.photos_file.length > 0;
    const nsActionsDefined = isDefined(drefResponse)
        && isDefined(drefResponse.national_society_actions)
        && drefResponse.national_society_actions.length > 0;
    const showNsActionsSection = nsActionsDefined || nsActionImagesDefined;

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

    // const showBudgetOverviewSection = isTruthyString(drefResponse?.budget_file_details?.file);

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
        <div className={styles.drefOperationalUpdateExport}>
            <div className={styles.pageTitleSection}>
                <img
                    className={styles.ifrcLogo}
                    src={ifrcLogo}
                    alt={strings.drefOperationalImageAlt}
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
                imgElementClassName={styles.image}
                src={drefResponse?.cover_image_file?.file}
                caption={drefResponse?.cover_image_file?.caption}
                captionClassName={styles.caption}
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
                    label={strings.drefAllocationLabel}
                    value={drefResponse?.total_dref_allocation}
                    valueType="number"
                    prefix={strings.chfPrefix}
                    strongValue
                />
                <TextOutput
                    className={styles.metaItem}
                    label={strings.crisisCategoryLabel}
                    value={drefResponse?.disaster_category_display}
                    valueClassName={_cs(
                        drefResponse?.disaster_category_display
                            && colorMap[drefResponse.disaster_category_display],
                    )}
                    strongValue
                />
                {/*
                <TextOutput
                    className={styles.metaItem}
                    label={strings.countryLabel}
                    value={drefResponse?.country_details?.name}
                    strongValue
                />
                */}
                <TextOutput
                    className={styles.metaItem}
                    label={strings.hazardLabel}
                    value={drefResponse?.disaster_type_details?.name}
                    strongValue
                />
                <TextOutput
                    className={styles.metaItem}
                    label={strings.glideNumberLabel}
                    value={drefResponse?.glide_code}
                    strongValue
                />
                {/*
                <TextOutput
                    className={styles.metaItem}
                    label={strings.typeOfDrefLabel}
                    value={drefResponse?.type_of_dref_display}
                    strongValue
                />
                */}
                <TextOutput
                    className={styles.metaItem}
                    label={strings.peopleAffectedLabel}
                    value={drefResponse?.number_of_people_affected}
                    valueType="number"
                    suffix={strings.peopleSuffix}
                    strongValue
                />
                <TextOutput
                    className={styles.peopleTargeted}
                    label={strings.peopleTargetedLabel}
                    value={drefResponse?.total_targeted_population}
                    suffix={strings.peopleSuffix}
                    valueType="number"
                    strongValue
                />
                <TextOutput
                    className={styles.metaItem}
                    label={strings.eventOnsetLabel}
                    value={drefResponse?.type_of_onset_display}
                    strongValue
                />
                <TextOutput
                    className={styles.metaItem}
                    label={strings.operationStartDateLabel}
                    value={drefResponse?.new_operational_start_date}
                    valueType="date"
                    strongValue
                />
                <TextOutput
                    className={styles.metaItem}
                    label={strings.operationEndDateLabel}
                    value={drefResponse?.new_operational_end_date}
                    valueType="date"
                    strongValue
                />
                <TextOutput
                    className={styles.metaItem}
                    label={strings.operationTimeframeLabel}
                    value={drefResponse?.total_operation_timeframe}
                    valueType="number"
                    suffix={strings.monthsSuffix}
                    strongValue
                />
                <TextOutput
                    className={styles.metaItem}
                    label={strings.additionalAllocationRequestedLabel}
                    value={drefResponse?.additional_allocation}
                    valueType="number"
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
                    <Image
                        imgElementClassName={styles.image}
                        captionClassName={styles.caption}
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
                    {imagesFileDefined && drefResponse.images_file?.map(
                        (imageFile) => (
                            <Image
                                imgElementClassName={styles.smallImage}
                                captionClassName={styles.caption}
                                key={imageFile.id}
                                src={imageFile.file}
                                caption={imageFile.caption}
                            />
                        ),
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
                </Container>
            )}
            {showSummaryOfChangesSection && (
                <Container
                    heading={strings.summaryOfChangesSectionHeading}
                    className={styles.summaryOfChangesSection}
                    childrenContainerClassName={styles.content}
                    headingLevel={2}
                >
                    <BlockTextOutput
                        className={styles.textOutput}
                        label={strings.changingTimeFrameLabel}
                        value={drefResponse?.changing_timeframe_operation}
                        valueType="boolean"
                        strongValue
                    />
                    <BlockTextOutput
                        className={styles.textOutput}
                        label={strings.changingStrategyLabel}
                        value={drefResponse?.changing_operation_strategy}
                        valueType="boolean"
                        strongValue
                    />
                    <BlockTextOutput
                        className={styles.textOutput}
                        label={strings.changingTargetPopulationLabel}
                        value={drefResponse?.changing_target_population_of_operation}
                        valueType="boolean"
                        strongValue
                    />
                    <BlockTextOutput
                        className={styles.textOutput}
                        label={strings.changingLocationLabel}
                        value={drefResponse?.changing_geographic_location}
                        valueType="boolean"
                        strongValue
                    />
                    <BlockTextOutput
                        className={styles.textOutput}
                        label={strings.changingBudgetLabel}
                        value={drefResponse?.changing_budget}
                        valueType="boolean"
                        strongValue
                    />
                    <BlockTextOutput
                        className={styles.textOutput}
                        label={strings.secondAllocationLabel}
                        value={drefResponse?.request_for_second_allocation}
                        valueType="boolean"
                        strongValue
                    />
                    <BlockTextOutput
                        className={styles.textOutput}
                        label={strings.eventMaterializedLabel}
                        value={drefResponse?.has_forecasted_event_materialize}
                        valueType="boolean"
                        strongValue
                    />
                    {summaryOfChangeDefined && (
                        <TextOutput
                            className={styles.summary}
                            label={strings.changeSummaryLabel}
                            value={drefResponse?.summary_of_change}
                            valueType="text"
                            strongLabel
                        />
                    )}
                    {specifiedTriggerMetDefined && (
                        <TextOutput
                            className={styles.specifiedTriggerMet}
                            label={strings.specifiedTriggerMetLabel}
                            value={drefResponse?.specified_trigger_met}
                            valueType="text"
                            strongLabel
                        />
                    )}
                </Container>
            )}
            {showNsActionsSection && (
                <Container
                    heading={strings.currentNationalSocietyActionsHeading}
                    className={styles.nsActionsSection}
                    childrenContainerClassName={styles.content}
                    headingLevel={2}
                >
                    {nsActionImagesDefined && drefResponse?.photos_file?.map(
                        (nsActionImage) => (
                            <Image
                                captionClassName={styles.caption}
                                key={nsActionImage.id}
                                src={nsActionImage.file}
                                caption={nsActionImage.caption}
                            />
                        ),
                    )}
                    {nsActionsDefined && (
                        <div className={styles.actions}>
                            {drefResponse?.national_society_actions?.map(
                                (nsAction) => (
                                    <BlockTextOutput
                                        className={styles.textOutput}
                                        key={nsAction.id}
                                        label={nsAction.title_display}
                                        value={nsAction.description}
                                        valueType="text"
                                        strongLabel
                                    />
                                ),
                            )}
                        </div>
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
                            className={styles.textOutput}
                            label={strings.secretariatLabel}
                            value={drefResponse?.ifrc}
                            valueType="text"
                            strongLabel
                        />
                    )}
                    {partnerNsActionsDefined && (
                        <BlockTextOutput
                            className={styles.textOutput}
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
                            className={styles.textOutput}
                            label={strings.governmentRequestedAssistanceLabel}
                            value={drefResponse?.government_requested_assistance}
                            valueType="boolean"
                            strongLabel
                        />
                    )}
                    {nationalAuthoritiesDefined && (
                        <BlockTextOutput
                            className={styles.textOutput}
                            label={strings.nationalAuthoritiesLabel}
                            value={drefResponse?.national_authorities}
                            valueType="text"
                            strongLabel
                        />
                    )}
                    {unOrOtherActorDefined && (
                        <BlockTextOutput
                            className={styles.textOutput}
                            label={strings.unOrOtherActorsLabel}
                            value={drefResponse?.un_or_other_actor}
                            valueType="text"
                            strongLabel
                        />
                    )}
                    {majorCoordinationMechanismDefined && (
                        <BlockTextOutput
                            className={_cs(styles.textOutput, styles.majorCoordination)}
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
                                headingSectionClassName={styles.headingSection}
                                spacing="compact"
                                icons={(
                                    <img
                                        className={styles.icon}
                                        src={identifiedNeed.image_url}
                                        alt={strings.drefOperationalImageAlt}
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
            {/* TODO: check if this section is also optional */}
            <Container
                heading={strings.targetPopulationSectionHeading}
                headingLevel={2}
                className={styles.targetPopulationSection}
                childrenContainerClassName={styles.content}
            >
                <div className={styles.left}>
                    {drefResponse?.type_of_dref !== DREF_TYPE_ASSESSMENT && (
                        <>
                            <BlockTextOutput
                                className={styles.textOutput}
                                labelClassName={styles.categoryLabel}
                                label={strings.womenLabel}
                                value={drefResponse?.women}
                                valueType="number"
                                strongValue
                            />
                            <BlockTextOutput
                                className={styles.textOutput}
                                label={strings.girlsLabel}
                                value={drefResponse?.girls}
                                valueType="number"
                                strongValue
                                labelClassName={styles.categoryLabel}
                            />
                            <BlockTextOutput
                                className={styles.textOutput}
                                label={strings.menLabel}
                                value={drefResponse?.men}
                                valueType="number"
                                strongValue
                                labelClassName={styles.categoryLabel}
                            />
                            <BlockTextOutput
                                className={styles.textOutput}
                                label={strings.boysLabel}
                                value={drefResponse?.boys}
                                valueType="number"
                                strongValue
                                labelClassName={styles.categoryLabel}
                            />
                        </>
                    )}
                </div>
                <div className={styles.right}>
                    <BlockTextOutput
                        className={styles.textOutput}
                        label={strings.ruralLabel}
                        value={isDefined(drefResponse?.people_per_local)
                            ? Number(drefResponse?.people_per_local)
                            : undefined}
                        valueType="number"
                        suffix="%"
                        strongValue
                    />
                    <BlockTextOutput
                        className={_cs(styles.textOutput, styles.ruralUrban)}
                        label={strings.urbanLabel}
                        value={isDefined(drefResponse?.people_per_urban)
                            ? Number(drefResponse?.people_per_urban)
                            : undefined}
                        suffix="%"
                        valueType="number"
                        strongValue
                    />
                    <BlockTextOutput
                        className={_cs(styles.textOutput, styles.disabilities)}
                        label={strings.peopleWithDisabilitesLabel}
                        value={isDefined(drefResponse?.disability_people_per)
                            ? Number(drefResponse?.disability_people_per)
                            : undefined}
                        labelClassName={styles.disabilityLabel}
                        valueClassName={styles.disabilityValue}
                        suffix="%"
                        valueType="number"
                        strongValue
                    />
                </div>
                <BlockTextOutput
                    className={styles.textOutput}
                    label={strings.targetedPopulationLabel}
                    value={drefResponse?.total_targeted_population}
                    labelClassName={styles.totalTargetedPopulationLabel}
                    valueClassName={styles.totalTargetedPopulationValue}
                    valueType="number"
                    strongValue
                />
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
                            headingClassName={styles.riskHeading}
                            childrenContainerClassName={styles.riskList}
                            headingLevel={6}
                        >
                            <div className={styles.riskTitle}>
                                {strings.drefOperationalRisk}
                            </div>
                            <div className={styles.mitigationTitle}>
                                {strings.drefOperationalMitigation}
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
                            headingLevel={6}
                            headingClassName={styles.riskHeading}
                        >
                            <DescriptionText
                                className={styles.description}
                            >
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
                                        alt={strings.drefOperationalOtherImageAlt}
                                    />
                                )}
                                headingSectionClassName={styles.headingSection}
                                headingClassName={styles.interventionHeading}
                                heading={plannedIntervention.title_display}
                                actionsContainerClassName={styles.metaDetails}
                                withoutWrapInHeading
                                actions={(
                                    <>
                                        <BlockTextOutput
                                            className={styles.textOutput}
                                            label={strings.targetedPersonsLabel}
                                            value={plannedIntervention.person_targeted}
                                            valueType="number"
                                            strongLabel
                                        />
                                        <BlockTextOutput
                                            className={styles.textOutput}
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
                                    <div className={styles.actualLabel}>
                                        {strings.indicatorActualLabel}
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
                                                <NumberOutput
                                                    className={styles.actual}
                                                    value={indicator.actual}
                                                />
                                            </Fragment>
                                        ),
                                    )}
                                </Container>
                                <Container
                                    heading={strings.progressTowardsOutcomeHeading}
                                    headingLevel={4}
                                    spacing="compact"
                                >
                                    <DescriptionText>
                                        {plannedIntervention.progress_towards_outcome}
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
            {/* FIXME: confirm if budget overview section is needed here */}
            {/* showBudgetOverviewSection && (
                <Container
                    heading={strings.budgetOverSectionHeading}
                    headingLevel={2}
                    className={styles.budgetOverviewSection}
                    childrenContainerClassName={styles.content}
                    actions={(
                        <Link
                            to={drefResponse?.budget_file_details?.file}
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
            ) */}
            {showContactsSection && (
                <>
                    <Container
                        className={styles.contactInformationSection}
                        childrenContainerClassName={styles.content}
                        heading={strings.contactInformationSectionHeading}
                        headingLevel={2}
                        headerDescription={strings.contactInformationSectionDescription}
                    >
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
                    </Container>
                    <Link
                        to="emergencies"
                        withUnderline
                    >
                        {strings.drefExportReference}
                    </Link>
                </>
            )}
            {previewReady && <div id="pdf-preview-ready" />}
        </div>
    );
}

Component.displayName = 'DrefOperationalUpdateExport';
