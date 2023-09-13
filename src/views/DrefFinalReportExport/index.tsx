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
import Header from '#components/Header';
import TextOutput from '#components/TextOutput';
import DescriptionText from '#components/domain/DescriptionText';
import BlockTextOutput from '#components/domain/BlockTextOutput';
import NumberOutput from '#components/NumberOutput';
import useTranslation from '#hooks/useTranslation';
import Link from '#components/Link';
import { useRequest } from '#utils/restRequest';
import { DREF_TYPE_ASSESSMENT, DREF_TYPE_IMMINENT } from '#utils/constants';

import ifrcLogo from '#assets/icons/ifrc-square.png';

import i18n from './i18n.json';
import styles from './styles.module.css';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const { finalReportId } = useParams<{ finalReportId: string }>();
    const [previewReady, setPreviewReady] = useState(false);
    const strings = useTranslation(i18n);

    const {
        // pending: fetchingDref,
        response: drefResponse,
    } = useRequest({
        skip: isFalsyString(finalReportId),
        url: '/api/v2/dref-final-report/{id}/',
        pathVariables: isDefined(finalReportId) ? {
            id: finalReportId,
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

    const showMainDonorsSection = isTruthyString(drefResponse?.main_donors?.trim());
    const eventDescriptionDefined = isTruthyString(drefResponse?.event_description?.trim());
    const eventScopeDefined = drefResponse?.type_of_dref !== DREF_TYPE_ASSESSMENT
        && isTruthyString(drefResponse?.event_scope?.trim());
    const imagesFileDefined = isDefined(drefResponse)
        && isDefined(drefResponse.images_file)
        && drefResponse.images_file.length > 0;
    const showEventDescriptionSection = eventDescriptionDefined
        || eventScopeDefined
        || imagesFileDefined
        || isDefined(drefResponse?.event_map_file?.file);

    const ifrcActionsDefined = isTruthyString(drefResponse?.ifrc?.trim());
    const partnerNsActionsDefined = isTruthyString(drefResponse?.partner_national_society?.trim());
    const showMovementPartnersActionsSection = ifrcActionsDefined || partnerNsActionsDefined;

    const showNsActionsSection = isDefined(drefResponse?.has_national_society_conducted)
        || isTruthyString(drefResponse?.national_society_conducted_description);

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

    const needsIdentifiedDefined = isDefined(drefResponse)
        && isDefined(drefResponse.needs_identified)
        && drefResponse.needs_identified.length > 0;
    const showNeedsIdentifiedSection = isDefined(drefResponse)
        && drefResponse.type_of_dref !== DREF_TYPE_ASSESSMENT
        && needsIdentifiedDefined;

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

    const financialReportDescriptionDefined = isTruthyString(
        drefResponse?.financial_report_description?.trim(),
    );
    const financialReportPreviewDefined = isTruthyString(
        drefResponse?.financial_report_preview?.trim(),
    );
    const showFinancialReportSection = financialReportPreviewDefined
        || financialReportDescriptionDefined
        || isTruthyString(drefResponse?.financial_report_details?.file);

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
        <div className={styles.drefFinalReportExport}>
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
                    value={drefResponse?.total_dref_allocation}
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
                    value={drefResponse?.number_of_people_affected}
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
                    className={styles.dateItem}
                    label={strings.operationStartDateLabel}
                    value={drefResponse?.operation_start_date}
                    valueType="date"
                    strongValue
                />
                <TextOutput
                    className={styles.dateItem}
                    label={strings.operationEndDateLabel}
                    // FIXME: Find out the field
                    // value={drefResponse?.operation_end_date}
                    value={undefined}
                    valueType="date"
                    strongValue
                />
                <TextOutput
                    className={styles.dateItem}
                    label={strings.operationTimeframeLabel}
                    value={drefResponse?.total_operation_timeframe}
                    valueType="number"
                    suffix={strings.monthsSuffix}
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
            {showMainDonorsSection && (
                <DescriptionText className={styles.mainDonorText}>
                    {drefResponse?.main_donors}
                </DescriptionText>
            )}
            {showEventDescriptionSection && (
                <Container
                    heading={strings.eventDescriptionSectionHeading}
                    className={styles.eventDescriptionSection}
                    headingLevel={2}
                    childrenContainerClassName={styles.content}
                >
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
                    {imagesFileDefined && drefResponse.images_file?.map(
                        (imageFile) => (
                            <Image
                                key={imageFile.id}
                                src={imageFile.file}
                                caption={imageFile.caption}
                            />
                        ),
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
            {showNsActionsSection && (
                <Container
                    heading={strings.nationalSocietyActionsHeading}
                    className={styles.nsActionsSection}
                    childrenContainerClassName={styles.content}
                    headingLevel={2}
                >
                    <BlockTextOutput
                        label={strings.nsConductedInterventionLabel}
                        value={drefResponse?.has_national_society_conducted}
                        valueType="boolean"
                        strongLabel
                    />
                    <BlockTextOutput
                        label={strings.nsInterventionDescriptionLabel}
                        value={drefResponse?.national_society_conducted_description}
                        valueType="text"
                        strongLabel
                    />
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
                    value={isDefined(drefResponse?.people_per_local)
                        ? Number(drefResponse?.people_per_local)
                        : undefined}
                    valueType="number"
                    suffix="%"
                    strongValue
                />
                <BlockTextOutput
                    label={strings.urbanLabel}
                    value={isDefined(drefResponse?.people_per_urban)
                        ? Number(drefResponse?.people_per_urban)
                        : undefined}
                    suffix="%"
                    valueType="number"
                    strongValue
                />
                <BlockTextOutput
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
                                {strings.riskLabel}
                            </div>
                            <div className={styles.mitigationTitle}>
                                {strings.mitigationLabel}
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
                    heading={strings.interventionSectionHeading}
                    headingLevel={2}
                    className={styles.implementationSection}
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
                                        <TextOutput
                                            label={strings.assistedPersonsLabel}
                                            value={plannedIntervention.person_assisted}
                                            valueType="number"
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
                                {isTruthyString(
                                    plannedIntervention
                                        .narrative_description_of_achievements?.trim(),
                                ) && (
                                    <Container
                                        heading={strings.achievementsHeading}
                                        headingLevel={4}
                                        spacing="compact"
                                    >
                                        <DescriptionText>
                                            {plannedIntervention
                                                .narrative_description_of_achievements}
                                        </DescriptionText>
                                    </Container>
                                )}
                                {isTruthyString(plannedIntervention.lessons_learnt?.trim()) && (
                                    <Container
                                        heading={strings.lessonsLearntHeading}
                                        headingLevel={4}
                                        spacing="compact"
                                    >
                                        <DescriptionText>
                                            {plannedIntervention.lessons_learnt}
                                        </DescriptionText>
                                    </Container>
                                )}
                                {isTruthyString(plannedIntervention.challenges?.trim()) && (
                                    <Container
                                        heading={strings.challengesHeading}
                                        headingLevel={4}
                                        spacing="compact"
                                    >
                                        <DescriptionText>
                                            {plannedIntervention.challenges}
                                        </DescriptionText>
                                    </Container>
                                )}
                            </Container>
                        ),
                    )}
                </Container>
            )}
            {showFinancialReportSection && (
                <Container
                    heading={strings.financialReportSectionHeading}
                    headingLevel={2}
                    className={styles.financialOverviewSection}
                    childrenContainerClassName={styles.content}
                    actions={(
                        <Link
                            to={drefResponse?.financial_report_details?.file}
                            external
                        >
                            <DownloadLineIcon className={styles.downloadIcon} />
                        </Link>
                    )}
                >
                    {financialReportPreviewDefined && (
                        <img
                            className={styles.preview}
                            src={drefResponse?.financial_report_preview}
                            alt=""
                        />
                    )}
                    {financialReportDescriptionDefined && (
                        <Container
                            heading={strings.financialReportVariancesHeading}
                        >
                            <DescriptionText>
                                {drefResponse?.financial_report_description}
                            </DescriptionText>
                        </Container>
                    )}
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

Component.displayName = 'DrefFinalReportExport';
