import { useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
    Container,
    DateOutput,
    Description,
    HtmlOutput,
    InfoPopup,
    InlineLayout,
    KeyFigureView,
    Label,
    ListView,
    Message,
    TextOutput,
    Tooltip,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    compareDate,
    isDefined,
    isFalsyString,
    isNotDefined,
    isTruthyString,
    listToGroupList,
    listToMap,
} from '@togglecorp/fujs';

import EmergencyLessonsLearnedFromPreviousOperations from '#components/domain/EmergencyLessonsLearnedFromPreviousOperations';
import SeverityIndicator from '#components/domain/SeverityIndicator';
import EventTimeline, { type EventTimelineItem } from '#components/EventTimeline';
import Link from '#components/Link';
import TabPage from '#components/TabPage';
import useDisasterType from '#hooks/domain/useDisasterType';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import {
    DREF_TYPE_IMMINENT,
    FIELD_REPORT_STATUS_EARLY_WARNING,
    FIELD_REPORT_STATUS_EVENT,
} from '#utils/constants';
import {
    STAGE_DREF_APPEAL_ONLY,
    STAGE_DREF_APPLICATION,
    STAGE_EMERGENCY_APPEAL,
    STAGE_FIELD_REPORT,
    STAGE_FINAL_REPORT,
    STAGE_OPERATIONAL_UPDATE,
} from '#utils/domain/emergency';
import { type EmergencyOutletContext } from '#utils/outletContext';

import EmergencyMap from './EmergencyMap';

import i18n from './i18n.json';

/** @knipignore */
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    const disasterTypes = useDisasterType();
    const {
        emergencyResponse,
        emergencyResponsePending,
    } = useOutletContext<EmergencyOutletContext>();
    const {
        api_request_choices,
        api_visibility_choices,
    } = useGlobalEnums();

    const visibilityMap = useMemo(
        () => listToMap(
            api_visibility_choices,
            ({ key }) => key,
            ({ value }) => value,
        ),
        [api_visibility_choices],
    );

    const requestMap = useMemo(
        () => listToMap(
            api_request_choices,
            ({ key }) => key,
            ({ value }) => value,
        ),
        [api_request_choices],
    );

    const disasterType = disasterTypes?.find(
        (typeOfDisaster) => typeOfDisaster.id === emergencyResponse?.dtype,
    ) ?? emergencyResponse?.dref.disaster_type_details;

    const mdrCode = emergencyResponse?.appeal?.code
        ?? emergencyResponse?.dref?.appeal_code;

    const latestFieldReport = emergencyResponse?.field_report;

    const latestAppeal = emergencyResponse?.appeal;
    const dref = emergencyResponse?.dref;
    const drefOpsUpdate = dref?.operational_update_details;
    const drefFinalReport = dref?.final_report_details;

    const stage = emergencyResponse?.stage;
    const isFieldReportStage = stage === STAGE_FIELD_REPORT;
    // STAGE_DREF_APPEAL_ONLY behaves like Emergency Appeal — no embedded DREF data is available.
    // FIXME: variable name should be more generic
    const isEmergencyAppealStage = stage === STAGE_EMERGENCY_APPEAL
        || stage === STAGE_DREF_APPEAL_ONLY;
    const isDrefStage = stage === STAGE_DREF_APPLICATION
        || stage === STAGE_OPERATIONAL_UPDATE
        || stage === STAGE_FINAL_REPORT;

    // The new endpoint encodes the first field report's assistance flags on the
    // attached field_report via `first_fr_*` fields.
    const assistanceIsRequestedByNS = latestFieldReport?.first_fr_ns_request_assistance;
    const assistanceIsRequestedByCountry = latestFieldReport?.first_fr_request_assistance;

    const emergencyContacts = emergencyResponse?.contacts;

    const groupedContacts = useMemo(
        () => {
            type Contact = Omit<NonNullable<typeof emergencyContacts>[number], 'event'>;
            let contactsToProcess: Contact[] | undefined = emergencyContacts;
            if (!contactsToProcess || contactsToProcess.length <= 0) {
                contactsToProcess = latestFieldReport?.contacts;
            }
            const grouped = listToGroupList(
                contactsToProcess?.map(
                    (contact) => {
                        if (isNotDefined(contact)) {
                            return undefined;
                        }

                        const { ctype } = contact;
                        if (isNotDefined(ctype)) {
                            return undefined;
                        }

                        return {
                            ...contact,
                            ctype,
                        };
                    },
                ).filter(isDefined) ?? [],
                (contact) => (
                    // FIXME: this logic can be improved
                    contact.email.endsWith('ifrc.org')
                        ? 'IFRC'
                        : 'National Societies'
                ),
            );
            return grouped;
        },
        [emergencyContacts, latestFieldReport],
    );

    const timelineEvents = useMemo(
        () => {
            if (isFieldReportStage) {
                return undefined;
            }

            const events: EventTimelineItem[] = [];

            if (dref?.type_of_dref === DREF_TYPE_IMMINENT
                && isDefined(dref.date_of_approval)
            ) {
                events.push({
                    key: `imminent-dref-start-${dref.id}`,
                    date: new Date(dref.date_of_approval),
                    label: (
                        <>
                            <Label strong>
                                Start of Imminent DREF
                            </Label>
                            <Link
                                to="drefApplicationForm"
                                urlParams={{ drefId: dref.id }}
                                withLinkIcon
                                withUnderline
                            >
                                DREF Application
                            </Link>
                        </>
                    ),
                });
            }

            if (dref?.type_of_dref === DREF_TYPE_IMMINENT
                && emergencyResponse?.stage === STAGE_DREF_APPLICATION
                && isDefined(dref.hazard_date)
            ) {
                events.push({
                    key: `event-forecasted-${dref.id}`,
                    date: new Date(dref.hazard_date),
                    label: (
                        <Label strong>
                            Forecasted event
                        </Label>
                    ),
                });
            }

            emergencyResponse?.timeline_field_reports.forEach((fr) => {
                if (isDefined(fr.report_date)) {
                    events.push({
                        key: `fr-${fr.id}`,
                        date: new Date(fr.report_date),
                        label: (
                            <>
                                <Label>
                                    {`Field Report #${fr.fr_num ?? 1}`}
                                </Label>
                                <Link
                                    to="fieldReportDetails"
                                    urlParams={{ fieldReportId: fr.id }}
                                    withUnderline
                                    withLinkIcon
                                    // FIXME: use strings
                                >
                                    View report
                                </Link>
                            </>
                        ),
                    });
                }
            });

            if (isEmergencyAppealStage) {
                if (isDefined(emergencyResponse)
                    && isDefined(emergencyResponse.disaster_start_date)
                ) {
                    events.push({
                        key: `ea-start-${emergencyResponse.id}`,
                        date: new Date(emergencyResponse.disaster_start_date),
                        // FIXME: use strings
                        label: 'Beginning of the Disaster',
                    });
                }

                if (isDefined(latestAppeal?.start_date)) {
                    events.push({
                        key: `ea-start-${latestAppeal.id}`,
                        date: new Date(latestAppeal.start_date),
                        // FIXME: use strings
                        label: 'Start of the Operation',
                    });
                }

                if (isDefined(latestAppeal?.end_date)) {
                    events.push({
                        key: `ea-end-${latestAppeal.id}`,
                        date: new Date(latestAppeal.end_date),
                        // FIXME: use strings
                        label: 'End of the Operation',
                    });
                }
            }

            if (isDrefStage && isDefined(dref)) {
                if (dref?.type_of_dref !== DREF_TYPE_IMMINENT && isDefined(dref?.event_date)) {
                    events.push({
                        key: `dref-event-start-${dref.id}`,
                        date: new Date(dref.event_date),
                        // FIXME: use strings
                        label: (
                            <Label strong>
                                Beginning of the Disaster
                            </Label>
                        ),
                    });
                }

                if (isDefined(dref?.date_of_approval)) {
                    events.push({
                        key: `dref-operation-start-${dref.id}`,
                        date: new Date(dref.date_of_approval),
                        label: (
                            <Label strong>
                                Start of Operation
                            </Label>
                        ),
                    });
                }

                dref.timeline_operational_updates.forEach((opsUpdate) => {
                    if (isDefined(opsUpdate.date_of_approval)) {
                        events.push({
                            key: `dref-operation-update-${opsUpdate.id}`,
                            date: new Date(opsUpdate.date_of_approval),
                            // FIXME: use strings
                            label: (
                                <>
                                    <Label>
                                        {`Operational Update #${opsUpdate.operational_update_number}`}
                                    </Label>
                                    <Tooltip
                                        description={(
                                            <Container
                                                heading={(
                                                    <DateOutput
                                                        value={opsUpdate.date_of_approval}
                                                    />
                                                )}
                                                withHeaderBorder
                                            >
                                                <TextOutput
                                                    // FIXME: use strings
                                                    label="Targeted Population"
                                                    value={opsUpdate.total_targeted_population}
                                                    valueType="number"
                                                    strongValue
                                                />
                                                <TextOutput
                                                    // FIXME: use strings
                                                    label="Funding Requirements"
                                                    value={opsUpdate.total_dref_allocation}
                                                    valueType="number"
                                                    strongValue
                                                />
                                                <Description>
                                                    {opsUpdate.summary_of_change}
                                                </Description>
                                            </Container>
                                        )}
                                    />
                                </>
                            ),
                        });
                    }
                });

                const endDate = drefFinalReport?.operation_end_date
                    ?? drefOpsUpdate?.new_operational_end_date
                    ?? dref.end_date;

                if (isDefined(endDate)) {
                    events.push({
                        key: 'end-of-dref-operations',
                        date: new Date(endDate),
                        // FIXME: use strings
                        label: (
                            <Label strong>
                                End of Operation
                            </Label>
                        ),
                    });
                }

                const lastFinalReportUpdate = drefFinalReport?.date_of_approval
                    ?? drefFinalReport?.modified_at;

                if (isDefined(drefFinalReport) && isDefined(lastFinalReportUpdate)) {
                    events.push({
                        key: `final-report-${drefFinalReport.id}`,
                        date: new Date(lastFinalReportUpdate),
                        // FIXME: use strings
                        label: (
                            <>
                                <Label strong>
                                    DREF Final Report
                                </Label>
                                <Link
                                    to="drefFinalReportForm"
                                    urlParams={{ finalReportId: drefFinalReport.id }}
                                    withLinkIcon
                                    withUnderline
                                    // FIXME: use strings
                                >
                                    View report
                                </Link>
                            </>
                        ),
                    });
                }
            }

            return events.toSorted((a, b) => compareDate(a.date, b.date));
        },
        [
            isFieldReportStage,
            isEmergencyAppealStage,
            isDrefStage,
            latestAppeal,
            emergencyResponse,
            dref,
            drefOpsUpdate,
            drefFinalReport,
        ],
    );

    const country = emergencyResponse?.countries?.[0];

    const startDate = isFieldReportStage
        ? latestFieldReport?.start_date
        : emergencyResponse?.disaster_start_date;

    const lfrDisasterTypeName = latestFieldReport?.dtype?.name;

    const numInjured = emergencyResponse?.num_injured
        ?? latestFieldReport?.num_injured
        ?? latestFieldReport?.gov_num_injured
        ?? latestFieldReport?.other_num_injured;
    const numDead = emergencyResponse?.num_dead
        ?? latestFieldReport?.num_dead
        ?? latestFieldReport?.gov_num_dead
        ?? latestFieldReport?.other_num_dead;
    const numMissing = emergencyResponse?.num_missing
        ?? latestFieldReport?.num_missing
        ?? latestFieldReport?.gov_num_missing
        ?? latestFieldReport?.other_num_missing;
    const numAffected = emergencyResponse?.num_affected
        ?? latestFieldReport?.num_affected
        ?? latestFieldReport?.gov_num_affected
        ?? latestFieldReport?.other_num_affected;
    const numDisplaced = emergencyResponse?.num_displaced
        ?? latestFieldReport?.num_displaced
        ?? latestFieldReport?.gov_num_displaced
        ?? latestFieldReport?.other_num_displaced;
    const numPotentiallyAffected = latestFieldReport?.num_potentially_affected
        ?? latestFieldReport?.gov_num_potentially_affected
        ?? latestFieldReport?.other_num_potentially_affected;
    const numHighestRisk = latestFieldReport?.num_highest_risk
        ?? latestFieldReport?.gov_num_highest_risk
        ?? latestFieldReport?.other_num_highest_risk;

    if (isNotDefined(emergencyResponse)) {
        return (
            <Message
                pending={emergencyResponsePending}
            />
        );
    }

    return (
        <TabPage>
            {isFieldReportStage
                && latestFieldReport?.status === FIELD_REPORT_STATUS_EARLY_WARNING && (
                <Container
                    heading={strings.emergencyKeyFiguresTitle}
                    withHeaderBorder
                >
                    <ListView
                        layout="grid"
                        numPreferredGridColumns={2}
                        spacing="sm"
                    >
                        <KeyFigureView
                            label={strings.keyFigurePotentiallyAffectedLabel}
                            value={numPotentiallyAffected}
                            valueType="number"
                            withShadow
                        />
                        <KeyFigureView
                            label={strings.keyFigureHighestRiskLabel}
                            value={numHighestRisk}
                            valueType="number"
                            withShadow
                        />
                    </ListView>
                </Container>
            )}
            {((isFieldReportStage && latestFieldReport?.status === FIELD_REPORT_STATUS_EVENT)
                || isEmergencyAppealStage) && (
                <Container
                    heading={strings.emergencyKeyFiguresTitle}
                    withHeaderBorder
                >
                    <ListView
                        layout="grid"
                        numPreferredGridColumns={5}
                        spacing="sm"
                    >
                        <KeyFigureView
                            label={strings.keyFigureInjuredLabel}
                            value={numInjured}
                            valueType="number"
                            withShadow
                        />
                        <KeyFigureView
                            label={strings.keyFigureDeadLabel}
                            value={numDead}
                            valueType="number"
                            withShadow
                        />
                        <KeyFigureView
                            label={strings.keyFigureMissingLabel}
                            value={numMissing}
                            valueType="number"
                            withShadow
                        />
                        <KeyFigureView
                            label={strings.keyFigureAffectedLabel}
                            value={numAffected}
                            valueType="number"
                            withShadow
                        />
                        <KeyFigureView
                            label={strings.keyFigureDisplacedLabel}
                            value={numDisplaced}
                            valueType="number"
                            withShadow
                        />
                    </ListView>
                </Container>
            )}
            {!isFieldReportStage && (
                <InlineLayout
                    after={(
                        <ListView
                            layout="block"
                            withSpacingOpticalCorrection
                        >
                            <TextOutput
                                label={strings.MDRCode}
                                value={mdrCode}
                                strongValue
                            />
                            <TextOutput
                                label={strings.GLIDENumber}
                                value={emergencyResponse?.glide
                                    ?? emergencyResponse?.dref?.glide_code}
                                strongValue
                            />
                        </ListView>
                    )}
                />
            )}
            <Container
                heading={strings.emergencyOverviewTitle}
                withHeaderBorder
            >
                <ListView
                    layout="grid"
                    withSpacingOpticalCorrection
                    numPreferredGridColumns={isDrefStage ? 2 : 3}
                >
                    <ListView layout="block">
                        <TextOutput
                            label={strings.overviewCountryLabel}
                            value={country?.name}
                            strongValue
                        />
                        <TextOutput
                            label={strings.disasterType}
                            value={isFieldReportStage ? lfrDisasterTypeName : disasterType?.name}
                            strongValue
                        />
                        {!isFieldReportStage && (
                            <>
                                <TextOutput
                                    label={strings.overviewOperationTypeLabel}
                                    value={emergencyResponse?.stage_display}
                                    strongValue
                                />
                                <TextOutput
                                    label={strings.disasterCategorization}
                                    value={(
                                        <ListView
                                            withWrap
                                            withSpacingOpticalCorrection
                                            spacing="2xs"
                                        >
                                            <SeverityIndicator
                                                level={emergencyResponse.ifrc_severity_level}
                                            />
                                            {emergencyResponse.ifrc_severity_level_display}
                                            {emergencyResponse.ifrc_severity_level_update_date && (
                                                <InfoPopup
                                                    description={(
                                                        <TextOutput
                                                            label={strings
                                                                .severityLevelUpdateDateLabel}
                                                            value={
                                                                emergencyResponse
                                                                    .ifrc_severity_level_update_date
                                                            }
                                                            valueType="date"
                                                        />
                                                    )}
                                                />
                                            )}
                                        </ListView>
                                    )}
                                    strongValue
                                />
                            </>
                        )}
                    </ListView>
                    <ListView layout="block">
                        <TextOutput
                            label={strings.startDate}
                            valueType="date"
                            value={startDate}
                            strongValue
                        />
                        {isFieldReportStage && (
                            <>
                                <TextOutput
                                    label={strings.overviewDREFLabel}
                                    value={isDefined(latestFieldReport?.dref)
                                        ? requestMap?.[latestFieldReport.dref]
                                        : undefined}
                                    strongValue
                                />
                                <TextOutput
                                    label={strings.overviewEmergencyAppealLabel}
                                    value={isDefined(latestFieldReport?.appeal)
                                        ? requestMap?.[latestFieldReport.appeal]
                                        : undefined}
                                    strongValue
                                />
                            </>
                        )}
                        <TextOutput
                            label={strings.visibility}
                            value={isDefined(emergencyResponse.visibility)
                                ? visibilityMap?.[emergencyResponse.visibility]
                                : '--'}
                            strongValue
                        />
                    </ListView>
                    {!isDrefStage && (
                        <ListView layout="block">
                            <TextOutput
                                label={strings.assistanceRequestedByGovernment}
                                valueType="boolean"
                                value={assistanceIsRequestedByCountry}
                                strongValue
                            />
                            <TextOutput
                                label={strings.assistanceRequestedByNS}
                                valueType="boolean"
                                value={assistanceIsRequestedByNS}
                                strongValue
                            />
                        </ListView>
                    )}
                </ListView>
            </Container>

            {isDefined(timelineEvents) && timelineEvents.length > 0 && (
                <Container
                    heading={strings.operationalTimelineTitle}
                    withHeaderBorder
                >
                    <EventTimeline
                        events={timelineEvents}
                    />
                </Container>
            )}
            <Container
                heading={strings.situationalOverviewTitle}
                withHeaderBorder
            >
                {/* FIXME(frozenhelium): handle condition where there is no summary */}
                <ListView
                    layout="grid"
                    numPreferredGridColumns={(isDrefStage && isFalsyString(dref?.event_scope))
                        || (!isDrefStage && isFalsyString(emergencyResponse.summary)) ? 1 : 2}
                >
                    {isDrefStage && (
                        <Description>
                            {dref?.event_scope}
                        </Description>
                    )}
                    {!isDrefStage && (
                        <HtmlOutput
                            value={emergencyResponse.summary}
                        />
                    )}
                    <EmergencyMap event={emergencyResponse} />
                </ListView>
            </Container>
            {isFieldReportStage
                && isDefined(emergencyResponse)
                && isDefined(emergencyResponse.dtype)
                && isDefined(country) && (
                <EmergencyLessonsLearnedFromPreviousOperations
                    disasterType={emergencyResponse.dtype}
                    country={country.id}
                />
            )}
            {isDefined(emergencyResponse?.links)
                && emergencyResponse.links.length > 0
                && (
                    <Container
                        heading={strings.linksTitle}
                        withHeaderBorder
                    >
                        <ListView
                            layout="grid"
                            withSpacingOpticalCorrection
                        >
                            {emergencyResponse.links.map((link) => (
                                <ListView
                                    key={link.id}
                                    layout="block"
                                    withSpacingOpticalCorrection
                                    spacing="sm"
                                >
                                    <Link
                                        href={link.url}
                                        external
                                        withLinkIcon
                                    >
                                        {link.title}
                                    </Link>
                                    <Description
                                        textSize="sm"
                                        withLightText
                                    >
                                        {link.description}
                                    </Description>
                                </ListView>
                            ))}
                        </ListView>
                    </Container>
                )}
            {isDefined(groupedContacts) && Object.keys(groupedContacts).length > 0
                && (
                    <Container
                        heading={strings.contactsTitle}
                        withHeaderBorder
                    >
                        <ListView layout="block">
                            {/* FIXME: lets not use Object.entries here */}
                            {Object.entries(groupedContacts).map(([contactGroup, contacts]) => (
                                <Container
                                    key={contactGroup}
                                    heading={contactGroup}
                                    headingLevel={5}
                                >
                                    <ListView
                                        layout="grid"
                                        numPreferredGridColumns={4}
                                        spacing="sm"
                                    >
                                        {contacts.map((contact) => (
                                            <Container
                                                key={contact.id}
                                                headingLevel={6}
                                                heading={contact.name}
                                                withPadding
                                                withShadow
                                                withBackground
                                            >
                                                <ListView
                                                    layout="block"
                                                    withSpacingOpticalCorrection
                                                >
                                                    <Description
                                                        textSize="sm"
                                                        withLightText
                                                    >
                                                        {contact.title}
                                                    </Description>
                                                    <ListView
                                                        layout="block"
                                                        spacing="none"
                                                    >
                                                        <Description
                                                            textSize="sm"
                                                            withLightText
                                                        >
                                                            {contact.ctype}
                                                        </Description>
                                                        {isTruthyString(contact.email) && (
                                                            <Link
                                                                href={`mailto:${contact.email}`}
                                                                external
                                                                withLinkIcon
                                                                textSize="sm"
                                                                withEllipsizedContent
                                                            >
                                                                {contact.email}
                                                            </Link>
                                                        )}
                                                        {isTruthyString(contact.phone) && (
                                                            <Link
                                                                href={`tel:${contact.phone}`}
                                                                withLinkIcon
                                                                external
                                                                textSize="sm"
                                                                withEllipsizedContent
                                                            >
                                                                {contact.phone}
                                                            </Link>
                                                        )}
                                                    </ListView>
                                                </ListView>
                                            </Container>
                                        ))}
                                    </ListView>
                                </Container>
                            ))}
                        </ListView>
                    </Container>
                )}
        </TabPage>
    );
}

Component.displayName = 'EmergencyOverview';
