import { Fragment, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
    _cs,
    isDefined,
    isFalsyString,
    isNotDefined,
    isTruthyString,
} from '@togglecorp/fujs';

import Container from '#components/printable/Container';
import TextOutput, { type Props as TextOutputProps } from '#components/printable/TextOutput';
import Image from '#components/printable/Image';
import Heading from '#components/printable/Heading';
import Link from '#components/printable/Link';

import DateOutput from '#components/DateOutput';
import DescriptionText from '#components/printable/DescriptionText';
import NumberOutput from '#components/NumberOutput';
import useTranslation from '#hooks/useTranslation';
import { useRequest } from '#utils/restRequest';
import {
    DISASTER_CATEGORY_ORANGE,
    DISASTER_CATEGORY_RED,
    DISASTER_CATEGORY_YELLOW,
    DREF_TYPE_ASSESSMENT,
    DREF_TYPE_IMMINENT,
    DisasterCategory,
} from '#utils/constants';
import {
    identifiedNeedsAndGapsOrder,
    plannedInterventionOrder,
} from '#utils/domain/dref';

import ifrcLogo from '#assets/icons/ifrc-square.png';

import i18n from './i18n.json';
import styles from './styles.module.css';

function BlockTextOutput(props: TextOutputProps & { variant?: never, withoutLabelColon?: never }) {
    return (
        <TextOutput
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            variant="contents"
            withoutLabelColon
        />
    );
}

const colorMap: Record<DisasterCategory, string> = {
    [DISASTER_CATEGORY_YELLOW]: styles.yellow,
    [DISASTER_CATEGORY_ORANGE]: styles.orange,
    [DISASTER_CATEGORY_RED]: styles.red,
};

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

    const filteredPlannedIntervention = useMemo(
        () => drefResponse?.planned_interventions?.map((intervention) => {
            if (isNotDefined(intervention.title)) {
                return undefined;
            }
            return { ...intervention, title: intervention.title };
        }).filter(isDefined),
        [drefResponse?.planned_interventions],
    );

    const filteredIdentifiedNeedsAndGaps = useMemo(
        () => drefResponse?.needs_identified?.map((need) => {
            if (isNotDefined(need.title)) {
                return undefined;
            }
            return { ...need, title: need.title };
        }).filter(isDefined),
        [drefResponse?.needs_identified],
    );

    const sortedPlannedInterventions = useMemo(
        () => filteredPlannedIntervention?.sort(
            // eslint-disable-next-line max-len
            (a, b) => plannedInterventionOrder[a.title] - plannedInterventionOrder[b.title],
        ),
        [filteredPlannedIntervention],
    );

    const sortedIdentifiedNeedsAndGaps = useMemo(
        () => filteredIdentifiedNeedsAndGaps?.sort(
            // eslint-disable-next-line max-len
            (a, b) => identifiedNeedsAndGapsOrder[a.title] - identifiedNeedsAndGapsOrder[b.title],
        ),
        [filteredIdentifiedNeedsAndGaps],
    );

    const showMainDonorsSection = isTruthyString(drefResponse?.main_donors?.trim());
    const eventDescriptionDefined = isTruthyString(drefResponse?.event_description?.trim());
    const eventScopeDefined = drefResponse?.type_of_dref !== DREF_TYPE_ASSESSMENT
        && isTruthyString(drefResponse?.event_scope?.trim());
    const imagesFileDefined = isDefined(drefResponse)
        && isDefined(drefResponse.images_file)
        && drefResponse.images_file.length > 0;
    const eventDateDefined = drefResponse?.type_of_dref !== DREF_TYPE_IMMINENT
        && isDefined(drefResponse?.event_date);
    const eventTextDefined = drefResponse?.type_of_dref === DREF_TYPE_IMMINENT
        && isDefined(drefResponse?.event_text);
    const showEventDescriptionSection = eventDescriptionDefined
        || eventScopeDefined
        || imagesFileDefined
        || eventDateDefined
        || eventTextDefined
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
    const hasChildrenSafeguardingDefined = isDefined(
        drefResponse?.has_child_safeguarding_risk_analysis_assessment,
    );
    const showRiskAndSecuritySection = riskSecurityDefined
        || riskSecurityConcernDefined
        || hasChildrenSafeguardingDefined;

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
            <Container childrenContainerClassName={styles.pageTitleSection}>
                <img
                    className={styles.ifrcLogo}
                    src={ifrcLogo}
                    alt={strings.imageLogoIFRCAlt}
                />
                <div>
                    <Heading level={1}>
                        {strings.exportTitle}
                    </Heading>
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
                            src={drefResponse?.cover_image_file?.file}
                            caption={drefResponse?.cover_image_file?.caption}
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
                        isDefined(drefResponse)
                        && isDefined(drefResponse.disaster_category)
                        // FIXME: empty string in enum
                        && drefResponse.disaster_category !== ''
                        && colorMap[drefResponse.disaster_category],
                    )}
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
                    value={drefResponse?.operation_start_date}
                    valueType="date"
                    strongValue
                />
                <TextOutput
                    className={styles.metaItem}
                    label={strings.operationEndDateLabel}
                    value={drefResponse?.operation_end_date}
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
                    className={styles.targetedAreas}
                    label={strings.targetedAreasLabel}
                    value={drefResponse?.district_details?.map(
                        (district) => district.name,
                    ).join(', ')}
                    strongValue
                />
            </Container>
            {showMainDonorsSection && (
                <Container>
                    <DescriptionText className={styles.mainDonorText}>
                        {drefResponse?.main_donors}
                    </DescriptionText>
                </Container>
            )}
            {showEventDescriptionSection && (
                <>
                    <div className={styles.pageBreak} />
                    <Heading level={2}>
                        {strings.eventDescriptionSectionHeading}
                    </Heading>
                    {isTruthyString(drefResponse?.event_map_file?.file) && (
                        <Container>
                            <Image
                                src={drefResponse?.event_map_file?.file}
                                caption={drefResponse?.event_map_file?.caption}
                            />
                        </Container>
                    )}
                    {eventTextDefined && (
                        <Container heading={strings.approximateDateOfImpactHeading}>
                            <DescriptionText>
                                {drefResponse.event_text}
                            </DescriptionText>
                        </Container>
                    )}
                    {eventDateDefined && (
                        <Container heading={strings.dateWhenTheTriggerWasMetHeading}>
                            <DateOutput
                                value={drefResponse?.event_date}
                            />
                        </Container>
                    )}
                    {eventDescriptionDefined && (
                        <Container
                            heading={drefResponse?.type_of_dref === DREF_TYPE_IMMINENT
                                ? strings.situationUpdateSectionHeading
                                : strings.whatWhereWhenSectionHeading}
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
                </>
            )}
            {showNsActionsSection && (
                <Container
                    heading={strings.nationalSocietyActionsHeading}
                    childrenContainerClassName={styles.nsActionsContent}
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
                    {needsIdentifiedDefined && sortedIdentifiedNeedsAndGaps?.map(
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
                            heading={strings.operationStragegyHeading}
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
                    label={strings.peopleWithDisabilitesLabel}
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
            {showRiskAndSecuritySection && (
                <>
                    <Heading level={2}>
                        {strings.riskAndSecuritySectionHeading}
                    </Heading>
                    {riskSecurityDefined && (
                        <Container
                            heading={strings.riskSecurityHeading}
                            childrenContainerClassName={styles.riskList}
                            headingLevel={6}
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
                                        <DescriptionText className={styles.risk}>
                                            {riskSecurity.risk}
                                        </DescriptionText>
                                        <DescriptionText className={styles.mitigation}>
                                            {riskSecurity.mitigation}
                                        </DescriptionText>
                                    </Fragment>
                                ),
                            )}
                        </Container>
                    )}
                    {riskSecurityConcernDefined && (
                        <Container
                            heading={strings.safetyConcernHeading}
                            headingLevel={6}
                        >
                            <DescriptionText
                                className={styles.description}
                            >
                                {drefResponse?.risk_security_concern}
                            </DescriptionText>
                        </Container>
                    )}
                    {hasChildrenSafeguardingDefined && (
                        <Container>
                            <BlockTextOutput
                                label={strings.hasChildRiskCompleted}
                                // eslint-disable-next-line max-len
                                value={drefResponse?.has_child_safeguarding_risk_analysis_assessment}
                                valueType="boolean"
                                strongLabel
                            />
                        </Container>
                    )}
                </>
            )}
            {plannedInterventionDefined && (
                <>
                    <Heading level={2}>
                        {strings.interventionSectionHeading}
                    </Heading>
                    {sortedPlannedInterventions?.map(
                        (plannedIntervention) => (
                            <Fragment key={plannedIntervention.id}>
                                <Heading className={styles.plannedInterventionHeading}>
                                    <img
                                        className={styles.icon}
                                        src={plannedIntervention.image_url}
                                        alt=""
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
                                    <TextOutput
                                        label={strings.assistedPersonsLabel}
                                        value={plannedIntervention.person_assisted}
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
                                        headingLevel={5}
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
                                        headingLevel={5}
                                    >
                                        <DescriptionText>
                                            {plannedIntervention.lessons_learnt}
                                        </DescriptionText>
                                    </Container>
                                )}
                                {isTruthyString(plannedIntervention.challenges?.trim()) && (
                                    <Container
                                        heading={strings.challengesHeading}
                                        headingLevel={5}
                                    >
                                        <DescriptionText>
                                            {plannedIntervention.challenges}
                                        </DescriptionText>
                                    </Container>
                                )}
                            </Fragment>
                        ),
                    )}
                </>
            )}
            {showFinancialReportSection && (
                <>
                    <div className={styles.pageBreak} />
                    <Heading level={2}>
                        {strings.financialReportSectionHeading}
                    </Heading>
                    {financialReportPreviewDefined && (
                        <Container>
                            <Image
                                imgElementClassName={styles.financialReportPreview}
                                src={drefResponse?.financial_report_preview}
                            />
                        </Container>
                    )}
                    {isTruthyString(drefResponse?.financial_report_details?.file) && (
                        <Container>
                            <Link
                                href={drefResponse?.financial_report_details?.file}
                            >
                                {strings.downloadFinancialReport}
                            </Link>
                        </Container>
                    )}
                    {financialReportDescriptionDefined && (
                        <Container heading={strings.financialReportVariancesHeading}>
                            <DescriptionText>
                                {drefResponse?.financial_report_description}
                            </DescriptionText>
                        </Container>
                    )}
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
                    </Container>
                    <Link
                        href="/emergencies"
                    >
                        {strings.drefExportReference}
                    </Link>
                </>
            )}
            {previewReady && <div id="pdf-preview-ready" />}
        </div>
    );
}

Component.displayName = 'DrefFinalReportExport';
