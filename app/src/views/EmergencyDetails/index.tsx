import { useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
    Container,
    Description,
    HtmlOutput,
    InfoPopup,
    InlineLayout,
    KeyFigureView,
    ListView,
    Message,
    TextOutput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    compareDate,
    isDefined,
    isNotDefined,
    isTruthyString,
    listToGroupList,
    listToMap,
} from '@togglecorp/fujs';

import {
    APPEAL_TYPE_DREF,
    APPEAL_TYPE_EMERGENCY,
} from '#components/domain/ActiveOperationMap/utils';
import SeverityIndicator from '#components/domain/SeverityIndicator';
import EventTimeline, { type EventTimelineItem } from '#components/EventTimeline';
import Link from '#components/Link';
import TabPage from '#components/TabPage';
import useDisasterType from '#hooks/domain/useDisasterType';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import { DREF_TYPE_IMMINENT } from '#utils/constants';
import {
    getFirstFieldReport,
    getLatestAppeal,
    getLatestFieldReport,
} from '#utils/domain/emergency';
import { type EmergencyOutletContext } from '#utils/outletContext';
import { useRequest } from '#utils/restRequest';

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
        emergencyStage,
        activeDrefOperation,
        drefStage,
        drefApplication,
        drefOpsUpdate,
        drefFinalReport: drefFinaReport,
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
    );

    // FIXME(frozenhelium): verify if this is correct
    const mdrCode = isDefined(emergencyResponse)
        && isDefined(emergencyResponse?.appeals)
        && emergencyResponse.appeals.length > 0
        ? emergencyResponse?.appeals[0]?.code : undefined;

    const firstFieldReport = getFirstFieldReport(emergencyResponse?.field_reports);
    const assistanceIsRequestedByNS = firstFieldReport?.ns_request_assistance;
    const assistanceIsRequestedByCountry = firstFieldReport?.request_assistance;
    const latestFieldReport = getLatestFieldReport(emergencyResponse?.field_reports);
    const latestAppeal = getLatestAppeal(emergencyResponse?.appeals);

    const {
        pending: latestFullFieldReportPending,
        response: latestFullFieldReport,
    } = useRequest({
        skip: isNotDefined(latestFieldReport),
        url: '/api/v2/field-report/{id}/',
        pathVariables: isDefined(latestFieldReport?.id) ? ({
            id: latestFieldReport.id,
        }) : undefined,
    });

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
            const events: EventTimelineItem[] = [];

            if (isDefined(firstFieldReport)
                && firstFieldReport?.id !== latestFieldReport?.id
                && isDefined(firstFieldReport.report_date)
            ) {
                events.push({
                    key: `fr-${firstFieldReport.id}`,
                    date: new Date(firstFieldReport.report_date),
                    // FIXME: use strings
                    label: 'First Field Report',
                });
            }

            if (isDefined(latestFieldReport) && isDefined(latestFieldReport.report_date)) {
                events.push({
                    key: `fr-${latestFieldReport.id}`,
                    date: new Date(latestFieldReport.report_date),
                    // FIXME: use strings
                    label: 'Last Field Report',
                });
            }

            if (latestAppeal?.atype === APPEAL_TYPE_EMERGENCY) {
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

                if (isDefined(latestAppeal.start_date)) {
                    events.push({
                        key: `ea-start-${latestAppeal.id}`,
                        date: new Date(latestAppeal.start_date),
                        // FIXME: use strings
                        label: 'Start of the Operation',
                    });
                }

                if (isDefined(latestAppeal.end_date)) {
                    events.push({
                        key: `ea-end-${latestAppeal.id}`,
                        date: new Date(latestAppeal.end_date),
                        // FIXME: use strings
                        label: 'End of the Operation',
                    });
                }
            }

            if (latestAppeal?.atype === APPEAL_TYPE_DREF && isDefined(activeDrefOperation)) {
                const {
                    id,
                    date_of_approval,
                    has_ops_update,
                    operational_update_details,
                    has_final_report,
                    final_report_details,
                } = activeDrefOperation;

                if (isDefined(drefApplication)) {
                    const {
                        type_of_dref,
                        event_date,
                        hazard_date,
                    } = drefApplication;

                    if (type_of_dref !== DREF_TYPE_IMMINENT && isDefined(event_date)) {
                        events.push({
                            key: `dref-application-event-start-${id}`,
                            date: new Date(event_date),
                            // FIXME: use strings
                            label: 'Beginning of the Disaster',
                        });
                    }

                    if (type_of_dref === DREF_TYPE_IMMINENT && isDefined(hazard_date)) {
                        events.push({
                            key: `dref-application-event-start-${id}`,
                            date: new Date(hazard_date),
                            // FIXME: use strings
                            label: 'Beginning of the Disaster',
                        });
                    }
                }

                if (isDefined(date_of_approval)) {
                    events.push({
                        key: `dref-application-approved-${id}`,
                        date: new Date(date_of_approval),
                        // FIXME: use strings
                        label: 'Start of Operation',
                    });
                }

                if (has_ops_update && operational_update_details.length > 0) {
                    operational_update_details.toReversed().forEach((opsUpdate, i) => {
                        // FIXME(frozenhelium): we need date_of_approval or updated_at here
                        if (isDefined(opsUpdate.created_at)) {
                            events.push({
                                key: `ops-update-${opsUpdate.id}`,
                                date: new Date(opsUpdate.created_at),
                                // FIXME: use strings
                                label: `Operational Update #${i + 1}`,
                            });
                        }
                    });
                }

                if (has_final_report
                    && isDefined(final_report_details)
                    && final_report_details.created_at
                ) {
                    // FIXME(frozenhelium): we need date_of_approval or updated_at here
                    events.push({
                        key: `final-report-${final_report_details.id}`,
                        date: new Date(final_report_details.created_at),
                        // FIXME: use strings
                        label: 'DREF Final Report',
                    });
                }

                const endDate = drefFinaReport?.operation_end_date
                    ?? drefOpsUpdate?.new_operational_end_date
                    ?? drefApplication?.end_date;

                if (isDefined(endDate)) {
                    events.push({
                        key: 'end-of-dref-operations',
                        date: new Date(endDate),
                        label: 'End of Operation',
                    });
                }
            }

            return events.toSorted((a, b) => compareDate(a.date, b.date));
        },
        [
            latestAppeal,
            emergencyResponse,
            firstFieldReport,
            latestFieldReport,
            activeDrefOperation,
            drefApplication,
            drefOpsUpdate,
            drefFinaReport,
        ],
    );

    if (isNotDefined(emergencyResponse)) {
        return (
            <Message
                pending={emergencyResponsePending}
            />
        );
    }

    return (
        <TabPage pending={latestFullFieldReportPending}>
            {(emergencyStage === 'field-report' || emergencyStage === 'emergency-appeal') && (
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
                            value={latestFieldReport?.num_injured}
                            valueType="number"
                            withShadow
                        />
                        <KeyFigureView
                            label={strings.keyFigureDeadLabel}
                            value={latestFieldReport?.num_dead}
                            valueType="number"
                            withShadow
                        />
                        <KeyFigureView
                            label={strings.keyFigureMissingLabel}
                            value={latestFieldReport?.num_missing}
                            valueType="number"
                            withShadow
                        />
                        <KeyFigureView
                            label={strings.keyFigureAffectedLabel}
                            value={latestFieldReport?.num_affected}
                            valueType="number"
                            withShadow
                        />
                        <KeyFigureView
                            label={strings.keyFigureDisplacedLabel}
                            value={latestFieldReport?.num_displaced}
                            valueType="number"
                            withShadow
                        />
                    </ListView>
                </Container>
            )}
            {emergencyStage !== 'field-report' && (
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
                                value={emergencyResponse?.glide}
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
                    numPreferredGridColumns={emergencyStage === 'dref' ? 2 : 3}
                >
                    <ListView layout="block">
                        <TextOutput
                            label={strings.overviewCountryLabel}
                            value={emergencyResponse.countries[0]?.name}
                            strongValue
                        />
                        <TextOutput
                            label={strings.disasterType}
                            value={disasterType?.name}
                            strongValue
                        />
                        {emergencyStage !== 'field-report' && (
                            <>
                                <TextOutput
                                    label={strings.overviewOperationTypeLabel}
                                    value={[
                                        latestAppeal?.atype_display,
                                        latestAppeal?.atype === APPEAL_TYPE_DREF && drefStage === 'application' && drefApplication?.type_of_dref_display,
                                        latestAppeal?.atype === APPEAL_TYPE_DREF && drefStage === 'ops-update' && drefOpsUpdate?.type_of_dref_display,
                                        latestAppeal?.atype === APPEAL_TYPE_DREF && drefStage === 'final-report' && drefFinaReport?.type_of_dref_display,
                                    ].filter(Boolean).join(', ')}
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
                            value={emergencyResponse?.disaster_start_date}
                            strongValue
                        />
                        {emergencyStage === 'field-report' && isDefined(latestFullFieldReport) && (
                            <>
                                <TextOutput
                                    label={strings.overviewDREFLabel}
                                    value={isDefined(latestFullFieldReport.dref)
                                        ? requestMap?.[latestFullFieldReport.dref]
                                        : undefined}
                                    strongValue
                                />
                                <TextOutput
                                    label={strings.overviewEmergencyAppealLabel}
                                    value={isDefined(latestFullFieldReport.appeal)
                                        ? requestMap?.[latestFullFieldReport.appeal]
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
                    {emergencyStage !== 'dref' && (
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
                <ListView layout="grid">
                    {emergencyStage === 'dref' && (
                        <Description>
                            {drefApplication?.event_scope}
                        </Description>
                    )}
                    {emergencyStage !== 'dref' && (
                        <HtmlOutput
                            value={emergencyResponse.summary}
                        />
                    )}
                    <EmergencyMap event={emergencyResponse} />
                </ListView>
            </Container>
            <Container
                // TODO(frozenhelium): use separate component, use translations
                heading="Lessons learned from previous operations"
                withHeaderBorder
                empty
            >
                {null}
            </Container>
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

Component.displayName = 'EmergencyDetails';
