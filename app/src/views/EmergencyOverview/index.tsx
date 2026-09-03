import { useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { DownloadFillIcon } from '@ifrc-go/icons';
import {
    BlockView,
    Container,
    DateOutput,
    Description,
    DropdownMenu,
    HtmlOutput,
    InfoPopup,
    InlineLayout,
    KeyFigureView,
    Label,
    ListView,
    Message,
    TextOutput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { DescriptionText } from '@ifrc-go/ui/printable';
import {
    resolveToComponent,
    resolveToString,
} from '@ifrc-go/ui/utils';
import {
    compareDate,
    isDefined,
    isFalsyString,
    isNotDefined,
    isTruthyString,
    listToGroupList,
    listToMap,
} from '@togglecorp/fujs';

import ClampedContent from '#components/ClampedContent';
import DrefSummaryDisclaimer from '#components/domain/DrefSummaryDisclaimer';
import DrefSummarySourceLabel from '#components/domain/DrefSummarySourceLabel';
import EmergencyLessonsLearnedFromPreviousOperations from '#components/domain/EmergencyLessonsLearnedFromPreviousOperations';
import EmergencyOperationType from '#components/domain/EmergencyOperationType';
import SeverityIndicator from '#components/domain/SeverityIndicator';
import EventTimeline, { type EventTimelineItem } from '#components/EventTimeline';
import Link from '#components/Link';
import TabPage from '#components/TabPage';
import useAuth from '#hooks/domain/useAuth';
import useDisasterType from '#hooks/domain/useDisasterType';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import usePermissions from '#hooks/domain/usePermissions';
import { joinStrings } from '#utils/common';
import {
    DREF_TYPE_IMMINENT,
    FIELD_REPORT_STATUS_EARLY_WARNING,
    FIELD_REPORT_STATUS_EVENT,
} from '#utils/constants';
import {
    getDrefAppealDocumentUrls,
    getDrefSummary,
    getEmergencyDrefStrategy,
    getEmergencyOperationType,
    STAGE_DREF_APPEAL_ONLY,
    STAGE_DREF_APPLICATION,
    STAGE_EMERGENCY_APPEAL,
    STAGE_FIELD_REPORT,
    STAGE_FINAL_REPORT,
    STAGE_OPERATIONAL_UPDATE,
} from '#utils/domain/emergency';
import { type EmergencyOutletContext } from '#utils/outletContext';
import { useRequest } from '#utils/restRequest';

import EmergencyMap from './EmergencyMap';

import i18n from './i18n.json';
import styles from './styles.module.css';

const IFRC_EMAIL_DOMAIN = 'ifrc.org';

// NOTE: the domain is compared whole rather than matched as a suffix, so a
// look-alike domain such as "notifrc.org" is not grouped under IFRC
function isIfrcEmail(email: string) {
    return email.slice(email.lastIndexOf('@') + 1).toLowerCase() === IFRC_EMAIL_DOMAIN;
}

interface TimelineDocumentProps {
    label: string;
    url: string | undefined;
}

// the published file only exists once ERP has it, and the agreement is that
// there is no link until then
function TimelineDocument(props: TimelineDocumentProps) {
    const { label, url } = props;

    if (isFalsyString(url)) {
        return null;
    }

    return (
        <Link
            external
            href={url}
            after={<DownloadFillIcon />}
            spacing="lg"
        >
            {label}
        </Link>
    );
}

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    const disasterTypes = useDisasterType();
    const { isAuthenticated } = useAuth();
    const { isGuestUser } = usePermissions();
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

    const latestFieldReport = emergencyResponse?.field_report;

    const latestAppeal = emergencyResponse?.appeal;
    // FIXME(frozenhelium): go-api, dref (and field_report, appeal) on the
    // emergency detail response can be null but the schema marks them
    // non-nullable; add allow_null to the extend_schema_field annotations on
    // DetailEmergencySerializer and regenerate the types
    const dref = emergencyResponse?.dref;
    const drefOpsUpdate = dref?.operational_update_details;
    const drefFinalReport = dref?.final_report_details;

    const stage = emergencyResponse?.stage;
    const isFieldReportStage = stage === STAGE_FIELD_REPORT;
    // STAGE_DREF_APPEAL_ONLY behaves like Emergency Appeal, no embedded DREF
    // data is available
    // FIXME: variable name should be more generic
    const isEmergencyAppealStage = stage === STAGE_EMERGENCY_APPEAL
        || stage === STAGE_DREF_APPEAL_ONLY;
    const isDrefStage = stage === STAGE_DREF_APPLICATION
        || stage === STAGE_OPERATIONAL_UPDATE
        || stage === STAGE_FINAL_REPORT;

    // the field report stage is the only one without a DREF to continue
    const showCreateDrefApplication = isAuthenticated
        && !isGuestUser
        && isFieldReportStage;

    // event.dtype is copied from the dref once at approval and not resynced,
    // so prefer the latest revision's disaster type at DREF stages
    const disasterType = (isDrefStage
        ? drefFinalReport?.disaster_type_details
            ?? drefOpsUpdate?.disaster_type_details
            ?? dref?.disaster_type_details
        : undefined)
        ?? disasterTypes?.find(
            (typeOfDisaster) => typeOfDisaster.id === emergencyResponse?.dtype,
        );

    // an appeal_code filled in a revision is not synced back to the dref
    const mdrCode = emergencyResponse?.appeal?.code
        ?? [
            drefFinalReport?.appeal_code,
            drefOpsUpdate?.appeal_code,
            dref?.appeal_code,
        ].find(isTruthyString);

    // FIXME(frozenhelium): go-api, an operational update / final report
    // glide code is not synced to event.glide (nor dref.glide_codes) on
    // approval; until it is, read the latest non-empty revision glide here.
    // event.glide only ever holds the primary code, so it ranks last
    const glideNumber = [
        joinStrings(drefFinalReport?.glide_codes ?? []),
        joinStrings(drefOpsUpdate?.glide_codes ?? []),
        joinStrings(dref?.glide_codes ?? []),
        emergencyResponse?.glide,
    ].find(isTruthyString);

    // the emergency payload carries no appeal at DREF stages, so the published
    // documents have to be reached through the MDR code
    const { response: appealResponse } = useRequest({
        skip: !isDrefStage || isNotDefined(mdrCode),
        url: '/api/v2/appeal/',
        query: { code: mdrCode },
    });

    // the appeal history serializes the appeal's own id, as a string
    const appealId = appealResponse?.results?.[0]?.id;
    const appealIdNumber = isDefined(appealId) ? Number(appealId) : undefined;

    const { response: appealDocumentsResponse } = useRequest({
        skip: isNotDefined(appealIdNumber),
        url: '/api/v2/appeal_document/',
        query: {
            appeal: isDefined(appealIdNumber) ? [appealIdNumber] : undefined,
            limit: 9999,
            ordering: 'created_at',
        },
    });

    const drefDocumentUrls = useMemo(
        () => getDrefAppealDocumentUrls(appealDocumentsResponse?.results),
        [appealDocumentsResponse],
    );

    const drefStrategy = useMemo(
        () => getEmergencyDrefStrategy(emergencyResponse),
        [emergencyResponse],
    );

    const operationType = useMemo(
        () => getEmergencyOperationType(emergencyResponse),
        [emergencyResponse],
    );

    // an imminent operation converts to a response in its first approved ops
    // update, so the anticipatory sources only apply before that
    const isAnticipatoryPhase = (drefStrategy?.beganAsImminent ?? false)
        && !drefStrategy?.hasApprovedOpsUpdate;

    // A disaster_category changed in an operational update / final report is not
    // synced onto the event, so read it per stage, falling back to the event's
    // severity level. An imminent DREF captures no categorization at all, so
    // the event severity must not stand in for one there.
    const disasterCategoryLevel = isAnticipatoryPhase
        ? undefined
        : (isDrefStage
            ? drefFinalReport?.disaster_category
                ?? drefOpsUpdate?.disaster_category
                ?? dref?.disaster_category
            : undefined)
            ?? emergencyResponse?.ifrc_severity_level;

    const disasterCategoryDisplay = isAnticipatoryPhase
        ? undefined
        : (isDrefStage
            ? drefFinalReport?.disaster_category_display
                ?? drefOpsUpdate?.disaster_category_display
                ?? dref?.disaster_category_display
            : undefined)
            ?? emergencyResponse?.ifrc_severity_level_display;

    const hasDisasterCategory = isDefined(disasterCategoryLevel)
        || isTruthyString(disasterCategoryDisplay);

    // FIXME(frozenhelium): go-api, expose hazard_vulnerabilities_and_risks for
    // the imminent situational overview (only hazard_date_and_location for now)
    const situationalOverviewText = useMemo(() => {
        if (!isDrefStage) {
            return emergencyResponse?.summary;
        }

        // imminent DREFs use the base dref hazard fields, not event_scope
        if (isAnticipatoryPhase) {
            return dref?.hazard_date_and_location;
        }

        // latest revision first; event_scope is null for Assessment DREFs, so
        // fall through to event_description
        let eventScope = dref?.event_scope;
        let eventDescription = dref?.event_description;
        if (stage === STAGE_FINAL_REPORT && isDefined(drefFinalReport)) {
            eventScope = drefFinalReport.event_scope;
            eventDescription = drefFinalReport.event_description;
        } else if (stage === STAGE_OPERATIONAL_UPDATE && isDefined(drefOpsUpdate)) {
            eventScope = drefOpsUpdate.event_scope;
            eventDescription = drefOpsUpdate.event_description;
        }

        return isTruthyString(eventScope) ? eventScope : eventDescription;
    }, [
        isDrefStage,
        isAnticipatoryPhase,
        stage,
        dref,
        drefOpsUpdate,
        drefFinalReport,
        emergencyResponse,
    ]);

    const drefSummary = getDrefSummary(emergencyResponse);

    // AI-generated situational overview replaces the raw text when available;
    // otherwise fall back to the raw event scope/description resolved above.
    const situationalOverviewSummary = isDrefStage
        ? drefSummary?.situational_overview
        : undefined;
    const showSituationalOverviewSummary = isTruthyString(situationalOverviewSummary);
    const displayedSituationalOverview = showSituationalOverviewSummary
        ? situationalOverviewSummary
        : situationalOverviewText;

    const showLearnings = stage === STAGE_FINAL_REPORT
        && (isTruthyString(drefSummary?.challenges_identified)
            || isTruthyString(drefSummary?.lessons_learned));

    // The new endpoint encodes the first field report's assistance flags on the
    // attached field_report via `first_fr_*` fields.
    // FIXME(frozenhelium): go-api, the dref payload does not expose whether
    // the National Society requested international assistance, so the value
    // stays empty for DREF stage emergencies
    const assistanceIsRequestedByNS = isDrefStage
        ? undefined
        : latestFieldReport?.first_fr_ns_request_assistance;
    const assistanceIsRequestedByCountry = isDrefStage
        ? drefFinalReport?.government_requested_assistance
            ?? drefOpsUpdate?.government_requested_assistance
            ?? dref?.government_requested_assistance
            ?? undefined
        : latestFieldReport?.first_fr_request_assistance;

    const emergencyContacts = emergencyResponse?.contacts;

    const groupedContacts = useMemo(
        () => {
            interface DisplayContact {
                id: string | number;
                ctype: string;
                name: string;
                title: string;
                email: string;
                phone: string | null | undefined;
            }

            // DREF-origin emergencies have no event/field-report contacts, so
            // fall back to the dref payload's contacts
            const eventContacts = (emergencyContacts && emergencyContacts.length > 0)
                ? emergencyContacts
                : latestFieldReport?.contacts;

            let displayContacts: DisplayContact[] | undefined;
            if (eventContacts && eventContacts.length > 0) {
                displayContacts = eventContacts
                    .map((contact) => {
                        if (isNotDefined(contact) || isNotDefined(contact.ctype)) {
                            return undefined;
                        }
                        return {
                            id: contact.id,
                            ctype: contact.ctype,
                            name: contact.name,
                            title: contact.title,
                            email: contact.email,
                            phone: contact.phone,
                        };
                    })
                    .filter(isDefined);
            } else {
                // contacts edited in a revision are not synced back to the
                // dref, so read the latest non-empty revision
                displayContacts = [
                    drefFinalReport?.dref_contacts,
                    drefOpsUpdate?.dref_contacts,
                    dref?.dref_contacts,
                ].find((contacts) => isDefined(contacts) && contacts.length > 0);
            }

            return listToGroupList(
                displayContacts ?? [],
                (contact) => (
                    // FIXME: dref_contacts already carry their group in `ctype`
                    // (IFRC Appeal Manager, National Society Contact, ...), so
                    // those should be grouped on that instead of the email domain
                    isIfrcEmail(contact.email)
                        ? 'IFRC'
                        : 'National Societies'
                ),
            );
        },
        [emergencyContacts, latestFieldReport, dref, drefOpsUpdate, drefFinalReport],
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
                            {/* FIXME: add new component/variant for this */}
                            <div className={styles.primaryLabel}>
                                {strings.timelineImminentDrefStart}
                            </div>
                            <TimelineDocument
                                label={strings.timelineDrefApplication}
                                url={drefDocumentUrls.application}
                            />
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
                            {strings.timelineForecastedEvent}
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
                                <Label strong>
                                    {resolveToString(
                                        strings.timelineFieldReport,
                                        { fieldReportNumber: fr.fr_num ?? 1 },
                                    )}
                                </Label>
                                <Link
                                    to="fieldReportDetails"
                                    urlParams={{ fieldReportId: fr.id }}
                                    withUnderline
                                    withLinkIcon
                                >
                                    {strings.timelineViewFieldReport}
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
                        label: (
                            <Label strong>
                                {strings.timelineDisasterStart}
                            </Label>
                        ),
                    });
                }

                if (isDefined(latestAppeal?.start_date)) {
                    events.push({
                        key: `ea-start-${latestAppeal.id}`,
                        date: new Date(latestAppeal.start_date),
                        label: (
                            <div className={styles.primaryLabel}>
                                {strings.timelineOperationStart}
                            </div>
                        ),
                    });
                }

                if (isDefined(latestAppeal?.end_date)) {
                    events.push({
                        key: `ea-end-${latestAppeal.id}`,
                        date: new Date(latestAppeal.end_date),
                        label: (
                            <div className={styles.primaryLabel}>
                                {strings.timelineOperationEnd}
                            </div>
                        ),
                    });
                }
            }

            if (isDrefStage && isDefined(dref)) {
                // an event_date corrected in a revision is not synced back to the dref
                const drefEventDate = drefFinalReport?.event_date
                    ?? drefOpsUpdate?.event_date
                    ?? dref.event_date;

                if (dref?.type_of_dref !== DREF_TYPE_IMMINENT && isDefined(drefEventDate)) {
                    events.push({
                        key: `dref-event-start-${dref.id}`,
                        date: new Date(drefEventDate),
                        label: (
                            <Label strong>
                                {strings.timelineDisasterStart}
                            </Label>
                        ),
                    });
                }

                if (dref?.type_of_dref !== DREF_TYPE_IMMINENT
                    && isDefined(dref?.date_of_approval)
                ) {
                    events.push({
                        key: `dref-operation-start-${dref.id}`,
                        date: new Date(dref.date_of_approval),
                        label: (
                            <>
                                <div className={styles.primaryLabel}>
                                    {strings.timelineOperationStart}
                                </div>
                                <TimelineDocument
                                    label={strings.timelineDrefApplication}
                                    url={drefDocumentUrls.application}
                                />
                            </>
                        ),
                    });
                }

                dref.timeline_operational_updates.forEach((opsUpdate) => {
                    const opsUpdateDate = opsUpdate.date_of_approval ?? opsUpdate.modified_at;
                    const hasSummary = isTruthyString(opsUpdate.summary_of_change);

                    if (isDefined(opsUpdateDate)) {
                        events.push({
                            key: `dref-operation-update-${opsUpdate.id}`,
                            date: new Date(opsUpdateDate),
                            label: (
                                <>
                                    <DropdownMenu
                                        labelColorVariant="text"
                                        labelStyleVariant="translucent"
                                        withoutDropdownIcon
                                        labelWithoutAdditionalInlinePadding
                                        withoutPopupPadding
                                        label={resolveToString(
                                            strings.timelineOperationalUpdate,
                                            {
                                                updateNumber:
                                                    opsUpdate.operational_update_number ?? 1,
                                            },
                                        )}
                                        preferredPopupWidth={hasSummary ? 34 : 26}
                                    >
                                        <Container
                                            heading={resolveToComponent(
                                                strings.timelineOperationalUpdatePopupHeading,
                                                {
                                                    updateNumber:
                                                        opsUpdate.operational_update_number ?? 1,
                                                    date: (
                                                        <DateOutput
                                                            value={opsUpdateDate}
                                                        />
                                                    ),
                                                },
                                            )}
                                            withHeaderBorder
                                            withPadding
                                            withOverflow
                                            withContentOverflow
                                        >
                                            <BlockView
                                                before={(
                                                    <ListView
                                                        layout="block"
                                                        withSpacingOpticalCorrection
                                                    >
                                                        <TextOutput
                                                            label={strings
                                                                .timelineTargetedPopulationLabel}
                                                            value={opsUpdate
                                                                .total_targeted_population}
                                                            valueType="number"
                                                            strongValue
                                                        />
                                                        <TextOutput
                                                            label={strings
                                                                .timelineFundingRequirementsLabel}
                                                            value={opsUpdate.total_dref_allocation}
                                                            valueType="number"
                                                            strongValue
                                                        />
                                                    </ListView>
                                                )}
                                                withBeforeSeparator={hasSummary}
                                            >
                                                {hasSummary && (
                                                    <Container
                                                        heading="Summary of Updates"
                                                        headingLevel={6}
                                                        spacing="sm"
                                                    >
                                                        <DescriptionText>
                                                            {opsUpdate.summary_of_change}
                                                        </DescriptionText>
                                                    </Container>
                                                )}
                                            </BlockView>
                                        </Container>
                                    </DropdownMenu>
                                    <TimelineDocument
                                        label={resolveToString(
                                            strings.timelineOperationalUpdateDownload,
                                            {
                                                updateNumber:
                                                    opsUpdate.operational_update_number ?? 1,
                                            },
                                        )}
                                        url={drefDocumentUrls.operationalUpdates[
                                            (opsUpdate.operational_update_number ?? 1) - 1
                                        ]}
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
                        label: (
                            <div className={styles.primaryLabel}>
                                {strings.timelineOperationEnd}
                            </div>
                        ),
                    });
                }

                const lastFinalReportUpdate = drefFinalReport?.date_of_approval
                    ?? drefFinalReport?.modified_at;

                if (isDefined(drefFinalReport) && isDefined(lastFinalReportUpdate)) {
                    events.push({
                        key: `final-report-${drefFinalReport.id}`,
                        date: new Date(lastFinalReportUpdate),
                        label: (
                            <>
                                <DropdownMenu
                                    labelColorVariant="text"
                                    labelStyleVariant="translucent"
                                    withoutDropdownIcon
                                    labelWithoutAdditionalInlinePadding
                                    withoutPopupPadding
                                    label={strings.timelineDrefFinalReport}
                                    preferredPopupWidth={22}
                                >
                                    <Container
                                        heading={resolveToComponent(
                                            strings.timelineDrefFinalReportPopupHeading,
                                            {
                                                date: (
                                                    <DateOutput
                                                        value={lastFinalReportUpdate}
                                                    />
                                                ),
                                            },
                                        )}
                                        withHeaderBorder
                                        withPadding
                                    >
                                        <TextOutput
                                            label={strings
                                                .timelineTargetedPopulationLabel}
                                            value={drefFinalReport
                                                .total_targeted_population}
                                            valueType="number"
                                            strongValue
                                        />
                                        <TextOutput
                                            label={strings
                                                .timelineFundingRequirementsLabel}
                                            value={drefFinalReport.total_dref_allocation}
                                            valueType="number"
                                            strongValue
                                        />
                                    </Container>
                                </DropdownMenu>
                                <TimelineDocument
                                    label={strings.timelineDrefFinalReportDownload}
                                    url={drefDocumentUrls.finalReport}
                                />
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
            drefDocumentUrls,
            strings,
        ],
    );

    const country = emergencyResponse?.countries?.[0];

    // disaster_start_date is copied from the dref once at approval and not
    // resynced, so prefer the latest revision's event date at DREF stages
    const startDate = isFieldReportStage
        ? latestFieldReport?.start_date
        : (isDrefStage && !isAnticipatoryPhase
            ? drefFinalReport?.event_date
                ?? drefOpsUpdate?.event_date
                ?? dref?.event_date
            : undefined)
            ?? emergencyResponse?.disaster_start_date;

    const drefEndDate = drefFinalReport?.operation_end_date
        ?? drefOpsUpdate?.new_operational_end_date
        ?? dref?.end_date;

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
            {showCreateDrefApplication && (
                <InlineLayout
                    after={(
                        <Link
                            to="newDrefApplicationForm"
                            state={{ event: emergencyResponse.id }}
                            colorVariant="primary"
                            styleVariant="filled"
                        >
                            {strings.createDrefApplicationLink}
                        </Link>
                    )}
                />
            )}
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
                                value={glideNumber}
                                strongValue
                            />
                        </ListView>
                    )}
                />
            )}
            <Container
                heading={strings.emergencyOverviewTitle}
                headerActions={(
                    <TextOutput
                        label={strings.overviewLastUpdateLabel}
                        value={emergencyResponse.updated_at}
                        valueType="date"
                        textSize="sm"
                        withLightText
                    />
                )}
                withHeaderBorder
            >
                <ListView
                    layout="grid"
                    withSpacingOpticalCorrection
                    numPreferredGridColumns={3}
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
                                    value={isDefined(operationType) ? (
                                        <EmergencyOperationType type={operationType} />
                                    ) : undefined}
                                    strongValue
                                />
                                <TextOutput
                                    label={strings.disasterCategorization}
                                    value={hasDisasterCategory ? (
                                        <ListView
                                            withWrap
                                            withSpacingOpticalCorrection
                                            spacing="2xs"
                                        >
                                            <SeverityIndicator
                                                level={disasterCategoryLevel}
                                            />
                                            {disasterCategoryDisplay}
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
                                    ) : undefined}
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
                        {isDrefStage && (
                            <TextOutput
                                label={strings.endDate}
                                valueType="date"
                                value={drefEndDate}
                                strongValue
                            />
                        )}
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
                        {isDrefStage && (
                            <TextOutput
                                label={strings.overviewEmergencyAppealLabel}
                                value={isDefined(dref?.emergency_appeal_planned)
                                    // NOTE: in api_request_choices, 2 is
                                    // 'Planned' and 0 is 'No'
                                    ? requestMap?.[dref.emergency_appeal_planned ? 2 : 0]
                                    : undefined}
                                strongValue
                            />
                        )}
                        <TextOutput
                            label={strings.visibility}
                            value={isDefined(emergencyResponse.visibility)
                                ? visibilityMap?.[emergencyResponse.visibility]
                                : '--'}
                            strongValue
                        />
                    </ListView>
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
            {showLearnings && (
                <Container
                    heading={strings.learningsFromOperationTitle}
                    withHeaderBorder
                >
                    <ListView
                        layout="grid"
                        numPreferredGridColumns={2}
                    >
                        {isTruthyString(drefSummary?.challenges_identified) && (
                            <Container
                                heading={strings.challengesIdentifiedHeading}
                                headingLevel={5}
                                withHeaderBorder
                                withShadow
                                withBackground
                                withPadding
                            >
                                <DescriptionText>
                                    {drefSummary?.challenges_identified}
                                </DescriptionText>
                            </Container>
                        )}
                        {isTruthyString(drefSummary?.lessons_learned) && (
                            <Container
                                heading={strings.lessonsLearnedHeading}
                                headingLevel={5}
                                withHeaderBorder
                                withShadow
                                withBackground
                                withPadding
                            >
                                <DescriptionText>
                                    {drefSummary?.lessons_learned}
                                </DescriptionText>
                            </Container>
                        )}
                    </ListView>
                    <DrefSummaryDisclaimer multiple />
                </Container>
            )}
            <Container
                heading={strings.situationalOverviewTitle}
                withHeaderBorder
            >
                {/* FIXME(frozenhelium): handle condition where there is no summary */}
                <ListView
                    layout="grid"
                    gridContentClassName={styles.situationalOverviewContent}
                    numPreferredGridColumns={isFalsyString(displayedSituationalOverview) ? 1 : 2}
                >
                    <ListView layout="block">
                        <ClampedContent
                            size="lg"
                            resetKey={displayedSituationalOverview}
                        >
                            {isDrefStage && (
                                // Description collapses the summaries'
                                // blank-line paragraph breaks
                                <DescriptionText>
                                    {displayedSituationalOverview}
                                </DescriptionText>
                            )}
                            {!isDrefStage && (
                                <HtmlOutput
                                    value={emergencyResponse.summary}
                                />
                            )}
                        </ClampedContent>
                        {showSituationalOverviewSummary && (
                            <ListView
                                layout="block"
                                spacing="2xs"
                            >
                                {isAnticipatoryPhase ? (
                                    <Description
                                        textSize="sm"
                                        withLightText
                                    >
                                        {strings.situationalOverviewSourceImminent}
                                    </Description>
                                ) : (
                                    <DrefSummarySourceLabel
                                        source={drefSummary?.source}
                                        section={strings.situationalOverviewSource}
                                    />
                                )}
                                <DrefSummaryDisclaimer />
                            </ListView>
                        )}
                    </ListView>
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
                                                        withSpacingOpticalCorrection
                                                        spacing="sm"
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
