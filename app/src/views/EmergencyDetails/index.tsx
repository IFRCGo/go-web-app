import { useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
    Container,
    Description,
    HtmlOutput,
    InfoPopup,
    KeyFigureView,
    ListView,
    TextOutput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { resolveToString } from '@ifrc-go/ui/utils';
import {
    compareDate,
    isDefined,
    isNotDefined,
    isTruthyString,
    listToGroupList,
    listToMap,
} from '@togglecorp/fujs';

import SeverityIndicator from '#components/domain/SeverityIndicator';
import Link from '#components/Link';
import TabPage from '#components/TabPage';
import useDisasterType from '#hooks/domain/useDisasterType';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import { type EmergencyOutletContext } from '#utils/outletContext';
import { type GoApiResponse } from '#utils/restRequest';

import EmergencyMap from './EmergencyMap';
import FieldReportStats from './FieldReportStats';

import i18n from './i18n.json';

type EventItem = GoApiResponse<'/api/v2/event/{id}'>;
type FieldReport = EventItem['field_reports'][number];

function getFieldReport(
    reports: FieldReport[],
    compareFunction: (
        a?: string,
        b?: string,
        direction?: number
    ) => number,
    direction?: number,
): FieldReport | undefined {
    if (reports.length === 0) {
        return undefined;
    }

    // FIXME: use max function
    return reports.reduce((
        selectedReport: FieldReport | undefined,
        currentReport: FieldReport | undefined,
    ) => {
        if (isNotDefined(selectedReport)
            || compareFunction(
                currentReport?.updated_at,
                selectedReport.updated_at,
                direction,
            ) > 0) {
            return currentReport;
        }
        return selectedReport;
    }, undefined);
}

/** @knipignore */
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    const disasterTypes = useDisasterType();
    const { emergencyResponse } = useOutletContext<EmergencyOutletContext>();
    const { api_visibility_choices } = useGlobalEnums();

    const visibilityMap = useMemo(
        () => listToMap(
            api_visibility_choices,
            ({ key }) => key,
            ({ value }) => value,
        ),
        [api_visibility_choices],
    );

    const hasKeyFigures = isDefined(emergencyResponse)
        && emergencyResponse.key_figures.length !== 0;

    const disasterType = disasterTypes?.find(
        (typeOfDisaster) => typeOfDisaster.id === emergencyResponse?.dtype,
    );

    const mdrCode = isDefined(emergencyResponse)
        && isDefined(emergencyResponse?.appeals)
        && emergencyResponse.appeals.length > 0
        ? emergencyResponse?.appeals[0]?.code : undefined;

    const hasFieldReports = isDefined(emergencyResponse)
        && isDefined(emergencyResponse?.field_reports)
        && emergencyResponse?.field_reports.length > 0;

    const firstFieldReport = hasFieldReports
        ? getFieldReport(emergencyResponse.field_reports, compareDate, -1) : undefined;
    const assistanceIsRequestedByNS = firstFieldReport?.ns_request_assistance;
    const assistanceIsRequestedByCountry = firstFieldReport?.request_assistance;
    const latestFieldReport = hasFieldReports
        ? getFieldReport(emergencyResponse.field_reports, compareDate) : undefined;

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

    return (
        <TabPage>
            {hasKeyFigures && (
                <Container
                    heading={strings.emergencyKeyFiguresTitle}
                    withHeaderBorder
                >
                    <ListView
                        layout="grid"
                        numPreferredGridColumns={4}
                    >
                        {emergencyResponse?.key_figures.map(
                            (keyFigure) => (
                                <KeyFigureView
                                    key={keyFigure.id}
                                    // FIXME: fix typing in server (medium priority)
                                    // FIXME: Rounding this because it was previously rounded
                                    value={Math.round(
                                        Number.parseInt(
                                            // Removing commas from the value
                                            keyFigure.number.replace(/[^\d.-]/g, ''),
                                            10,
                                        ),
                                    )}
                                    valueType="number"
                                    label={(
                                        <ListView
                                            layout="block"
                                            spacing="sm"
                                        >
                                            <div>
                                                {keyFigure.deck}
                                            </div>
                                            <div>
                                                {resolveToString(
                                                    strings.sourceLabel,
                                                    { source: keyFigure.source },
                                                )}
                                            </div>
                                        </ListView>
                                    )}
                                    withShadow
                                />
                            ),
                        )}
                    </ListView>
                </Container>
            )}
            {isDefined(emergencyResponse) && (
                <Container
                    heading={strings.emergencyOverviewTitle}
                    withHeaderBorder
                >
                    <ListView
                        layout="grid"
                        withSpacingOpticalCorrection
                        numPreferredGridColumns={3}
                    >
                        <TextOutput
                            label={strings.disasterCategorisation}
                            value={(
                                <ListView
                                    withWrap
                                    withSpacingOpticalCorrection
                                    spacing="sm"
                                >
                                    {emergencyResponse.ifrc_severity_level_display}
                                    <SeverityIndicator
                                        level={emergencyResponse.ifrc_severity_level}
                                    />
                                    {emergencyResponse.ifrc_severity_level_update_date && (
                                        <InfoPopup
                                            description={(
                                                <TextOutput
                                                    label={strings.severityLevelUpdateDateLabel}
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
                        <TextOutput
                            label={strings.disasterType}
                            value={disasterType?.name}
                            strongValue
                        />
                        <TextOutput
                            label={strings.startDate}
                            valueType="date"
                            value={emergencyResponse?.disaster_start_date}
                            strongValue
                        />
                        <TextOutput
                            label={strings.visibility}
                            value={isDefined(emergencyResponse.visibility)
                                ? visibilityMap?.[emergencyResponse.visibility]
                                : '--'}
                            strongValue
                        />
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
                        <TextOutput
                            label={strings.assistanceRequestedByNS}
                            valueType="boolean"
                            value={assistanceIsRequestedByNS}
                            strongValue
                        />
                        <TextOutput
                            label={strings.assistanceRequestedByGovernment}
                            valueType="boolean"
                            value={assistanceIsRequestedByCountry}
                            strongValue
                        />
                    </ListView>
                </Container>
            )}
            {isDefined(emergencyResponse)
                && isDefined(emergencyResponse?.summary)
                && isTruthyString(emergencyResponse.summary)
                && (
                    <Container
                        heading={strings.situationalOverviewTitle}
                        withHeaderBorder
                    >
                        <HtmlOutput
                            value={emergencyResponse.summary}
                        />
                    </Container>
                )}
            {isDefined(emergencyResponse)
                && isDefined(emergencyResponse?.links)
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
            <ListView
                layout="grid"
                withSidebar
            >
                {emergencyResponse && !emergencyResponse.hide_field_report_map && (
                    <Container
                        heading={strings.emergencyMapTitle}
                        withHeaderBorder
                    >
                        <EmergencyMap event={emergencyResponse} />
                    </Container>
                )}
                {hasFieldReports
                    && isDefined(latestFieldReport)
                    && !emergencyResponse.hide_attached_field_reports && (
                    <Container
                        heading={strings.emergencyKeyFiguresTitle}
                        withHeaderBorder
                    >
                        <FieldReportStats
                            report={latestFieldReport}
                            disasterType={emergencyResponse.dtype}
                        />
                    </Container>
                )}
            </ListView>
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
