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
import DescriptionText from '#components/printable/DescriptionText';
import Link from '#components/Link';
import DateOutput from '#components/DateOutput';
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
    nsActionsOrder,
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
        && drefResponse.national_society_actions.length > 0
        && isDefined(nsActions);

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
        && drefResponse.needs_identified.length > 0
        && isDefined(needsIdentified);

    const assessmentReportDefined = isDefined(drefResponse)
        && isDefined(drefResponse.assessment_report_details)
        && isDefined(drefResponse.assessment_report_details.file);

    const showNeedsIdentifiedSection = isDefined(drefResponse)
        && drefResponse.type_of_dref !== DREF_TYPE_ASSESSMENT
        && (identifiedGapsDefined || needsIdentifiedDefined || assessmentReportDefined);

    const operationObjectiveDefined = isTruthyString(drefResponse?.operation_objective?.trim());
    const responseStrategyDefined = isTruthyString(drefResponse?.response_strategy?.trim());
    const showOperationStrategySection = operationObjectiveDefined || responseStrategyDefined;

    const peopleAssistedDefined = isTruthyString(drefResponse?.people_assisted?.trim());
    const selectionCriteriaDefined = isTruthyString(drefResponse?.selection_criteria?.trim());
    const targetingStrategySupportingDocumentDefined = isDefined(
        drefResponse?.targeting_strategy_support_file_details,
    );
    const showTargetingStrategySection = peopleAssistedDefined
    || selectionCriteriaDefined
    || targetingStrategySupportingDocumentDefined;

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
        && drefResponse.planned_interventions.length > 0
        && isDefined(plannedInterventions);

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

    const sourceInformationDefined = isDefined(drefResponse)
        && isDefined(drefResponse.source_information)
        && drefResponse.source_information.length > 0;

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
            </Container>
            {showEventDescriptionSection && (
                <>
                    <div className={styles.pageBreak} />
                    <Heading level={2}>
                        {strings.eventDescriptionSectionHeading}
                    </Heading>
                    {drefResponse?.disaster_category_analysis_details?.file && (
                        <Container>
                            <Link
                                href={drefResponse?.disaster_category_analysis_details?.file}
                                external
                                withUnderline
                            >
                                {strings.crisisCategorySupportingDocumentLabel}
                            </Link>
                        </Container>
                    )}
                    {isDefined(drefResponse)
                        && drefResponse.type_of_dref === DREF_TYPE_IMMINENT
                        && isTruthyString(drefResponse.event_text) && (
                        <Container
                            heading={strings.approximateDateOfImpactHeading}
                            headingLevel={3}
                        >
                            <DescriptionText>
                                {drefResponse.event_text}
                            </DescriptionText>
                        </Container>
                    )}
                    {isTruthyString(drefResponse?.event_map_file?.file) && (
                        <Container>
                            <Image
                                src={drefResponse?.event_map_file?.file}
                                caption={drefResponse?.event_map_file?.caption}
                            />
                        </Container>
                    )}
                    {isDefined(drefResponse?.end_date) && (
                        <Container
                            heading={drefResponse?.type_of_dref !== DREF_TYPE_IMMINENT
                                && strings.dateWhenTheTriggerWasMetHeading}
                        >
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
                                {drefResponse?.event_scope}
                            </DescriptionText>
                        </Container>
                    )}
                    {drefResponse?.supporting_document_details?.file && (
                        <Container>
                            <Link
                                href={drefResponse?.supporting_document_details?.file}
                                external
                                withUnderline
                            >
                                {strings.drefApplicationSupportingDocumentation}
                            </Link>
                        </Container>
                    )}
                    {sourceInformationDefined && (
                        <Container
                            heading={strings.SourceInformationSectionHeading}
                            childrenContainerClassName={styles.sourceInformationList}
                            headingLevel={3}
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
                                            <Link
                                                href={source.source_link}
                                                external
                                                withUnderline
                                            >
                                                {source?.source_link}
                                            </Link>
                                        </DescriptionText>
                                    </Fragment>
                                ),
                            )}

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
                </Container>
            )}
            {showNsAction && (
                <>
                    <Heading level={2}>
                        {strings.currentNationalSocietyActionsHeading}
                    </Heading>
                    {drefResponse?.ns_respond_date && (
                        <Container
                            heading={
                                drefResponse?.type_of_dref === DREF_TYPE_IMMINENT
                                    ? strings.nationalSocietyActionsHeading
                                    : strings.drefFormNsResponseStarted
                            }
                        >
                            <DateOutput
                                value={drefResponse?.ns_respond_date}
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
                            <Link
                                href={drefResponse?.assessment_report_details?.file}
                                external
                                withUnderline
                            >
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
                    {targetingStrategySupportingDocumentDefined && (
                        <Container>
                            <Link
                                className={styles.targetingStrategyLink}
                                href={drefResponse?.targeting_strategy_support_file_details?.file}
                                external
                                withUnderline
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
                        {strings.plannedInterventionSectionHeading}
                    </Heading>
                    {plannedInterventions?.map((plannedIntervention) => (
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
                                    label={strings.drefAllocationLabel}
                                    value={drefResponse?.amount_requested}
                                    valueType="number"
                                    prefix={strings.chfPrefix}
                                    strongLabel
                                />
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
                        {strings.aboutSupportServicesSectionHeading}
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
                    {surgePersonnelDeployedDefined && (
                        <Container
                            heading={strings.surgePersonnelDeployedHeading}
                        >
                            <DescriptionText>
                                {drefResponse?.surge_personnel_deployed}
                            </DescriptionText>
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
                        <Link
                            href={drefResponse?.budget_file_details?.file}
                            external
                            withUnderline
                        >
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

Component.displayName = 'DrefApplicationExport';
