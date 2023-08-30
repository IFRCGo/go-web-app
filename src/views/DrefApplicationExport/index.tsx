import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { DownloadLineIcon } from '@ifrc-go/icons';
import {
    _cs,
    isDefined,
    isFalsyString,
    isTruthyString,
} from '@togglecorp/fujs';

import Container from '#components/Container';
import Image from '#components/Image';
import Link from '#components/Link';
import Header from '#components/Header';
import TextOutput, { type Props as TextOutputProps } from '#components/TextOutput';
import { useRequest } from '#utils/restRequest';
import { DREF_TYPE_ASSESSMENT, DREF_TYPE_IMMINENT } from '#utils/constants';

import ifrcLogo from '#assets/icons/ifrc-square.png';

import styles from './styles.module.css';

/*
TODO:
- Move helper components to separate files
- Hide sections with empty content
- Footer with page number and logo
- Separate font for headings
*/

function BlockTextOutput(props: TextOutputProps) {
    const {
        className,
        labelClassName,
        valueClassName,
        ...otherProps
    } = props;

    return (
        <TextOutput
            className={_cs(styles.blockTextOutput, className)}
            labelClassName={_cs(styles.label, labelClassName)}
            valueClassName={_cs(valueClassName, styles.value)}
            withoutLabelColon
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...otherProps}
        />
    );
}

interface DescriptionTextProps {
    children?: React.ReactNode;
    className?: string;
}

function DescriptionText(props: DescriptionTextProps) {
    const { children, className } = props;

    return (
        <div className={_cs(styles.descriptionText, className)}>
            {children}
        </div>
    );
}

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const { drefId } = useParams<{ drefId: string }>();
    const [previewReady, setPreviewReady] = useState(false);

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
            async function waitForImages() {
                const images = document.querySelectorAll('img');
                const promises = Array.from(images).map(
                    (image) => (
                        new Promise((accept) => {
                            image.addEventListener('load', () => {
                                accept(true);
                            });
                        })
                    ),
                );

                await Promise.all(promises);
                setPreviewReady(true);
            }

            waitForImages();
        },
    });

    return (
        <div className={styles.drefApplicationExport}>
            <div className={styles.pageTitleSection}>
                <img
                    className={styles.ifrcLogo}
                    src={ifrcLogo}
                    alt="IFRC"
                />
                <Header
                    heading="DREF Operation"
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
                    label="Appeal"
                    value={drefResponse?.appeal_code}
                    strongValue
                />
                <TextOutput
                    label="Country"
                    value={drefResponse?.country}
                    strongValue
                />
                <TextOutput
                    label="Hazard"
                    value={drefResponse?.disaster_type_details?.name}
                    strongValue
                />
                <TextOutput
                    label="Type of DREF"
                    value={drefResponse?.type_of_dref_display}
                    strongValue
                />
                <TextOutput
                    label="Crisis Category"
                    value={drefResponse?.disaster_category_display}
                    strongValue
                />
                <TextOutput
                    label="Event Onset"
                    value={drefResponse?.type_of_onset_display}
                    strongValue
                />
                <TextOutput
                    className={styles.budget}
                    label="DREF Allocation"
                    value={drefResponse?.amount_requested}
                    valueType="number"
                    prefix="CHF "
                    strongValue
                />
                <TextOutput
                    className={styles.glideCode}
                    label="Glide Number"
                    value={drefResponse?.glide_code}
                    strongValue
                />
                <TextOutput
                    label="People Affected"
                    value={drefResponse?.num_affected}
                    valueType="number"
                    suffix=" People"
                    strongValue
                />
                <TextOutput
                    label="People Targeted"
                    value={drefResponse?.total_targeted_population}
                    suffix=" People"
                    strongValue
                />
                {/* TODO: add other details */}
            </div>
            <Container
                heading="Description of the Event"
                className={styles.eventDescriptionSection}
                headingLevel={2}
                childrenContainerClassName={styles.content}
            >
                <Image
                    src={drefResponse?.event_map_file?.file}
                    caption={drefResponse?.event_map_file?.caption}
                />
                <Container
                    heading="What happened, where and when?"
                    spacing="compact"
                >
                    <DescriptionText>
                        {drefResponse?.event_description}
                    </DescriptionText>
                </Container>
                <Container
                    heading="Scope and Scale"
                    childrenContainerClassName={styles.descriptionText}
                    spacing="compact"
                >
                    <DescriptionText>
                        {drefResponse?.event_scope}
                    </DescriptionText>
                </Container>
            </Container>
            {drefResponse?.type_of_dref !== DREF_TYPE_ASSESSMENT && (
                <Container
                    heading="Previous Operations"
                    className={styles.previousOperationSection}
                    childrenContainerClassName={styles.content}
                    headingLevel={2}
                >
                    <BlockTextOutput
                        label="Has a similar event affected the same area(s) in the last 3 years?"
                        value={drefResponse?.did_it_affect_same_area}
                        valueType="boolean"
                        strongValue
                    />
                    <BlockTextOutput
                        label="Did it affect the same population group?"
                        value={drefResponse?.did_it_affect_same_population}
                        valueType="boolean"
                        strongValue
                    />
                    <BlockTextOutput
                        label="Did the National Society respond?"
                        value={drefResponse?.did_ns_respond}
                        valueType="boolean"
                        strongValue
                    />
                    <BlockTextOutput
                        label="Did the National Society request funding form DREF for that event(s)"
                        value={drefResponse?.did_ns_request_fund}
                        valueType="boolean"
                        strongValue
                    />
                    <BlockTextOutput
                        label="If yes, please specify which operation"
                        value={drefResponse?.ns_request_text}
                        valueType="text"
                    />
                    <BlockTextOutput
                        label="If you have answered yes to all questions above, justify why the use of DREF for a recurrent event, or how this event should not be considered recurrent"
                        value={drefResponse?.dref_recurrent_text}
                        valueType="text"
                    />
                    <TextOutput
                        className={styles.lessonsLearned}
                        label="Lessons learned"
                        value={drefResponse?.lessons_learned}
                        valueType="text"
                        strongLabel
                    />
                </Container>
            )}
            <Container
                heading="Current National Society Actions"
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
            <Container
                heading="Movement Partners Actions Related To The Current Event"
                className={styles.movementPartnersActionsSection}
                childrenContainerClassName={styles.content}
                headingLevel={2}
            >
                <BlockTextOutput
                    label="Secretariat"
                    value={drefResponse?.ifrc}
                    valueType="text"
                    strongLabel
                />
                <BlockTextOutput
                    label="Participating National Societies"
                    value={drefResponse?.partner_national_society}
                    valueType="text"
                    strongLabel
                />
            </Container>
            <Container
                heading="ICRC Actions Related To The Current Event"
                className={styles.icrcActionsSection}
                childrenContainerClassName={styles.content}
                headingLevel={2}
            >
                <DescriptionText>
                    {drefResponse?.icrc}
                </DescriptionText>
            </Container>
            <Container
                heading="Other Actors Actions Related To The Current Event"
                className={styles.otherActionsSection}
                childrenContainerClassName={styles.content}
                headingLevel={2}
            >
                <BlockTextOutput
                    label="Government has requested international assistance"
                    value={drefResponse?.government_requested_assistance}
                    valueType="boolean"
                    strongValue
                />
                <BlockTextOutput
                    label="National authorities"
                    value={drefResponse?.national_authorities}
                    valueType="text"
                    strongLabel
                />
                <BlockTextOutput
                    label="UN or other actors"
                    value={drefResponse?.un_or_other_actor}
                    valueType="text"
                    strongLabel
                />
                <BlockTextOutput
                    label="Are there major coordination mechanism in place?"
                    value={drefResponse?.major_coordination_mechanism}
                    valueType="text"
                    strongLabel
                />
            </Container>
            {drefResponse?.type_of_dref !== DREF_TYPE_ASSESSMENT && (
                <Container
                    heading="Needs (Gaps) Identified"
                    headingLevel={2}
                    className={styles.needsIdentifiedSection}
                    childrenContainerClassName={styles.content}
                >
                    {drefResponse?.needs_identified?.map(
                        (identifiedNeed) => (
                            <Container
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
                    {drefResponse?.type_of_dref !== DREF_TYPE_IMMINENT && (
                        <Container
                            heading="Any identified gaps/limitations in the assessment"
                            spacing="compact"
                        >
                            {drefResponse?.identified_gaps}
                        </Container>
                    )}
                </Container>
            )}
            <Container
                heading="Operational Strategy"
                headingLevel={2}
                className={styles.operationalStrategySection}
                childrenContainerClassName={styles.content}
            >
                <Container
                    heading="Overall objective of the operation"
                    spacing="compact"
                >
                    <DescriptionText>
                        {drefResponse?.operation_objective}
                    </DescriptionText>
                </Container>
                <Container
                    heading="Operation strategy rationale"
                    spacing="compact"
                >
                    <DescriptionText>
                        {drefResponse?.response_strategy}
                    </DescriptionText>
                </Container>
            </Container>
            <Container
                heading="Targeting Strategy"
                headingLevel={2}
                className={styles.targetingStrategySection}
                childrenContainerClassName={styles.content}
            >
                <Container
                    heading="Who will be targeted through this operation?"
                    spacing="compact"
                >
                    <DescriptionText>
                        {drefResponse?.people_assisted}
                    </DescriptionText>
                </Container>
                <Container
                    heading="Explain the selection criteria for the targeted population"
                    spacing="compact"
                >
                    <DescriptionText>
                        {drefResponse?.selection_criteria}
                    </DescriptionText>
                </Container>
            </Container>
            <Container
                heading="Total Targeted Population"
                headingLevel={2}
                className={styles.targetPopulationSection}
                childrenContainerClassName={styles.content}
            >
                {/* TODO: Apply condition for assessment type */}
                <BlockTextOutput
                    label="Women"
                    value={drefResponse?.women}
                    valueType="number"
                    strongValue
                />
                <BlockTextOutput
                    label="Girls (under 18)"
                    value={drefResponse?.girls}
                    valueType="number"
                    strongValue
                />
                <BlockTextOutput
                    label="Men"
                    value={drefResponse?.men}
                    valueType="number"
                    strongValue
                />
                <BlockTextOutput
                    label="Boys (under 18)"
                    value={drefResponse?.boys}
                    valueType="number"
                    strongValue
                />
                <BlockTextOutput
                    label="Total targeted population"
                    value={drefResponse?.total_targeted_population}
                    labelClassName={styles.totalTargetedPopulationLabel}
                    valueClassName={styles.totalTargetedPopulationValue}
                    valueType="number"
                    strongValue
                />
                <BlockTextOutput
                    label="Rural"
                    // FIXME: this is currently sent as string
                    value={drefResponse?.people_per_local || undefined}
                    valueType="number"
                    suffix="%"
                    strongValue
                />
                <BlockTextOutput
                    label="Urban"
                    // FIXME: this is currently sent as string
                    value={drefResponse?.people_per_urban || undefined}
                    suffix="%"
                    valueType="number"
                    strongValue
                />
                <BlockTextOutput
                    label="People with disabilities (estimated)"
                    value={drefResponse?.disability_people_per || undefined}
                    labelClassName={styles.disabilityLabel}
                    valueClassName={styles.disabilityValue}
                    suffix="%"
                    valueType="number"
                    strongValue
                />
            </Container>
            <Container
                heading="Risk and Security Considerations"
                headingLevel={2}
                className={styles.riskAndSecurityConsiderationsSection}
                childrenContainerClassName={styles.content}
            >
                <Container
                    heading="Please indicate about potential operation risk for this operations and mitigation actions"
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
                            <>
                                <div className={styles.risk}>
                                    {riskSecurity.risk}
                                </div>
                                <div className={styles.mitigation}>
                                    {riskSecurity.mitigation}
                                </div>
                            </>
                        ),
                    )}
                </Container>
                <Container
                    heading="Please indicate any security and safety concerns for this operation"
                    spacing="compact"
                    headingLevel={4}
                >
                    <DescriptionText>
                        {drefResponse?.risk_security_concern}
                    </DescriptionText>
                </Container>
            </Container>
            <Container
                heading="Planned Intervention"
                headingLevel={2}
                className={styles.plannedInterventionSection}
                childrenContainerClassName={styles.content}
            >
                {drefResponse?.planned_interventions?.map(
                    (plannedIntervention) => (
                        <Container
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
                                        label="Targeted Persons"
                                        value={plannedIntervention.person_targeted}
                                        valueType="number"
                                        strongLabel
                                    />
                                    <TextOutput
                                        label="Budget"
                                        value={plannedIntervention.budget}
                                        valueType="number"
                                        prefix="CHF "
                                        strongLabel
                                    />
                                </>
                            )}
                            withInternalPadding
                            withHeaderBorder
                            childrenContainerClassName={styles.plannedInterventionContent}
                        >
                            <Container
                                heading="Indicators"
                                headingLevel={4}
                                spacing="compact"
                                childrenContainerClassName={styles.indicatorsContent}
                            >
                                {plannedIntervention.indicators?.map(
                                    (indicator) => (
                                        <TextOutput
                                            className={styles.indicator}
                                            label={indicator.title}
                                            value={indicator.target}
                                            valueType="number"
                                            labelClassName={styles.label}
                                            valueClassName={styles.value}
                                            strongValue
                                            withoutLabelColon
                                        />
                                    ),
                                )}
                            </Container>
                            <Container
                                className={styles.priorityActions}
                                heading="Priority Actions"
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
            <Container
                heading="About Support Services"
                headingLevel={2}
                className={styles.aboutSupportServicesSection}
                childrenContainerClassName={styles.content}
            >
                <Container
                    heading="How many staff and volunteers will be involved in this operation. Briefly describe their role."
                    spacing="compact"
                >
                    <DescriptionText>
                        {drefResponse?.human_resource}
                    </DescriptionText>
                </Container>
                <Container
                    heading="Will surge personnel be deployed? Please provide the role profile needed."
                    spacing="compact"
                >
                    <DescriptionText>
                        {drefResponse?.surge_personnel_deployed}
                    </DescriptionText>
                </Container>
                <Container
                    heading="If there is procurement, will it be done by National Society or IFRC?"
                    spacing="compact"
                >
                    <DescriptionText>
                        {drefResponse?.logistic_capacity_of_ns}
                    </DescriptionText>
                </Container>
                <Container
                    heading="How will this operation be monitored?"
                    spacing="compact"
                >
                    <DescriptionText>
                        {drefResponse?.pmer}
                    </DescriptionText>
                </Container>
                <Container
                    heading="Please briefly explain the National Societies communication strategy for this operation"
                    spacing="compact"
                >
                    <DescriptionText>
                        {drefResponse?.communication}
                    </DescriptionText>
                </Container>
            </Container>
            <Container
                heading="Budget Overview"
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
            <Container
                className={styles.contactInformationSection}
                childrenContainerClassName={styles.content}
                heading="Contact Information"
                headingLevel={2}
                headerDescription="For further information, specifically related to this operation please contact:"
            >
                <Container
                    heading="National Society contact"
                    headingLevel={4}
                    spacing="none"
                >
                    {[
                        drefResponse?.national_society_contact_name,
                        drefResponse?.national_society_contact_title,
                        drefResponse?.national_society_contact_email,
                        drefResponse?.national_society_contact_phone_number,
                    ].filter(isTruthyString).join(', ')}
                </Container>
                <Container
                    heading="IFRC Appeal Manager"
                    headingLevel={4}
                    spacing="none"
                >
                    {[
                        drefResponse?.ifrc_appeal_manager_name,
                        drefResponse?.ifrc_appeal_manager_title,
                        drefResponse?.ifrc_appeal_manager_email,
                        drefResponse?.ifrc_appeal_manager_phone_number,
                    ].filter(isTruthyString).join(', ')}
                </Container>
                <Container
                    heading="IFRC Project Manager"
                    headingLevel={4}
                    spacing="none"
                >
                    {[
                        drefResponse?.ifrc_project_manager_name,
                        drefResponse?.ifrc_project_manager_title,
                        drefResponse?.ifrc_project_manager_email,
                        drefResponse?.ifrc_project_manager_phone_number,
                    ].filter(isTruthyString).join(', ')}
                </Container>
                <Container
                    heading="IFRC focal point for the emergency"
                    headingLevel={4}
                    spacing="none"
                >
                    {[
                        drefResponse?.ifrc_emergency_name,
                        drefResponse?.ifrc_emergency_title,
                        drefResponse?.ifrc_emergency_email,
                        drefResponse?.ifrc_emergency_phone_number,
                    ].filter(isTruthyString).join(', ')}
                </Container>
                <Container
                    heading="Media Contact"
                    headingLevel={4}
                    spacing="none"
                >
                    {[
                        drefResponse?.media_contact_name,
                        drefResponse?.media_contact_title,
                        drefResponse?.media_contact_email,
                        drefResponse?.media_contact_phone_number,
                    ].filter(isTruthyString).join(', ')}
                </Container>
            </Container>
            {previewReady && <div id="pdf-preview-ready" />}
        </div>
    );
}
