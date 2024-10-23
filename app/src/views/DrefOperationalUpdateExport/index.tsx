import {
    Fragment,
    useMemo,
    useState,
} from 'react';
import {
    ScrollRestoration,
    useParams,
} from 'react-router-dom';
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
    type TextOutputProps,
} from '@ifrc-go/ui/printable';
import { DEFAULT_PRINT_DATE_FORMAT } from '@ifrc-go/ui/utils';
import {
    _cs,
    isDefined,
    isFalsyString,
    isNotDefined,
    isTruthyString,
} from '@togglecorp/fujs';

import ifrcLogo from '#assets/icons/ifrc-square.png';
import Link from '#components/printable/Link';
import {
    DISASTER_CATEGORY_ORANGE,
    DISASTER_CATEGORY_RED,
    DISASTER_CATEGORY_YELLOW,
    DisasterCategory,
    DREF_TYPE_ASSESSMENT,
    DREF_TYPE_IMMINENT,
    ONSET_SLOW,
} from '#utils/constants';
import {
    identifiedNeedsAndGapsOrder,
    nsActionsOrder,
    plannedInterventionOrder,
} from '#utils/domain/dref';
import { useRequest } from '#utils/restRequest';

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

    const filteredNsActions = useMemo(
        () => drefResponse?.national_society_actions?.map((nsAction) => {
            if (isNotDefined(nsAction.title)) {
                return undefined;
            }
            return { ...nsAction, title: nsAction.title };
        }).filter(isDefined),
        [drefResponse?.national_society_actions],
    );

    const sortedPlannedInterventions = useMemo(
        () => filteredPlannedIntervention?.sort(

            (a, b) => plannedInterventionOrder[a.title] - plannedInterventionOrder[b.title],
        ),
        [filteredPlannedIntervention],
    );

    const sortedIdentifiedNeedsAndGaps = useMemo(
        () => filteredIdentifiedNeedsAndGaps?.sort(

            (a, b) => identifiedNeedsAndGapsOrder[a.title] - identifiedNeedsAndGapsOrder[b.title],
        ),
        [filteredIdentifiedNeedsAndGaps],
    );

    const sortedNsActions = useMemo(
        () => filteredNsActions?.sort((a, b) => (

            nsActionsOrder[a.title] - nsActionsOrder[b.title]
        )),
        [filteredNsActions],
    );

    const eventDescriptionDefined = isTruthyString(drefResponse?.event_description?.trim());
    const eventScopeDefined = drefResponse?.type_of_dref !== DREF_TYPE_ASSESSMENT
        && isTruthyString(drefResponse?.event_scope?.trim());
    const imagesFileDefined = isDefined(drefResponse)
        && isDefined(drefResponse.images_file)
        && drefResponse.images_file.length > 0;
    const eventDateDefined = drefResponse?.type_of_dref !== DREF_TYPE_IMMINENT
        && isDefined(drefResponse?.event_date);
    const eventTextDefined = drefResponse?.type_of_dref === DREF_TYPE_IMMINENT
        && isDefined(drefResponse?.event_text?.trim());
    const anticipatoryActionsDefined = drefResponse?.type_of_dref === DREF_TYPE_IMMINENT
        && isTruthyString(drefResponse?.anticipatory_actions?.trim());
    const sourceInformationDefined = isDefined(drefResponse)
        && isDefined(drefResponse?.source_information)
        && drefResponse.source_information.length > 0;
    const showEventDescriptionSection = eventDescriptionDefined
        || eventScopeDefined
        || imagesFileDefined
        || anticipatoryActionsDefined
        || eventDateDefined
        || eventTextDefined
        || sourceInformationDefined
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
    const hasChildrenSafeguardingDefined = isDefined(
        drefResponse?.has_child_safeguarding_risk_analysis_assessment,
    );
    const showRiskAndSecuritySection = riskSecurityDefined
        || riskSecurityConcernDefined
        || hasChildrenSafeguardingDefined;

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
        <div className={styles.drefOperationalUpdateExport}>
            <ScrollRestoration />
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
                    className={styles.reportingTimeframeStartDate}
                    label={strings.reportingTimeframeStartDateLabel}
                    value={drefResponse?.reporting_start_date}
                    valueType="date"
                    strongValue
                />
                <TextOutput
                    className={styles.reportingTimeframeEndDate}
                    label={strings.reportingTimeframeEndDateLabel}
                    value={drefResponse?.reporting_end_date}
                    valueType="date"
                    strongValue
                />
                <TextOutput
                    className={styles.additionalAllocation}
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
            </Container>
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
                    {sourceInformationDefined && (
                        <Container
                            heading={strings.sourceInformationSectionHeading}
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
            {showSummaryOfChangesSection && (
                <Container
                    heading={strings.summaryOfChangesSectionHeading}
                    childrenContainerClassName={styles.summaryOfChangesContent}
                    headingLevel={2}
                >
                    <BlockTextOutput
                        label={strings.changingTimeFrameLabel}
                        value={drefResponse?.changing_timeframe_operation}
                        valueType="boolean"
                        strongValue
                    />
                    <BlockTextOutput
                        label={strings.changingStrategyLabel}
                        value={drefResponse?.changing_operation_strategy}
                        valueType="boolean"
                        strongValue
                    />
                    <BlockTextOutput
                        label={strings.changingTargetPopulationLabel}
                        value={drefResponse?.changing_target_population_of_operation}
                        valueType="boolean"
                        strongValue
                    />
                    <BlockTextOutput
                        label={strings.changingLocationLabel}
                        value={drefResponse?.changing_geographic_location}
                        valueType="boolean"
                        strongValue
                    />
                    <BlockTextOutput
                        label={strings.changingBudgetLabel}
                        value={drefResponse?.changing_budget}
                        valueType="boolean"
                        strongValue
                    />
                    <BlockTextOutput
                        label={strings.secondAllocationLabel}
                        value={drefResponse?.request_for_second_allocation}
                        valueType="boolean"
                        strongValue
                    />
                    <BlockTextOutput
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
                <>
                    <Heading level={2}>
                        {strings.currentNationalSocietyActionsHeading}
                    </Heading>
                    <Container>
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
                                    format={DEFAULT_PRINT_DATE_FORMAT}
                                />
                            </Container>
                        )}
                    </Container>
                    {nsActionImagesDefined && (
                        <Container childrenContainerClassName={styles.nsActionsImages}>
                            {drefResponse?.photos_file?.map(
                                (nsActionImage) => (
                                    <Image
                                        key={nsActionImage.id}
                                        src={nsActionImage.file}
                                        caption={nsActionImage.caption}
                                    />
                                ),
                            )}
                        </Container>
                    )}
                    {nsActionsDefined && (
                        <Container>
                            <Container
                                childrenContainerClassName={styles.nsActionsList}
                            >
                                {sortedNsActions?.map(
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
                        </Container>
                    )}
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
                    {needsIdentifiedDefined && sortedIdentifiedNeedsAndGaps?.map(
                        (identifiedNeed) => (
                            <Fragment key={identifiedNeed.id}>
                                <Heading className={styles.needsIdentifiedHeading}>
                                    <img
                                        className={styles.icon}
                                        src={identifiedNeed.image_url}
                                        alt={strings.drefOperationalImageAlt}
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
                                {strings.drefOperationalRisk}
                            </div>
                            <div className={styles.mitigationTitle}>
                                {strings.drefOperationalMitigation}
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
                                {isTruthyString(plannedIntervention.progress_towards_outcome) && (
                                    <Container
                                        heading={strings.progressTowardsOutcomeHeading}
                                        headingLevel={5}
                                    >
                                        <DescriptionText>
                                            {plannedIntervention.progress_towards_outcome}
                                        </DescriptionText>
                                    </Container>
                                )}
                            </Fragment>
                        ),
                    )}
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
                    <Link href="/emergencies">
                        {strings.drefExportReference}
                    </Link>
                </>
            )}
            {previewReady && <div id="pdf-preview-ready" />}
        </div>
    );
}

Component.displayName = 'DrefOperationalUpdateExport';
